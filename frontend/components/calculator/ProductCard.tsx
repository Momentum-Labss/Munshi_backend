import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  index?: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  index = 0,
}) => {
  const { theme, isDark } = useTheme();
  const [quantity, setQuantity] = useState<number>(1);

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const totalPrice = product.price * quantity;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 120,
        delay: index * 30,
      }}
      style={{
        backgroundColor: isDark
          ? theme.colors.background.card
          : theme.colors.background.card,
        borderRadius: theme.borderRadius.md,
        padding: 10,
        borderWidth: 1,
        borderColor: isDark ? theme.colors.border : theme.colors.borderLight,
        opacity: product.inStock ? 1 : 0.5,
        aspectRatio: 0.85,
      }}
    >
      <View className="flex-1 items-center justify-between">
        {/* Product Name */}
        <Text
          style={{
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            textAlign: 'center',
            marginBottom: 4,
            lineHeight: 14,
          }}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Price */}
        <View style={{ marginBottom: 4 }}>
          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.bold,
              color: isDark ? theme.colors.primary : theme.brand.primary,
              textAlign: 'center',
            }}
          >
            {formatCurrency(product.price)}
          </Text>
          {product.unit && (
            <Text
              style={{
                fontSize: 9,
                color: theme.colors.text.tertiary,
                textAlign: 'center',
              }}
            >
              per {product.unit}
            </Text>
          )}
        </View>

        {/* Quantity Controls */}
        <View className="flex-row items-center" style={{ gap: 4, marginBottom: 6 }}>
          <TouchableOpacity
            onPress={handleDecrement}
            disabled={quantity <= 1 || !product.inStock}
            activeOpacity={0.7}
            style={{
              width: 28,
              height: 32,
              borderRadius: 8,
              backgroundColor:
                quantity <= 1 || !product.inStock
                  ? theme.colors.background.input
                  : isDark
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
            <Ionicons
              name="remove"
              size={14}
              color={
                quantity <= 1 || !product.inStock
                  ? theme.colors.text.disabled
                  : theme.colors.text.primary
              }
            />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              minWidth: 20,
              textAlign: 'center',
            }}
          >
            {quantity}
          </Text>

          <TouchableOpacity
            onPress={handleIncrement}
            disabled={!product.inStock}
            activeOpacity={0.7}
            style={{
              width: 28,
              height: 32,
              borderRadius: 8,
              backgroundColor: !product.inStock
                ? theme.colors.background.input
                : isDark
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
            <Ionicons
              name="add"
              size={14}
              color={
                !product.inStock
                  ? theme.colors.text.disabled
                  : theme.colors.text.primary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={!product.inStock}
          activeOpacity={0.7}
          style={{
            backgroundColor: !product.inStock
              ? theme.colors.background.input
              : isDark
              ? theme.colors.primary
              : theme.brand.primary,
            paddingHorizontal: 8,
            paddingVertical: 8,
            borderRadius: theme.borderRadius.md,
            width: '100%',
            alignItems: 'center',
            minHeight: 32,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.bold,
              color: '#FFFFFF',
            }}
          >
            {formatCurrency(totalPrice)}
          </Text>
        </TouchableOpacity>

        {!product.inStock && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark
                ? 'rgba(0,0,0,0.7)'
                : 'rgba(255,255,255,0.8)',
              borderRadius: theme.borderRadius.md,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 9,
                color: theme.colors.error,
                fontWeight: theme.typography.fontWeight.bold,
              }}
            >
              Out of Stock
            </Text>
          </View>
        )}
      </View>
    </MotiView>
  );
};

export default ProductCard;
