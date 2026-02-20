import React from "react";
import { Text, View } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

export default function MiniBarChart({ title, values, color }) {
  const { t } = useI18n();
  const max = Math.max(...values, 1);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>{t(title)}</Text>
      <View style={styles.chartRow}>
        {values.map((item, idx) => (
          <View key={`${title}-${idx}`} style={styles.barCol}>
            <View
              style={[
                styles.bar,
                { height: `${(item / max) * 100}%`, backgroundColor: color }
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
