// Utility functions for processing astrology chart data

import type { PlanetLongitudes, HouseCusps, SouthIndianChartData, ChartPosition } from '../types/astrology';
import { ZODIAC_SIGNS } from '../types/astrology';

// Convert degrees to zodiac sign (0-11)
export function degreesToSign(degrees: number): number {
  return Math.floor(degrees / 30);
}

// Convert degrees to sign and degree within sign
export function degreesToSignDegree(degrees: number): { sign: number; degree: number } {
  const sign = Math.floor(degrees / 30);
  const degree = degrees % 30;
  return { sign, degree };
}

// Get zodiac sign name
export function getSignName(signNumber: number): string {
  return ZODIAC_SIGNS[signNumber] || 'Unknown';
}

// Convert planet longitudes to South Indian Rasi chart format
export function convertToSouthIndianRasiChart(planetData: PlanetLongitudes): SouthIndianChartData {
  const positions: ChartPosition[] = [];
  
  // Calculate ascendant sign
  const ascendantSign = degreesToSign(planetData.Ascendant);
  
  // Process each planet (excluding Ascendant as it's handled separately)
  Object.entries(planetData).forEach(([planet, longitude]) => {
    if (planet !== 'Ascendant') {
      const { sign, degree } = degreesToSignDegree(longitude);
      
      positions.push({
        sign,
        degree,
        planet
      });
    }
  });
  
  return {
    positions,
    ascendant: ascendantSign
  };
}

// Convert planet longitudes and house cusps to South Indian Bhav chart format
export function convertToSouthIndianBhavChart(planetData: PlanetLongitudes, houseCusps: HouseCusps): SouthIndianChartData {
  const positions: ChartPosition[] = [];
  
  // Calculate ascendant sign
  const ascendantSign = degreesToSign(planetData.Ascendant);
  
  // Process each planet (excluding Ascendant as it's handled separately)
  Object.entries(planetData).forEach(([planet, longitude]) => {
    if (planet !== 'Ascendant') {
      const { sign, degree } = degreesToSignDegree(longitude);
      
      positions.push({
        sign,
        degree,
        planet
      });
    }
  });
  
  // Add house cusps to the chart
  Object.entries(houseCusps).forEach(([house, longitude]) => {
    const { sign, degree } = degreesToSignDegree(longitude);
    
    positions.push({
      sign,
      degree,
      planet: house.replace('House ', 'H') // Convert "House 1" to "H1"
    });
  });
  
  return {
    positions,
    ascendant: ascendantSign
  };
}


// Get planets in a specific sign
export function getPlanetsInSign(positions: ChartPosition[], signNumber: number): ChartPosition[] {
  return positions.filter(pos => pos.sign === signNumber);
}

// Format degree display
export function formatDegree(degree: number): string {
  const deg = Math.floor(degree);
  const min = Math.floor((degree - deg) * 60);
  const sec = Math.floor(((degree - deg) * 60 - min) * 60);
  return `${deg}°${min}'${sec}"`;
}

// Get planet symbol/abbreviation
export function getPlanetSymbol(planet: string): string {
  const symbols: { [key: string]: string } = {
    'Sun': '☉',
    'Moon': '☽',
    'Mars': '♂',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋'
  };
  return symbols[planet] || planet;
}

// South Indian chart fixed rasi positions (4x4 grid)
export function getSouthIndianRasiPositions(): number[] {
  // Returns the correct sign order for South Indian chart layout
  // Grid positions (row by row): [row1, row2, row3, row4]
  return [
    11, 0, 1, 2,   // Top row: Pisces, Aries, Taurus, Gemini
    10, -1, -1, 3, // Middle row: Aquarius, center, center, Cancer  
    9, -1, -1, 4,  // Middle row: Capricorn, center, center, Leo
    8, 7, 6, 5     // Bottom row: Sagittarius, Scorpio, Libra, Virgo
  ];
}

// Get house number for a given sign based on ascendant
export function getHouseNumber(signNumber: number, ascendantSign: number): number {
  let house = signNumber - ascendantSign + 1;
  if (house <= 0) {
    house += 12;
  }
  return house;
}

// Determine if two planets are in conjunction (within orb)
export function isConjunction(planet1Deg: number, planet2Deg: number, orb: number = 8): boolean {
  const diff = Math.abs(planet1Deg - planet2Deg);
  return diff <= orb || diff >= (360 - orb);
}

// Get all conjunctions in chart
export function findConjunctions(planetPositions: PlanetLongitudes, orb: number = 8): Array<{planets: string[], degrees: number[]}> {
  const conjunctions: Array<{planets: string[], degrees: number[]}> = [];
  const planetList = Object.entries(planetPositions);
  
  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const [planet1, deg1] = planetList[i];
      const [planet2, deg2] = planetList[j];
      
      if (isConjunction(deg1, deg2, orb)) {
        // Check if this conjunction group already exists
        let existingGroup = conjunctions.find(group => 
          group.planets.includes(planet1) || group.planets.includes(planet2)
        );
        
        if (existingGroup) {
          // Add to existing group
          if (!existingGroup.planets.includes(planet1)) {
            existingGroup.planets.push(planet1);
            existingGroup.degrees.push(deg1);
          }
          if (!existingGroup.planets.includes(planet2)) {
            existingGroup.planets.push(planet2);
            existingGroup.degrees.push(deg2);
          }
        } else {
          // Create new group
          conjunctions.push({
            planets: [planet1, planet2],
            degrees: [deg1, deg2]
          });
        }
      }
    }
  }
  
  return conjunctions;
}