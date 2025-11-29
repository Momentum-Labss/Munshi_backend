import { useCustomers } from "@/api/udhaar";
import { useTheme } from "@/hooks/useTheme";
import { Udhaar } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { MotiView } from "moti";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabType = "pending" | "paid";

const UdhaarPage = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch customers from API
  const { data, isLoading, error } = useCustomers({
    page: 1,
    limit: 100,
    search: searchQuery || undefined,
    status: activeTab === "pending" ? "UNPAID" : "PAID",
  });

  // Transform API data to Udhaar format
  const udhaarData: Udhaar[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((customer) => ({
      id: customer.id,
      personName: customer.name,
      customerName: customer.name,
      customerPhone: customer.phone,
      amount: Number(customer.currentDebt),
      status:
        customer.currentDebt > 0 ? ("pending" as const) : ("paid" as const),
      date: new Date(customer.createdAt),
      isPaid: customer.currentDebt === 0,
      items: [],
    }));
  }, [data]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleStatus = (id: string) => {
    // TODO: Implement API call to mark as paid/unpaid
    console.log("Toggle status for:", id);
    // This would require a backend endpoint to update the payment status
  };

  // Filter and group data
  const filteredData = udhaarData
    .filter((item) => item.isPaid === (activeTab === "paid"))
    .filter(
      (item) =>
        item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerPhone?.includes(searchQuery)
    );

  // Group by customer (name + phone combination)
  const groupedData = filteredData.reduce((acc, item) => {
    const key = `${item.customerName}_${item.customerPhone}`;
    if (!acc[key]) {
      acc[key] = {
        customerName: item.customerName || "Unknown",
        customerPhone: item.customerPhone || "",
        transactions: [],
      };
    }
    acc[key].transactions.push(item);
    return acc;
  }, {} as Record<string, { customerName: string; customerPhone: string; transactions: Udhaar[] }>);

  const renderCustomerGroup = ({
    item: key,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const group = groupedData[key];
    const { customerName, customerPhone, transactions } = group;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const isExpanded = expandedId === key;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 15, delay: index * 50 }}
        style={{ marginBottom: 12 }}
      >
        <TouchableOpacity
          onPress={() => toggleExpand(key)}
          activeOpacity={0.7}
          style={{
            backgroundColor: isDark
              ? theme.colors.background.card
              : theme.colors.background.card,
            borderRadius: theme.borderRadius.lg,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark
              ? theme.colors.border
              : theme.colors.borderLight,
          }}
        >
          {/* Collapsed View */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1" style={{ gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${theme.colors.warning}15`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.colors.warning}
                />
              </View>

              <View className="flex-1">
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginBottom: 2,
                  }}
                >
                  {customerName}
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {customerPhone} • {transactions.length}{" "}
                  {transactions.length === 1 ? "transaction" : "transactions"}
                </Text>
              </View>
            </View>

            <View className="items-end" style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  color:
                    activeTab === "pending"
                      ? theme.colors.warning
                      : theme.colors.success,
                }}
              >
                {formatCurrency(totalAmount)}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.text.tertiary}
              />
            </View>
          </View>

          {/* Expanded View */}
          {isExpanded && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ type: "timing", duration: 200 }}
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: isDark
                  ? theme.colors.border
                  : theme.colors.borderLight,
              }}
            >
              {transactions.map((transaction, idx) => (
                <View
                  key={transaction.id}
                  style={{
                    marginBottom: idx < transactions.length - 1 ? 12 : 0,
                    paddingBottom: idx < transactions.length - 1 ? 12 : 0,
                    borderBottomWidth: idx < transactions.length - 1 ? 1 : 0,
                    borderBottomColor: isDark
                      ? theme.colors.border
                      : theme.colors.borderLight,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                      }}
                    >
                      {formatDate(transaction.date)}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text.primary,
                      }}
                    >
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                  <View>
                    {transaction.items?.map((item, itemIdx) => (
                      <View
                        key={itemIdx}
                        className="flex-row items-center"
                        style={{ marginBottom: 4 }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={theme.colors.success}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.text.secondary,
                          }}
                        >
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View className="flex-row items-center justify-between mt-3">
                    {transaction.isPaid && transaction.paidDate ? (
                      <View
                        style={{
                          backgroundColor: `${theme.colors.success}15`,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: theme.borderRadius.sm,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.success,
                            fontWeight: theme.typography.fontWeight.semibold,
                          }}
                        >
                          Paid on {formatDate(transaction.paidDate)}
                        </Text>
                      </View>
                    ) : (
                      <View /> // Spacer
                    )}

                    <TouchableOpacity
                      onPress={() => toggleStatus(transaction.id)}
                      style={{
                        backgroundColor: transaction.isPaid
                          ? theme.colors.background.secondary
                          : theme.colors.primary,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: theme.borderRadius.full,
                        borderWidth: transaction.isPaid ? 1 : 0,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.xs,
                          fontWeight: theme.typography.fontWeight.bold,
                          color: transaction.isPaid
                            ? theme.colors.text.primary
                            : "#FFFFFF",
                        }}
                      >
                        {transaction.isPaid
                          ? "Mark as Pending"
                          : "Mark as Paid"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </MotiView>
          )}
        </TouchableOpacity>
      </MotiView>
    );
  };

  // Calculate summary
  const totalPending = udhaarData
    .filter((item) => !item.isPaid)
    .reduce((sum, item) => sum + item.amount, 0);

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
              Udhaar Management
            </Text>

            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Tabs */}
        <View style={{ padding: 20, paddingBottom: 12 }}>
          <View
            style={{
              backgroundColor: isDark
                ? theme.colors.background.card
                : theme.colors.background.card,
              borderRadius: theme.borderRadius.lg,
              padding: 4,
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("pending")}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: theme.borderRadius.md,
                backgroundColor:
                  activeTab === "pending"
                    ? isDark
                      ? theme.colors.primary
                      : theme.brand.primary
                    : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color:
                    activeTab === "pending"
                      ? "#FFFFFF"
                      : theme.colors.text.secondary,
                }}
              >
                Pending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("paid")}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: theme.borderRadius.md,
                backgroundColor:
                  activeTab === "paid"
                    ? isDark
                      ? theme.colors.primary
                      : theme.brand.primary
                    : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color:
                    activeTab === "paid"
                      ? "#FFFFFF"
                      : theme.colors.text.secondary,
                }}
              >
                Paid
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Card (only for pending) */}
        {activeTab === "pending" && totalPending > 0 && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
            <View
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.card
                  : theme.colors.background.card,
                borderRadius: theme.borderRadius.lg,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.warning,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  marginBottom: 4,
                }}
              >
                Total Pending Amount
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xxl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.warning,
                }}
              >
                {formatCurrency(totalPending)}
              </Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
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
              placeholder="Search by name or phone..."
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

        {/* Udhaar List */}
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 48,
            }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={{
                marginTop: 16,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}
            >
              Loading udhaar data...
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              paddingVertical: 48,
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
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
                textAlign: "center",
              }}
            >
              Failed to load udhaar data
            </Text>
          </View>
        ) : (
          <FlatList
            data={Object.keys(groupedData)}
            keyExtractor={(item) => item}
            renderItem={renderCustomerGroup}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ paddingVertical: 48, alignItems: "center" }}>
                <Ionicons
                  name="time-outline"
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
                  {searchQuery
                    ? "No matching customers"
                    : `No ${activeTab} udhaar`}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
};

export default UdhaarPage;
