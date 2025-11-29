// contexts/ThemeContext.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import {
  createTheme,
  DarkColors,
  LightColors,
  Theme,
} from "../constants/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

const THEME_STORAGE_KEY = "@app_theme_mode";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light"); // Default to dark
  const [isLoading, setIsLoading] = useState(true);

  // NativeWind's color scheme hook
  const { setColorScheme } = useNativeWindColorScheme();

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Sync NativeWind color scheme whenever themeMode changes
  useEffect(() => {
    setColorScheme(themeMode);
  }, [themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

  const toggleTheme = () => {
    const newMode = themeMode === "light" ? "dark" : "light";
    handleSetThemeMode(newMode);
  };

  const theme = createTheme(themeMode === "light" ? LightColors : DarkColors);
  const isDark = themeMode === "dark";

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        themeMode,
        toggleTheme,
        setThemeMode: handleSetThemeMode,
      }}
    >
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      {children}
    </ThemeContext.Provider>
  );
};
