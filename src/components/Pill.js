import React from "react";
import { Pressable, Text } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

export default function Pill({ label, active, onPress }) {
  const { t } = useI18n();

  return (
    <Pressable style={[styles.pill, active && styles.pillActive]} onPress={onPress}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{t(label)}</Text>
    </Pressable>
  );
}
