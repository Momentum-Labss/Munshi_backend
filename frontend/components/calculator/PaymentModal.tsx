import { useTheme } from '@/hooks/useTheme';
import { SaleMethod } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

interface PaymentModalProps {
  visible: boolean;
  amount: number;
  onClose: () => void;
  onSelectMethod: (method: SaleMethod) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  amount,
  onClose,
  onSelectMethod,
}) => {
  const { theme, isDark } = useTheme();

  const handleSelectMethod = (method: SaleMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectMethod(method);
  };

  const paymentMethods: {
    method: SaleMethod;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }[] = [
    {
      method: 'cash',
      label: 'Cash',
      icon: 'cash-outline',
      color: theme.colors.success,
    },
    {
      method: 'upi',
      label: 'UPI',
      icon: 'phone-portrait-outline',
      color: theme.colors.info,
    },
    {
      method: 'udhaar',
      label: 'Udhaar',
      icon: 'time-outline',
      color: theme.colors.warning,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          style={{
            backgroundColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.primary,
            borderRadius: theme.borderRadius.xxl,
            width: '100%',
            maxWidth: 400,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
              },
              android: {
                elevation: 8,
              },
            }),
          }}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDark
                ? theme.colors.border
                : theme.colors.borderLight,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                }}
              >
                Payment Method
              </Text>

              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={theme.colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.card
                  : theme.colors.background.secondary,
                padding: 12,
                borderRadius: theme.borderRadius.lg,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  marginBottom: 4,
                }}
              >
                Total Amount
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xxl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: isDark ? theme.colors.primary : theme.brand.primary,
                }}
              >
                {formatCurrency(amount)}
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={{ padding: 24 }}>
            {paymentMethods.map((pm, index) => (
              <MotiView
                key={pm.method}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  delay: index * 100,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleSelectMethod(pm.method)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isDark
                      ? theme.colors.background.card
                      : theme.colors.background.card,
                    borderRadius: theme.borderRadius.lg,
                    padding: 20,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: `${pm.color}30`,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: `${pm.color}15`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Ionicons name={pm.icon} size={28} color={pm.color} />
                  </View>

                  <View className="flex-1">
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text.primary,
                        marginBottom: 4,
                      }}
                    >
                      {pm.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.tertiary,
                      }}
                    >
                      {pm.method === 'cash'
                        ? 'Pay with cash'
                        : pm.method === 'upi'
                        ? 'Pay via UPI'
                        : 'Credit to customer'}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={theme.colors.text.tertiary}
                  />
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};

export default PaymentModal;
