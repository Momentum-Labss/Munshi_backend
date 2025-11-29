import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";

interface AnimatedSplashProps {
  isReady: boolean;
  onComplete: () => void;
}

export default function AnimatedSplash({
  isReady,
  onComplete,
}: AnimatedSplashProps) {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (isReady) {
      // Wait for fade out animation to complete
      const timeout = setTimeout(() => {
        setShouldRender(false);
        onComplete();
      }, 800); // Match the animation duration

      return () => clearTimeout(timeout);
    }
  }, [isReady, onComplete]);

  if (!shouldRender) {
    return null;
  }

  return (
    <MotiView
      from={{
        opacity: 1,
        scale: 1,
      }}
      animate={{
        opacity: isReady ? 0 : 1,
        scale: isReady ? 1.1 : 1,
      }}
      transition={{
        type: "timing",
        duration: 800,
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "#1a223d",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Logo with subtle animation */}
      <MotiView
        from={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          type: "timing",
          duration: 600,
        }}
      >
        <Image
          source={require("../assets/munshi.png")}
          style={{
            width: 200,
            height: 200,
          }}
          resizeMode="contain"
        />
      </MotiView>

      {/* Decorative elements */}
      <View
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "#6366f1",
          opacity: 0.1,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -150,
          right: -150,
          width: 400,
          height: 400,
          borderRadius: 200,
          backgroundColor: "#8b5cf6",
          opacity: 0.1,
        }}
      />
    </MotiView>
  );
}
