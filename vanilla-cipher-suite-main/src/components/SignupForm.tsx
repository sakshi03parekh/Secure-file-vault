import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import './SignupForm.css'; // We'll create this CSS file

const SignupForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const checkPasswordStrength = (password: string) => {
    if (password.length === 0) return '';
    if (password.length < 8) return 'Weak';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strength === 4) return 'Strong';
    if (strength >= 2) return 'Medium';
    return 'Weak';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate inputs
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength === 'Weak') {
      setError('Please choose a stronger password');
      setLoading(false);
      return;
    }

    const result = await signup({ username, email, password });
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/index');
      }, 1500);
    } else {
      setError(result.error || 'Signup failed');
    }
    
    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'Strong': return '#10B981'; // Green
      case 'Medium': return '#F59E0B'; // Amber
      case 'Weak': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#38BDFF" strokeWidth="4" />
              <path d="M12 20 L18 26 L28 14" stroke="#38BDFF" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h2>Create Your Account</h2>
          <p>Join us today and start your journey</p>
        </div>

        {error && (
          <div className="error-alert">
            <span>⚠️</span>
            <div className="error-text">{error}</div>
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}

        {success && (
          <div className="success-alert">
            <span>✅</span>
            <div className="success-text">Account created successfully! Redirecting...</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <span className="input-icon">✉</span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Create a strong password"
                required
                disabled={loading}
              />
            </div>
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: passwordStrength === 'Strong' ? '100%' : 
                             passwordStrength === 'Medium' ? '66%' : '33%',
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                  {passwordStrength} password
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="signup-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="login-link">Sign in instead</Link>
        </div>

        <div className="terms">
          <p>By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;