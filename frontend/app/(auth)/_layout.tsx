// app/(auth)/_layout.tsx - Auth Stack Navigator

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="email" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}
