from flask import Flask, jsonify, Response
import re
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend to avoid UI thread issues
import matplotlib.pyplot as plt
import io
import os

app = Flask(__name__)

# Path to the file storing historical data
HISTORICAL_DATA_FILE = "gpu_hw_residency_history.txt"
MAX_OBSERVATIONS = 20

def parse_latest_gpu_hw_residency(file_path):
    # Regular expression to capture the GPU HW active residency percentage
    pattern = r"GPU HW active residency:\s+([\d\.]+)%"
    latest_value = None
    
    with open(file_path, "r") as file:
        for line in file:
            match = re.search(pattern, line)
            if match:
                latest_value = float(match.group(1))

    return latest_value

def save_to_historical_data(value):
    # Read current historical data
    historical_data = get_historical_data()

    # Append the latest value
    historical_data.append(value)

    # Keep only the last MAX_OBSERVATIONS values
    if len(historical_data) > MAX_OBSERVATIONS:
        historical_data = historical_data[-MAX_OBSERVATIONS:]

    # Write the updated historical data back to the file
    with open(HISTORICAL_DATA_FILE, "w") as file:
        for val in historical_data:
            file.write(f"{val}\n")

def get_historical_data():
    # Read historical data from the file
    if not os.path.exists(HISTORICAL_DATA_FILE):
        return []

    with open(HISTORICAL_DATA_FILE, "r") as file:
        data = [float(line.strip()) for line in file if line.strip().isdigit() or re.match(r'^\d+(\.\d+)?$', line.strip())]
    
    return data

@app.route('/gpu_metrics', methods=['GET'])
def gpu_metrics():
    file_path = "gpu_power_metrics.txt"
    gpu_hw_residency = parse_latest_gpu_hw_residency(file_path)
    
    if gpu_hw_residency is not None:
        save_to_historical_data(gpu_hw_residency)
    
    # Return JSON response
    response = {
        "gpu_hw_active_residency": gpu_hw_residency if gpu_hw_residency is not None else "Not found"
    }
    return jsonify(response)

@app.route('/gpu_metrics_chart', methods=['GET'])
def gpu_metrics_chart():
    # Get the historical data
    historical_data = get_historical_data()
    
    if not historical_data:
        return "No historical GPU HW Active Residency data found.", 404

    # Create a bar chart using historical data
    plt.figure(figsize=(12, 6))
    plt.box(False)
    plt.axis('off')
    indices = list(range(1, len(historical_data) + 1))
    plt.bar(indices, historical_data, color='blue')
    # plt.xlabel('Observation Number')
    # plt.ylabel('GPU HW Active Residency (%)')
    # plt.title('Historical GPU HW Active Residency (Last 20 Observations)')
    plt.ylim(0, 100)
    plt.xticks(indices)  # Add observation numbers as x-axis labels

    # Save the plot to a bytes buffer and return it as an image response
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()

    return Response(buf, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
