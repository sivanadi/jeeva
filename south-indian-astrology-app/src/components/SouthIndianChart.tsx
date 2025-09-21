// South Indian Chart Display Component

import React from 'react';
import type { SouthIndianChartData } from '../types/astrology';
import { getPlanetsInSign, getSignName, getPlanetSymbol, getHouseNumber } from '../utils/chartUtils';
import './SouthIndianChart.css';

interface SouthIndianChartProps {
  chartData: SouthIndianChartData;
  title: string;
  showHouses?: boolean;
}

const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ 
  chartData, 
  title, 
  showHouses = false 
}) => {
  // South Indian chart layout - Fixed rasi positions (signs never move)
  const southIndianLayout = [
    // Top row: Pisces -> Aries -> Taurus -> Gemini
    { sign: 11, gridArea: '1 / 1' },  // Pisces - top-left 
    { sign: 0, gridArea: '1 / 2' },   // Aries - top-center-left 
    { sign: 1, gridArea: '1 / 3' },   // Taurus - top-center-right 
    { sign: 2, gridArea: '1 / 4' },   // Gemini - top-right 
    // Middle sides: Aquarius and Cancer
    { sign: 10, gridArea: '2 / 1' },  // Aquarius - middle-left 
    { sign: 3, gridArea: '2 / 4' },   // Cancer - middle-right 
    // Middle sides: Capricorn and Leo
    { sign: 9, gridArea: '3 / 1' },   // Capricorn - middle-left 
    { sign: 4, gridArea: '3 / 4' },   // Leo - middle-right 
    // Bottom row: Sagittarius -> Scorpio -> Libra -> Virgo
    { sign: 8, gridArea: '4 / 1' },   // Sagittarius - bottom-left 
    { sign: 7, gridArea: '4 / 2' },   // Scorpio - bottom-center-left 
    { sign: 6, gridArea: '4 / 3' },   // Libra - bottom-center-right 
    { sign: 5, gridArea: '4 / 4' }    // Virgo - bottom-right 
  ];

  // Get planet abbreviations
  const getPlanetAbbreviation = (planet: string): string => {
    const abbreviations: { [key: string]: string } = {
      'Sun': 'Su',
      'Moon': 'Mo', 
      'Mars': 'Ma',
      'Mercury': 'Me',
      'Jupiter': 'Ju',
      'Venus': 'Ve',
      'Saturn': 'Sa',
      'Rahu': 'Ra',
      'Ketu': 'Ke',
      'Ascendant': 'As'
    };
    return abbreviations[planet] || planet.substring(0, 2);
  };

  const renderHouse = (signNumber: number, gridArea: string) => {
    const planetsInSign = getPlanetsInSign(chartData.positions, signNumber);
    const isAscendant = signNumber === chartData.ascendant;
    const houseNumber = getHouseNumber(signNumber, chartData.ascendant);
    
    // Add ascendant as a "planet" if this is the ascendant sign
    const allPlanetsInSign = [...planetsInSign];
    if (isAscendant) {
      allPlanetsInSign.push({
        sign: signNumber,
        degree: 0,
        planet: 'Ascendant'
      });
    }

    return (
      <div 
        key={signNumber} 
        className={`chart-house house-${signNumber} ${isAscendant ? 'ascendant-house' : ''}`}
        style={{ gridArea }}
      >
        {showHouses && <div className="house-number">{houseNumber}</div>}
        <div className="planets-container">
          {allPlanetsInSign.map((planet, index) => {
            const planetName = planet.planet || '';
            if (planetName.startsWith('H')) return null; // Skip house markers for now
            
            const abbrev = getPlanetAbbreviation(planetName);
            const isRahu = planetName === 'Rahu';
            const isKetu = planetName === 'Ketu';
            
            return (
              <div 
                key={index} 
                className={`planet-abbrev ${isRahu ? 'rahu' : ''} ${isKetu ? 'ketu' : ''}`}
                title={planetName}
              >
                {isRahu ? `(${abbrev})` : isKetu ? `(${abbrev})` : abbrev}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="south-indian-chart">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-grid">
        {southIndianLayout.map(({ sign, gridArea }) => 
          renderHouse(sign, gridArea)
        )}
        
        {/* Center 2x2 block for chart information */}
        <div className="center-info" style={{ gridArea: '2 / 2 / span 2 / span 2' }}>
          <div className="chart-center">
            <div className="chart-type">{title.includes('Natal') ? 'NATAL' : 'TRANSIT'}</div>
            <div className="chart-subtype">{title.includes('Rasi') ? 'RASI' : 'BHAV'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SouthIndianChart;