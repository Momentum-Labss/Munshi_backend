import { useTheme } from '@/hooks/useTheme';
import { Cart } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CartModalProps {
  visible: boolean;
  cart: Cart;
  onClose: () => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProceed: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CartModal: React.FC<CartModalProps> = ({
  visible,
  cart,
  onClose,
  onRemoveItem,
  onClearCart,
  onProceed,
}) => {
  const { theme, isDark } = useTheme();

  const handleRemoveItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemoveItem(itemId);
  };

  const handleClearCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onClearCart();
  };

  const handleProceed = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onProceed();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <MotiView
          from={{ translateY: 600 }}
          animate={{ translateY: 0 }}
          exit={{ translateY: 600 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            flex: 1,
            backgroundColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.primary,
            borderTopLeftRadius: theme.borderRadius.xxl,
            borderTopRightRadius: theme.borderRadius.xxl,
            maxHeight: '80%',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
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
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDark
                ? theme.colors.border
                : theme.colors.borderLight,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
              }}
            >
              Cart ({cart.items.length})
            </Text>

            <View className="flex-row items-center" style={{ gap: 12 }}>
              {/* Clear Cart Button */}
              {cart.items.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearCart}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: `${theme.colors.error}15`,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: `${theme.colors.error}30`,
                  }}
                >
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.error,
                      }}
                    >
                      Clear
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Close Button */}
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={theme.colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cart Items */}
          {cart.items.length > 0 ? (
            <>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {cart.items.map((item, index) => (
                  <MotiView
                    key={item.id}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      delay: index * 50,
                    }}
                    style={{
                      backgroundColor: isDark
                        ? theme.colors.background.card
                        : theme.colors.background.card,
                      borderRadius: theme.borderRadius.lg,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: isDark
                        ? theme.colors.border
                        : theme.colors.borderLight,
                    }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-3">
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.md,
                            fontWeight: theme.typography.fontWeight.semibold,
                            color: theme.colors.text.primary,
                            marginBottom: 4,
                          }}
                        >
                          {item.productName}
                          {item.productId === 'general' && (
                            <Text
                              style={{
                                fontSize: theme.typography.fontSize.xs,
                                color: theme.colors.text.tertiary,
                              }}
                            >
                              {' '}
                              (General Item)
                            </Text>
                          )}
                        </Text>

                        <View className="flex-row items-center" style={{ gap: 8 }}>
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              color: theme.colors.text.secondary,
                            }}
                          >
                            {formatCurrency(item.unitPrice)} × {item.quantity}
                          </Text>
                        </View>
                      </View>

                      <View className="items-end" style={{ gap: 8 }}>
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.lg,
                            fontWeight: theme.typography.fontWeight.bold,
                            color: isDark
                              ? theme.colors.primary
                              : theme.brand.primary,
                          }}
                        >
                          {formatCurrency(item.totalPrice)}
                        </Text>

                        <TouchableOpacity
                          onPress={() => handleRemoveItem(item.id)}
                          activeOpacity={0.7}
                          style={{
                            backgroundColor: `${theme.colors.error}15`,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: theme.borderRadius.md,
                            borderWidth: 1,
                            borderColor: `${theme.colors.error}30`,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              fontWeight: theme.typography.fontWeight.semibold,
                              color: theme.colors.error,
                            }}
                          >
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </MotiView>
                ))}
              </ScrollView>

              {/* Footer with Total and Proceed */}
              <View
                style={{
                  padding: 20,
                  borderTopWidth: 1,
                  borderTopColor: isDark
                    ? theme.colors.border
                    : theme.colors.borderLight,
                }}
              >
                <View
                  className="flex-row items-center justify-between mb-4"
                  style={{
                    backgroundColor: isDark
                      ? theme.colors.background.card
                      : theme.colors.background.secondary,
                    padding: 16,
                    borderRadius: theme.borderRadius.lg,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.xxl,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: isDark ? theme.colors.primary : theme.brand.primary,
                    }}
                  >
                    {formatCurrency(cart.totalAmount)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleProceed}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isDark
                      ? theme.colors.primary
                      : theme.brand.primary,
                    paddingVertical: 16,
                    borderRadius: theme.borderRadius.lg,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: '#FFFFFF',
                    }}
                  >
                    Proceed to Payment
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
              }}
            >
              <Ionicons
                name="cart-outline"
                size={80}
                color={theme.colors.text.tertiary}
              />
              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  color: theme.colors.text.tertiary,
                  marginTop: 16,
                  textAlign: 'center',
                }}
              >
                Your cart is empty
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.tertiary,
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                Add some products to get started
              </Text>
            </View>
          )}
        </MotiView>
      </View>
    </Modal>
  );
};

export default CartModal;
