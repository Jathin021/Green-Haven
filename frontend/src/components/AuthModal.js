import React, { useState, useEffect } from 'react';

const AuthModal = ({ show, onClose, authMode, setAuthMode, handleAuth }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    if (show) {
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: ''
      });
      setErrors({});
      setPasswordStrength('');
    }
  }, [show, authMode]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    return 'strong';
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (authMode === 'register' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Name validation for register
    if (authMode === 'register') {
      if (!formData.first_name.trim()) {
        newErrors.first_name = 'First name is required';
      }
      if (!formData.last_name.trim()) {
        newErrors.last_name = 'Last name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Password strength check
    if (name === 'password' && authMode === 'register') {
      const strength = validatePassword(value);
      setPasswordStrength(strength);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await handleAuth(formData);
    } catch (err) {
      // Error is handled by the parent component
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-2">
            {authMode === 'login' ? 'Welcome back to Green Haven' : 'Join Green Haven Nursery'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Enter your email"
              required
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                placeholder="Enter your password"
                required
                className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            {authMode === 'register' && formData.password && (
              <p className={`text-sm mt-1 ${getPasswordStrengthColor()}`}>
                Password strength: {passwordStrength}
              </p>
            )}
          </div>

          {/* Register Fields */}
          {authMode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    placeholder="First name"
                    required
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onChange={handleChange}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    placeholder="Last name"
                    required
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onChange={handleChange}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  placeholder="Enter your phone number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-md font-semibold transition shadow-md ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              authMode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              className="ml-1 text-green-600 hover:text-green-700 font-semibold"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Terms for Register */}
        {authMode === 'register' && (
          <p className="text-xs text-gray-500 mt-4 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthModal; 