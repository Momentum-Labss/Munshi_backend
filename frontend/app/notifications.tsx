import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NOTIFICATIONS = [
  {
    id: "1",
    title: "Stock Alert",
    message: "Rice stock is running low (below 10kg).",
    time: "2 hours ago",
    read: false,
    type: "alert",
  },
  {
    id: "2",
    title: "Payment Received",
    message: "Received ₹500 from Rahul via UPI.",
    time: "5 hours ago",
    read: true,
    type: "success",
  },
  {
    id: "3",
    title: "Daily Summary",
    message: "Yesterday's total sales: ₹12,450.",
    time: "1 day ago",
    read: true,
    type: "info",
  },
  {
    id: "4",
    title: "Udhaar Due",
    message: "Priya's payment of ₹1,200 is due today.",
    time: "1 day ago",
    read: true,
    type: "warning",
  },
];

export default function NotificationsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return "alert-circle";
      case "success":
        return "checkmark-circle";
      case "warning":
        return "time";
      default:
        return "information-circle";
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "alert":
        return theme.colors.error;
      case "success":
        return theme.colors.success;
      case "warning":
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: theme.colors.text.primary,
            marginLeft: 8,
          }}
        >
          Notifications
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              padding: 16,
              backgroundColor: item.read
                ? theme.colors.background.primary
                : theme.colors.background.secondary,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: getColor(item.type) + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name={getIcon(item.type) as any}
                size={24}
                color={getColor(item.type)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.colors.text.primary,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {item.time}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                  lineHeight: 20,
                }}
              >
                {item.message}
              </Text>
            </View>
            {!item.read && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.brand.primary,
                  marginLeft: 8,
                  marginTop: 6,
                }}
              />
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
