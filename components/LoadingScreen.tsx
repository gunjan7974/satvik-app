import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../app/data/ThemeContext";

const { width, height } = Dimensions.get("window");

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  size?: "small" | "medium" | "large";
  colors?: string[];
  logo?: boolean;
}

export default function LoadingScreen({
  message = "Loading delicious food...",
  fullScreen = true,
  size = "medium",
  colors,
  logo = true,
}: LoadingScreenProps) {
  const { colors: themeColors, mode } = useTheme();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Scale animation for entrance
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 1500,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Slide up animation for text
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Dot animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot1Anim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, []);

  // Size configurations
  const sizeConfig = {
    small: {
      logoSize: 60,
      fontSize: 14,
      dotSize: 6,
    },
    medium: {
      logoSize: 100,
      fontSize: 16,
      dotSize: 8,
    },
    large: {
      logoSize: 150,
      fontSize: 18,
      dotSize: 10,
    },
  };

  const config = sizeConfig[size];

  // Gradient colors based on theme
  const gradientColors = colors || [
    themeColors.primary + '20',
    themeColors.primary + '40',
    themeColors.primary + '20',
  ];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: themeColors.background },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo with animations */}
        {logo ? (
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: pulseAnim },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <Image
              source={require("../assets/images/logo.png")}
              style={[
                styles.logo,
                {
                  width: config.logoSize,
                  height: config.logoSize,
                },
              ]}
              resizeMode="contain"
            />
            
            {/* Animated rings around logo */}
            <Animated.View
              style={[
                styles.ring,
                {
                  width: config.logoSize + 20,
                  height: config.logoSize + 20,
                  borderRadius: (config.logoSize + 20) / 2,
                  borderColor: themeColors.primary,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            />
            
            <Animated.View
              style={[
                styles.ring2,
                {
                  width: config.logoSize + 40,
                  height: config.logoSize + 40,
                  borderRadius: (config.logoSize + 40) / 2,
                  borderColor: themeColors.primary + '60',
                  transform: [{ scale: Animated.multiply(scaleAnim, 1.2) }],
                },
              ]}
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.spinner,
              {
                width: config.logoSize,
                height: config.logoSize,
                borderRadius: config.logoSize / 2,
                borderColor: themeColors.primary,
                borderLeftColor: "transparent",
                transform: [{ rotate: spin }],
              },
            ]}
          />
        )}

        {/* Loading message */}
        <Animated.Text
          style={[
            styles.message,
            {
              color: themeColors.text,
              fontSize: config.fontSize,
              opacity: fadeAnim,
            },
          ]}
        >
          {message}
        </Animated.Text>

        {/* Animated dots */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: themeColors.primary,
                width: config.dotSize,
                height: config.dotSize,
                borderRadius: config.dotSize / 2,
                opacity: dot1Anim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: themeColors.primary,
                width: config.dotSize,
                height: config.dotSize,
                borderRadius: config.dotSize / 2,
                opacity: dot2Anim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: themeColors.primary,
                width: config.dotSize,
                height: config.dotSize,
                borderRadius: config.dotSize / 2,
                opacity: dot3Anim,
              },
            ]}
          />
        </View>

        {/* Progress bar */}
        <View
          style={[
            styles.progressBarContainer,
            {
              backgroundColor: themeColors.border,
              width: config.logoSize * 2,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: themeColors.primary,
                width: progressWidth,
              },
            ]}
          />
        </View>

        {/* Food icons floating animation */}
        <View style={styles.floatingIcons}>
          <Animated.View
            style={[
              styles.floatingIcon,
              {
                transform: [
                  { translateY: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0, -10],
                  })},
                  { translateX: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0, 5],
                  })},
                ],
              },
            ]}
          >
            <Text style={{ fontSize: 24 }}>🍛</Text>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.floatingIcon,
              {
                right: 20,
                transform: [
                  { translateY: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0, -15],
                  })},
                  { translateX: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0, -5],
                  })},
                ],
              },
            ]}
          >
            <Text style={{ fontSize: 28 }}>🥗</Text>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.floatingIcon,
              {
                bottom: 20,
                transform: [
                  { translateY: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0, -5],
                  })},
                ],
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>🍜</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Version info */}
      {fullScreen && (
        <Text style={[styles.version, { color: themeColors.subText }]}>
          Sattvik Kaleva v1.0.0
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    position: "relative",
  },
  logo: {
    zIndex: 10,
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
    opacity: 0.3,
  },
  ring2: {
    position: "absolute",
    borderWidth: 1,
    opacity: 0.15,
  },
  spinner: {
    borderWidth: 4,
    marginBottom: 30,
  },
  message: {
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    borderRadius: 4,
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  floatingIcons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  floatingIcon: {
    position: "absolute",
    opacity: 0.3,
  },
  version: {
    position: "absolute",
    bottom: 30,
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.5,
  },
});