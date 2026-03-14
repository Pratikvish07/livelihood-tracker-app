import React from "react";
import { Pressable, Text, View } from "react-native";
import { useI18n } from "../i18n/I18nProvider";
import styles from "../styles/appStyles";

export default function TrlmHeader({
  title,
  subtitle,
  badge,
  onLogout,
  showLogout = false,
  compact = false
}) {
  const { t } = useI18n();

  return (
    <View style={[styles.trlmHeaderCard, compact && styles.trlmHeaderCardCompact]}>
      <View style={styles.trlmHeaderTopRow}>
        <View style={styles.trlmBrandRow}>
          <View style={styles.trlmSeal}>
            <Text style={styles.trlmSealText}>TR</Text>
          </View>
          <View style={styles.trlmBrandCopy}>
            <Text style={styles.trlmGovtLabel}>Government of Tripura</Text>
            <Text style={styles.trlmGovtDept}>Tripura Rural Livelihood Mission</Text>
          </View>
        </View>

        {showLogout ? (
          <Pressable style={styles.trlmLogoutButton} onPress={onLogout}>
            <Text style={styles.trlmLogoutButtonText}>{t("Logout")}</Text>
          </Pressable>
        ) : null}
      </View>

      {(title || subtitle || badge) ? (
        <View style={styles.trlmHeaderBody}>
          {badge ? (
            <View style={styles.trlmBadge}>
              <Text style={styles.trlmBadgeText}>{badge}</Text>
            </View>
          ) : null}
          {title ? <Text style={styles.trlmHeaderTitle}>{t(title)}</Text> : null}
          {subtitle ? <Text style={styles.trlmHeaderSubtitle}>{t(subtitle)}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}
