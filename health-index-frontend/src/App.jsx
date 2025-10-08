// health-index-frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FormPage from './pages/FormPage'; 
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// A component that checks for the admin token before showing content
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* 1. Public Form */}
                <Route path="/" element={<FormPage />} /> 

                {/* 2. Admin Login */}
                <Route path="/admin/login" element={<LoginPage />} />

                {/* 3. Protected Dashboard */}
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;