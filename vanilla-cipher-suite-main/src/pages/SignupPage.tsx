import React from 'react';
import SignupForm from '../components/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="signup-page">
      <div className="container">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;