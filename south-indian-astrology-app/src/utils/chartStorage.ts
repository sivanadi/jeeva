// Chart Storage Utility - Save and retrieve chart data from localStorage

import type { BirthData, ApiResponse } from '../types/astrology';

// Interface for saved chart data
export interface SavedChart {
  id: string;
  birthData: BirthData;
  chartData: ApiResponse;
  savedAt: number;
  label?: string;
}

// Storage key for localStorage
const STORAGE_KEY = 'saved_astrology_charts';

// Generate unique ID for birth data
export function generateChartId(birthData: BirthData): string {
  const { year, month, day, hour, minute, second, lat, lon } = birthData;
  return `${year}-${month}-${day}-${hour}-${minute}-${second}-${lat.toFixed(4)}-${lon.toFixed(4)}`;
}

// Get all saved charts from localStorage
export function getSavedCharts(): SavedChart[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading saved charts:', error);
    return [];
  }
}

// Save a new chart to localStorage
export function saveChart(birthData: BirthData, chartData: ApiResponse, label?: string): string {
  try {
    const chartId = generateChartId(birthData);
    const savedChart: SavedChart = {
      id: chartId,
      birthData,
      chartData,
      savedAt: Date.now(),
      label
    };

    const savedCharts = getSavedCharts();
    
    // Remove existing chart with same ID if it exists
    const filteredCharts = savedCharts.filter(chart => chart.id !== chartId);
    
    // Add new chart
    filteredCharts.push(savedChart);
    
    // Keep only last 50 charts to avoid localStorage bloat
    const limitedCharts = filteredCharts.slice(-50);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedCharts));
    
    console.log(`Chart saved with ID: ${chartId}`);
    return chartId;
  } catch (error) {
    console.error('Error saving chart:', error);
    throw new Error('Failed to save chart data');
  }
}

// Find existing chart by birth data
export function findSavedChart(birthData: BirthData): SavedChart | null {
  try {
    const chartId = generateChartId(birthData);
    const savedCharts = getSavedCharts();
    
    return savedCharts.find(chart => chart.id === chartId) || null;
  } catch (error) {
    console.error('Error finding saved chart:', error);
    return null;
  }
}

// Delete a saved chart
export function deleteSavedChart(chartId: string): boolean {
  try {
    const savedCharts = getSavedCharts();
    const filteredCharts = savedCharts.filter(chart => chart.id !== chartId);
    
    if (filteredCharts.length < savedCharts.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCharts));
      console.log(`Chart deleted with ID: ${chartId}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting chart:', error);
    return false;
  }
}

// Clear all saved charts
export function clearAllSavedCharts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('All saved charts cleared');
  } catch (error) {
    console.error('Error clearing charts:', error);
  }
}

// Get storage usage info
export function getStorageInfo(): { chartCount: number; storageSize: string } {
  try {
    const savedCharts = getSavedCharts();
    const storageData = localStorage.getItem(STORAGE_KEY) || '';
    const sizeInBytes = new Blob([storageData]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    return {
      chartCount: savedCharts.length,
      storageSize: `${sizeInKB} KB`
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { chartCount: 0, storageSize: '0 KB' };
  }
}

// Format saved chart for display
export function formatChartLabel(savedChart: SavedChart): string {
  if (savedChart.label) {
    return savedChart.label;
  }
  
  const { birthData } = savedChart;
  const date = new Date(birthData.year, birthData.month - 1, birthData.day, birthData.hour, birthData.minute);
  
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}