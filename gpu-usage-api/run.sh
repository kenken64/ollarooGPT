#!/bin/bash

# URL of the Flask API endpoint
METRICS_ENDPOINT="http://127.0.0.1:5000/gpu_metrics"

# Function to call the metrics endpoint
call_metrics_endpoint() {
  echo "Calling GPU metrics endpoint..."
  curl -s $METRICS_ENDPOINT > /dev/null
  echo "GPU metrics data updated."
}

# Main loop to keep calling the metrics endpoint every 10 seconds
while true; do
  call_metrics_endpoint
  sleep 10
done

