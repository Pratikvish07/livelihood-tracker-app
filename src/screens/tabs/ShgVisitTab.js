import React, { useMemo } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { BLOCKS, MOCK_SHGS, VILLAGES } from "../../constants/appData";
import LabelInput from "../../components/LabelInput";
import Pill from "../../components/Pill";
import PrimaryButton from "../../components/PrimaryButton";
import styles from "../../styles/appStyles";

export default function ShgVisitTab({ shgState, setShgState }) {
  const filtered = useMemo(
    () =>
      MOCK_SHGS.filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(shgState.search.toLowerCase());
        const blockOk = shgState.block === "All" || item.block === shgState.block;
        const villageOk =
          shgState.village === "All" || item.village === shgState.village;
        return matchesSearch && blockOk && villageOk;
      }),
    [shgState.block, shgState.search, shgState.village]
  );

  const selectedShg =
    MOCK_SHGS.find((item) => item.id === shgState.selectedId) || MOCK_SHGS[0];

  if (shgState.screen === "visit") {
    const locationValid = shgState.distance <= 50;

    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Field Visit Screen</Text>
          <Text style={styles.infoLine}>
            SHG Details: {selectedShg.name} ({selectedShg.id})
          </Text>
          <PrimaryButton
            label="Start Visit"
            onPress={() =>
              setShgState((prev) => ({
                ...prev,
                visitStarted: true,
                timestamp: new Date().toLocaleString(),
                distance: Math.floor(Math.random() * 90)
              }))
            }
          />
          <Text style={styles.infoLine}>
            Auto GPS Capture: {shgState.visitStarted ? "Captured" : "Pending"}
          </Text>
          <Text
            style={[styles.infoLine, locationValid ? styles.validText : styles.invalidText]}
          >
            50m Radius Validation: {locationValid ? "Valid (Green)" : "Outside Radius (Red)"}
          </Text>
          <Text style={styles.infoLine}>
            Timestamp: {shgState.timestamp || "Not captured"}
          </Text>
          <Pressable
            style={styles.outlineButton}
            onPress={() =>
              setShgState((prev) => ({
                ...prev,
                photoCaptured: !prev.photoCaptured
              }))
            }
          >
            <Text style={styles.outlineText}>
              {shgState.photoCaptured ? "Retake Photo" : "Capture Photo"}
            </Text>
          </Pressable>
          <LabelInput
            label="Remarks"
            value={shgState.remarks}
            onChangeText={(text) =>
              setShgState((prev) => ({ ...prev, remarks: text }))
            }
            placeholder="Visit remarks"
          />
          <PrimaryButton
            label="Submit Visit"
            onPress={() => {
              Alert.alert(
                "Visit submitted",
                `Visit for ${selectedShg.name} submitted successfully.`
              );
              setShgState((prev) => ({ ...prev, screen: "list" }));
            }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>GPS Validation UI</Text>
          <View style={styles.mapBox}>
            <Text style={styles.mapText}>Live Location Map Preview</Text>
            <View
              style={[styles.radiusCircle, !locationValid && styles.radiusCircleInvalid]}
            />
          </View>
          <Text style={styles.infoLine}>Radius Indicator: 50m circle</Text>
          <Text
            style={[styles.infoLine, locationValid ? styles.validText : styles.invalidText]}
          >
            Location Status: {locationValid ? "Valid (Green)" : "Outside Radius (Red)"}
          </Text>
          <Text style={styles.infoLine}>
            Timestamp: {shgState.timestamp || "Not captured"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SHG List Screen</Text>
        <LabelInput
          label="Search Bar"
          value={shgState.search}
          onChangeText={(text) => setShgState((prev) => ({ ...prev, search: text }))}
          placeholder="Search SHG"
        />
        <Text style={styles.label}>Filter by Block</Text>
        <View style={styles.rowWrap}>
          {BLOCKS.map((item) => (
            <Pill
              key={item}
              label={item}
              active={shgState.block === item}
              onPress={() => setShgState((prev) => ({ ...prev, block: item }))}
            />
          ))}
        </View>
        <Text style={styles.label}>Filter by Village</Text>
        <View style={styles.rowWrap}>
          {VILLAGES.map((item) => (
            <Pill
              key={item}
              label={item}
              active={shgState.village === item}
              onPress={() => setShgState((prev) => ({ ...prev, village: item }))}
            />
          ))}
        </View>
      </View>

      {filtered.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.infoLine}>Member Count: {item.members}</Text>
          <Text style={styles.infoLine}>Last Visit Date: {item.lastVisit}</Text>
          <Text
            style={[
              styles.badge,
              item.status === "Active" ? styles.badgeGood : styles.badgeWarn
            ]}
          >
            Status: {item.status}
          </Text>
          <PrimaryButton
            label="Open Field Visit"
            onPress={() =>
              setShgState((prev) => ({ ...prev, selectedId: item.id, screen: "visit" }))
            }
          />
        </View>
      ))}
    </View>
  );
}
