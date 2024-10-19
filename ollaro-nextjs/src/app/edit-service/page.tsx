'use client'
import React, { useState } from 'react';
import EditServiceForm from '@/app/edit-service/EditServiceForm';

// Define the shape of the service data
interface ServiceData {
  name: string;
  location: string;
  contact: string;
  services: string[];
}

const Home: React.FC = () => {
  // Update the state to accept either `null` or a service object
  const [submittedData, setSubmittedData] = useState<ServiceData | null>(null);

  const handleFormSubmit = (data: ServiceData) => {
    setSubmittedData(data); // This will work now
    console.log('Form Submitted:', data);
  };

  return (
    <div>
      <EditServiceForm
        initialData={{
          name: 'Pacific Ship Repair',
          location: 'Los Angeles, USA',
          contact: 'info@pacificshiprepair.com',
          services: ['Electrical Systems', 'Propeller Replacement', 'Fuel System Repair']
        }}
        onSubmit={handleFormSubmit}
      />

      {submittedData && (
        <div className="submitted-data">
          <h2>Service Details:</h2>
          <p><strong>Company Name:</strong> {submittedData.name}</p>
          <p><strong>Location:</strong> {submittedData.location}</p>
          <p><strong>Contact:</strong> {submittedData.contact}</p>
          <p><strong>Offered Services:</strong></p>
          <ul>
            {submittedData.services.map((service, index) => (
              <li key={index}>{service}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;