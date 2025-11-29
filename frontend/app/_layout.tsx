// app/_layout.tsx - Root Layout with SafeArea

import AnimatedSplash from "@/components/AnimatedSplash";
import { MunshiProvider } from "@/contexts/MunshiContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { QueryClientProvider } from "@/contexts/QueryClientProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import "../global.css";

// Configure Reanimated logger to suppress warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Keep splash visible while loading
        if (fontsLoaded || fontError) {
          // Add a small delay to ensure smooth transition
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Hide the native splash screen
          await SplashScreen.hideAsync();

          // Mark app as ready (will trigger animated splash to fade out)
          setAppReady(true);
        }
      } catch (e) {
        console.warn("Error during app preparation:", e);
        setAppReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  const onSplashComplete = useCallback(() => {
    setSplashAnimationComplete(true);
  }, []);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider>
        <ThemeProvider>
          <VoiceProvider>
            <MunshiProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                  animation: "fade",
                  animationDuration: 300,
                }}
              />

              {/* Custom animated splash overlay */}
              {!splashAnimationComplete && (
                <AnimatedSplash
                  isReady={appReady}
                  onComplete={onSplashComplete}
                />
              )}
            </MunshiProvider>
          </VoiceProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
