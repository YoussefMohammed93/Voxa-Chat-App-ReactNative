import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

// Define the theme options
export type ThemeMode = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

// Define the context shape
interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => void;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  themeMode: "system",
  colorScheme: "light",
  setThemeMode: () => {},
});

// Storage key for theme preference
const THEME_MODE_STORAGE_KEY = "theme_mode";

// Provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get the device color scheme
  const deviceColorScheme = useDeviceColorScheme();
  
  // State for the theme mode (system, light, dark)
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  
  // Derived state for the actual color scheme to use
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    deviceColorScheme === "dark" ? "dark" : "light"
  );

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
        if (savedThemeMode) {
          setThemeMode(savedThemeMode as ThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    };

    loadThemePreference();
  }, []);

  // Update color scheme when theme mode or device theme changes
  useEffect(() => {
    let newColorScheme: ColorScheme;
    
    switch (themeMode) {
      case "light":
        newColorScheme = "light";
        break;
      case "dark":
        newColorScheme = "dark";
        break;
      case "system":
      default:
        newColorScheme = deviceColorScheme === "dark" ? "dark" : "light";
        break;
    }
    
    setColorScheme(newColorScheme);
  }, [themeMode, deviceColorScheme]);

  // Function to update theme mode and save to storage
  const handleSetThemeMode = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        colorScheme,
        setThemeMode: handleSetThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
