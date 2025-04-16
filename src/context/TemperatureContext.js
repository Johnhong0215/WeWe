import React, { createContext, useState, useContext } from 'react';

const TemperatureContext = createContext();

export const TemperatureProvider = ({ children }) => {
  const [isCelsius, setIsCelsius] = useState(false);

  const toggleUnit = () => {
    setIsCelsius(prev => !prev);
  };

  const convertTemp = (fahrenheit) => {
    if (isCelsius) {
      return Math.round((fahrenheit - 32) * 5 / 9);
    }
    return fahrenheit;
  };

  return (
    <TemperatureContext.Provider value={{ isCelsius, toggleUnit, convertTemp }}>
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