import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CalculatorInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onOperationPress: (op: '+' | '-' | '/' | '×') => void;
  onEquals: () => void;
  onClear: () => void;
}

export const CalculatorInput: React.FC<CalculatorInputProps> = ({
  value,
  onValueChange,
  onOperationPress,
  onEquals,
  onClear,
}) => {
  const { theme, isDark } = useTheme();

  const handleOperationPress = (op: '+' | '-' | '/' | '×') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOperationPress(op);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClear();
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 15, stiffness: 120 }}
      style={{
        backgroundColor: isDark
          ? theme.colors.background.card
          : theme.colors.background.card,
        borderRadius: theme.borderRadius.xl,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        ...Platform.select({
          ios: {
            shadowColor: isDark ? '#000' : '#1a223d',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 12,
          },
          android: {
            elevation: 4,
          },
        }),
        borderWidth: isDark ? 1 : 0,
        borderColor: theme.colors.border,
      }}
    >
      {/* Calculator Display */}
      <View className="mb-4">
        <TextInput
          value={value}
          onChangeText={onValueChange}
          placeholder="Enter amount"
          placeholderTextColor={theme.colors.text.placeholder}
          keyboardType="numeric"
          style={{
            fontSize: theme.typography.fontSize.xxxl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            textAlign: 'right',
            paddingVertical: 12,
          }}
        />
      </View>

      {/* Operation Buttons */}
      <View className="flex-row items-center justify-between">
        {/* Math Operations + Equals */}
        <View className="flex-row items-center" style={{ gap: 8 }}>
          {['+', '-', '×', '/'].map((op) => (
            <TouchableOpacity
              key={op}
              onPress={() => handleOperationPress(op as '+' | '-' | '/' | '×')}
              activeOpacity={0.7}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: isDark
                  ? theme.colors.background.input
                  : theme.colors.background.secondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark
                  ? theme.colors.border
                  : theme.colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: isDark ? theme.colors.primary : theme.brand.primary,
                }}
              >
                {op}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Equals Button */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onEquals();
            }}
            activeOpacity={0.7}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isDark
                ? theme.colors.primary
                : theme.brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: '#FFFFFF',
              }}
            >
              =
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clear Button */}
        <TouchableOpacity
          onPress={handleClear}
          activeOpacity={0.7}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${theme.colors.error}15`,
            borderWidth: 1,
            borderColor: `${theme.colors.error}30`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.error,
            }}
          >
            C
          </Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  );
};

export default CalculatorInput;
