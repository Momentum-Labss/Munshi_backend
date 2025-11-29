import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const Section = ({ title, content }: { title: string; content: string }) => (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: theme.colors.text.primary,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.colors.text.secondary,
          lineHeight: 22,
        }}
      >
        {content}
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
          Terms & Privacy
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.text.tertiary,
            marginBottom: 24,
          }}
        >
          Last updated: November 26, 2025
        </Text>

        <Section
          title="1. Introduction"
          content="Welcome to Munshi. By using our app, you agree to these terms and conditions. Please read them carefully."
        />

        <Section
          title="2. Data Privacy"
          content="We take your privacy seriously. All your business data, including sales records, customer details, and inventory, is stored securely. We do not share your data with third parties without your explicit consent."
        />

        <Section
          title="3. User Responsibilities"
          content="You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
        />

        <Section
          title="4. Service Availability"
          content="While we strive to provide uninterrupted service, we cannot guarantee that the app will be available at all times. We may perform maintenance or updates that could temporarily affect availability."
        />

        <Section
          title="5. Changes to Terms"
          content="We reserve the right to modify these terms at any time. We will notify you of any significant changes through the app."
        />

        <Section
          title="6. Contact Us"
          content="If you have any questions about these terms, please contact our support team."
        />
      </ScrollView>
    </SafeAreaView>
  );
}
