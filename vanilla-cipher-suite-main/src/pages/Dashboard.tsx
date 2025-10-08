import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome to your Dashboard, {user?.username}!</h1>
      <p>You are successfully logged in.</p>
      <button onClick={logout} className="logout-btn">Logout</button>
    </div>
  );
};

export default Dashboard;