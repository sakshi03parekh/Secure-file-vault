// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';

// const LoginForm: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const result = await login({ email, password });
    
//     if (result.success) {
//       navigate('/index');
//     } else {
//       setError(result.error || 'Login failed');
//     }
    
//     setLoading(false);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="login-form">
//       <h2>Login</h2>
      
//       <div className="form-group">
//         <label htmlFor="email">Email</label>
//         <input
//           type="email"
//           id="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           placeholder="Enter your email"
//         />
//       </div>
      
//       <div className="form-group">
//         <label htmlFor="password">Password</label>
//         <input
//           type="password"
//           id="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           placeholder="Enter your password"
//         />
//       </div>
      
//       <button type="submit" disabled={loading}>
//         {loading ? 'Logging in...' : 'Login'}
//       </button>
      
//       {error && <p className="error">{error}</p>}
      
//       <p className="signup-link">
//         Don't have an account? <Link to="/signup">Sign up</Link>
//       </p>
//     </form>
//   );
// };

// export default LoginForm;
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css'; // We'll create this CSS file

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); // 'login', 'forgot'

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const result = await login({ email, password });
    
    if (result.success) {
      navigate('/index');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address to reset your password');
      return;
    }

    setLoading(true);
    // Simulate password reset request
    setTimeout(() => {
      setLoading(false);
      alert(`Password reset instructions sent to ${email}`);
      setView('login');
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>
            {view === 'login' 
              ? 'Sign in to access your account' 
              : 'Reset your password'}
          </p>
        </div>

        {error && (
          <div className="error-alert">
            {error}
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}

        <form onSubmit={view === 'forgot' ? handleForgotPassword : handleLogin}>
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

          {view !== 'forgot' && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {view === 'forgot' ? 'Sending...' : 'Signing in...'}
              </>
            ) : view === 'forgot' ? 'Reset Password' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          {view === 'login' ? (
            <>
              <p className="signup-link">
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
              <p>
                <button 
                  onClick={() => setView('forgot')} 
                  className="forgot-link"
                >
                  Forgot password?
                </button>
              </p>
            </>
          ) : (
            <p>
              <button 
                onClick={() => setView('login')} 
                className="back-link"
              >
                ← Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;