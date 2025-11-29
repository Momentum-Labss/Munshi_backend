// components/onboarding/OnboardingSlide.tsx

import { MotiView } from "moti";
import React from "react";
import { Image, ImageURISource, Text, View } from "react-native";

interface OnboardingSlideProps {
  title: string;
  description: string;
  image?: ImageURISource;
  icon?: React.ReactNode;
}

export default function OnboardingSlide({
  title,
  description,
  image,
  icon,
}: OnboardingSlideProps) {
  return (
    <View className="flex-1 justify-center items-center px-8 pt-safe">
      {/* Floating image with animation */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "timing",
          duration: 800,
        }}
        className="items-center justify-center mb-12 w-full"
      >
        <MotiView
          from={{ translateY: 0 }}
          animate={{ translateY: -12 }}
          transition={{
            type: "timing",
            duration: 2000,
            loop: true,
            repeatReverse: true,
          }}
        >
          <View
            className="bg-indigo-50 dark:bg-indigo-900/30 rounded-full p-8"
            style={{
              shadowColor: "#6366f1",
              shadowOpacity: 0.15,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
            }}
          >
            {image ? (
              <Image
                source={image}
                className="w-64 h-64"
                resizeMode="contain"
              />
            ) : icon ? (
              <View className="w-64 h-64 items-center justify-center">
                {icon}
              </View>
            ) : null}
          </View>
        </MotiView>
      </MotiView>

      {/* Text content with staggered animation */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: 600,
          delay: 300,
        }}
        className="px-4"
      >
        <Text className="text-3xl font-bold text-center mb-4 text-slate-900 dark:text-white">
          {title}
        </Text>

        <Text className="text-base text-center text-slate-600 dark:text-slate-400 leading-7">
          {description}
        </Text>
      </MotiView>
    </View>
  );
}
