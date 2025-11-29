import {
    HomeHeader,
    SalesCard,
    StockCard,
    UdhaarCard,
} from "@/components/home";
import { ProfileModal } from "@/components/profile";
import { useTheme } from "@/hooks/useTheme";
import { Sale, StockItem, Udhaar, UserProfile } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { ScrollView, View, ActivityIndicator, Text } from "react-native";
import { useLowStockItems } from "@/api/inventory";
import { useTodayTransactions } from "@/api/transactions";
import { useUnpaidUdhaars } from "@/api/udhaar";

const USER_DETAILS_KEY = "@app_user_details";

const HomeScreen = () => {
  const { theme, isDark } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Fetch data with optimized hooks (limited data for home page)
  const { data: stockData, isLoading: stockLoading } = useLowStockItems(5);
  const { data: transactionsData, isLoading: transactionsLoading } = useTodayTransactions(4);
  const { data: udhaarData, isLoading: udhaarLoading } = useUnpaidUdhaars(4);

  // Transform API data to match component expectations
  const stockItems: StockItem[] = useMemo(() => {
    if (!stockData?.data) return [];
    return stockData.data.map(item => ({
      id: item.id,
      name: item.name,
      currentQuantity: item.stock,
      unit: item.unit,
      predictedRefillDate: undefined,
      quantity: item.stock,
    }));
  }, [stockData]);

  const sales: Sale[] = useMemo(() => {
    if (!transactionsData?.data) return [];
    return transactionsData.data.map(transaction => {
      const date = new Date(transaction.createdAt);
      return {
        id: transaction.id,
        amount: transaction.totalAmount,
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: date,
        method: transaction.mode.toLowerCase() as "cash" | "upi" | "udhaar",
      };
    });
  }, [transactionsData]);

  const udhaars: Udhaar[] = useMemo(() => {
    if (!udhaarData?.data) return [];
    return udhaarData.data
      .filter(customer => customer.currentDebt > 0)
      .map(customer => ({
        id: customer.id,
        personName: customer.name,
        customerName: customer.name,
        customerPhone: customer.phone,
        amount: customer.currentDebt,
        status: "pending" as const,
        date: new Date(customer.createdAt),
      }));
  }, [udhaarData]);

  const isLoading = stockLoading || transactionsLoading || udhaarLoading;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profileData = await AsyncStorage.getItem(USER_DETAILS_KEY);
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleProfilePress = () => {
    setProfileModalVisible(true);
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: isDark
          ? theme.colors.background.primary
          : theme.colors.background.secondary,
      }}
    >
      <HomeHeader
        userName={userProfile?.name || "User"}
        notificationCount={3}
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
      >
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{
              marginTop: 16,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}>
              Loading your data...
            </Text>
          </View>
        ) : (
          <>
            <StockCard
              stockItems={stockItems}
              onViewAll={() => router.push('/stock')}
            />
            <SalesCard
              sales={sales}
              onViewAll={() => router.push('/sales')}
            />
            <UdhaarCard
              udhaars={udhaars}
              onViewAll={() => router.push('/udhaar')}
            />
          </>
        )}
      </ScrollView>

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </View>
  );
};

export default HomeScreen;
