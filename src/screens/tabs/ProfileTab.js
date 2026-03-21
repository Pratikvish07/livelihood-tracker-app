import React from "react";
import { Text as RNText, View } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import { useTranslatedValue } from "../../i18n/I18nProvider";
import styles from "../../styles/appStyles";

function Text({ children, ...props }) {
  const translated = useTranslatedValue(typeof children === "string" ? children : children);
  return <RNText {...props}>{translated}</RNText>;
}

export default function ProfileTab({ user, onLogout }) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.profileHeroCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {(user.name || "TR").slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileHeroCopy}>
          <Text style={styles.profileHeroTitle}>{user.name || "TRLM User"}</Text>
          <Text style={styles.profileHeroSubtitle}>
            {user.identity || "Authenticated field session"}
          </Text>
          <View style={styles.profileRoleBadge}>
            <Text style={styles.profileRoleBadgeText}>{user.role || "CRP"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileInfoCard}>
        <Text style={styles.cardTitle}>Profile</Text>
        <View style={styles.profileInfoRow}>
          <Text style={styles.profileInfoLabel}>Name</Text>
          <Text style={styles.profileInfoValue}>{user.name || "-"}</Text>
        </View>
        <View style={styles.profileInfoRow}>
          <Text style={styles.profileInfoLabel}>Role</Text>
          <Text style={styles.profileInfoValue}>{user.role || "-"}</Text>
        </View>
        <View style={styles.profileInfoRow}>
          <Text style={styles.profileInfoLabel}>Language</Text>
          <Text style={styles.profileInfoValue}>{user.language || "-"}</Text>
        </View>
        <Text style={styles.secureNote}>
          Secure login note: Session is protected using role-based controls.
        </Text>
      </View>

      <View style={styles.profileActionCard}>
        <Text style={styles.profileActionTitle}>Session Control</Text>
        <Text style={styles.profileActionHint}>
          Logout is aligned here for quick access from the profile screen.
        </Text>
        <PrimaryButton label="Logout" onPress={onLogout} />
      </View>
    </View>
  );
}
