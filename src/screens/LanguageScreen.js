import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LANGUAGES } from "../constants/appData";
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
          <Text style={styles.languageCardTitle}>Select Interface Language</Text>
          <Text style={styles.languageCardHint}>
            This selection will be applied across the application screens.
          </Text>
        </View>

        {LANGUAGES.map((item) => {
          const active = language === item;
          return (
            <Pressable
              key={item}
              style={[styles.languageOption, active && styles.languageOptionActive]}
              onPress={() => setLanguage(item)}
            >
              <View style={styles.languageOptionLeft}>
                <Text style={[styles.languageOptionPrefix, active && styles.languageOptionPrefixActive]}>
                  {active ? "Selected" : "Available"}
                </Text>
                <Text style={[styles.languageOptionText, active && styles.languageOptionTextActive]}>
                  {t(item)}
                </Text>
              </View>
              <View style={[styles.languageDot, active && styles.languageDotActive]} />
            </Pressable>
          );
        })}

        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </ScrollView>
  );
}
