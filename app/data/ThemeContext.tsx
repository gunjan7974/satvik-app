// app/data/ThemeContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= TYPES ================= */

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;

  primary: string;
  secondary: string;

  danger: string;
  success: string;
  warning: string;

  inputBackground: string;
  modalBackground: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  mode: "light" | "dark";
  toggle: () => void;
  setMode: (mode: "light" | "dark") => void;
}

/* ================= ORANGE THEME ================= */

/* 🌞 LIGHT MODE (Orange / Food App Look) */
const lightColors: ThemeColors = {
  background: "#FFF8F1",        // page background
  card: "#FFFFFF",              // cards
  text: "#2E2E2E",              // main text
  subText: "#7A7A7A",            // secondary text
  border: "#FFE0C2",             // light orange border

  primary: "#FF6F00",            // 🔥 MAIN ORANGE
  secondary: "#FF8F00",

  danger: "#D84315",             // cancel / error
  success: "#2E7D32",            // delivered
  warning: "#FB8C00",            // preparing

  inputBackground: "#FFF3E0",    // search / inputs
  modalBackground: "#FFFFFF",
};

/* 🌙 DARK MODE (Premium Orange Dark) */
const darkColors: ThemeColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  subText: "#BDBDBD",
  border: "#2C2C2C",

  primary: "#FF9800",            // 🔥 glowing orange
  secondary: "#FFB74D",

  danger: "#FF7043",
  success: "#66BB6A",
  warning: "#FFA726",

  inputBackground: "#2A2A2A",
  modalBackground: "#1F1F1F",
};

/* ================= CONTEXT ================= */

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

/* ================= PROVIDER ================= */

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();

  const [mode, setModeState] = useState<"light" | "dark">(
    systemScheme === "dark" ? "dark" : "light"
  );

  /* Load saved theme */
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("theme_mode");
        if (saved === "light" || saved === "dark") {
          setModeState(saved);
        }
      } catch (e) {
        console.log("Theme load error:", e);
      }
    })();
  }, []);

  /* Save theme */
  const saveTheme = async (value: "light" | "dark") => {
    try {
      await AsyncStorage.setItem("theme_mode", value);
    } catch (e) {
      console.log("Theme save error:", e);
    }
  };

  /* Toggle light / dark */
  const toggle = () => {
    const next = mode === "light" ? "dark" : "light";
    setModeState(next);
    saveTheme(next);
  };

  const setMode = (value: "light" | "dark") => {
    setModeState(value);
    saveTheme(value);
  };

  const colors = mode === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        colors,
        mode,
        toggle,
        setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
