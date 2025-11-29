import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: theme.colors.text.primary,
          marginBottom: 8,
        }}
      >
        {question}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.colors.text.secondary,
          lineHeight: 22,
        }}
      >
        {answer}
      </Text>
    </View>
  );

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
          Help & Support
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View
          style={{
            padding: 20,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: 12,
            marginBottom: 32,
            alignItems: "center",
          }}
        >
          <Ionicons
            name="headset"
            size={48}
            color={theme.brand.primary}
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: theme.colors.text.primary,
              marginBottom: 8,
            }}
          >
            Need help?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.text.secondary,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Our support team is available 24/7 to assist you with any issues.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.brand.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: theme.colors.text.primary,
            marginBottom: 24,
          }}
        >
          Frequently Asked Questions
        </Text>

        <FAQItem
          question="How do I record a sale?"
          answer="You can record a sale by tapping the 'Sale' button on the home screen or by using voice commands like 'Record a sale of 500 rupees'."
        />
        <FAQItem
          question="Can I use Munshi offline?"
          answer="Yes! Munshi works offline. Your data is stored locally on your device and syncs when you're back online."
        />
        <FAQItem
          question="How do I manage stock?"
          answer="Go to the 'Stock' tab to view and manage your inventory. You can add items, update quantities, and set low stock alerts."
        />
        <FAQItem
          question="Is my data safe?"
          answer="Absolutely. We use industry-standard encryption to ensure your business data is secure and private."
        />
      </ScrollView>
    </SafeAreaView>
  );
}
