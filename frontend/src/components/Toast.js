import React from 'react';

const Toast = ({ message, type = 'success', show }) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast ${type}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast; 