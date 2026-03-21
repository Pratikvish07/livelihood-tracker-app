import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LANGUAGE_OPTIONS } from "../constants/appData";
import HeaderText from "../components/HeaderText";
import PrimaryButton from "../components/PrimaryButton";
import styles from "../styles/appStyles";
import { useI18n } from "../i18n/I18nProvider";

export default function LanguageScreen({ language, setLanguage, onContinue }) {
  const { t } = useI18n();

  return (
    <ScrollView contentContainerStyle={styles.languageScreenPad}>
      <View style={styles.languageTopBand} />
      <View style={styles.languageHero}>
        <View style={styles.languageHeroAura} />
        <View style={styles.languageHeroHeader}>
          <View style={styles.languageSeal}>
            <Text style={styles.languageSealText}>TR</Text>
          </View>
          <View style={styles.languageGovtCopy}>
            <Text style={styles.languageGovtLabel}>Government of Tripura</Text>
            <Text style={styles.languageGovtDept}>Tripura Rural Livelihood Mission</Text>
          </View>
        </View>

        <View style={styles.languageTitleWrap}>
          <HeaderText
            title="Language Selection"
            subtitle="Choose your preferred language"
          />
        </View>
      </View>

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
                  {active ? "Selected" : "Available"}
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
