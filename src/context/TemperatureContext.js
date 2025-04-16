import React, { createContext, useState, useContext } from 'react';

const TemperatureContext = createContext();

export const TemperatureProvider = ({ children }) => {
  const [temperatureUnit, setTemperatureUnit] = useState('C');

  const toggleTemperatureUnit = (unit) => {
    setTemperatureUnit(unit);
  };

  const convertTemp = (temp) => {
    if (temperatureUnit === 'C') {
      // If we're displaying in Celsius, return the temperature as is
      return Math.round(temp);
    } else {
      // Convert Celsius to Fahrenheit
      return Math.round((temp * 9/5) + 32);
    }
  };

  return (
    <TemperatureContext.Provider value={{ temperatureUnit, toggleTemperatureUnit, convertTemp }}>
      {children}
    </TemperatureContext.Provider>
  );
};

export const useTemperature = () => {
  const context = useContext(TemperatureContext);
  if (!context) {
    throw new Error('useTemperature must be used within a TemperatureProvider');
  }
  return context;
}; 