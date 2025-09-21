// API service for external astrology API integration

import type { BirthData, ApiResponse, ApiError, ApiSettings } from '../types/astrology';

class AstrologyApiService {
  private apiSettings: ApiSettings | null = null;

  // Load API settings from localStorage
  private loadSettings(): ApiSettings | null {
    try {
      const settings = localStorage.getItem('astrology_api_settings');
      return settings ? JSON.parse(settings) : null;
    } catch {
      return null;
    }
  }

  // Save API settings to localStorage
  // WARNING: This stores the API key in browser storage, which is not secure for production use
  // For production, move API calls to a server-side proxy to keep keys secure
  public saveSettings(settings: ApiSettings): void {
    this.apiSettings = settings;
    localStorage.setItem('astrology_api_settings', JSON.stringify(settings));
    
    // Show security warning
    if (typeof window !== 'undefined') {
      console.warn('⚠️ SECURITY WARNING: API key is stored in browser localStorage. ' +
                   'For production use, implement server-side API proxy to keep keys secure.');
    }
  }

  // Get current API settings
  public getSettings(): ApiSettings | null {
    if (!this.apiSettings) {
      this.apiSettings = this.loadSettings();
    }
    return this.apiSettings;
  }

  // Check if API is configured
  public isConfigured(): boolean {
    const settings = this.getSettings();
    return !!(settings?.apiKey && settings?.baseUrl);
  }

  // Make API request to calculate chart via proxy server
  public async calculateChart(birthData: BirthData): Promise<ApiResponse> {
    const settings = this.getSettings();
    
    if (!settings?.apiKey || !settings?.baseUrl) {
      throw new Error('API not configured. Please set API key and base URL in settings.');
    }

    // Use proxy server instead of direct API call
    const proxyUrl = `${window.location.protocol}//${window.location.hostname}:3001/api/chart`;
    
    const requestPayload = {
      apiKey: settings.apiKey,
      baseUrl: settings.baseUrl,
      birthData: birthData
    };

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    };

    try {
      console.log('Making API request via proxy to:', proxyUrl);
      console.log('Request payload:', { ...requestPayload, apiKey: '[REDACTED]' });
      
      const response = await fetch(proxyUrl, requestOptions);
      
      console.log('Response received:', { status: response.status, statusText: response.statusText, ok: response.ok });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        const errorMsg = `Proxy Error (${response.status}): ${errorData.error || errorData.detail || response.statusText}`;
        console.error('Proxy Error:', errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json() as ApiResponse;
      console.log('API response received successfully via proxy');
      return data;
    } catch (error) {
      console.error('Fetch error details:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while fetching chart data');
    }
  }

  // Test API connection
  public async testConnection(): Promise<boolean> {
    try {
      // Test with sample birth data
      const testData: BirthData = {
        year: 1990,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        second: 0,
        lat: 28.6139,
        lon: 77.2090,
        tz: 'Asia/Kolkata'
      };

      console.log('Testing API connection with data:', testData);
      const settings = this.getSettings();
      console.log('Using API settings:', { baseUrl: settings?.baseUrl, apiKey: settings?.apiKey ? 'SET' : 'NOT_SET' });
      
      await this.calculateChart(testData);
      console.log('API connection test successful');
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  // Clear API settings
  public clearSettings(): void {
    this.apiSettings = null;
    localStorage.removeItem('astrology_api_settings');
  }
}

// Export singleton instance
export const astrologyApiService = new AstrologyApiService();
export default astrologyApiService;