import { useTheme } from "@/hooks/useTheme";
import { StockItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { MotiView } from "moti";
import React, { useState, useMemo } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useInventory } from "@/api/inventory";

const StockPage = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch inventory data from API
  const { data, isLoading, error } = useInventory({
    page: 1,
    limit: 100,
    search: searchQuery || undefined,
  });

  // Transform API data to StockItem format
  const stockData: StockItem[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.stock,
      currentQuantity: item.stock,
      unit: item.unit,
      category: item.type,
      lastRefillDate: item.updatedAt ? new Date(item.updatedAt) : undefined,
      refillFrequency: undefined,
      predictedRefillDate: undefined,
      price: item.price,
    }));
  }, [data]);

  // Calculate days until refill and status
  const getStockStatus = (item: StockItem) => {
    const daysSinceRefill = item.lastRefillDate
      ? Math.floor(
          (Date.now() - item.lastRefillDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;
    const daysUntilRefill =
      item.refillFrequency && daysSinceRefill !== null
        ? item.refillFrequency - daysSinceRefill
        : undefined;

    if (item.quantity !== undefined) {
      if (item.quantity === 0) {
        return {
          status: "out",
          color: theme.colors.error,
          label: "Out of Stock",
        };
      } else if (item.quantity < 10) {
        return {
          status: "low",
          color: theme.colors.warning,
          label: "Low Stock",
        };
      } else if (daysUntilRefill !== undefined && daysUntilRefill <= 0) {
        return {
          status: "refill",
          color: theme.colors.warning,
          label: "Needs Refill",
        };
      }
    }

    return {
      status: "normal",
      color: theme.colors.success,
      label: "In Stock",
    };
  };

  // Filter stock data
  const filteredStock = stockData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const renderStockItem = ({
    item,
    index,
  }: {
    item: StockItem;
    index: number;
  }) => {
    const stockStatus = getStockStatus(item);
    const daysSinceRefill = item.lastRefillDate
      ? Math.floor(
          (Date.now() - item.lastRefillDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
    const daysUntilRefill = item.refillFrequency
      ? item.refillFrequency - daysSinceRefill
      : 0;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 15, delay: index * 50 }}
        style={{
          backgroundColor: isDark
            ? theme.colors.background.card
            : theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isDark ? theme.colors.border : theme.colors.borderLight,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: 4,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                marginBottom: 8,
              }}
            >
              {item.category}
            </Text>

            <View className="flex-row items-center" style={{ gap: 12 }}>
              <View
                style={{
                  backgroundColor: `${stockStatus.color}15`,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: `${stockStatus.color}30`,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: stockStatus.color,
                  }}
                >
                  {stockStatus.label}
                </Text>
              </View>

              {daysUntilRefill > 0 && stockStatus.status !== "out" && (
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                  }}
                >
                  Refill in {daysUntilRefill}d
                </Text>
              )}
            </View>
          </View>

          <View className="items-end">
            <Text
              style={{
                fontSize: theme.typography.fontSize.xxl,
                fontWeight: theme.typography.fontWeight.bold,
                color: stockStatus.color,
              }}
            >
              {item.quantity}
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                marginBottom: 4,
              }}
            >
              {item.unit}
            </Text>
            {item.price !== undefined && (
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}
              >
                ₹{item.price}
              </Text>
            )}
          </View>
        </View>
      </MotiView>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="flex-1"
        style={{
          backgroundColor: isDark
            ? theme.colors.background.primary
            : theme.colors.background.secondary,
        }}
      >
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
                alignItems: "center",
                justifyContent: "center",
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
              Stock Management
            </Text>

            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ padding: 20, paddingBottom: 12 }}>
          <View
            style={{
              backgroundColor: isDark
                ? theme.colors.background.input
                : theme.colors.background.secondary,
              borderRadius: theme.borderRadius.lg,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: isDark
                ? theme.colors.border
                : theme.colors.borderLight,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.text.tertiary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search stock..."
              placeholderTextColor={theme.colors.text.placeholder}
              style={{
                flex: 1,
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.text.primary,
                padding: 0,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.text.tertiary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stock List */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{
              marginTop: 16,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}>
              Loading inventory...
            </Text>
          </View>
        ) : error ? (
          <View style={{ paddingVertical: 48, alignItems: "center", paddingHorizontal: 20 }}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={theme.colors.error}
            />
            <Text
              style={{
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.text.tertiary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              Failed to load inventory
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredStock}
            keyExtractor={(item) => item.id}
            renderItem={renderStockItem}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ paddingVertical: 48, alignItems: "center" }}>
                <Ionicons
                  name="cube-outline"
                  size={64}
                  color={theme.colors.text.tertiary}
                />
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    color: theme.colors.text.tertiary,
                    marginTop: 16,
                  }}
                >
                  {searchQuery ? "No matching items found" : "No stock items found"}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
};

export default StockPage;
