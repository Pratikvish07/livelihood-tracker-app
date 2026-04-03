import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LANGUAGE_OPTIONS } from "../constants/appData";
import PrimaryButton from "../components/PrimaryButton";
import styles from "../styles/appStyles";
import { useI18n } from "../i18n/I18nProvider";

export default function LanguageScreen({ language, setLanguage, onContinue }) {
  const { t } = useI18n();

  return (
    <ScrollView contentContainerStyle={styles.languageScreenPad}>
      <View style={styles.languageCard}>
        <View style={styles.languageCardHeader}>
          <Text style={styles.languageCardTitle}>{t("Select Interface Language")}</Text>
          <Text style={styles.languageCardHint}>
            {t("Pick any language and the app will translate labels dynamically using Google Translate when configured.")}
          </Text>
        </View>

        <View style={styles.languagePillBanner}>
          <Text style={styles.languagePillBannerText}>{t("Available Across India")}</Text>
        </View>

        <View style={styles.languageGrid}>
        {LANGUAGE_OPTIONS.map((item) => {
          const active = language === item.name;
          return (
            <Pressable
              key={item.name}
              style={[styles.languageOption, active && styles.languageOptionActive]}
              onPress={() => setLanguage(item.name)}
            >
              <View style={styles.languageOptionLeft}>
                <Text style={[styles.languageOptionPrefix, active && styles.languageOptionPrefixActive]}>
                  {t(active ? "Selected" : "Available")}
                </Text>
                <Text style={[styles.languageOptionText, active && styles.languageOptionTextActive]}>
                  {item.nativeName}
                </Text>
                <Text
                  style={[
                    styles.languageOptionSubtext,
                    active && styles.languageOptionSubtextActive
                  ]}
                >
                  {item.name}
                </Text>
              </View>
              <View style={[styles.languageDot, active && styles.languageDotActive]} />
            </Pressable>
          );
        })}
        </View>

        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </ScrollView>
  );
}
