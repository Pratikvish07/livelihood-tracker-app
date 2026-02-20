import React from "react";
import { Text, View } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

export default function MetricCard({ label, value, tone }) {
  const { t } = useI18n();

  return (
    <View style={[styles.metricCard, tone === "warn" && styles.metricCardWarn]}>
      <Text style={styles.metricLabel}>{t(label)}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}
