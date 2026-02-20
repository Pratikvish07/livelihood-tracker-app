import React from "react";
import { Text, View } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import styles from "../../styles/appStyles";

export default function ProfileTab({ user, onLogout }) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
        <Text style={styles.infoLine}>Name: {user.name || "Pratik User"}</Text>
        <Text style={styles.infoLine}>Role: {user.role}</Text>
        <Text style={styles.infoLine}>Language: {user.language}</Text>
        <Text style={styles.secureNote}>
          Secure login note: Session is protected using role-based controls.
        </Text>
        <PrimaryButton label="Logout" onPress={onLogout} />
      </View>
    </View>
  );
}
