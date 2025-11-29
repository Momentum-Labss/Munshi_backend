import { useTheme } from "@/hooks/useTheme";
import { ProductType } from "@/types/product";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface ProductTabsProps {
  activeTab: ProductType;
  onTabChange: (tab: ProductType) => void;
  packagedCount?: number;
  unpackagedCount?: number;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({
  activeTab,
  onTabChange,
  packagedCount = 0,
  unpackagedCount = 0,
}) => {
  const { theme, isDark } = useTheme();

  const handleTabPress = (tab: ProductType) => {
    if (tab !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTabChange(tab);
    }
  };

  const tabs: { key: ProductType; label: string }[] = [
    { key: "packaged", label: "Packaged" },
    { key: "unpackaged", label: "Unpackaged" },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: isDark
          ? theme.colors.background.input
          : theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        padding: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
            style={{ flex: 1 }}
          >
            <View style={{ position: "relative" }}>
              {isActive && (
                <MotiView
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isDark
                      ? theme.colors.background.card
                      : theme.colors.background.primary,
                    borderRadius: theme.borderRadius.md,
                    ...Platform.select({
                      ios: {
                        shadowColor: isDark ? "#000" : "#1a223d",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isDark ? 0.3 : 0.08,
                        shadowRadius: 4,
                      },
                      android: {
                        elevation: 2,
                      },
                    }),
                  }}
                />
              )}

              <View
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: isActive
                      ? theme.typography.fontWeight.semibold
                      : theme.typography.fontWeight.medium,
                    color: isActive
                      ? theme.colors.text.primary
                      : theme.colors.text.tertiary,
                  }}
                >
                  {tab.label}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ProductTabs;
