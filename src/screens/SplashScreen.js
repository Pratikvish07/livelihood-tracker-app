import React, { useState, useEffect } from "react";
import { Animated, Platform, Text, View } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

export default function SplashScreen() {
  const { t } = useI18n();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [dotAnim1] = useState(new Animated.Value(0.4));
  const [dotAnim2] = useState(new Animated.Value(0.4));
  const [dotAnim3] = useState(new Animated.Value(0.4));
  const [activeDot, setActiveDot] = useState(0);
  const useNativeDriver = Platform.OS !== "web";

  useEffect(() => {
    // Pulsing animation for logo
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver,
        }),
      ])
    );
    pulse.start();

    // Loading dots animation
    const dots = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim1, { toValue: 1, duration: 300, useNativeDriver }),
        Animated.timing(dotAnim2, { toValue: 1, duration: 300, useNativeDriver }),
        Animated.timing(dotAnim3, { toValue: 1, duration: 300, useNativeDriver }),
        Animated.timing(dotAnim1, { toValue: 0.4, duration: 300, useNativeDriver }),
        Animated.timing(dotAnim2, { toValue: 0.4, duration: 300, useNativeDriver }),
        Animated.timing(dotAnim3, { toValue: 0.4, duration: 300, useNativeDriver }),
      ])
    );
    dots.start();

    // Active dot indicator
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 400);

    return () => {
      pulse.stop();
      dots.stop();
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.splashContainer}>
      {/* Decorative background circles */}
      <View style={styles.splashTopBand} />
      <View style={styles.splashBottomBand} />
      <View style={styles.splashDecoCircle1} />
      <View style={styles.splashDecoCircle2} />
      <View style={styles.splashDecoCircle3} />
      <View style={styles.splashGridLineVertical} />
      <View style={styles.splashGridLineHorizontal} />

      {/* Logo section with pulse animation */}
      <View style={styles.splashAuthorityBadge}>
        <Text style={styles.splashAuthorityText}>TRLM</Text>
      </View>
      <View style={styles.splashLogoWrapper}>
        <Animated.View
          style={[
            styles.splashLogoOuterGlow,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.splashLogoCircle,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.splashLogoText}>TRLM</Text>
        </Animated.View>
      </View>

      {/* App name */}
      <Text style={styles.splashAppName}>TRLM Livelihood Trackker</Text>
      
      {/* Subtitle */}
      <Text style={styles.splashSubtitle}>
        {t("Rural field monitoring, identity creation, and livelihood tracking")}
      </Text>

      {/* Animated loading dots */}
      <View style={styles.splashLoaderContainer}>
        <Animated.View
          style={[
            styles.splashLoaderDot,
            activeDot === 0 && styles.splashLoaderDotActive,
            { opacity: activeDot === 0 ? 1 : dotAnim1 },
          ]}
        />
        <Animated.View
          style={[
            styles.splashLoaderDot,
            activeDot === 1 && styles.splashLoaderDotActive,
            { opacity: activeDot === 1 ? 1 : dotAnim2 },
          ]}
        />
        <Animated.View
          style={[
            styles.splashLoaderDot,
            activeDot === 2 && styles.splashLoaderDotActive,
            { opacity: activeDot === 2 ? 1 : dotAnim3 },
          ]}
        />
      </View>

      {/* Tagline */}
      <Text style={styles.splashTagline}>Tripura Rural Livelihood Mission</Text>

      {/* Version */}
      <Text style={styles.splashVersion}>Version 1.0.0</Text>
    </View>
  );
}
