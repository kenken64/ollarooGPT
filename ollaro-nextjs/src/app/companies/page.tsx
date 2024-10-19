'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Simulate fetching data from an API with mock data
    const fetchMembers = async () => {
      setLoading(true);
      try {
        // Mock data
        const data: Member[] = [
          { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
          { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
          { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor' },
          { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'User' },
          { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', role: 'Admin' },
        ];
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleEdit = (id: number) => {
    console.log('Edit member with ID:', id);
    // Implement edit logic here
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this member?')) {
      console.log('Delete member with ID:', id);
      // Implement delete logic here
      setMembers(prevMembers => prevMembers.filter(member => member.id !== id));
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">List of Companies</h1>
      <div className="flex justify-between items-center mb-4">
        <Link href="/companies/add" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Add Member
        </Link>
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded w-1/3"
        />
      </div>
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold">ID</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">{member.id}</td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">{member.name}</td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">{member.email}</td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">{member.role}</td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">
                    <button 
                      onClick={() => handleEdit(member.id)} 
                      className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(member.id)} 
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
