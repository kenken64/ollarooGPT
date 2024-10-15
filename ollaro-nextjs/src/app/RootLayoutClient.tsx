'use client';
import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  //const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  // Check authentication on initial load
  // useEffect(() => {
  //   // Ensure localStorage is accessed only on the client side
  //   if (typeof window !== 'undefined') {
  //     const token = localStorage.getItem('authToken');
  //     if (token) {
  //       setIsAuthenticated(true);
  //     }
  //   }

  //   const handleAuthChange = () => {
  //     if (typeof window !== 'undefined') {
  //       const updatedToken = localStorage.getItem('authToken');
  //       setIsAuthenticated(!!updatedToken);
  //     }
  //   };

  //   window.addEventListener('authChange', handleAuthChange);

  //   return () => {
  //     window.removeEventListener('authChange', handleAuthChange);
  //   };
  // }, []);

  // Handle logout and dispatch a custom event
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      logout();
      window.dispatchEvent(new Event('authChange')); // Notify other components
      router.push('/auth/login'); // Redirect after logout
    }
  };

  return (
    <>
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Global Header</h1>
        <nav>
          <a href="/" className="mr-4">Home</a>
          {isAuthenticated ? (
            <>
              {/* <a href="/aichat" className="mr-4">Ai Chat</a> */}
              <a href="/fruits" className="mr-4">Fruits</a>
              <button onClick={handleLogout} className="mr-4 bg-transparent text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/auth/login" className="mr-4">Sign In</a>
              <a href="/auth/register" className="mr-4">Sign Up</a>
              <a href="/enquiry" className="mr-4">General Enquiry</a>
            </>
          )}
        </nav>
      </header>
      <main className="min-h-screen p-6">{children}</main>
      <footer className="bg-gray-800 text-white text-center p-4">
        <p>&copy; 2024 My App</p>
      </footer>
    </>
  );
}