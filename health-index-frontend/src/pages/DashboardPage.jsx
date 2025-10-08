// health-index-frontend/src/pages/DashboardPage.jsx - FINAL VERSION WITH COLOR-CODED METRICS

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Data Classification Logic (Based on Screenshot 2025-10-07 180428.png) ---
const getClassification = (metric, score) => {
    // Scores are 1-10. This logic maps the score to Good, Moderate, or Bad.
    // The exact mapping is derived from the criteria implied by the spreadsheet:
    // Good: 9-10 (Best performance, lowest error/waste, best health)
    // Moderate: 5-8 (Acceptable performance)
    // Bad: 1-4 (Needs significant improvement, highest error/waste, worst health)
    
    // Note: The spreadsheet defines criteria (like <2% error, <10% health index), 
    // but without explicit score-to-criteria mapping, a direct score-based 
    // classification is the simplest way to implement the visual indicator.

    if (score >= 9) {
        return 'good'; // Green
    } else if (score >= 5) {
        return 'moderate'; // Yellow
    } else {
        return 'bad'; // Red
    }
};


// --- Reusable Component: Modal for Editing (Kept the Multi-Select Dropdown) ---
const EditModal = ({ submission, onClose, onSave }) => {
    const [formData, setFormData] = useState(submission);
    
    // Helper data for the Edit form
    const businessTypeOptions = ['Manufacturing Company', 'Service Company'];
    
    // COMPLETE LIST OF BUSINESS CATEGORIES
    const businessCategoryOptions = [
        'Agriculture & Farming', 'Industrial & Manufacturing', 'Consumer Goods & & Retail', 
        'Food & Beverage', 'Health & Beauty', 'Automotive & Transportation', 
        'Professional & Business Services', 'Financial Services', 'Healthcare Services', 
        'Hospitality & Tourism', 'Education & Training', 'Construction & Real Estate', 
        'Transportation & Logistics', 'Maintenance & Repair Services', 'Personal & Lifestyle Services'
    ];

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        if (type === 'number') {
            setFormData({ ...formData, [name]: parseInt(value) });
        } else if (name === 'businessCategories') {
            // Logic for Multi-Select Dropdown
            const selectedOptions = Array.from(e.target.options)
                                       .filter(option => option.selected)
                                       .map(option => option.value);
            setFormData({ ...formData, businessCategories: selectedOptions });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    // Function to render the 1-10 rating inputs
    const renderRatingInputs = (key, label) => (
        <>
            <label>{label} (1-10)</label>
            <input 
                type="number" 
                name={key} 
                value={formData[key]} 
                onChange={handleChange} 
                min="1" max="10" 
                required 
            />
        </>
    );

    return (
        <div className="modal-overlay">
            <div className="edit-modal">
                <h3>Edit Submission: {submission.companyName}</h3>
                <form onSubmit={handleSubmit}>
                    
                    {/* Contact Fields */}
                    <label>Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    
                    <label>Company Name</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
                    
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    
                    <label>Address</label>
                    <input type="text" name="address" value={formData.address || ''} onChange={handleChange} />
                    
                    <label>Phone Number</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} />
                    
                    <label>Website</label>
                    <input type="url" name="website" value={formData.website || ''} onChange={handleChange} />
                    
                    {/* Business Categories Multi-Select Dropdown */}
                    <label>Business Categories (Hold CTRL/CMD to select multiple)</label>
                    <select 
                        name="businessCategories" 
                        value={formData.businessCategories} 
                        onChange={handleChange}
                        multiple
                        size={Math.min(businessCategoryOptions.length, 6)}
                    >
                        {businessCategoryOptions.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                    
                    {/* Business Type Radio Buttons */}
                    <label>Business Type</label>
                    <div className="radio-group">
                        {businessTypeOptions.map(type => (
                            <label key={type}>
                                <input 
                                    type="radio" 
                                    name="businessType" 
                                    value={type} 
                                    checked={formData.businessType === type} 
                                    onChange={handleChange} 
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                    
                    {/* Rating Fields */}
                    {renderRatingInputs("qualityIndex", "Quality Index")}
                    {renderRatingInputs("costEfficiency", "Cost Efficiency")}
                    {renderRatingInputs("deliveryTimeliness", "Delivery Timeliness")}
                    {renderRatingInputs("customerSatisfaction", "Customer Satisfaction")}
                    {renderRatingInputs("processStability", "Process Stability")}
                    {renderRatingInputs("employeeHealth", "Employee Health Condition")}


                    <div className="modal-actions">
                        <button type="submit" className="dashboard-button save-button">Save Changes</button>
                        <button type="button" onClick={onClose} className="dashboard-button cancel-button">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Data Display Component for Submissions (UPDATED for Color-Coding) ---
const SubmissionsTable = ({ data, onEdit, onDelete }) => {
    // The keys that need color-coding
    const metricKeys = [
        'qualityIndex', 'costEfficiency', 'deliveryTimeliness', 
        'customerSatisfaction', 'processStability', 'employeeHealth'
    ];
    
    // COMPLETE Column definitions for all 14 fields
    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'companyName', label: 'Company' },
        { key: 'address', label: 'Address' },           
        { key: 'phoneNumber', label: 'Phone Number' }, 
        { key: 'email', label: 'Email' },
        { key: 'website', label: 'Website' },           
        { key: 'businessType', label: 'Type' },
        { key: 'businessCategories', label: 'Categories' },
        { key: 'qualityIndex', label: 'Quality Index' },
        { key: 'costEfficiency', label: 'Cost Efficiency' },
        { key: 'deliveryTimeliness', label: 'Delivery Timeliness' },
        { key: 'customerSatisfaction', label: 'Customer Satisfaction' },
        { key: 'processStability', label: 'Process Stability' },
        { key: 'employeeHealth', label: 'Employee Health Condition' },
    ];

    if (!data || data.length === 0) {
        return <p>No Health Index submissions found.</p>;
    }

    return (
        <div className="table-responsive">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                        <th>Actions</th> 
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item._id}>
                            {columns.map(col => {
                                const isMetric = metricKeys.includes(col.key);
                                const cellValue = Array.isArray(item[col.key]) 
                                    ? item[col.key].join(', ') 
                                    : item[col.key];

                                // Apply class if it's a metric
                                const cellClass = isMetric 
                                    ? `metric-cell ${getClassification(col.key, item[col.key])}`
                                    : '';

                                return (
                                    <td key={col.key} className={cellClass}>
                                        {cellValue}
                                    </td>
                                );
                            })}
                            <td>
                                <button className="action-button edit-button" onClick={() => onEdit(item)}>Edit</button>
                                <button className="action-button delete-button" onClick={() => onDelete(item._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// ... (Keep UserManagement component and Main DashboardPage export as they were) ...
const UserManagement = () => (
    <div className="user-management-panel">
        <h3>User Management</h3>
        <p>This panel is a placeholder. You would implement backend routes and UI here for managing admin accounts.</p>
        <div className="placeholder-card">
            <h4>User List (Placeholder)</h4>
            <ul>
                <li>Admin (Current User)</li>
                <li>John Doe (Editor)</li>
            </ul>
            <button className="dashboard-button">Add New User</button>
        </div>
    </div>
);


const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('data');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingSubmission, setEditingSubmission] = useState(null); 
    const navigate = useNavigate();
    
    const getToken = () => localStorage.getItem('token');

    // --- Data Fetching Logic ---
    const fetchSubmissions = async () => {
        const token = getToken();
        if (!token) {
            navigate('/admin/login');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/submissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSubmissions(response.data);
            setError('');
        } catch (err) {
            // Handle 401 Unauthorized or expired token
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/admin/login');
            } else {
                setError('Failed to fetch data. Check server connection.'); 
            }
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSubmissions();
    }, []);

    // --- CRUD Handlers ---
    
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this submission?")) return;
        
        const token = getToken();
        try {
            await axios.delete(`http://localhost:5000/api/submissions/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSubmissions(prev => prev.filter(sub => sub._id !== id));
            alert('Submission deleted successfully.');
        } catch (err) {
            alert('Deletion failed.'); 
            console.error('Delete Error:', err.response || err);
        }
    };
    
    const handleEditSave = async (updatedData) => {
        const token = getToken();
        const id = updatedData._id;
        
        try {
            const response = await axios.put(`http://localhost:5000/api/submissions/${id}`, updatedData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setSubmissions(prev => prev.map(sub => (sub._id === id ? response.data : sub)));
            setEditingSubmission(null); // Close modal
            alert('Submission updated successfully.');
        } catch (err) {
            alert('Update failed. Check form fields and server console.');
            console.error('Update Error:', err.response || err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    return (
        <div className="dashboard-layout">
            
            {/* Left Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h2>Health Index</h2>
                    <p className="portal-label">Admin Portal</p>
                </div>
                
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeTab === 'data' ? 'active' : ''}`}
                        onClick={() => setActiveTab('data')}
                    >
                        📊 Submission Data
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 User Management
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-button" onClick={handleLogout}>
                        ⬅️ Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="dashboard-main-content">
                <header className="main-header">
                    <h1>{activeTab === 'data' ? 'Submission Reports' : 'System Administration'}</h1>
                    <div className="user-profile">
                        <span>Admin User</span>
                        <div className="user-avatar">AD</div>
                    </div>
                </header>

                <div className="content-body">
                    {loading && <p>Loading data...</p>}
                    {error && <p className="error-message">{error}</p>}

                    {!loading && !error && (
                        <>
                            {activeTab === 'data' && (
                                <SubmissionsTable 
                                    data={submissions} 
                                    onEdit={setEditingSubmission}
                                    onDelete={handleDelete}
                                />
                            )}
                            {activeTab === 'users' && (
                                <UserManagement />
                            )}
                        </>
                    )}
                </div>
            </main>
            
            {/* Edit Modal */}
            {editingSubmission && (
                <EditModal
                    submission={editingSubmission}
                    onClose={() => setEditingSubmission(null)}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
};

export default DashboardPage;