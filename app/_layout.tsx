import React from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "./data/ThemeContext";
import { AuthProvider } from "./data/AuthContext";

export default function RootLayout() {
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