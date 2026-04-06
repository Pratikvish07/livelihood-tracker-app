import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import { LANGUAGE_OPTIONS, getLanguageCode, getLanguageNativeName } from "../i18n/translations";
import styles from "../styles/appStyles";

const TABS = ["Home", "Profile"];
const TAB_META = {
  Home: { icon: "H" },
  Profile: { icon: "P" }
};

export default function BottomNav({ active, setActive, currentLanguage = "en", onLanguageChange }) {
  const { t } = useI18n();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const normalizedLanguage = getLanguageCode(currentLanguage);
  const currentLanguageLabel = getLanguageNativeName(normalizedLanguage);
  const languageOptions = useMemo(() => LANGUAGE_OPTIONS, []);

  return (
    <View style={styles.bottomNavShell}>
      {showLanguageMenu ? (
        <View style={styles.languageMenuPopup}>
          {languageOptions.map((item) => {
            const activeLanguage = item.code === normalizedLanguage;
            return (
              <Pressable
                key={item.code}
                style={[styles.languageMenuItem, activeLanguage && styles.languageMenuItemActive]}
                onPress={() => {
                  setShowLanguageMenu(false);
                  onLanguageChange?.(item.code);
                }}
              >
                <Text style={[styles.languageMenuText, activeLanguage && styles.languageMenuTextActive]}>
                  {item.nativeName}
                </Text>
                <Text style={[styles.languageMenuHint, activeLanguage && styles.languageMenuTextActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

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
                  {TAB_META[item]?.icon || "."}
                </Text>
              </View>
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {t(item)}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[styles.navItem, styles.languageNavItem]}
          onPress={() => setShowLanguageMenu((prev) => !prev)}
        >
          <View style={styles.languageSwitcherButton}>
            <Text style={styles.languageSwitcherCode}>{normalizedLanguage.toUpperCase()}</Text>
          </View>
          <Text style={styles.navText}>{currentLanguageLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
