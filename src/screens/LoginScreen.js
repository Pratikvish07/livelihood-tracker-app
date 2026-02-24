import React, { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {
  generateCrpId,
  isAadhaarValid,
  isContactValid,
  isEmailValid,
  isLokosValid,
  isPasswordStrong
} from "../utils/appCalculations";
import { GEOFENCE_SETTINGS } from "../constants/appData";
import LeafletLocationPicker from "../components/LeafletLocationPicker";

const ID_TYPES = ["Master ID", "CRP ID", "High Level CRP"];
const DISTRICTS = ["Birbhum", "Bankura", "Purulia"];
const BLOCKS = ["Suri-I", "Suri-II", "Dubrajpur", "Manbazar"];
const GP_VC_OPTIONS = ["GP-A", "GP-B", "VC-A", "VC-B"];
const VILLAGE_OPTIONS = ["Village 1", "Village 2", "Village 3", "Village 4"];
const CRP_TYPES = ["Pashu Sakhi", "Krishi Sakhi", "CRP-EP", "Udyog Sakhi"];
const APP_LOGO_URI = "";

function LabelInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry
}) {
  return (
    <View style={localStyles.field}>
      <Text style={localStyles.label}>{label}</Text>
      <TextInput
        style={localStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

function Pill({ label, active, onPress }) {
  return (
    <Pressable
      style={[localStyles.pill, active && localStyles.pillActive]}
      onPress={onPress}
    >
      <Text style={[localStyles.pillText, active && localStyles.pillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function LoginScreen({
  loginForm,
  setLoginForm,
  onLogin,
  signupForm,
  setSignupForm,
  onSignup
}) {
  const [mode, setMode] = useState("login");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showIdTypeDropdown, setShowIdTypeDropdown] = useState(false);

  const generatedCrpId = useMemo(
    () => generateCrpId(signupForm),
    [signupForm.block, signupForm.district, signupForm.name]
  );

  const aadhaarValid = isAadhaarValid(signupForm.uid);
  const lokosValid = isLokosValid(signupForm.lokosId);
  const passwordValid = isPasswordStrong(signupForm.password);
  const contactValid = isContactValid(signupForm.contactNo);
  const emailValid = isEmailValid(signupForm.email);
  const passwordMatch =
    signupForm.confirmPassword.length > 0 &&
    signupForm.password === signupForm.confirmPassword;

  const handleLocationSelected = (location) => {
    setCurrentLocation(location);
    setShowMapPicker(false);
  };

  return (
    <View style={localStyles.container}>
      <View style={localStyles.bgOrbTop} />
      <View style={localStyles.bgOrbBottom} />

      <View style={localStyles.head}>
        {APP_LOGO_URI ? (
          <Image source={{ uri: APP_LOGO_URI }} style={localStyles.logoImage} />
        ) : (
          <Text style={localStyles.logo}>SRS Portal</Text>
        )}
        <Text style={localStyles.title}>Diagram Login + Sign-up</Text>
        <Text style={localStyles.subtitle}>Secure access for CRP and Admin workflows</Text>
      </View>

      <View style={localStyles.modeRow}>
        <Pressable
          style={[localStyles.modeButton, mode === "login" && localStyles.modeButtonActive]}
          onPress={() => setMode("login")}
        >
          <Text style={[localStyles.modeText, mode === "login" && localStyles.modeTextActive]}>
            Log-In
          </Text>
        </Pressable>
        <Pressable
          style={[localStyles.modeButton, mode === "signup" && localStyles.modeButtonActive]}
          onPress={() => setMode("signup")}
        >
          <Text style={[localStyles.modeText, mode === "signup" && localStyles.modeTextActive]}>
            Sign-up
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={localStyles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {mode === "login" ? (
          <View style={localStyles.card}>
            <Text style={localStyles.sectionTitle}>Sign In</Text>
            <Text style={localStyles.label}>ID Type</Text>
            <View style={localStyles.dropdownWrap}>
              <Pressable
                style={localStyles.dropdownTrigger}
                onPress={() => setShowIdTypeDropdown((prev) => !prev)}
              >
                <Text style={localStyles.dropdownTriggerText}>{loginForm.idType}</Text>
                <Text style={localStyles.dropdownChevron}>
                  {showIdTypeDropdown ? "▲" : "▼"}
                </Text>
              </Pressable>
              {showIdTypeDropdown ? (
                <View style={localStyles.dropdownMenu}>
                  {ID_TYPES.map((item) => (
                    <Pressable
                      key={item}
                      style={[
                        localStyles.dropdownItem,
                        loginForm.idType === item && localStyles.dropdownItemActive
                      ]}
                      onPress={() => {
                        setLoginForm((prev) => ({ ...prev, idType: item }));
                        setShowIdTypeDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          localStyles.dropdownItemText,
                          loginForm.idType === item && localStyles.dropdownItemTextActive
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <LabelInput
              label="CRP ID / Master ID"
              value={loginForm.identity}
              onChangeText={(text) =>
                setLoginForm((prev) => ({ ...prev, identity: text.trim() }))
              }
              placeholder="Enter ID"
            />
            <LabelInput
              label="Password"
              value={loginForm.password}
              onChangeText={(text) => setLoginForm((prev) => ({ ...prev, password: text }))}
              placeholder="Enter password"
              secureTextEntry
            />

            {GEOFENCE_SETTINGS.enabled ? (
              <Pressable
                style={localStyles.locationButton}
                onPress={() => setShowMapPicker(true)}
              >
                <Text style={localStyles.locationButtonText}>
                  {currentLocation
                    ? `Location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                    : "Capture Location"}
                </Text>
              </Pressable>
            ) : null}

            <Pressable style={localStyles.primary} onPress={onLogin}>
              <Text style={localStyles.primaryText}>LOG-IN</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={localStyles.card}>
            <Text style={localStyles.sectionTitle}>Sign-up Module</Text>

            {GEOFENCE_SETTINGS.enabled ? (
              <Pressable
                style={localStyles.locationButton}
                onPress={() => setShowMapPicker(true)}
              >
                <Text style={localStyles.locationButtonText}>
                  {currentLocation
                    ? `Location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                    : "Select Location (Map)"}
                </Text>
              </Pressable>
            ) : null}

            <LabelInput
              label="Name"
              value={signupForm.name}
              onChangeText={(text) => setSignupForm((prev) => ({ ...prev, name: text }))}
              placeholder="Full name"
            />
            <LabelInput
              label="UID (Aadhaar)"
              value={signupForm.uid}
              onChangeText={(text) =>
                setSignupForm((prev) => ({ ...prev, uid: text.replace(/\D/g, "").slice(0, 12) }))
              }
              placeholder="12 digit Aadhaar"
              keyboardType="numeric"
            />
            <Text style={[localStyles.helper, aadhaarValid ? localStyles.ok : localStyles.bad]}>
              {aadhaarValid ? "Aadhaar valid" : "Aadhaar must be 12 digits"}
            </Text>

            <LabelInput
              label="LokOS ID"
              value={signupForm.lokosId}
              onChangeText={(text) =>
                setSignupForm((prev) => ({
                  ...prev,
                  lokosId: text.replace(/\D/g, "").slice(0, 12)
                }))
              }
              placeholder="12 digit LokOS ID"
              keyboardType="numeric"
            />
            <Text style={[localStyles.helper, lokosValid ? localStyles.ok : localStyles.bad]}>
              {lokosValid ? "LokOS valid" : "LokOS must be 12 digits"}
            </Text>

            <Text style={localStyles.label}>District Name</Text>
            <View style={localStyles.rowWrap}>
              {DISTRICTS.map((item) => (
                <Pill
                  key={item}
                  label={item}
                  active={signupForm.district === item}
                  onPress={() => setSignupForm((prev) => ({ ...prev, district: item }))}
                />
              ))}
            </View>

            <Text style={localStyles.label}>Block Name</Text>
            <View style={localStyles.rowWrap}>
              {BLOCKS.map((item) => (
                <Pill
                  key={item}
                  label={item}
                  active={signupForm.block === item}
                  onPress={() => setSignupForm((prev) => ({ ...prev, block: item }))}
                />
              ))}
            </View>

            <Text style={localStyles.label}>GP/VC Name</Text>
            <View style={localStyles.rowWrap}>
              {GP_VC_OPTIONS.map((item) => {
                const active = signupForm.gpVc.includes(item);
                return (
                  <Pill
                    key={item}
                    label={item}
                    active={active}
                    onPress={() =>
                      setSignupForm((prev) => ({
                        ...prev,
                        gpVc: active
                          ? prev.gpVc.filter((x) => x !== item)
                          : [...prev.gpVc, item]
                      }))
                    }
                  />
                );
              })}
            </View>

            <Text style={localStyles.label}>Village Covered</Text>
            <View style={localStyles.rowWrap}>
              {VILLAGE_OPTIONS.map((item) => {
                const active = signupForm.villages.includes(item);
                return (
                  <Pill
                    key={item}
                    label={item}
                    active={active}
                    onPress={() =>
                      setSignupForm((prev) => ({
                        ...prev,
                        villages: active
                          ? prev.villages.filter((x) => x !== item)
                          : [...prev.villages, item]
                      }))
                    }
                  />
                );
              })}
            </View>

            <LabelInput
              label="Password"
              value={signupForm.password}
              onChangeText={(text) => setSignupForm((prev) => ({ ...prev, password: text }))}
              placeholder="Type password"
              secureTextEntry
            />
            <Text style={[localStyles.helper, passwordValid ? localStyles.ok : localStyles.bad]}>
              {passwordValid
                ? "Password valid"
                : "Need upper/lower/number/special char"}
            </Text>

            <LabelInput
              label="Confirm Password"
              value={signupForm.confirmPassword}
              onChangeText={(text) =>
                setSignupForm((prev) => ({ ...prev, confirmPassword: text }))
              }
              placeholder="Re-enter password"
              secureTextEntry
            />
            <Text style={[localStyles.helper, passwordMatch ? localStyles.ok : localStyles.bad]}>
              {passwordMatch ? "Password matched" : "Password mismatch"}
            </Text>

            <LabelInput
              label="Contact No."
              value={signupForm.contactNo}
              onChangeText={(text) =>
                setSignupForm((prev) => ({
                  ...prev,
                  contactNo: text.replace(/\D/g, "").slice(0, 10)
                }))
              }
              placeholder="10 digit mobile"
              keyboardType="numeric"
            />
            <Text style={[localStyles.helper, contactValid ? localStyles.ok : localStyles.bad]}>
              {contactValid ? "Contact valid" : "Contact must be 10 digits"}
            </Text>

            <LabelInput
              label="Email ID"
              value={signupForm.email}
              onChangeText={(text) => setSignupForm((prev) => ({ ...prev, email: text }))}
              placeholder="email@example.com"
              keyboardType="email-address"
            />
            <Text style={[localStyles.helper, emailValid ? localStyles.ok : localStyles.bad]}>
              {emailValid ? "Email valid" : "Invalid email"}
            </Text>

            <Text style={localStyles.label}>Type of CRP</Text>
            <View style={localStyles.rowWrap}>
              {CRP_TYPES.map((item) => {
                const active = signupForm.crpTypes.includes(item);
                return (
                  <Pill
                    key={item}
                    label={item}
                    active={active}
                    onPress={() =>
                      setSignupForm((prev) => ({
                        ...prev,
                        crpTypes: active
                          ? prev.crpTypes.filter((x) => x !== item)
                          : [...prev.crpTypes, item]
                      }))
                    }
                  />
                );
              })}
            </View>

            <LabelInput
              label="Upload Picture (.jpg/.jpeg path)"
              value={signupForm.pictureFile}
              onChangeText={(text) => setSignupForm((prev) => ({ ...prev, pictureFile: text }))}
              placeholder="example.jpg"
            />

            <View style={localStyles.crpPreviewBox}>
              <Text style={localStyles.crpPreviewLabel}>CRP ID (Auto-generated)</Text>
              <Text style={localStyles.crpPreviewValue}>{generatedCrpId}</Text>
            </View>

            <Pressable style={localStyles.primary} onPress={() => onSignup(generatedCrpId)}>
              <Text style={localStyles.primaryText}>Create ID</Text>
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <LeafletLocationPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelected={handleLocationSelected}
        initialLatitude={currentLocation?.latitude}
        initialLongitude={currentLocation?.longitude}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef3fb" },
  bgOrbTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(59,130,246,0.16)",
    top: -110,
    right: -90
  },
  bgOrbBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(37,99,235,0.1)",
    bottom: -100,
    left: -80
  },
  head: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#0b1b4a",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#29458f"
  },
  logo: {
    color: "#dbeafe",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  logoImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: "#93c5fd",
    backgroundColor: "#fff"
  },
  title: { color: "#fff", marginTop: 5, fontSize: 20, fontWeight: "900" },
  subtitle: { color: "#c7d2fe", marginTop: 3, fontSize: 12, fontWeight: "600" },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 14,
    marginTop: 12,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#dbe4f4",
    borderWidth: 1,
    borderColor: "#b8c6e4"
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#8fa1c5",
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#f8fafc"
  },
  modeButtonActive: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  modeText: { color: "#334155", fontWeight: "800", fontSize: 13 },
  modeTextActive: { color: "#fff" },
  body: { flex: 1 },
  card: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fefeff",
    borderWidth: 1,
    borderColor: "#cfd9ec",
    gap: 8,
    shadowColor: "#0b1b4a",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 6
  },
  sectionTitle: { fontSize: 24, fontWeight: "900", color: "#1e293b", marginBottom: 6 },
  field: { gap: 4 },
  label: { color: "#334155", fontSize: 12, fontWeight: "800" },
  input: {
    borderWidth: 1,
    borderColor: "#ccdaef",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
    backgroundColor: "#f8fbff",
    color: "#0f172a"
  },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  dropdownWrap: { marginBottom: 4 },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#ccdaef",
    borderRadius: 10,
    backgroundColor: "#f8fbff",
    paddingHorizontal: 11,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropdownTriggerText: { color: "#0f172a", fontSize: 14, fontWeight: "700" },
  dropdownChevron: { color: "#475569", fontSize: 12, fontWeight: "700" },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#ccdaef",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden"
  },
  dropdownItem: { paddingHorizontal: 11, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: "#eaf2ff" },
  dropdownItemText: { color: "#0f172a", fontWeight: "600" },
  dropdownItemTextActive: { color: "#1e3a8a", fontWeight: "800" },
  pill: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f8fafc"
  },
  pillActive: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
  pillText: { color: "#334155", fontSize: 12, fontWeight: "700" },
  pillTextActive: { color: "#fff" },
  helper: { fontSize: 11, marginTop: -2, marginBottom: 2 },
  ok: { color: "#15803d" },
  bad: { color: "#b91c1c" },
  locationButton: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#86efac",
    backgroundColor: "#ebfff0",
    padding: 11
  },
  locationButtonText: { color: "#166534", fontWeight: "700", fontSize: 12 },
  primary: {
    backgroundColor: "#1e40d2",
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#274cd9",
    shadowColor: "#1e40d2",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.27,
    shadowRadius: 10,
    elevation: 5
  },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 15, letterSpacing: 0.5 },
  crpPreviewBox: {
    backgroundColor: "#edf4ff",
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 10,
    padding: 11
  },
  crpPreviewLabel: { fontSize: 11, color: "#1d4ed8", fontWeight: "700" },
  crpPreviewValue: { marginTop: 2, color: "#1e3a8a", fontWeight: "800" }
});
