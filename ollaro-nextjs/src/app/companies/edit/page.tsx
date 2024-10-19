'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function EditMember() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams() as { id: string };

  useEffect(() => {
    // Simulate fetching data from an API with the member ID
    const fetchMember = async () => {
      setLoading(true);
      try {
        // Mock data for the member being edited
        const member: Member = {
          id: parseInt(Array.isArray(id) ? id[0] : id),
          name: 'Alice Johnson',
          email: 'alice@example.com',
          role: 'Admin',
        };
        setName(member.name);
        setEmail(member.email);
        setRole(member.role);
      } catch (error) {
        console.error('Error fetching member:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMember();
    }
  }, [id]);

  const handleEditMember = () => {
    if (!name || !email) {
      alert('Please fill in all fields.');
      return;
    }

    // Here you would normally send the updated member data to an API endpoint
    console.log('Updated Member:', { id, name, email, role });
    
    // Redirect to the list page after editing the member
    router.push('/companies');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Edit Member</h1>
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/companies')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleEditMember}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
