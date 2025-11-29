import {
  useCreateCustomer,
  useCreateTransaction,
  useGetSuggestions,
} from "@/api/sales";
import { useCalculator } from "@/hooks/useCalculator";
import { useCart } from "@/hooks/useCart";
import { useDebounce } from "@/hooks/useDebounce";
import { useTheme } from "@/hooks/useTheme";
import { SaleMethod } from "@/types";
import { Product, ProductType } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useMemo, useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalculatorInput } from "./CalculatorInput";
import { CartModal } from "./CartModal";
import { CfoVerdictModal } from "./CfoVerdictModal";
import { PaymentModal } from "./PaymentModal";
import { ProductList } from "./ProductList";
import { ProductTabs } from "./ProductTabs";
import { UdhaarForm } from "./UdhaarForm";

interface CalculatorContentProps {
  /** Whether to include safe area top padding */
  includeSafeArea?: boolean;
}

export const CalculatorContent: React.FC<CalculatorContentProps> = ({
  includeSafeArea = true,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const calculator = useCalculator();
  const cart = useCart();
  const createCustomerMutation = useCreateCustomer();
  const createTransactionMutation = useCreateTransaction();

  // UI State
  const [activeTab, setActiveTab] = useState<ProductType>("packaged");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [udhaarFormVisible, setUdhaarFormVisible] = useState(false);

  // CFO Verdict State
  const [cfoVerdictVisible, setCfoVerdictVisible] = useState(false);
  const [cfoVerdict, setCfoVerdict] = useState<{
    status: "BLOCK" | "WARN";
    reason: string;
    riskScore?: number;
  } | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<{
    method: SaleMethod;
    customerName?: string;
    customerPhone?: string;
  } | null>(null);

  // Complete transaction
  const completeTransaction = async (
    method: SaleMethod,
    customerName?: string,
    customerPhone?: string,
    force: boolean = false
  ) => {
    try {
      let customerId = undefined;

      // 1. If Udhaar, create customer first
      if (method === "udhaar") {
        if (!customerName || !customerPhone) {
          Alert.alert("Error", "Customer details are required for Udhaar");
          return;
        }

        // Only create customer if we don't have an ID yet (optimization could be added here)
        // For now, simple flow:
        const customerResponse = await createCustomerMutation.mutateAsync({
          name: customerName,
          phone: customerPhone,
        });

        if (customerResponse.success) {
          customerId = customerResponse.data.id;
        } else {
          throw new Error("Failed to create customer");
        }
      }

      // 2. Prepare transaction items
      const transactionItems = cart.cart.items.map((item) => ({
        productId: item.productId,
        name: item.productName,
        price: item.unitPrice,
        quantity: item.type === "packaged" ? item.quantity : undefined,
        weight:
          item.type === "unpackaged"
            ? (item.weight || 1) * item.quantity
            : undefined,
        isLoose: item.type === "unpackaged",
      }));

      // 3. Create transaction
      const transactionResponse = await createTransactionMutation.mutateAsync({
        data: {
          items: transactionItems,
          totalAmount: cart.totalAmount,
          mode: method.toUpperCase() as "CASH" | "UPI" | "UDHAAR",
          customerId,
        },
        force,
      });

      if (transactionResponse.success) {
        console.log("Transaction completed:", transactionResponse);

        // Close all modals
        setPaymentModalVisible(false);
        setUdhaarFormVisible(false);
        setCfoVerdictVisible(false);
        setPendingTransaction(null);

        // Clear cart and calculator
        cart.clearCart();
        calculator.clear();

        // Show success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          "Success",
          `Transaction completed successfully via ${method.toUpperCase()}!`,
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      // Handle CFO Verdicts (403 Block / 409 Warn)
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if ((status === 403 || status === 409) && data.cfoDecision) {
          // Store pending transaction details for retry
          setPendingTransaction({ method, customerName, customerPhone });

          // Show CFO Verdict Modal
          setCfoVerdict({
            status: data.cfoDecision.status,
            reason: data.cfoDecision.reason,
            riskScore: data.cfoDecision.riskScore,
          });
          setCfoVerdictVisible(true);

          // Close other modals to focus on verdict
          setPaymentModalVisible(false);
          setUdhaarFormVisible(false);

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return;
        }
      }

      Alert.alert(
        "Transaction Failed",
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  // Handle CFO Bypass
  const handleBypassCfo = () => {
    if (pendingTransaction) {
      completeTransaction(
        pendingTransaction.method,
        pendingTransaction.customerName,
        pendingTransaction.customerPhone,
        true // Force = true
      );
    }
  };

  // ... (existing handleEquals)

  const [lastAddedAmount, setLastAddedAmount] = useState<string>("");

  // Parse filter amount from calculator display (get the last number in the expression)
  const filterAmount = useMemo(() => {
    const display = calculator.display.trim();
    if (!display) return 10; // Default to 10 rupees when empty

    // Extract the last number from the expression
    const parts = display.split(/[+\-×\/]/);
    const lastPart = parts[parts.length - 1].trim();
    const value = parseFloat(lastPart);

    return !isNaN(value) && value > 0 ? value : 10; // Default to 10 if invalid
  }, [calculator.display]);

  // Debounce the filter amount to avoid too many API calls
  const debouncedFilterAmount = useDebounce(filterAmount, 500);

  // Fetch suggestions from API
  const {
    data: suggestionsData,
    isLoading,
    error,
  } = useGetSuggestions(debouncedFilterAmount);

  // Convert API suggestions to Product format
  const currentProducts = useMemo(() => {
    if (!suggestionsData?.data) return [];

    const suggestions =
      activeTab === "packaged"
        ? suggestionsData.data.packagedSuggestion
        : suggestionsData.data.looseSuggestion;

    // Convert API format to Product format
    return suggestions.map((item) => ({
      id: item.id,
      name: item.name,
      type: activeTab,
      price: item.price,
      icon: item.icon,
      score: item.score,
      weight: item.weight,
      inStock: true,
      // For loose items, add unit based on weight
      ...(activeTab === "unpackaged" &&
        item.weight && {
          unit: "kg",
        }),
    })) as Product[];
  }, [suggestionsData, activeTab]);

  // Handle operation button press - auto-add general item if needed

  const handleOperationPress = (op: "+" | "-" | "/" | "×") => {
    const display = calculator.display.trim();

    // Extract the last number from the expression
    const parts = display.split(/[+\-×\/]/);
    const lastPart = parts[parts.length - 1].trim();
    const lastAmount = parseFloat(lastPart);

    // If there's a number that hasn't been added to cart yet, add it as general item
    if (!isNaN(lastAmount) && lastAmount > 0 && lastPart !== lastAddedAmount) {
      // Auto-add as general item
      cart.addItem({
        productId: "general",
        productName: "General Item",
        quantity: 1,
        unitPrice: lastAmount,
        totalPrice: lastAmount,
        type: "unpackaged", // Default to unpackaged for general items
        weight: 1, // Default weight
      });

      setLastAddedAmount(lastPart);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Add the operation to calculator
    calculator.addOperation(op);
  };

  // Handle adding product to cart
  const handleAddToCart = (product: Product, quantity: number) => {
    const totalPrice = product.price * quantity;

    cart.addItem({
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice,
      type: product.type,
      weight: product.weight,
    });

    // Update calculator with the total price
    const currentDisplay = calculator.display.trim();
    const lastChar = currentDisplay[currentDisplay.length - 1];

    // Check if display contains any operations
    const hasOperation = /[+\-×\/]/.test(currentDisplay);

    if (!currentDisplay) {
      // Empty - set to total
      calculator.setDisplay(totalPrice.toString());
    } else if (!hasOperation) {
      // Just a number (no operations) - replace with total
      calculator.setDisplay(totalPrice.toString());
    } else if (["+", "-", "×", "/"].includes(lastChar)) {
      // Has operation at end (like "40 +") - append total
      calculator.setDisplay(currentDisplay + totalPrice.toString());
    } else {
      // Has complete expression (like "40 + 10") - replace last number with total
      const parts = currentDisplay.split(/([+\-×\/])/);
      parts[parts.length - 1] = totalPrice.toString();
      calculator.setDisplay(parts.join(""));
    }

    // Mark this amount as added (so it won't be auto-added as general item)
    setLastAddedAmount(totalPrice.toString());

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Handle cart button press
  const handleCartPress = () => {
    if (cart.itemCount > 0) {
      // Auto-finalize last general item if needed
      handleEquals();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCartModalVisible(true);
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    setCartModalVisible(false);
    setTimeout(() => {
      setPaymentModalVisible(true);
    }, 300);
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: SaleMethod) => {
    if (method === "udhaar") {
      setPaymentModalVisible(false);
      setTimeout(() => {
        setUdhaarFormVisible(true);
      }, 300);
    } else {
      // Handle cash/UPI payment
      completeTransaction(method);
    }
  };

  // Handle udhaar form submission
  const handleUdhaarSubmit = (name: string, phone: string) => {
    completeTransaction("udhaar", name, phone);
  };

  // Handle equals button - finalize last general item if needed
  const handleEquals = () => {
    const display = calculator.display.trim();

    // Extract the last number from the expression
    const parts = display.split(/[+\-×\/]/);
    const lastPart = parts[parts.length - 1].trim();
    const lastAmount = parseFloat(lastPart);

    // If there's a number that hasn't been added to cart yet, add it as general item
    if (!isNaN(lastAmount) && lastAmount > 0 && lastPart !== lastAddedAmount) {
      cart.addItem({
        productId: "general",
        productName: "General Item",
        quantity: 1,
        unitPrice: lastAmount,
        totalPrice: lastAmount,
        type: "unpackaged",
        weight: 1,
      });

      setLastAddedAmount(lastPart);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
      {/* Calculator Input */}
      <View style={{ paddingTop: includeSafeArea ? insets.top + 16 : 16 }}>
        <CalculatorInput
          value={calculator.display}
          onValueChange={calculator.setDisplay}
          onOperationPress={handleOperationPress}
          onEquals={handleEquals}
          onClear={calculator.clear}
        />
      </View>

      {/* Cart Total Display */}
      {cart.itemCount > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 15 }}
          style={{
            marginHorizontal: 20,
            marginBottom: 16,
            backgroundColor: isDark
              ? theme.colors.background.card
              : theme.colors.background.card,
            borderRadius: theme.borderRadius.lg,
            padding: 12,
            borderWidth: 1,
            borderColor: isDark ? theme.colors.primary : theme.brand.primary,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Ionicons
                name="receipt-outline"
                size={20}
                color={isDark ? theme.colors.primary : theme.brand.primary}
              />
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.secondary,
                }}
              >
                Cart Total ({cart.itemCount}{" "}
                {cart.itemCount === 1 ? "item" : "items"})
              </Text>
            </View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: isDark ? theme.colors.primary : theme.brand.primary,
              }}
            >
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(cart.totalAmount)}
            </Text>
          </View>
        </MotiView>
      )}

      {/* Product Tabs */}
      <ProductTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        packagedCount={suggestionsData?.data?.packagedSuggestion?.length || 0}
        unpackagedCount={suggestionsData?.data?.looseSuggestion?.length || 0}
      />

      {/* Product List */}
      <ProductList
        products={currentProducts}
        filterAmount={filterAmount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddToCart={handleAddToCart}
        enablePriceFilter={activeTab === "packaged"}
      />

      {/* Floating Cart Button */}
      {cart.itemCount > 0 && (
        <MotiView
          from={{ opacity: 0, scale: 0.8, translateY: 100 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, translateY: 100 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          style={{
            position: "absolute",
            bottom: insets.bottom + 20,
            right: 20,
          }}
        >
          <TouchableOpacity
            onPress={handleCartPress}
            activeOpacity={0.8}
            style={{
              backgroundColor: isDark
                ? theme.colors.primary
                : theme.brand.primary,
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: "center",
              justifyContent: "center",
              ...Platform.select({
                ios: {
                  shadowColor: isDark
                    ? theme.colors.primary
                    : theme.brand.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                },
                android: {
                  elevation: 8,
                },
              }),
            }}
          >
            <Ionicons name="cart" size={28} color="#FFFFFF" />
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                backgroundColor: theme.colors.error,
                minWidth: 24,
                height: 24,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 6,
                borderWidth: 2,
                borderColor: isDark
                  ? theme.colors.background.primary
                  : theme.colors.background.secondary,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {cart.itemCount}
              </Text>
            </View>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Modals */}
      <CartModal
        visible={cartModalVisible}
        cart={cart.cart}
        onClose={() => setCartModalVisible(false)}
        onRemoveItem={cart.removeItem}
        onClearCart={cart.clearCart}
        onProceed={handleProceedToPayment}
      />

      <PaymentModal
        visible={paymentModalVisible}
        amount={cart.totalAmount}
        onClose={() => setPaymentModalVisible(false)}
        onSelectMethod={handlePaymentMethodSelect}
      />

      <UdhaarForm
        visible={udhaarFormVisible}
        amount={cart.totalAmount}
        onClose={() => setUdhaarFormVisible(false)}
        onSubmit={handleUdhaarSubmit}
        isLoading={
          createCustomerMutation.isPending ||
          createTransactionMutation.isPending
        }
      />

      <CfoVerdictModal
        visible={cfoVerdictVisible}
        verdict={cfoVerdict}
        onClose={() => setCfoVerdictVisible(false)}
        onBypass={handleBypassCfo}
      />
    </View>
  );
};
