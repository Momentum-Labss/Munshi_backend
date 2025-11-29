import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Text, TextInput, View } from 'react-native';
import { ProductCard } from './ProductCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate card width: screen width - horizontal padding - gaps between cards
const CARD_WIDTH = (SCREEN_WIDTH - 10 - 18) / 3; // 10 for paddingHorizontal, 18 for gaps (6px * 3)

interface ProductListProps {
  products: Product[];
  filterAmount?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  enablePriceFilter?: boolean; // Only filter by price for packaged items
  isLoading?: boolean; // Loading state for API calls
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  filterAmount,
  searchQuery,
  onSearchChange,
  onAddToCart,
  enablePriceFilter = true,
  isLoading = false,
}) => {
  const { theme, isDark } = useTheme();

  // Filter products based on search and amount, limit to 9 items
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    // Filter by amount (only for packaged items - unpackaged are sold by weight)
    if (enablePriceFilter && filterAmount && filterAmount > 0) {
      filtered = filtered.filter((product) => product.price === filterAmount);
    }

    // Limit to 9 items
    return filtered.slice(0, 9);
  }, [products, searchQuery, filterAmount, enablePriceFilter]);

  return (
    <View className="flex-1">
      {/* Search Bar */}
      <View
        style={{
          marginHorizontal: 8,
          marginBottom: 8,
          backgroundColor: isDark
            ? theme.colors.background.input
            : theme.colors.background.secondary,
          borderRadius: theme.borderRadius.md,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: isDark ? theme.colors.border : theme.colors.borderLight,
        }}
      >
        <Ionicons
          name="search"
          size={18}
          color={theme.colors.text.tertiary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search products..."
          placeholderTextColor={theme.colors.text.placeholder}
          style={{
            flex: 1,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.primary,
            padding: 0,
          }}
        />
        {searchQuery.length > 0 && (
          <Ionicons
            name="close-circle"
            size={18}
            color={theme.colors.text.tertiary}
            onPress={() => onSearchChange('')}
          />
        )}
      </View>

      {/* Product Grid - 3 columns */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item, index }) => (
          <View style={{ width: CARD_WIDTH, paddingHorizontal: 3 }}>
            <ProductCard
              product={item}
              onAddToCart={onAddToCart}
              index={index}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 80 }}
        columnWrapperStyle={{ marginBottom: 6 }}
        ListEmptyComponent={
          <View
            style={{
              paddingVertical: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <>
                <ActivityIndicator 
                  size="large" 
                  color={isDark ? theme.colors.primary : theme.brand.primary} 
                />
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.tertiary,
                    marginTop: 16,
                    textAlign: 'center',
                  }}
                >
                  Loading suggestions...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="cube-outline"
                  size={64}
                  color={theme.colors.text.tertiary}
                />
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    color: theme.colors.text.tertiary,
                    marginTop: 16,
                    textAlign: 'center',
                  }}
                >
                  {searchQuery || filterAmount
                    ? 'No products found'
                    : 'No products available'}
                </Text>
                {(searchQuery || filterAmount) && (
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.tertiary,
                      marginTop: 8,
                      textAlign: 'center',
                    }}
                  >
                    Try adjusting your search or filter
                  </Text>
                )}
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

export default ProductList;
