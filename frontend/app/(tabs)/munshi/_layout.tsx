import { Stack } from "expo-router";
import React from "react";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Munshi",
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default Layout;
