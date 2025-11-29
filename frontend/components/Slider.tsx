// components/Slider.tsx - Reusable Slider with External Controls

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Dimensions, FlatList, View, ViewToken } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SliderProps {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactElement;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showPagination?: boolean;
  itemWidth?: number;
  gap?: number;
  paginationColor?: string;
  paginationActiveColor?: string;
  onIndexChange?: (index: number) => void;
}

export interface SliderRef {
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  getCurrentIndex: () => number;
}

const Slider = forwardRef<SliderRef, SliderProps>(
  (
    {
      data,
      renderItem,
      autoPlay = false,
      autoPlayInterval = 3000,
      showPagination = true,
      itemWidth = SCREEN_WIDTH,
      gap = 0,
      paginationColor = "#CBD5E1",
      paginationActiveColor = "#1a223d",
      onIndexChange,
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(
      null
    );

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      goToNext: () => {
        if (currentIndex < data.length - 1) {
          const nextIndex = currentIndex + 1;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          setCurrentIndex(nextIndex);
        }
      },
      goToPrevious: () => {
        if (currentIndex > 0) {
          const prevIndex = currentIndex - 1;
          flatListRef.current?.scrollToIndex({
            index: prevIndex,
            animated: true,
          });
          setCurrentIndex(prevIndex);
        }
      },
      goToIndex: (index: number) => {
        if (index >= 0 && index < data.length) {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
          });
          setCurrentIndex(index);
        }
      },
      getCurrentIndex: () => currentIndex,
    }));

    // Auto-play logic
    React.useEffect(() => {
      if (autoPlay && data.length > 1) {
        autoPlayTimerRef.current = setInterval(() => {
          const nextIndex = (currentIndex + 1) % data.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }, autoPlayInterval);
      }

      return () => {
        if (autoPlayTimerRef.current) {
          clearInterval(autoPlayTimerRef.current);
        }
      };
    }, [autoPlay, currentIndex, data.length, autoPlayInterval]);

    // Handle viewable items change
    const onViewableItemsChanged = useRef(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
          const newIndex = viewableItems[0].index || 0;
          // Defer state update to avoid Reanimated warning
          requestAnimationFrame(() => {
            setCurrentIndex(newIndex);
            onIndexChange?.(newIndex);
          });
        }
      }
    ).current;

    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 80,
      minimumViewTime: 100,
    }).current;

    // Handle scroll end to ensure correct index
    const handleMomentumScrollEnd = useCallback(
      (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / itemWidth);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < data.length) {
          setCurrentIndex(newIndex);
          onIndexChange?.(newIndex);
        }
      },
      [currentIndex, itemWidth, data.length, onIndexChange]
    );

    return (
      <View className="flex-1">
        {/* Slider */}
        <FlatList
          ref={flatListRef}
          data={data}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={itemWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          bounces={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item, index) => `slider-item-${index}`}
          renderItem={({ item, index }) => (
            <View style={{ width: itemWidth }}>{renderItem(item, index)}</View>
          )}
        />

        {/* Pagination Dots */}
        {showPagination && data.length > 1 && (
          <View className="flex-row justify-center items-center mt-8 gap-2">
            {data.map((_, index) => (
              <View
                key={`dot-${index}`}
                className="rounded-full transition-all"
                style={{
                  width: currentIndex === index ? 32 : 8,
                  height: 8,
                  backgroundColor:
                    currentIndex === index
                      ? paginationActiveColor
                      : paginationColor,
                  opacity: currentIndex === index ? 1 : 0.4,
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  }
);

Slider.displayName = "Slider";

export default Slider;
