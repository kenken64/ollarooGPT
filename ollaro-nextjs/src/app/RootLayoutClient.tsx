'use client';
import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';
import { customFetch } from '../app/utils/customFetcher';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = localStorage.getItem('email');
        if (email) {
          const response = await customFetch(`/api/protected/users?email=${email}`, {
            method: 'GET',
          });
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            console.log(data.data[0].role)
            setUserRole(data.data[0].role);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  // Handle logout and dispatch a custom event
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('email');
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
              <a href="/services" className="mr-4">Search Services</a>
              {userRole === 'admin' && (
                <a href="/companies" className="mr-4">List Companies</a>
              )}
              <a href="/edit-service" className="mr-4">Edit My Service</a>
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