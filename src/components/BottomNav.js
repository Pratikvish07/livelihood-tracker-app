import React from "react";
import { Pressable, Text, View } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

const TABS = ["Home", "Loan", "Profile"];
const TAB_META = {
  Home: { icon: "⌂" },
  Loan: { icon: "₹" },
  Profile: { icon: "◎" }
};

export default function BottomNav({ active, setActive }) {
  const { t } = useI18n();

  return (
    <View style={styles.bottomNav}>
      {TABS.map((item) => {
        const isActive = active === item;

        return (
          <Pressable
            key={item}
            onPress={() => setActive(item)}
            style={[styles.navItem, isActive && styles.navItemActive]}
          >
            <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
              <Text style={[styles.navIconText, isActive && styles.navIconTextActive]}>
                {TAB_META[item]?.icon || "•"}
              </Text>
            </View>
            <Text style={[styles.navText, isActive && styles.navTextActive]}>
              {t(item)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
