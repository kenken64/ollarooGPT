import React, { useState } from 'react';

interface ServiceFormProps {
    initialData?: {
        name: string;
        location: string;
        contact: string;
        services: string[];
    };
    onSubmit: (data: { name: string; location: string; contact: string; services: string[] }) => void;
}

const EditServiceForm: React.FC<ServiceFormProps> = ({ initialData, onSubmit }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [contact, setContact] = useState(initialData?.contact || '');
    const [services, setServices] = useState(initialData?.services || ['']);

    // Handler to update a service at a specific index
    const handleServiceChange = (index: number, value: string) => {
        const updatedServices = [...services];
        updatedServices[index] = value;
        setServices(updatedServices);
    };

    // Add a new service field
    const handleAddService = () => {
        setServices([...services, '']);
    };

    // Remove a service field by index
    const handleRemoveService = (index: number) => {
        const updatedServices = services.filter((_, i) => i !== index);
        setServices(updatedServices);
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, location, contact, services });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-md space-y-6">
            <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">Edit Ship Repair Service</h2>
            <div>
                <label className="block font-medium mb-2 text-gray-700">Company Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block font-medium mb-2 text-gray-700">Location:</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block font-medium mb-2 text-gray-700">Contact:</label>
                <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block font-medium mb-2 text-gray-700">Offered Services:</label>
                {services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-3 mb-3">
                        <input
                            type="text"
                            value={service}
                            onChange={(e) => handleServiceChange(index, e.target.value)}
                            placeholder="Service name"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {services.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveService(index)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddService}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    Add Service
                </button>
            </div>

            <button
                type="submit"
                className="w-full py-3 mt-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Submit
            </button>
        </form>
    );
};

export default EditServiceForm;