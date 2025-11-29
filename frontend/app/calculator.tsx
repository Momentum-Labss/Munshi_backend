import { CalculatorContent } from '@/components/calculator';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CalculatorPage = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className="flex-1">
        {/* Custom Header */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 12,
            paddingHorizontal: 20,
            backgroundColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.primary,
            borderBottomWidth: 1,
            borderBottomColor: isDark
              ? theme.colors.border
              : theme.colors.borderLight,
          }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark
                  ? theme.colors.background.input
                  : theme.colors.background.secondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                letterSpacing: -0.5,
              }}
            >
              Calculator
            </Text>

            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Calculator Content */}
        <CalculatorContent includeSafeArea={false} />
      </View>
    </>
  );
};

export default CalculatorPage;
