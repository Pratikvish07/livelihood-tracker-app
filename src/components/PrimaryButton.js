import React from "react";
import { Pressable, Text } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

export default function PrimaryButton({ label, onPress }) {
  const { t } = useI18n();

  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{t(label)}</Text>
    </Pressable>
  );
}
