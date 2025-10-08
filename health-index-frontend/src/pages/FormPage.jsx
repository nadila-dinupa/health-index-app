// health-index-frontend/src/pages/FormPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Initial State for Form Fields ---
const initialFormData = {
    name: '',
    companyName: '',
    address: '',
    phoneNumber: '',
    email: '',
    website: '',
    businessType: '', // radio: Manufacturing or Service
    businessCategories: [], // checkbox array
    
    // Performance Metrics (1-10 Scores)
    qualityIndex: 1, 
    costEfficiency: 1, 
    deliveryTimeliness: 1,
    customerSatisfaction: 1,
    processStability: 1,
    employeeHealth: 1,
};

// --- Reusable Component: Rating Block (1-10 Star Scale) ---
const RatingBlock = ({ name, label, description, value, onChange }) => {
    
    // Handler for updating the rating score state
    const handleRatingChange = (e) => {
        onChange({ target: { name: name, value: parseInt(e.target.value) } });
    };

    return (
        <div className="form-card rating-block">
            <h4>{label} <span className="rating-description">({description})</span></h4>
            <div className="rating-scale">
                {[...Array(10)].map((_, i) => {
                    const ratingValue = i + 1;
                    return (
                        <label key={i} className="rating-option">
                            <span className="rating-number">{ratingValue}</span>
                            <input 
                                type="radio" 
                                name={name} 
                                value={ratingValue} 
                                checked={value === ratingValue} 
                                onChange={handleRatingChange} 
                                required 
                            />
                            {/* Star coloring logic: color the star if its value is less than or equal to the selected value */}
                            <span className="star-icon" style={{ color: ratingValue <= value ? 'gold' : '#ced4da' }}>
                                ★
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

// --- Reusable Component: Input Group ---
const InputGroup = ({ label, name, type = "text", value, onChange, placeholder, required = false }) => (
    <div className="input-group form-card">
        <label htmlFor={name}>{label}{required && ' *'}</label>
        <input 
            type={type} 
            id={name}
            name={name} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
            required={required}
        />
    </div>
);

// --- Reusable Component: Selection Group (Radio/Checkboxes) ---
const SelectionGroup = ({ label, name, options, type, values, onChange }) => {
    
    const handleCheckChange = (e) => {
        const { value, checked } = e.target;
        let newValues = [...values];
        
        if (checked) {
            newValues = [...newValues, value];
        } else {
            newValues = newValues.filter(c => c !== value);
        }
        
        onChange({ target: { name, value: newValues } });
    };

    return (
        <div className="form-card selection-group">
            <h4 className="selection-label">{label}</h4>
            <div className="selection-options">
                {options.map((option, index) => (
                    <label key={index} className="selection-option">
                        <input 
                            type={type} 
                            name={type === 'radio' ? name : option} 
                            value={option} 
                            checked={values.includes(option)}
                            onChange={type === 'radio' ? onChange : handleCheckChange}
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>
    );
};


// --- Main Form Page Component ---
const FormPage = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleCategoryChange = (e) => {
        setFormData({ ...formData, businessCategories: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Submitting...');
        setIsSubmitting(true);
        
        try {
            await axios.post('http://localhost:5000/api/submit', formData); 
            setMessage('✅ Success! Health Index submitted.');
            setFormData(initialFormData); 
        } catch (error) {
            setMessage('❌ Submission failed. Check the network tab for details.');
            console.error('Submission Error:', error.response ? error.response.data : error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const businessTypeOptions = ['Manufacturing Company', 'Service Company'];
    const businessCategoryOptions = [
        'Agriculture & Farming', 'Industrial & Manufacturing', 'Consumer Goods & Retail', 
        'Food & Beverage', 'Health & Beauty', 'Automotive & Transportation', 
        'Professional & Business Services', 'Financial Services', 'Healthcare Services', 
        'Hospitality & Tourism', 'Education & Training', 'Construction & Real Estate', 
        'Transportation & Logistics', 'Maintenance & Repair Services', 'Personal & Lifestyle Services'
    ];


    return (
        <div className="form-page-container">
            <header className="form-header form-card">
                <h1>Health Index Dashboard for a Company</h1>
                <p>The Health Index helps service and manufacturing businesses measure their overall performance across key areas like quality, efficiency, and customer satisfaction.</p>
                <button onClick={() => navigate('/admin/login')} style={{ float: 'right', marginTop: '-50px', backgroundColor: '#e0f2f7', color: '#1d3557', border: '1px solid #1d3557', borderRadius: '4px', fontSize: '0.9em' }}>Admin Login</button>
            </header>

            <form onSubmit={handleSubmit}>
                {/* --- Contact and Business Info --- */}
                <InputGroup label="Name" name="name" value={formData.name} onChange={handleChange} required={true} placeholder="Your name" />
                <InputGroup label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required={true} placeholder="The company name" />
                <InputGroup label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Your company address" />
                <InputGroup label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} placeholder="Your phone number" />
                <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required={true} placeholder="Your email address" />
                <InputGroup label="Website" name="website" type="url" value={formData.website} onChange={handleChange} placeholder="Your website URL" />

                <SelectionGroup 
                    label="Business Type" 
                    name="businessType" 
                    options={businessTypeOptions} 
                    type="radio" 
                    values={[formData.businessType]} 
                    onChange={handleChange} 
                />
                
                <SelectionGroup 
                    label="Business categories" 
                    name="businessCategories" 
                    options={businessCategoryOptions} 
                    type="checkbox" 
                    values={formData.businessCategories} 
                    onChange={handleCategoryChange} 
                />

                {/* --- Performance Metrics (1-10 Ratings) --- */}
                <RatingBlock name="qualityIndex" label="Quality Index" description="Defects per Million, Error Rate" value={formData.qualityIndex} onChange={handleChange} />
                <RatingBlock name="costEfficiency" label="Cost Efficiency" description="COPQ, Waste" value={formData.costEfficiency} onChange={handleChange} />
                <RatingBlock name="deliveryTimeliness" label="Delivery / Timeliness" description="Turnaround Time, On-Time Delivery" value={formData.deliveryTimeliness} onChange={handleChange} />
                <RatingBlock name="customerSatisfaction" label="Customer Satisfaction" description="NPS, Feedback" value={formData.customerSatisfaction} onChange={handleChange} />
                <RatingBlock name="processStability" label="Process Stability & Capability" description="Sigma Level, Variation" value={formData.processStability} onChange={handleChange} />
                <RatingBlock name="employeeHealth" label="Employee & Group Health Condition" description="Turnover, Training, Safety" value={formData.employeeHealth} onChange={handleChange} />

                <div className="form-card" style={{ textAlign: 'right', paddingTop: '15px' }}>
                    {message && <p style={{ float: 'left', color: message.startsWith('❌') ? 'red' : 'green', fontWeight: 'bold' }}>{message}</p>}
                    <button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#673ab7' /* Purple Submit button */, padding: '10px 30px' }}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                    <button type="reset" onClick={() => setFormData(initialFormData)} style={{ marginLeft: '10px', backgroundColor: '#ccc', color: '#333' }}>
                        Clear form
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormPage;