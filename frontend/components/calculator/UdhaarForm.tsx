import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ... (imports)

interface UdhaarFormProps {
  visible: boolean;
  amount: number;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
  isLoading?: boolean;
}

// ... (existing helper)

export const UdhaarForm: React.FC<UdhaarFormProps> = ({
  visible,
  amount,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { theme, isDark } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({ name: '', phone: '' });

  const validateForm = (): boolean => {
    const newErrors = { name: '', phone: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onSubmit(name.trim(), phone.trim());
      // Don't reset here, wait for success/close
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setErrors({ name: '', phone: '' });
    onClose();
  };

  // Reset form when modal closes (including when CFO verdict appears)
  useEffect(() => {
    if (!visible && !isLoading) {
      // Clear fields when modal is hidden and not loading
      setName('');
      setPhone('');
      setErrors({ name: '', phone: '' });
    }
  }, [visible, isLoading]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={isLoading ? undefined : handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{
              backgroundColor: isDark
                ? theme.colors.background.card
                : theme.colors.background.primary,
              borderRadius: theme.borderRadius.xl,
              width: '90%',
              maxWidth: 400,
            }}
          >
            {/* Header */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingTop: 24,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark
                  ? theme.colors.border
                  : theme.colors.borderLight,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                  }}
                >
                  Udhaar Details
                </Text>

                <TouchableOpacity 
                  onPress={handleClose} 
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Ionicons
                    name="close-circle"
                    size={28}
                    color={isLoading ? theme.colors.text.disabled : theme.colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>

              {/* ... (existing Amount display) */}
            </View>

            {/* Form */}
            <View style={{ padding: 24 }}>
              {/* Name Input */}
              <View style={{ marginBottom: 20 }}>
                {/* ... (existing label) */}
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Enter customer name"
                  placeholderTextColor={theme.colors.text.placeholder}
                  editable={!isLoading}
                  style={{
                    backgroundColor: isDark
                      ? theme.colors.background.input
                      : theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.lg,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: theme.typography.fontSize.md,
                    color: isLoading ? theme.colors.text.disabled : theme.colors.text.primary,
                    borderWidth: 1,
                    borderColor: errors.name
                      ? theme.colors.error
                      : isDark
                      ? theme.colors.border
                      : theme.colors.borderLight,
                    opacity: isLoading ? 0.7 : 1,
                  }}
                />
                {/* ... (existing error) */}
              </View>

              {/* Phone Input */}
              <View style={{ marginBottom: 24 }}>
                {/* ... (existing label) */}
                <TextInput
                  value={phone}
                  onChangeText={(text) => {
                    // Only allow digits
                    const cleaned = text.replace(/\D/g, '');
                    setPhone(cleaned);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor={theme.colors.text.placeholder}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isLoading}
                  style={{
                    backgroundColor: isDark
                      ? theme.colors.background.input
                      : theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.lg,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: theme.typography.fontSize.md,
                    color: isLoading ? theme.colors.text.disabled : theme.colors.text.primary,
                    borderWidth: 1,
                    borderColor: errors.phone
                      ? theme.colors.error
                      : isDark
                      ? theme.colors.border
                      : theme.colors.borderLight,
                    opacity: isLoading ? 0.7 : 1,
                  }}
                />
                {/* ... (existing error) */}
              </View>

              {/* Buttons */}
              <View className="flex-row" style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={handleClose}
                  activeOpacity={0.7}
                  disabled={isLoading}
                  style={{
                    flex: 1,
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
                    opacity: isLoading ? 0.5 : 1,
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

                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.7}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.warning,
                    paddingVertical: 14,
                    borderRadius: theme.borderRadius.lg,
                    alignItems: 'center',
                    opacity: isLoading ? 0.8 : 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {isLoading && <ActivityIndicator size="small" color="#FFFFFF" />}
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: '#FFFFFF',
                    }}
                  >
                    {isLoading ? 'Agent Thinking...' : 'Confirm Udhaar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default UdhaarForm;
