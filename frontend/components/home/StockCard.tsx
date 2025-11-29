import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { StockItem, StockStatus } from "@/types";

interface StockCardProps {
  stockItems: StockItem[];
  onViewAll?: () => void;
}

// Get days until refill
const getDaysUntilRefill = (date: Date | undefined): number => {
  if (!date) return 999; // Return large number if no date
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Get stock status based on days until refill
const getStockStatus = (daysUntil: number): StockStatus => {
  if (daysUntil <= 1) return "critical";
  if (daysUntil <= 3) return "low";
  return "ok";
};

// Format refill time
const formatRefillTime = (date: Date | undefined): string => {
  if (!date) return "N/A";
  const days = getDaysUntilRefill(date);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `${days} days`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// Stock item component
interface StockItemRowProps {
  item: StockItem;
  index: number;
}

const StockItemRow: React.FC<StockItemRowProps> = ({ item, index }) => {
  const { theme, isDark } = useTheme();

  // Determine status based on current quantity
  const getStatus = (): { status: StockStatus; color: string } => {
    if (item.currentQuantity === 0) {
      return { status: "critical", color: theme.colors.error };
    } else if (item.currentQuantity < 10) {
      return { status: "low", color: theme.colors.warning };
    }
    return { status: "ok", color: theme.colors.success };
  };

  const { status, color: statusColor } = getStatus();

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
      {/* Left - Item details */}
      <View className="flex-row items-center flex-1">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${statusColor}15`,
            marginRight: 12,
          }}
        >
          <Ionicons
            name="cube-outline"
            size={18}
            color={statusColor}
          />
        </View>

        <View className="flex-1">
          <Text
            style={{
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.tertiary,
              marginTop: 2,
            }}
          >
            {item.category || "General"}
          </Text>
        </View>
      </View>

      {/* Right - Stock quantity */}
      <View className="items-end">
        <Text
          style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            color: statusColor,
          }}
        >
          {item.currentQuantity}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.tertiary,
          }}
        >
          {item.unit}
        </Text>
      </View>
    </MotiView>
  );
};

export const StockCard: React.FC<StockCardProps> = ({
  stockItems,
  onViewAll,
}) => {
  const { theme, isDark } = useTheme();

  // Sort items by refill date (most urgent first)
  const sortedItems = [...stockItems].sort((a, b) => {
    const aTime = a.predictedRefillDate?.getTime() ?? Infinity;
    const bTime = b.predictedRefillDate?.getTime() ?? Infinity;
    return aTime - bTime;
  });

  // Get items needing refill (within 3 days)
  const needsRefill = sortedItems.filter(
    (item) => getDaysUntilRefill(item.predictedRefillDate) <= 3
  );

  // Display top 4 items
  const displayItems = sortedItems.slice(0, 4);

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
        delay: 200,
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
          Stock
        </Text>
        <Ionicons
          name="cube-outline"
          size={20}
          color={theme.colors.text.tertiary}
        />
      </View>

      {/* Stock list or empty state */}
      {displayItems.length > 0 ? (
        <View>
          {displayItems.map((item, index) => (
            <StockItemRow key={item.id} item={item} index={index} />
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
            name="cube-outline"
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
            No stock items
          </Text>
        </MotiView>
      )}

      {/* Needs Refill Box */}
      {needsRefill.length > 0 && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 120,
            delay: 400,
          }}
          style={{
            backgroundColor: isDark
              ? `${theme.colors.warning}15`
              : `${theme.colors.warning}10`,
            borderRadius: theme.borderRadius.lg,
            padding: 12,
            marginTop: 12,
            borderWidth: 1,
            borderColor: `${theme.colors.warning}30`,
          }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="alert-circle"
              size={16}
              color={theme.colors.warning}
            />
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.warning,
                marginLeft: 6,
              }}
            >
              Needs Refill
            </Text>
          </View>

          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {needsRefill.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: isDark
                    ? theme.colors.background.card
                    : theme.colors.background.primary,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: theme.borderRadius.md,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
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

export default StockCard;
