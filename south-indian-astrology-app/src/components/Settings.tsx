// Settings component for API configuration

import React, { useState, useEffect } from 'react';
import astrologyApiService from '../services/astrologyApi';
import type { ApiSettings } from '../types/astrology';
import './Settings.css';

interface SettingsProps {
  onClose: () => void;
  onSettingsSaved: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose, onSettingsSaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Load existing settings
  useEffect(() => {
    const settings = astrologyApiService.getSettings();
    if (settings) {
      setApiKey(settings.apiKey);
      setBaseUrl(settings.baseUrl);
    }
  }, []);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSave = async () => {
    if (!apiKey.trim() || !baseUrl.trim()) {
      showMessage('Please provide both API key and base URL', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const settings: ApiSettings = {
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim()
      };
      
      // Save settings
      astrologyApiService.saveSettings(settings);
      
      // Test connection
      const isConnected = await astrologyApiService.testConnection();
      
      if (isConnected) {
        showMessage('Settings saved and connection verified successfully!', 'success');
        onSettingsSaved();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        showMessage('Settings saved but connection test failed. Please verify your API key and URL.', 'error');
      }
    } catch (error) {
      showMessage(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim() || !baseUrl.trim()) {
      showMessage('Please provide both API key and base URL first', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Temporarily save settings for testing
      const settings: ApiSettings = {
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim()
      };
      
      astrologyApiService.saveSettings(settings);
      
      const isConnected = await astrologyApiService.testConnection();
      
      if (isConnected) {
        showMessage('Connection test successful!', 'success');
      } else {
        showMessage('Connection test failed. Please verify your API key and URL.', 'error');
      }
    } catch (error) {
      showMessage(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    astrologyApiService.clearSettings();
    setApiKey('');
    setBaseUrl('');
    showMessage('Settings cleared successfully', 'success');
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>API Settings</h2>
          <button className="close-button" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>
        
        <div className="settings-content">
          <div className="form-group">
            <label htmlFor="apiKey">API Key:</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              disabled={isLoading}
            />
            <small>Your API key for accessing the astrology service</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="baseUrl">API Base URL:</label>
            <input
              type="url"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-api-domain.com"
              disabled={isLoading}
            />
            <small>Base URL of the astrology API service</small>
          </div>
          
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
          
          <div className="settings-actions">
            <button
              className="test-button"
              onClick={handleTestConnection}
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              className="save-button"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
            
            <button
              className="clear-button"
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear Settings
            </button>
          </div>
        </div>
        
        <div className="settings-help">
          <h4>Setup Instructions:</h4>
          <ol>
            <li>Enter your API key from the astrology service provider</li>
            <li>Enter the base URL of the API (e.g., https://api.example.com)</li>
            <li>Click "Test Connection" to verify your settings</li>
            <li>Click "Save Settings" to store your configuration</li>
          </ol>
          <div className="security-warning">
            <strong>⚠️ Security Notice:</strong> This demo stores API keys in browser storage. 
            For production use, implement a server-side proxy to keep API keys secure.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;