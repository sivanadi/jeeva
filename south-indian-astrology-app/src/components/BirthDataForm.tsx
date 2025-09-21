// Birth Data Input Form Component

import React, { useState } from 'react';
import type { BirthData } from '../types/astrology';
import './BirthDataForm.css';

interface BirthDataFormProps {
  onSubmit: (birthData: BirthData) => void;
  isLoading: boolean;
}

const BirthDataForm: React.FC<BirthDataFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<BirthData>({
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    second: 0,
    lat: 28.6139,
    lon: 77.2090,
    tz: 'Asia/Kolkata', // Keep for API compatibility but don't show in form
    ayanamsha: 'lahiri',
    house_system: 'placidus'
  });

  const handleChange = (field: keyof BirthData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Timezone is handled automatically by the API, no need to show in form

  const ayanamshas = [
    { value: 'lahiri', label: 'Lahiri (N.C. Lahiri)' },
    { value: 'krishnamurti', label: 'Krishnamurti' },
    { value: 'raman', label: 'B.V. Raman' },
    { value: 'yukteshwar', label: 'Yukteshwar' }
  ];

  const houseSystems = [
    { value: 'placidus', label: 'Placidus' },
    { value: 'equal', label: 'Equal House' },
    { value: 'whole', label: 'Whole Sign' }
  ];

  return (
    <form className="birth-data-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Birth Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Year:</label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Month:</label>
            <select
              value={formData.month}
              onChange={(e) => handleChange('month', parseInt(e.target.value))}
              disabled={isLoading}
              required
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Day:</label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.day}
              onChange={(e) => handleChange('day', parseInt(e.target.value))}
              disabled={isLoading}
              required
            />
          </div>
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Hour (24h):</label>
            <input
              type="number"
              min="0"
              max="23"
              value={formData.hour}
              onChange={(e) => handleChange('hour', parseInt(e.target.value))}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Minute:</label>
            <input
              type="number"
              min="0"
              max="59"
              value={formData.minute}
              onChange={(e) => handleChange('minute', parseInt(e.target.value))}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Second:</label>
            <input
              type="number"
              min="0"
              max="59"
              value={formData.second || 0}
              onChange={(e) => handleChange('second', parseInt(e.target.value))}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Location</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Latitude:</label>
            <input
              type="number"
              step="0.0001"
              value={formData.lat}
              onChange={(e) => handleChange('lat', parseFloat(e.target.value))}
              disabled={isLoading}
              placeholder="28.6139"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Longitude:</label>
            <input
              type="number"
              step="0.0001"
              value={formData.lon}
              onChange={(e) => handleChange('lon', parseFloat(e.target.value))}
              disabled={isLoading}
              placeholder="77.2090"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Chart Settings</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Ayanamsha:</label>
            <select
              value={formData.ayanamsha}
              onChange={(e) => handleChange('ayanamsha', e.target.value)}
              disabled={isLoading}
            >
              {ayanamshas.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>House System:</label>
            <select
              value={formData.house_system}
              onChange={(e) => handleChange('house_system', e.target.value)}
              disabled={isLoading}
            >
              {houseSystems.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <button type="submit" className="calculate-button" disabled={isLoading}>
        {isLoading ? 'Calculating Charts...' : 'Calculate Charts'}
      </button>
    </form>
  );
};

export default BirthDataForm;