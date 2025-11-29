import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

interface CfoVerdictModalProps {
  visible: boolean;
  verdict: {
    status: 'BLOCK' | 'WARN';
    reason: string;
    riskScore?: number;
  } | null;
  onClose: () => void;
  onBypass: () => void;
}

export const CfoVerdictModal: React.FC<CfoVerdictModalProps> = ({
  visible,
  verdict,
  onClose,
  onBypass,
}) => {
  const { theme, isDark } = useTheme();

  if (!verdict) return null;

  const isBlock = verdict.status === 'BLOCK';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          style={{
            backgroundColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.primary,
            borderRadius: theme.borderRadius.xl,
            width: '100%',
            maxWidth: 340,
            padding: 24,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
              },
              android: {
                elevation: 8,
              },
            }),
          }}
        >
          {/* Icon */}
          <View
            style={{
              alignSelf: 'center',
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isBlock
                ? `${theme.colors.error}15`
                : `${theme.colors.warning}15`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons
              name={isBlock ? 'shield-sharp' : 'warning'}
              size={32}
              color={isBlock ? theme.colors.error : theme.colors.warning}
            />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {isBlock ? 'Transaction Blocked' : 'CFO Warning'}
          </Text>

          {/* Reason */}
          <Text
            style={{
              fontSize: theme.typography.fontSize.md,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 22,
            }}
          >
            {verdict.reason}
          </Text>

          {/* Buttons */}
          <View style={{ gap: 12 }}>
            {/* Force Transaction Button - Show for both BLOCK and WARN */}
            <TouchableOpacity
              onPress={onBypass}
              activeOpacity={0.7}
              style={{
                backgroundColor: isBlock ? theme.colors.error : theme.colors.warning,
                paddingVertical: 14,
                borderRadius: theme.borderRadius.lg,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: '#FFFFFF',
                }}
              >
                {isBlock ? 'Force Transaction' : 'Bypass & Proceed'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.input
                  : theme.colors.background.secondary,
                paddingVertical: 14,
                borderRadius: theme.borderRadius.lg,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDark
                  ? theme.colors.border
                  : theme.colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
