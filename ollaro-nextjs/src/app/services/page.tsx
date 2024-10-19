'use client';
import React, { useState, useEffect } from 'react';
import ShipRepairService from './ShipRepairService';
import './service.css'; // Assuming you still have some custom styles in this file

const mockShipRepairServices = [
  {
    name: 'Atlantic Marine Repair',
    location: 'New York, USA',
    contact: 'contact@atlanticrepair.com',
    services: ['Hull Repair', 'Engine Overhaul', 'Deck Maintenance']
  },
  {
    name: 'Pacific Ship Repair',
    location: 'Los Angeles, USA',
    contact: 'info@pacificshiprepair.com',
    services: ['Electrical Systems', 'Propeller Replacement', 'Fuel System Repair']
  },
  {
    name: 'Mediterranean Dock Services',
    location: 'Barcelona, Spain',
    contact: 'support@mediterraneandock.com',
    services: ['Navigation Equipment', 'Painting and Coating', 'Rudder Repair']
  }
];

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState(mockShipRepairServices);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect to apply the initial theme based on system preference or saved preference
  useEffect(() => {
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && userPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  // Handler to filter the services when the search button is clicked
  const handleSearch = () => {
    const filtered = mockShipRepairServices.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredServices(filtered);
  };

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-center text-3xl font-bold mb-6">Ship Repair Services</h1>

      {/* Search Bar */}
      <div className="flex justify-start mb-5">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search services by name, location, or service"
          className="p-2 text-lg border border-gray-300 dark:border-gray-700 rounded-md mr-3 w-72 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        />
        <button
          onClick={handleSearch}
          className="p-2 px-4 text-lg bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800"
        >
          Search
        </button>
      </div>

      {/* List of Filtered Services */}
      <div className="flex flex-col gap-5">
        {filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <ShipRepairService
              key={index}
              name={service.name}
              location={service.location}
              contact={service.contact}
              services={service.services}
              thumbnailUrl="https://hsdmarine.com.sg/wp-content/uploads/2022/12/iStock-186668786-scaled.jpg"
            />
          ))
        ) : (
          <p className="text-center">No services found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;