'use client';

import { useState } from 'react';
import './PasswordInput.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Regular expressions for email and password validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateInputs = () => {
    setSuccessMessage('');
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    } else if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and include letters, numbers, and a special character');
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    } else {
      setError(""); // Clear error if passwords match
      // Proceed with form submission
    }

    setError(null);
    return true;
  };

  const handleRegister = async () => {
    if (validateInputs()) {
      try {
        const response = await fetch('/api/public/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.message);
        } else {
          setSuccessMessage('User registered successfully');
          setEmail('');
          setPassword('');
        }
      } catch (error) {
        setError('An error occurred while registering');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Register</h1>
      <div className="w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 w-full mb-2 bg-white dark:bg-gray-800 text-black dark:text-white"
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 w-full mb-2 bg-white dark:bg-gray-800 text-black dark:text-white"
          />
          <button type="button" onClick={togglePasswordVisibility} className="password-toggle-btn">
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 w-full mb-2 bg-white dark:bg-gray-800 text-black dark:text-white"
        />
        <button
          onClick={handleRegister}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 w-full"
        >
          Register
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
      </div>
    </div>
  );
}