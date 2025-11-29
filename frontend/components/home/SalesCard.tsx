import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { Sale } from "@/types";

interface SalesCardProps {
  sales: Sale[];
  onViewAll?: () => void;
}

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date for subheader
const formatDateHeader = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("en-IN", options);
};

// Check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Get method icon
const getMethodIcon = (method: string): keyof typeof Ionicons.glyphMap => {
  switch (method) {
    case "upi":
      return "phone-portrait-outline";
    case "udhaar":
      return "time-outline";
    case "cash":
    default:
      return "cash-outline";
  }
};

// Get method label
const getMethodLabel = (method: string): string => {
  switch (method) {
    case "upi":
      return "UPI";
    case "udhaar":
      return "Udhaar";
    case "cash":
    default:
      return "Cash";
  }
};

// Sale item component
interface SaleItemProps {
  sale: Sale;
  index: number;
}

const SaleItem: React.FC<SaleItemProps> = ({ sale, index }) => {
  const { theme, isDark } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 120,
        delay: index * 80,
      }}
      className="flex-row items-center justify-between py-3"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isDark
          ? theme.colors.borderLight
          : theme.colors.borderLight,
      }}
    >
      {/* Left - Icon and details */}
      <View className="flex-row items-center flex-1">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${theme.colors.success}15`,
            marginRight: 12,
          }}
        >
          <Ionicons
            name={getMethodIcon(sale.method)}
            size={18}
            color={theme.colors.success}
          />
        </View>

        <View className="flex-1">
          <Text
            style={{
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}
          >
            {sale.time}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.tertiary,
              marginTop: 2,
            }}
          >
            {getMethodLabel(sale.method)}
          </Text>
        </View>
      </View>

      {/* Right - Amount */}
      <Text
        style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.success,
        }}
      >
        {formatCurrency(sale.amount)}
      </Text>
    </MotiView>
  );
};

export const SalesCard: React.FC<SalesCardProps> = ({ sales, onViewAll }) => {
  const { theme, isDark } = useTheme();

  // Filter today's sales
  const todaySales = sales.filter((s) => isToday(s.date));

  // Limit to 5 sales
  const displaySales = todaySales.slice(0, 5);

  const handleViewAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewAll?.();
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 100,
      }}
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
            shadowColor: isDark ? "#000" : "#1a223d",
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
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text
          style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
          }}
        >
          Sales
        </Text>
        <Ionicons
          name="trending-up-outline"
          size={20}
          color={theme.colors.text.tertiary}
        />
      </View>

      {/* Date subheader */}
      <Text
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.tertiary,
          marginBottom: 12,
        }}
      >
        {formatDateHeader(new Date())}
      </Text>

      {/* Sales list or empty state */}
      {displaySales.length > 0 ? (
        <View>
          {displaySales.map((sale, index) => (
            <SaleItem key={sale.id} sale={sale} index={index} />
          ))}
        </View>
      ) : (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
          className="items-center py-8"
        >
          <Ionicons
            name="cart-outline"
            size={48}
            color={theme.colors.text.tertiary}
          />
          <Text
            style={{
              fontSize: theme.typography.fontSize.md,
              color: theme.colors.text.tertiary,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            No sales today
          </Text>
        </MotiView>
      )}

      {/* View All button */}
      <TouchableOpacity
        onPress={handleViewAll}
        activeOpacity={0.7}
        className="flex-row items-center justify-center mt-4 py-3"
        style={{
          backgroundColor: isDark
            ? theme.colors.background.input
            : theme.colors.background.secondary,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: isDark ? theme.colors.primary : theme.brand.primary,
            marginRight: 4,
          }}
        >
          View All
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? theme.colors.primary : theme.brand.primary}
        />
      </TouchableOpacity>
    </MotiView>
  );
};

export default SalesCard;
