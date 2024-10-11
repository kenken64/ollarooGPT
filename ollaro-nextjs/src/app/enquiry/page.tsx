'use client';

import { useState } from 'react';

export default function GeneralEnquiryForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+65',
        phone: '',
        subject: '',
        message: '',
    });

    const [formErrors, setFormErrors] = useState({
        name: '',
        email: '',
        countryCode: '+65',
        phone: '',
        subject: '',
        message: '',
    });

    // Function to clear all form errors
    const clearErrors = () => {
        setFormErrors({
        name: '',
        email: '',
        countryCode: '',
        phone: '',
        subject: '',
        message: '',
        });
    };

    const [formStatus, setFormStatus] = useState('');

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '', // Clear error message for the current field
        }));
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        // Email validation regex pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        e.preventDefault();
        // Validate all fields
        // Create an object to store errors for each field
        const errors: {
            name: string;
            email: string;
            countryCode: string;
            phone: string;
            subject: string;
            message: string;
        } = {
            name: '',
            email: '',
            countryCode: '',
            phone: '',
            subject: '',
            message: '',
        };

        if (!formData.name) {
            errors.name = 'Name is required.';
        }

        // Validate email
        if (!formData.email) {
            errors.email = 'Email is required.';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address.';
        }

        if (!formData.subject) {
            errors.subject = 'Subject is required.';
        }

        if (!formData.phone) {
            errors.phone = 'Phone is required.';
        } else if (isNaN(Number(formData.phone.toString()))) {
            errors.phone = 'Phone number must be number.';
        }

        // If there are errors, update the formErrors state
        if (Object.values(errors).some((error) => error !== '')) {
            setFormErrors(errors);
            return;
        }

        setFormStatus('Submitting...');
        clearErrors();
        
        try {
            const response = await fetch('/api/enquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setFormStatus('Thank you for your enquiry. We will get back to you shortly.');
                setFormData({ name: '', email: '', countryCode: '+65', phone: '', subject: '', message: '' });
            } else {
                setFormStatus('Something went wrong. Please try again later.');
            }
        } catch (error) {
            setFormStatus('Error: Unable to submit the form.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">General Enquiry Form</h1>
            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border text-gray-700 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    />
                    {formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border text-gray-700 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    />
                    {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                        <select
                            name="countryCode"
                            value={formData.countryCode}
                            onChange={handleChange}
                            className="mr-2 block border border-gray-300 rounded-md shadow-sm focus:border-blue-500 text-gray-700 focus:ring-blue-500 sm:text-sm p-2"
                        >
                            <option value="+1">+1 (USA)</option>
                            <option value="+60">+60 (MAlaysia)</option>
                            <option value="+65">+65 (Singapore)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+91">+91 (India)</option>
                            <option value="+61">+61 (Australia)</option>
                        </select>
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        />
                    </div>
                    {formErrors.phone && <p className="text-sm text-red-600">{formErrors.phone}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border text-gray-700 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    />
                    {formErrors.subject && <p className="text-sm text-red-600">{formErrors.subject}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message
                    </label>
                    <textarea
                        name="message"
                        id="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border text-gray-700 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        rows={4}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
                >
                    Submit
                </button>
            </form>
            {formStatus && <p className="mt-4 text-center text-sm text-red-600">{formStatus}</p>}
        </div>
    );
}