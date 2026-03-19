import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "./data/ThemeContext";
import { AuthProvider } from "./data/AuthContext";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Check Auth / Token
        const token = await AsyncStorage.getItem("token");
        
        // 2. Initialize Guest ID if needed
        const userInfo = await AsyncStorage.getItem("userInfo");
        if (!userInfo && !token) {
          const guestUser = {
            _id: "guest_" + Math.random().toString(36).substr(2, 9),
            name: "Guest User",
            isGuest: true,
          };
          await AsyncStorage.setItem("userInfo", JSON.stringify(guestUser));
        }

        // 3. Optional: Pre-fetch some data or wait a bit for a smooth transition
        // We wait a total of at least 2.5 seconds to ensure the splash is seen and app is stable
        await new Promise(resolve => setTimeout(resolve, 2500)); 
        
      } catch (e) {
        console.warn("Initialization Error:", e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      // Hide the native splash screen once the app is ready to render
      // This is the single source of truth for loading
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    // Returning null keeps the native splash screen active
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}