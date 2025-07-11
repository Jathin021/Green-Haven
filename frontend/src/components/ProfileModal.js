import React from 'react';

const ProfileModal = ({ show, onClose, currentUser }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">My Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 font-semibold">Email:</label>
            <p className="text-gray-900">{currentUser?.email}</p>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold">Name:</label>
            <p className="text-gray-900">{currentUser?.first_name} {currentUser?.last_name}</p>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold">Phone:</label>
            <p className="text-gray-900">{currentUser?.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold">Address:</label>
            <p className="text-gray-900">{currentUser?.address || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold">City, State:</label>
            <p className="text-gray-900">{currentUser?.city || 'Not provided'}, {currentUser?.state || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold">ZIP Code:</label>
            <p className="text-gray-900">{currentUser?.zip_code || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 