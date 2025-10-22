import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';


type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  tabBar: string;
  tabBarActive: string;
}

const lightTheme: ThemeColors = {
  background: '#F8FDF8',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  primary: '#2D7D32',
  primaryLight: '#E8F5E8',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  border: '#E0E0E0',
  tabBar: '#FFFFFF',
  tabBarActive: '#2D7D32',
};

const darkTheme: ThemeColors = {
  background: '#0A0F0A',
  surface: '#1A1F1A',
  card: '#252A25',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  primary: '#4CAF50',
  primaryLight: '#1A2F1A',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  border: '#333333',
  tabBar: '#1A1F1A',
  tabBarActive: '#4CAF50',
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemTheme = useColorScheme()
  const [manualTheme, setManualTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    async function loadTheme() {
      const savedTheme = await AsyncStorage.getItem("manualTheme");
      if (savedTheme === "light" || savedTheme === "dark") setManualTheme(savedTheme);
    }
    loadTheme();
  }, []);

  const toggleTheme = useCallback( async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setManualTheme(newTheme);
    await AsyncStorage.setItem("manualTheme", newTheme);
  }, []);

  const theme = manualTheme ?? (systemTheme ?? "light");
  const colors = useMemo(() => theme === 'light' ? lightTheme : darkTheme, [theme]);

  return useMemo(() => ({
    theme,
    colors,
    toggleTheme,
    setManualTheme,
    isLoading,
    isDark: theme === 'dark',
  }), [theme, colors, toggleTheme, isLoading]);
});

export const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === "light" ? "dark" : "light"} />
      {children}
    </>
  );
};