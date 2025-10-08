// health-index-frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: 'admin', password: 'securepassword123' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/login', credentials);
            
            localStorage.setItem('token', response.data.token);
            navigate('/admin/dashboard');

        } catch (err) {
            setError('Login failed. Check username and password.');
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                
                <div className="login-logo-section">
                    <div className="logo-placeholder"></div> 
                    <h1>Admin Portal</h1>
                </div>

                <div className="login-header">
                    <h2>Log In</h2>
                    <p className="test-credentials">Use: **admin** / **securepassword123**</p>
                </div>
                
                <form onSubmit={handleSubmit} className="login-form">
                    
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={credentials.username} 
                            onChange={handleChange} 
                            required 
                        />
                        <span className="input-icon user-icon">👤</span> 
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={credentials.password} 
                            onChange={handleChange} 
                            required 
                        />
                        <span className="input-icon eye-icon">👁️</span> 
                    </div>

                    <a href="#" className="forgot-password">Forgot Password?</a>
                    
                    {error && <p className="login-error">{error}</p>}
                    
                    <button type="submit" className="login-button">
                        Log In
                    </button>
                    
                    <p className="signup-link">
                        Don't have access? Contact support.
                    </p>

                </form>
            </div>
        </div>
    );
};

export default LoginPage;