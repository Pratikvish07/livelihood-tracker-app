import React from "react";
import { Modal, Pressable, Text as RNText, View } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import { useTranslatedValue } from "../../i18n/I18nProvider";
import styles from "../../styles/appStyles";

function Text({ children, ...props }) {
  const plainText =
    typeof children === "string" || typeof children === "number" ? String(children) : "";
  const translated = useTranslatedValue(plainText);
  const resolvedChildren =
    plainText && typeof translated === "string" && translated.trim() ? translated : children;

  return <RNText {...props}>{resolvedChildren}</RNText>;
}

export default function PostCheckoutModal({ visible, onClose, onLogout }) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.sessionGateCard, styles.postCheckoutCard]}>
          <View style={styles.sessionStatusBadgeSuccess}>
            <Text style={[styles.sessionStatusBadgeText, { fontWeight: "bold" }]}>OK</Text>
          </View>
          <Text style={styles.sessionGateTitle}>Session Check-Out Complete</Text>
          <Text style={styles.sessionGateHint}>
            Your field session for today has been successfully checked out.
            {"\n\n"}End your session with logout or continue working.
          </Text>
          <View style={styles.sessionGateActionRow}>
            <Pressable style={[styles.sessionGateGhostButton, { flex: 1 }]} onPress={onClose}>
              <Text style={styles.sessionGateGhostButtonText}>Continue Session</Text>
            </Pressable>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <PrimaryButton label="Logout Now" onPress={onLogout} />
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
