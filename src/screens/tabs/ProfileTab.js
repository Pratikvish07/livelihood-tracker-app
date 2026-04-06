import React from "react";
import { Text as RNText, View } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import { useTranslatedValue } from "../../i18n/I18nProvider";
import styles from "../../styles/appStyles";

function Text({ children, ...props }) {
  const plainText =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : "";
  const translated = useTranslatedValue(plainText);
  const resolvedChildren =
    plainText && typeof translated === "string" && translated.trim()
      ? translated
      : children;

  return <RNText {...props}>{resolvedChildren}</RNText>;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function ProfileTab({ user, sessionInfo, onLogout }) {
  const sessionDuration = sessionInfo?.isActive
    ? formatDuration(sessionInfo.elapsedSeconds)
    : user.lastSessionDurationLabel || formatDuration(user.lastSessionDurationSeconds);

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
        <View style={styles.profileInfoRow}>
          <Text style={styles.profileInfoLabel}>Login Time</Text>
          <Text style={styles.profileInfoValue}>
            {formatDateTime(sessionInfo?.loginAt || user.sessionStartedAt)}
          </Text>
        </View>
        <View style={styles.profileInfoRow}>
          <Text style={styles.profileInfoLabel}>Logout Time</Text>
          <Text style={styles.profileInfoValue}>
            {sessionInfo?.isActive ? "Running" : formatDateTime(sessionInfo?.logoutAt || user.sessionEndedAt)}
          </Text>
        </View>
        <View style={styles.profileInfoRow}>
          <Text style={styles.profileInfoLabel}>Session Duration</Text>
          <Text style={styles.profileInfoValue}>{sessionDuration}</Text>
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
