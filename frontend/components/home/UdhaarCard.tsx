import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { Udhaar } from "@/types";

interface UdhaarCardProps {
  udhaars: Udhaar[];
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

// Format date short
const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

// Udhaar item component
interface UdhaarItemProps {
  udhaar: Udhaar;
  index: number;
  baseDelay?: number;
}

const UdhaarItem: React.FC<UdhaarItemProps> = ({
  udhaar,
  index,
  baseDelay = 0,
}) => {
  const { theme, isDark } = useTheme();

  const isPending = udhaar.status === "pending";

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 120,
        delay: baseDelay + index * 60,
      }}
      className="flex-row items-center justify-between py-3"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isDark
          ? theme.colors.borderLight
          : theme.colors.borderLight,
      }}
    >
      {/* Left - Person and details */}
      <View className="flex-row items-center flex-1">
        {/* Avatar */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isPending
              ? `${theme.colors.warning}15`
              : `${theme.colors.success}15`,
            marginRight: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: isPending ? theme.colors.warning : theme.colors.success,
            }}
          >
            {udhaar.personName.charAt(0).toUpperCase()}
          </Text>
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
            {udhaar.personName}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.tertiary,
              marginTop: 2,
            }}
          >
            {formatDateShort(isPending ? udhaar.date : udhaar.paidDate || udhaar.date)}
          </Text>
        </View>
      </View>

      {/* Right - Amount */}
      <Text
        style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.semibold,
          color: isPending ? theme.colors.warning : theme.colors.success,
        }}
      >
        {formatCurrency(udhaar.amount)}
      </Text>
    </MotiView>
  );
};

// Section component
interface SectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const Section: React.FC<SectionProps> = ({ title, children, delay = 0 }) => {
  const { theme } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: 200,
        delay,
      }}
      className="mt-3"
    >
      <Text
        style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.secondary,
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      {children}
    </MotiView>
  );
};

export const UdhaarCard: React.FC<UdhaarCardProps> = ({
  udhaars,
  onViewAll,
}) => {
  const { theme, isDark } = useTheme();

  // Separate pending and paid udhaars
  const pendingUdhaars = udhaars.filter((u) => u.status === "pending");
  const paidUdhaars = udhaars
    .filter((u) => u.status === "paid")
    .sort((a, b) => {
      const dateA = a.paidDate || a.date;
      const dateB = b.paidDate || b.date;
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3);

  const hasNoUdhaars = pendingUdhaars.length === 0 && paidUdhaars.length === 0;

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
        delay: 100,
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
      <View className="flex-row items-center justify-between">
        <Text
          style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
          }}
        >
          Udhaar
        </Text>
        <Ionicons
          name="wallet-outline"
          size={20}
          color={theme.colors.text.tertiary}
        />
      </View>

      {/* Content */}
      {hasNoUdhaars ? (
        // Empty state
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
          className="items-center py-8"
        >
          <Ionicons
            name="wallet-outline"
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
            No udhaars yet
          </Text>
        </MotiView>
      ) : (
        <>
          {/* Pending section */}
          {pendingUdhaars.length > 0 && (
            <Section title="Pending" delay={100}>
              {pendingUdhaars.map((udhaar, index) => (
                <UdhaarItem
                  key={udhaar.id}
                  udhaar={udhaar}
                  index={index}
                  baseDelay={150}
                />
              ))}
            </Section>
          )}

          {/* Paid section */}
          {paidUdhaars.length > 0 && (
            <Section
              title="Paid"
              delay={pendingUdhaars.length > 0 ? 200 : 100}
            >
              {paidUdhaars.map((udhaar, index) => (
                <UdhaarItem
                  key={udhaar.id}
                  udhaar={udhaar}
                  index={index}
                  baseDelay={pendingUdhaars.length > 0 ? 250 : 150}
                />
              ))}
            </Section>
          )}
        </>
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

export default UdhaarCard;
