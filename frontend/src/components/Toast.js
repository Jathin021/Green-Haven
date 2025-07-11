import React from 'react';

const Toast = ({ message, type = 'success', show }) => {
  if (!show) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all duration-300 animate-fade-in ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Toast; 