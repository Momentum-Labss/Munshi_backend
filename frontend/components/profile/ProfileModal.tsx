import { ProfileContent } from "./ProfileContent";
import { useTheme } from "@/hooks/useTheme";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React from "react";
import {
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MODAL_WIDTH = SCREEN_WIDTH * 0.85;

export interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Modal Content */}
        <MotiView
          from={{ translateX: -MODAL_WIDTH }}
          animate={{ translateX: visible ? 0 : -MODAL_WIDTH }}
          transition={{
            type: "timing",
            duration: 300,
          }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: MODAL_WIDTH,
            backgroundColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.secondary,
          }}
        >
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {/* Header */}
            <View
              style={{
                paddingTop: insets.top + 12,
                paddingBottom: 16,
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
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                    letterSpacing: -0.5,
                  }}
                >
                  Profile
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  activeOpacity={0.7}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isDark
                      ? theme.colors.background.input
                      : theme.colors.background.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={theme.colors.text.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Content */}
            <ProfileContent onClose={handleClose} paddingBottom={insets.bottom + 24} />
          </TouchableOpacity>
        </MotiView>
      </TouchableOpacity>
    </Modal>
  );
};

export default ProfileModal;
