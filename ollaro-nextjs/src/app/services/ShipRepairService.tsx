import React from 'react';
import './service.css'; // Assuming you still need some custom styles

interface ShipRepairServiceProps {
  name: string;
  location: string;
  contact: string;
  services: string[];
  thumbnailUrl: string; // New prop for the thumbnail URL
}

const ShipRepairService: React.FC<ShipRepairServiceProps> = ({ name, location, contact, services, thumbnailUrl }) => {
  return (
    <div className="service-card p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {/* Thumbnail Image */}
      <div className="md:col-span-1">
        <img
          src={thumbnailUrl}
          alt={`${name} thumbnail`}
          className="w-full h-auto rounded-lg object-cover"
        />
      </div>

      {/* Service Information */}
      <div className="md:col-span-2">
        <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">{name}</h3>
        <p className="text-lg mb-3">
          <strong className="text-black dark:text-white">Location:</strong> {location}
        </p>
        <p className="text-lg mb-4">
          <strong className="text-black dark:text-white">Contact:</strong> {contact}
        </p>
        <div>
          <strong className="text-black dark:text-white block mb-2">Services:</strong>
          <ul className="list-disc pl-6">
            {services.map((service, index) => (
              <li key={index} className="my-1 text-black dark:text-white">
                {service}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShipRepairService;