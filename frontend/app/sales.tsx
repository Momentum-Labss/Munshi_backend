import { useTheme } from '@/hooks/useTheme';
import { Sale, SaleMethod } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState, useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions } from '@/api/transactions';

const SalesPage = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch transactions from API
  const { data, isLoading, error } = useTransactions({
    page: 1,
    limit: 50,
  });

  // Transform API data to Sale format
  const salesData: Sale[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map(transaction => {
      const date = new Date(transaction.createdAt);
      return {
        id: transaction.id,
        amount: Number(transaction.totalAmount),
        method: transaction.mode.toLowerCase() as SaleMethod,
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: date,
        timestamp: date,
        items: transaction.items?.map(item =>
          `${item.name} ${item.quantity ? `${item.quantity}x` : item.weight ? `${item.weight}kg` : ''}`
        ).filter(Boolean) || [],
        customerName: transaction.customerId,
      };
    });
  }, [data]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  };

  const formatTime = (date?: Date) => {
    if (!date) return 'N/A';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Group sales by date
  const groupedSales = salesData.reduce((acc, sale) => {
    const dateKey = sale.date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: sale.date,
        sales: [],
      };
    }
    acc[dateKey].sales.push(sale);
    return acc;
  }, {} as Record<string, { date: Date; sales: Sale[] }>);

  // Convert to array and sort by date (newest first)
  const groupedSalesArray = Object.values(groupedSales).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const getPaymentIcon = (method: SaleMethod) => {
    switch (method) {
      case 'cash':
        return 'cash-outline';
      case 'upi':
        return 'phone-portrait-outline';
      case 'udhaar':
        return 'time-outline';
      default:
        return 'cash-outline';
    }
  };

  const getPaymentColor = (method: SaleMethod) => {
    switch (method) {
      case 'cash':
        return theme.colors.success;
      case 'upi':
        return theme.colors.primary;
      case 'udhaar':
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderSaleItem = ({ item, index }: { item: Sale; index: number }) => {
    const isExpanded = expandedId === item.id;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 15, delay: index * 50 }}
        style={{ marginBottom: 12 }}
      >
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
          style={{
            backgroundColor: isDark
              ? theme.colors.background.card
              : theme.colors.background.card,
            borderRadius: theme.borderRadius.lg,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? theme.colors.border : theme.colors.borderLight,
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
                  backgroundColor: `${getPaymentColor(item.method)}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={getPaymentIcon(item.method)}
                  size={20}
                  color={getPaymentColor(item.method)}
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
                  {formatTime(item.timestamp)}
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {item.items?.length || 0} {(item.items?.length || 0) === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </View>

            <View className="items-end" style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: isDark ? theme.colors.primary : theme.brand.primary,
                }}
              >
                {formatCurrency(item.amount)}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.text.tertiary}
              />
            </View>
          </View>

          {/* Expanded View */}
          {isExpanded && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ type: 'timing', duration: 200 }}
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: isDark ? theme.colors.border : theme.colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.secondary,
                  marginBottom: 8,
                }}
              >
                Items Sold:
              </Text>
              {item.items?.map((itemName: string, idx: number) => (
                <View
                  key={idx}
                  className="flex-row items-center"
                  style={{ marginBottom: 6 }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.colors.success}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {itemName}
                  </Text>
                </View>
              ))}
            </MotiView>
          )}
        </TouchableOpacity>
      </MotiView>
    );
  };

  // Calculate summary
  const totalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
  const transactionCount = salesData.length;

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
            borderBottomColor: isDark ? theme.colors.border : theme.colors.borderLight,
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
              <Ionicons name="arrow-back" size={22} color={theme.colors.text.primary} />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                letterSpacing: -0.5,
              }}
            >
              Sales History
            </Text>

            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Summary Card */}
        <View style={{ padding: 20, paddingBottom: 12 }}>
          <View
            style={{
              backgroundColor: isDark
                ? theme.colors.background.card
                : theme.colors.background.card,
              borderRadius: theme.borderRadius.lg,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? theme.colors.primary : theme.brand.primary,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    marginBottom: 4,
                  }}
                >
                  Total Sales Today
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xxl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: isDark ? theme.colors.primary : theme.brand.primary,
                  }}
                >
                  {formatCurrency(totalSales)}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    marginBottom: 4,
                  }}
                >
                  Transactions
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xxl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                  }}
                >
                  {transactionCount}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sales List */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{
              marginTop: 16,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}>
              Loading sales history...
            </Text>
          </View>
        ) : error ? (
          <View style={{ paddingVertical: 48, alignItems: 'center', paddingHorizontal: 20 }}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
            <Text style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.tertiary,
              marginTop: 16,
              textAlign: 'center',
            }}>
              Failed to load sales
            </Text>
          </View>
        ) : (
          <FlatList
            data={groupedSalesArray}
            keyExtractor={(item) => item.date.toDateString()}
            renderItem={({ item: group }) => (
              <View style={{ marginBottom: 24 }}>
                {/* Date Header */}
                <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {formatDate(group.date)}
                  </Text>
                </View>

                {/* Sales for this date */}
                {group.sales.map((sale, index) => (
                  <View key={sale.id} style={{ paddingHorizontal: 20 }}>
                    {renderSaleItem({ item: sale, index })}
                  </View>
                ))}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 12 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <Ionicons name="receipt-outline" size={64} color={theme.colors.text.tertiary} />
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    color: theme.colors.text.tertiary,
                    marginTop: 16,
                  }}
                >
                  No sales yet
                </Text>
              </View>
            }
          />
        )}

        {/* Add Transaction FAB */}
        <TouchableOpacity
          onPress={() => router.push('/calculator')}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            bottom: insets.bottom + 24,
            right: 20,
            backgroundColor: isDark ? theme.colors.primary : theme.brand.primary,
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default SalesPage;
