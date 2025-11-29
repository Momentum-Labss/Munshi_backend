// app/(auth)/onboarding.tsx - Onboarding Screen with Slides

import Slider, { SliderRef } from "@/components/Slider";
import OnboardingSlide from "@/components/onboarding/OnboardingSlide";
import { onboardingSlides } from "@/components/onboarding/slides";
import { Button, PaginationDots } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { MotiView } from "moti";
import React, { useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ONBOARDING_KEY = "@app_onboarding_completed";

export default function OnboardingScreen() {
  const sliderRef = useRef<SliderRef>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLastSlide = currentIndex === onboardingSlides.length - 1;

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markOnboardingComplete();
    router.replace("/(auth)/email");
  };

  const handleNext = () => {
    if (isLastSlide) {
      handleContinue();
    } else {
      sliderRef.current?.goToNext();
    }
  };

  const handleContinue = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markOnboardingComplete();
    router.replace("/(auth)/email");
  };

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (error) {
      console.error("Failed to mark onboarding as complete:", error);
    }
  };

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 500 }}
      className="flex-1 bg-white dark:bg-slate-900"
    >
      {/* Decorative Background Elements */}
      <View
        key="bg-blob-1"
        className="absolute top-0 left-0 w-96 h-96 rounded-full bg-indigo-100 opacity-10 dark:bg-indigo-400/5 -translate-x-48 -translate-y-48"
      />
      <View
        key="bg-blob-2"
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-100 opacity-10 dark:bg-purple-400/5 translate-x-48 translate-y-48"
      />

      {/* Skip Button */}
      {!isLastSlide && (
        <MotiView
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 600, delay: 300 }}
          className="absolute top-0 right-0 z-10 pt-safe pr-6"
        >
          <TouchableOpacity
            onPress={handleSkip}
            className="py-3 px-5 mt-4 bg-slate-100 dark:bg-slate-800 rounded-full"
            activeOpacity={0.7}
          >
            <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
              Skip
            </Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Slider */}
      <View className="flex-1">
        <Slider
          ref={sliderRef}
          data={onboardingSlides}
          renderItem={(item) => (
            <OnboardingSlide
              description={item.description}
              title={item.title}
              image={item.image}
            />
          )}
          itemWidth={SCREEN_WIDTH}
          onIndexChange={setCurrentIndex}
          showPagination={false}
        />
      </View>

      {/* Bottom Navigation */}
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 400 }}
        className="px-6 pb-safe"
      >
        {/* Pagination Dots */}
        <View className="mb-6">
          <PaginationDots total={onboardingSlides.length} currentIndex={currentIndex} />
        </View>

        {/* Navigation Button */}
        <Button
          onPress={handleNext}
          size="lg"
          rightIcon={
            <Ionicons
              name={isLastSlide ? "checkmark-circle" : "arrow-forward"}
              size={20}
              color="white"
            />
          }
        >
          {isLastSlide ? "Get Started" : "Next"}
        </Button>

        {/* Footer Hint */}
        <View className="mt-4 mb-2">
          <Text className="text-center text-xs text-slate-500 dark:text-slate-500">
            Swipe to navigate between slides
          </Text>
        </View>
      </MotiView>
    </MotiView>
  );
}
