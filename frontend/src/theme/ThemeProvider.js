import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from './colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark'
  const [mode, setMode] = useState('auto'); // 'auto' | 'light' | 'dark'

  const [theme, setTheme] = useState(systemScheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    const loadPreference = async () => {
      const saved = await AsyncStorage.getItem('theme_mode');
      if (saved) setMode(saved);
    };
    loadPreference();
  }, []);

  useEffect(() => {
    const actual = mode === 'auto' ? systemScheme : mode;
    setTheme(actual === 'dark' ? darkTheme : lightTheme);
  }, [mode, systemScheme]);

  const changeTheme = async (newMode) => {
    await AsyncStorage.setItem('theme_mode', newMode);
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);