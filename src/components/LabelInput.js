import React from "react";
import { Text, TextInput, View } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

export default function LabelInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  editable = true
}) {
  const { t } = useI18n();

  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{t(label)}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={t(placeholder)}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );
}
