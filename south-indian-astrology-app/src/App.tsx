// Main application component for South Indian Astrology Charts

import { useState } from 'react';
import BirthDataForm from './components/BirthDataForm';
import SouthIndianChart from './components/SouthIndianChart';
import Settings from './components/Settings';
import ChatPage from './components/ChatPage';
import astrologyApiService from './services/astrologyApi';
import { convertToSouthIndianRasiChart, convertToSouthIndianBhavChart } from './utils/chartUtils';
import { findSavedChart, saveChart } from './utils/chartStorage';
import type { BirthData, ApiResponse, SouthIndianChartData } from './types/astrology';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chartData, setChartData] = useState<ApiResponse | null>(null);
  const [natalRasi, setNatalRasi] = useState<SouthIndianChartData | null>(null);
  const [natalBhav, setNatalBhav] = useState<SouthIndianChartData | null>(null);
  const [transitRasi, setTransitRasi] = useState<SouthIndianChartData | null>(null);
  const [transitBhav, setTransitBhav] = useState<SouthIndianChartData | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'cache' | null>(null);

  const handleCalculateCharts = async (birthData: BirthData) => {
    setIsLoading(true);
    setError('');
    setDataSource(null);
    
    try {
      // First, check if we have saved chart data for this birth data
      const savedChart = findSavedChart(birthData);
      
      let response: ApiResponse;
      
      if (savedChart) {
        // Use saved chart data
        console.log('Loading chart from saved data');
        response = savedChart.chartData;
        setDataSource('cache');
      } else {
        // Make API call for new data
        if (!astrologyApiService.isConfigured()) {
          setError('Please configure API settings first');
          setShowSettings(true);
          return;
        }
        
        console.log('Making new API call for chart data');
        response = await astrologyApiService.calculateChart(birthData);
        console.log('API Response received successfully');
        
        // Save the new chart data
        try {
          saveChart(birthData, response);
          console.log('Chart data saved successfully');
        } catch (saveError) {
          console.warn('Failed to save chart data:', saveError);
          // Continue even if save fails
        }
        
        setDataSource('api');
      }
      
      setChartData(response);
      
      // Check if response has the expected structure
      if (!response.natal_planets) {
        setError('Invalid API response: missing natal_planets data');
        return;
      }
      
      if (!response.transit_planets) {
        setError('Invalid API response: missing transit_planets data');
        return;
      }
      
      // Convert to South Indian format using new functions
      const natalRasiChart = convertToSouthIndianRasiChart(response.natal_planets);
      const natalBhavChart = convertToSouthIndianBhavChart(response.natal_planets, response.natal_house_cusps);
      const transitRasiChart = convertToSouthIndianRasiChart(response.transit_planets);
      const transitBhavChart = convertToSouthIndianBhavChart(response.transit_planets, response.transit_house_cusps);
      
      setNatalRasi(natalRasiChart);
      setNatalBhav(natalBhavChart);
      setTransitRasi(transitRasiChart);
      setTransitBhav(transitBhavChart);
      
    } catch (error) {
      console.error('Error in handleCalculateCharts:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate charts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSaved = () => {
    setError('');
  };

  const handleNavigateToChat = () => {
    setShowChat(true);
  };

  const handleNavigateFromChat = () => {
    setShowChat(false);
  };

  // Show chat page if requested
  if (showChat) {
    return (
      <ChatPage 
        chartData={chartData}
        onNavigateBack={handleNavigateFromChat}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>South Indian Astrology Charts</h1>
        <div className="header-actions">
          <button 
            className="chat-button"
            onClick={handleNavigateToChat}
            disabled={isLoading}
          >
            💬 AI Chat
          </button>
          <button 
            className="settings-button"
            onClick={() => setShowSettings(true)}
            disabled={isLoading}
          >
            ⚙️ Settings
          </button>
          {!astrologyApiService.isConfigured() && (
            <span className="config-warning">⚠️ API not configured</span>
          )}
        </div>
      </header>

      <main className="app-main">
        <BirthDataForm 
          onSubmit={handleCalculateCharts} 
          isLoading={isLoading}
        />
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {isLoading && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Calculating charts...</p>
          </div>
        )}
        
        {dataSource && !isLoading && (
          <div className={`data-source-message ${dataSource === 'cache' ? 'cache-source' : 'api-source'}`}>
            {dataSource === 'cache' ? 
              '💾 Loaded from saved data (no API call needed)' : 
              '🌐 Fresh data retrieved from API (saved for future use)'
            }
          </div>
        )}
        
        {chartData && !isLoading && (
          <div className="charts-container">
            <div className="charts-grid">
              {natalRasi && (
                <SouthIndianChart 
                  chartData={natalRasi} 
                  title="Natal Rasi Chart"
                  showHouses={false}
                />
              )}
              
              {natalBhav && (
                <SouthIndianChart 
                  chartData={natalBhav} 
                  title="Natal Bhav Chart"
                  showHouses={true}
                />
              )}
              
              {transitRasi && (
                <SouthIndianChart 
                  chartData={transitRasi} 
                  title="Transit Chart"
                  showHouses={false}
                />
              )}
              
              {transitBhav && (
                <SouthIndianChart 
                  chartData={transitBhav} 
                  title="Transit Bhav Chart"
                  showHouses={true}
                />
              )}
            </div>
            
            <div className="chart-info">
              <h3>Chart Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Natal Ayanamsha:</label>
                  <span>{chartData.other_details.natal_ayanamsha_name}</span>
                </div>
                <div className="info-item">
                  <label>Transit Ayanamsha:</label>
                  <span>{chartData.other_details.transit_ayanamsha_name}</span>
                </div>
                <div className="info-item">
                  <label>Natal House System:</label>
                  <span>{chartData.other_details.natal_house_system_used}</span>
                </div>
                <div className="info-item">
                  <label>Transit House System:</label>
                  <span>{chartData.other_details.transit_house_system_used}</span>
                </div>
                <div className="info-item">
                  <label>Timezone:</label>
                  <span>{chartData.other_details.timezone_used}</span>
                </div>
                <div className="info-item">
                  <label>Natal Date:</label>
                  <span>{chartData.other_details.natal_date_formatted}</span>
                </div>
                <div className="info-item">
                  <label>Transit Date:</label>
                  <span>{chartData.other_details.transit_date_formatted}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)}
          onSettingsSaved={handleSettingsSaved}
        />
      )}
    </div>
  );
}

export default App;
