import React from "react";
import { Pressable, Text, View } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

const TABS = ["Home", "SHG", "Loan", "Reports", "Profile"];

export default function BottomNav({ active, setActive }) {
  const { t } = useI18n();

  return (
    <View style={styles.bottomNav}>
      {TABS.map((item) => (
        <Pressable key={item} onPress={() => setActive(item)} style={styles.navItem}>
          <Text style={[styles.navText, active === item && styles.navTextActive]}>
            {t(item)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
