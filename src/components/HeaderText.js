import React from "react";
import { Text, View } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

export default function HeaderText({ title, subtitle }) {
  const { t } = useI18n();

  return (
    <View style={styles.headerTextWrap}>
      <Text style={styles.title}>{t(title)}</Text>
      {subtitle ? <Text style={styles.subtitle}>{t(subtitle)}</Text> : null}
    </View>
  );
}
