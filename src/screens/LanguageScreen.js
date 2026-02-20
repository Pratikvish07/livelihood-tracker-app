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
      <View style={styles.languageHero}>
        <Text style={styles.languageEyebrow}>SRS APP</Text>
        <HeaderText
          title="Language Selection"
          subtitle="Choose your preferred language"
        />
      </View>

      <View style={styles.languageCard}>
        {LANGUAGES.map((item) => {
          const active = language === item;
          return (
            <Pressable
              key={item}
              style={[styles.languageOption, active && styles.languageOptionActive]}
              onPress={() => setLanguage(item)}
            >
              <View style={styles.languageOptionLeft}>
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
