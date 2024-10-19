'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "../../context/AuthContext"; // Ensure correct path
import './PasswordInput.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // Redirect user to the homepage if they're already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/'); // Redirect to home if token is present
    }
  }, [router]);

  const validateInputs = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    setError(null);
    return true;
  };

  const handleLogin = async () => {
    if (validateInputs()) {
      try {
        const response = await fetch('/api/public/auth/login', {
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
            setToken(data.token);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('email', email);
            login();
            router.push('/');
        }
      } catch (error) {
        setError('An error occurred while logging in');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <div className="w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 w-full mb-2 bg-white dark:bg-gray-800 text-black dark:text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 w-full mb-2 bg-white dark:bg-gray-800 text-black dark:text-white"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 w-full"
        >
          Login
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {token && (
          <p className="text-green-500 text-sm mt-2">
            Successfully logged in! Token: {token}
          </p>
        )}
      </div>
    </div>
  );
}