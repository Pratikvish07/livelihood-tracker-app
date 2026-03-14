import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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
import {
  fetchBlocksByDistrict,
  fetchDistricts,
  fetchGpsByBlock,
  fetchVillagesByGp
} from "../services/masterApi";
import { useTranslatedValue } from "../i18n/I18nProvider";

const ID_TYPES = ["Master ID", "CRP ID"];
const CRP_TYPES = ["CRP"];
const APP_LOGO = require("../../assets/branding/livelihood-tracker-icon.png");

function stringifyChildren(children) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    const parts = children.map((child) => stringifyChildren(child));
    return parts.every((part) => typeof part === "string") ? parts.join("") : null;
  }

  return null;
}

function Text({ children, ...props }) {
  const rawText = stringifyChildren(children);
  const translated = useTranslatedValue(rawText ?? children);
  return <RNText {...props}>{translated}</RNText>;
}

function TextInput({ placeholder, ...props }) {
  const translatedPlaceholder = useTranslatedValue(placeholder);
  return <RNTextInput {...props} placeholder={translatedPlaceholder} />;
}

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
  onSignup,
  signupSubmitting,
  signupResponse,
  loginSubmitting
}) {
  const [mode, setMode] = useState("login");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showIdTypeDropdown, setShowIdTypeDropdown] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);
  const [gpOptions, setGpOptions] = useState([]);
  const [villageOptions, setVillageOptions] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [gpLoading, setGpLoading] = useState(false);
  const [villageLoading, setVillageLoading] = useState(false);
  const [districtError, setDistrictError] = useState("");
  const [blockError, setBlockError] = useState("");
  const [gpError, setGpError] = useState("");
  const [villageError, setVillageError] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showGpDropdown, setShowGpDropdown] = useState(false);
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);
  const [picturePreviewUri, setPicturePreviewUri] = useState("");
  const [pictureDisplayName, setPictureDisplayName] = useState("");
  const isWebPreview = Platform.OS === "web";
  const districtMessage = isWebPreview && districtError ? "Unable to load district list in web preview." : districtError;
  const blockMessage = isWebPreview && blockError ? "Unable to load block list in web preview." : blockError;
  const gpMessage = isWebPreview && gpError ? "Unable to load GP/VC list in web preview." : gpError;
  const villageMessage = isWebPreview && villageError ? "Unable to load village list in web preview." : villageError;
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

  const onPickPicture = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission needed", "Please allow gallery access to choose a photo.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const selectedName = asset.fileName || asset.uri.split("/").pop() || "selected-image.jpg";

      setPicturePreviewUri(asset.uri);
      setPictureDisplayName(selectedName);
      setSignupForm((prev) => ({
        ...prev,
        pictureFile: selectedName
      }));
    } catch (error) {
      Alert.alert("Image selection failed", error.message || "Unable to choose image.");
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadDistricts() {
      if (mode !== "signup" || districtOptions.length > 0) {
        return;
      }

      setDistrictLoading(true);
      setDistrictError("");

      try {
        const districts = await fetchDistricts();
        if (!isMounted) {
          return;
        }
        setDistrictOptions(districts.filter((item) => item.id && item.name));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setDistrictError(error.message || "Unable to load districts.");
      } finally {
        if (isMounted) {
          setDistrictLoading(false);
        }
      }
    }

    loadDistricts();

    return () => {
      isMounted = false;
    };
  }, [mode, districtOptions.length]);

  useEffect(() => {
    let isMounted = true;

    async function loadBlocks() {
      if (!signupForm.districtId) {
        setBlockOptions([]);
        setBlockError("");
        return;
      }

      setBlockLoading(true);
      setBlockError("");

      try {
        const blocks = await fetchBlocksByDistrict(signupForm.districtId);
        if (!isMounted) {
          return;
        }
        setBlockOptions(blocks.filter((item) => item.id && item.name));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setBlockError(error.message || "Unable to load blocks.");
        setBlockOptions([]);
      } finally {
        if (isMounted) {
          setBlockLoading(false);
        }
      }
    }

    loadBlocks();

    return () => {
      isMounted = false;
    };
  }, [signupForm.districtId]);

  useEffect(() => {
    let isMounted = true;

    async function loadGps() {
      if (!signupForm.blockId) {
        setGpOptions([]);
        setGpError("");
        return;
      }

      setGpLoading(true);
      setGpError("");

      try {
        const gps = await fetchGpsByBlock(signupForm.blockId);
        if (!isMounted) {
          return;
        }
        setGpOptions(gps.filter((item) => item.id && item.name));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setGpError(error.message || "Unable to load GP/VC.");
        setGpOptions([]);
      } finally {
        if (isMounted) {
          setGpLoading(false);
        }
      }
    }

    loadGps();

    return () => {
      isMounted = false;
    };
  }, [signupForm.blockId]);

  useEffect(() => {
    let isMounted = true;

    async function loadVillages() {
      if (!signupForm.gpId) {
        setVillageOptions([]);
        setVillageError("");
        return;
      }

      setVillageLoading(true);
      setVillageError("");

      try {
        const villages = await fetchVillagesByGp(signupForm.gpId);
        if (!isMounted) {
          return;
        }
        setVillageOptions(villages.filter((item) => item.id && item.name));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setVillageError(error.message || "Unable to load villages.");
        setVillageOptions([]);
      } finally {
        if (isMounted) {
          setVillageLoading(false);
        }
      }
    }

    loadVillages();

    return () => {
      isMounted = false;
    };
  }, [signupForm.gpId]);

  return (
    <View style={localStyles.container}>
      <View style={localStyles.bgSealTop} />
      <View style={localStyles.bgSealBottom} />
      <View style={localStyles.flagStripeTop} />

      <View style={localStyles.head}>
        <View style={localStyles.headTopRow}>
          <View style={localStyles.govtRow}>
            <View style={localStyles.govtSeal}>
              <Text style={localStyles.govtSealText}>TR</Text>
            </View>
            <View style={localStyles.govtCopy}>
              <Text style={localStyles.govtLabel}>Government of Tripura</Text>
              <Text style={localStyles.govtDept}>Tripura Rural Livelihood Mission</Text>
            </View>
          </View>
          <Image source={APP_LOGO} style={localStyles.logoImage} />
        </View>
        <Text style={localStyles.title}>Livelihood Tracker</Text>
        <Text style={localStyles.subtitle}>Sign in or create your CRP ID from one simple screen.</Text>
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
                <Text style={localStyles.dropdownTriggerText}>
                  {loginForm.idType || "Select ID Type"}
                </Text>
                <Text style={localStyles.dropdownChevron}>
                  {showIdTypeDropdown ? "^" : "v"}
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

            <Pressable
              style={[localStyles.primary, loginSubmitting && localStyles.primaryDisabled]}
              onPress={onLogin}
              disabled={loginSubmitting}
            >
              <Text style={localStyles.primaryText}>
                {loginSubmitting ? "Signing In..." : "LOG-IN"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={localStyles.card}>
            <View style={localStyles.signupIntro}>
              <Text style={localStyles.sectionTitle}>CRP Registration</Text>
              <Text style={localStyles.sectionSubtitle}>
                Fill the registration form as per official records. Area lists will open automatically after each selection.
              </Text>
            </View>

            {GEOFENCE_SETTINGS.enabled ? (
              <Pressable
                style={[localStyles.locationButton, localStyles.locationButtonCompact]}
                onPress={() => setShowMapPicker(true)}
              >
                <Text style={localStyles.locationButtonText}>
                  {currentLocation
                    ? `Map linked: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                    : "Add work location from map"}
                </Text>
              </Pressable>
            ) : null}

            <View style={localStyles.groupCard}>
              <Text style={localStyles.groupTitle}>Applicant Details</Text>
              <Text style={localStyles.groupHint}>Enter your name and identification details exactly as per official records.</Text>

              <LabelInput
                label="Full Name"
                value={signupForm.name}
                onChangeText={(text) => setSignupForm((prev) => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
              />
              <LabelInput
                label="UID (Aadhaar)"
                value={signupForm.uid}
                onChangeText={(text) =>
                  setSignupForm((prev) => ({ ...prev, uid: text.replace(/\D/g, "").slice(0, 12) }))
                }
                placeholder="Enter 12 digit Aadhaar number"
                keyboardType="numeric"
              />
              <Text style={[localStyles.helper, signupForm.uid ? (aadhaarValid ? localStyles.ok : localStyles.bad) : localStyles.neutral]}>
                {aadhaarValid ? "Aadhaar number looks correct." : "Aadhaar number must be 12 digits."}
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
                placeholder="Enter 12 digit LokOS ID"
                keyboardType="numeric"
              />
              <Text style={[localStyles.helper, signupForm.lokosId ? (lokosValid ? localStyles.ok : localStyles.bad) : localStyles.neutral]}>
                {lokosValid ? "LokOS ID looks correct." : "LokOS ID must be 12 digits."}
              </Text>
            </View>

            <View style={localStyles.groupCard}>
            <Text style={localStyles.groupTitle}>Area Mapping</Text>
            <Text style={localStyles.groupHint}>Choose your district first. Block, GP/VC, and village will open automatically based on your selection.</Text>

            <Text style={localStyles.label}>District Name</Text>
            <View style={localStyles.dropdownWrap}>
              <Pressable
                style={localStyles.dropdownTrigger}
                onPress={() => {
                  setShowDistrictDropdown((prev) => !prev);
                  setShowBlockDropdown(false);
                  setShowGpDropdown(false);
                  setShowVillageDropdown(false);
                }}
              >
                <Text style={localStyles.dropdownTriggerText}>
                  {signupForm.district || (districtLoading ? "Loading districts..." : "Select District")}
                </Text>
                <Text style={localStyles.dropdownChevron}>{showDistrictDropdown ? "^" : "v"}</Text>
              </Pressable>
              {showDistrictDropdown ? (
                <View style={localStyles.dropdownMenu}>
                  {districtLoading ? (
                    <View style={localStyles.dropdownStatusRow}>
                      <ActivityIndicator size="small" color="#224a93" />
                      <Text style={localStyles.dropdownStatusText}>Loading districts...</Text>
                    </View>
                  ) : districtOptions.length > 0 ? (
                    districtOptions.map((item) => (
                      <Pressable
                        key={item.id}
                        style={[
                          localStyles.dropdownItem,
                          signupForm.districtId === item.id && localStyles.dropdownItemActive
                        ]}
                        onPress={() => {
                          setSignupForm((prev) => ({
                            ...prev,
                            district: item.name,
                            districtId: item.id,
                            block: "",
                            blockId: "",
                            gpId: "",
                            villageId: "",
                            gpVc: [],
                            villages: []
                          }));
                          setShowDistrictDropdown(false);
                          setShowBlockDropdown(false);
                          setShowGpDropdown(false);
                          setShowVillageDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            localStyles.dropdownItemText,
                            signupForm.districtId === item.id && localStyles.dropdownItemTextActive
                          ]}
                        >
                          {item.name}
                        </Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={localStyles.dropdownEmptyText}>
                      {districtMessage || "No districts available."}
                    </Text>
                  )}
                </View>
              ) : null}
            </View>

            <Text style={localStyles.label}>Block Name</Text>
            <View style={localStyles.dropdownWrap}>
              <Pressable
                style={[
                  localStyles.dropdownTrigger,
                  !signupForm.districtId && localStyles.dropdownTriggerDisabled
                ]}
                disabled={!signupForm.districtId}
                onPress={() => {
                  setShowBlockDropdown((prev) => !prev);
                  setShowDistrictDropdown(false);
                  setShowGpDropdown(false);
                  setShowVillageDropdown(false);
                }}
              >
                <Text style={localStyles.dropdownTriggerText}>
                  {signupForm.block ||
                    (!signupForm.districtId
                      ? "Select District First"
                      : blockLoading
                        ? "Loading blocks..."
                        : "Select Block")}
                </Text>
                <Text style={localStyles.dropdownChevron}>{showBlockDropdown ? "^" : "v"}</Text>
              </Pressable>
              {showBlockDropdown ? (
                <View style={localStyles.dropdownMenu}>
                  {blockLoading ? (
                    <View style={localStyles.dropdownStatusRow}>
                      <ActivityIndicator size="small" color="#224a93" />
                      <Text style={localStyles.dropdownStatusText}>Loading blocks...</Text>
                    </View>
                  ) : blockOptions.length > 0 ? (
                    blockOptions.map((item) => (
                      <Pressable
                        key={item.id}
                        style={[
                          localStyles.dropdownItem,
                          signupForm.blockId === item.id && localStyles.dropdownItemActive
                        ]}
                        onPress={() => {
                          setSignupForm((prev) => ({
                            ...prev,
                            block: item.name,
                            blockId: item.id,
                            gpId: "",
                            villageId: "",
                            gpVc: []
                          }));
                          setShowBlockDropdown(false);
                          setShowGpDropdown(false);
                          setShowVillageDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            localStyles.dropdownItemText,
                            signupForm.blockId === item.id && localStyles.dropdownItemTextActive
                          ]}
                        >
                          {item.name}
                        </Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={localStyles.dropdownEmptyText}>
                      {blockMessage || "No blocks available."}
                    </Text>
                  )}
                </View>
              ) : null}
            </View>

            <Text style={localStyles.label}>GP/VC Name</Text>
            <View style={localStyles.dropdownWrap}>
              <Pressable
                style={[
                  localStyles.dropdownTrigger,
                  !signupForm.blockId && localStyles.dropdownTriggerDisabled
                ]}
                disabled={!signupForm.blockId}
                onPress={() => {
                  setShowGpDropdown((prev) => !prev);
                  setShowDistrictDropdown(false);
                  setShowBlockDropdown(false);
                  setShowVillageDropdown(false);
                }}
              >
                <Text style={localStyles.dropdownTriggerText}>
                  {signupForm.gpVc[0] ||
                    (!signupForm.blockId
                      ? "Select Block First"
                      : gpLoading
                        ? "Loading GP/VC..."
                        : "Select GP/VC")}
                </Text>
                <Text style={localStyles.dropdownChevron}>{showGpDropdown ? "^" : "v"}</Text>
              </Pressable>
              {showGpDropdown ? (
                <View style={localStyles.dropdownMenu}>
                  {gpLoading ? (
                    <View style={localStyles.dropdownStatusRow}>
                      <ActivityIndicator size="small" color="#224a93" />
                      <Text style={localStyles.dropdownStatusText}>Loading GP/VC...</Text>
                    </View>
                  ) : gpOptions.length > 0 ? (
                    gpOptions.map((item) => (
                      <Pressable
                        key={item.id}
                        style={[
                          localStyles.dropdownItem,
                          signupForm.gpId === item.id && localStyles.dropdownItemActive
                        ]}
                        onPress={() => {
                          setSignupForm((prev) => ({
                            ...prev,
                            gpId: item.id,
                            villageId: "",
                            gpVc: [item.name]
                          }));
                          setShowGpDropdown(false);
                          setShowVillageDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            localStyles.dropdownItemText,
                            signupForm.gpId === item.id && localStyles.dropdownItemTextActive
                          ]}
                        >
                          {item.name}
                        </Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={localStyles.dropdownEmptyText}>
                      {gpMessage || "No GP/VC available."}
                    </Text>
                  )}
                </View>
              ) : null}
            </View>

            <Text style={localStyles.label}>Village Covered</Text>
            <View style={localStyles.dropdownWrap}>
              <Pressable
                style={[
                  localStyles.dropdownTrigger,
                  !signupForm.gpId && localStyles.dropdownTriggerDisabled
                ]}
                disabled={!signupForm.gpId}
                onPress={() => {
                  setShowVillageDropdown((prev) => !prev);
                  setShowDistrictDropdown(false);
                  setShowBlockDropdown(false);
                  setShowGpDropdown(false);
                }}
              >
                <Text style={localStyles.dropdownTriggerText}>
                  {signupForm.villages[0] ||
                    (!signupForm.gpId
                      ? "Select GP/VC First"
                      : villageLoading
                        ? "Loading Villages..."
                        : "Select Village")}
                </Text>
                <Text style={localStyles.dropdownChevron}>{showVillageDropdown ? "^" : "v"}</Text>
              </Pressable>
              {showVillageDropdown ? (
                <View style={localStyles.dropdownMenu}>
                  {villageLoading ? (
                    <View style={localStyles.dropdownStatusRow}>
                      <ActivityIndicator size="small" color="#224a93" />
                      <Text style={localStyles.dropdownStatusText}>Loading villages...</Text>
                    </View>
                  ) : villageOptions.length > 0 ? (
                    villageOptions.map((item) => (
                      <Pressable
                        key={item.id}
                        style={[
                          localStyles.dropdownItem,
                          signupForm.villageId === item.id && localStyles.dropdownItemActive
                        ]}
                        onPress={() => {
                          setSignupForm((prev) => ({
                            ...prev,
                            villageId: item.id,
                            villages: [item.name]
                          }));
                          setShowVillageDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            localStyles.dropdownItemText,
                            signupForm.villageId === item.id && localStyles.dropdownItemTextActive
                          ]}
                        >
                          {item.name}
                        </Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={localStyles.dropdownEmptyText}>
                      {villageMessage || "No villages available."}
                    </Text>
                  )}
                </View>
              ) : null}
            </View>
            </View>

            <View style={localStyles.groupCard}>
            <Text style={localStyles.groupTitle}>Registration Credentials</Text>
            <Text style={localStyles.groupHint}>Provide your contact number, email, password, CRP type, and profile photo for submission.</Text>

            <LabelInput
              label="Password"
              value={signupForm.password}
              onChangeText={(text) => setSignupForm((prev) => ({ ...prev, password: text }))}
              placeholder="Create password"
              secureTextEntry
            />
            <Text style={[localStyles.helper, signupForm.password ? (passwordValid ? localStyles.ok : localStyles.bad) : localStyles.neutral]}>
              {passwordValid
                ? "Password looks strong."
                : "Use upper case, lower case, number and special character."}
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
            <Text style={[localStyles.helper, signupForm.confirmPassword ? (passwordMatch ? localStyles.ok : localStyles.bad) : localStyles.neutral]}>
              {passwordMatch ? "Password confirmed." : "Both password fields should match."}
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
              placeholder="Enter 10 digit mobile number"
              keyboardType="numeric"
            />
            <Text style={[localStyles.helper, signupForm.contactNo ? (contactValid ? localStyles.ok : localStyles.bad) : localStyles.neutral]}>
              {contactValid ? "Mobile number looks correct." : "Mobile number must be 10 digits."}
            </Text>

            <LabelInput
              label="Email ID"
              value={signupForm.email}
              onChangeText={(text) => setSignupForm((prev) => ({ ...prev, email: text }))}
              placeholder="Enter email address"
              keyboardType="email-address"
            />
            <Text style={[localStyles.helper, signupForm.email ? (emailValid ? localStyles.ok : localStyles.bad) : localStyles.neutral]}>
              {emailValid ? "Email address looks correct." : "Enter a valid email address."}
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

            <Text style={localStyles.label}>Upload Picture</Text>
            <View style={localStyles.uploadCard}>
              <View style={localStyles.uploadPreview}>
                {picturePreviewUri ? (
                  <Image source={{ uri: picturePreviewUri }} style={localStyles.uploadPreviewImage} />
                ) : (
                  <Text style={localStyles.uploadPreviewPlaceholder}>Photo Preview</Text>
                )}
              </View>
              <View style={localStyles.uploadCopy}>
                <Text style={localStyles.uploadTitle}>Choose a clear profile photo</Text>
                <Text style={localStyles.uploadHint}>
                  Upload a `.jpg` or `.jpeg` image so the registration can be verified easily.
                </Text>
                <Pressable style={localStyles.uploadButton} onPress={onPickPicture}>
                  <Text style={localStyles.uploadButtonText}>
                    {picturePreviewUri ? "Change Photo" : "Choose Photo"}
                  </Text>
                </Pressable>
                <Text style={localStyles.uploadFileName}>
                  {pictureDisplayName || "No photo selected"}
                </Text>
              </View>
            </View>
            </View>

            <View style={localStyles.crpPreviewBox}>
              <Text style={localStyles.crpPreviewLabel}>Proposed CRP ID (Auto-generated)</Text>
              <Text style={localStyles.crpPreviewValue}>{generatedCrpId}</Text>
            </View>

            {signupResponse?.message ? (
              <View
                style={[
                  localStyles.apiResponseCard,
                  signupResponse.type === "error"
                    ? localStyles.apiResponseCardError
                    : localStyles.apiResponseCardSuccess
                ]}
              >
                <Text style={localStyles.apiResponseTitle}>
                  {signupResponse.type === "error" ? "Signup Response" : "Registration Response"}
                </Text>
                <Text style={localStyles.apiResponseText}>{signupResponse.message}</Text>
              </View>
            ) : null}

            <Pressable
              style={[localStyles.primary, signupSubmitting && localStyles.primaryDisabled]}
              onPress={() => onSignup(generatedCrpId, currentLocation)}
              disabled={signupSubmitting}
            >
              <Text style={localStyles.primaryText}>
                {signupSubmitting ? "Creating ID..." : "Create ID"}
              </Text>
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
  container: { flex: 1, backgroundColor: "#edf2e7" },
  bgSealTop: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(19,78,74,0.07)",
    top: -120,
    right: -110
  },
  bgSealBottom: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(191,131,45,0.08)",
    bottom: -110,
    left: -90
  },
  flagStripeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "#d97706"
  },
  head: {
    marginTop: 18,
    marginHorizontal: 14,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    backgroundColor: "#f8f5ea",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#c6b98a",
    borderTopWidth: 5,
    borderTopColor: "#1f4b3f",
    shadowColor: "#5b5b39",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 3
  },
  headTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  govtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1
  },
  govtSeal: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff7db",
    borderWidth: 1.5,
    borderColor: "#a07f2f",
    alignItems: "center",
    justifyContent: "center"
  },
  govtSealText: {
    color: "#7c5a10",
    fontSize: 15,
    fontWeight: "900"
  },
  govtCopy: {
    flex: 1
  },
  govtLabel: {
    color: "#355245",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  govtDept: {
    color: "#1f2937",
    fontSize: 15,
    fontWeight: "800"
  },
  logo: {
    color: "#5b6b43",
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
  title: { color: "#16243a", marginTop: 8, fontSize: 24, fontWeight: "900" },
  subtitle: { color: "#4b5b4b", marginTop: 2, fontSize: 12, fontWeight: "600", lineHeight: 18 },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 14,
    marginTop: 10,
    padding: 5,
    borderRadius: 16,
    backgroundColor: "#e5e0cf",
    borderWidth: 1,
    borderColor: "#c9be99"
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#9fabc1",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#f8f6ef"
  },
  modeButtonActive: { backgroundColor: "#284e98", borderColor: "#19386f" },
  modeText: { color: "#3d4a58", fontWeight: "800", fontSize: 14 },
  modeTextActive: { color: "#fff" },
  body: { flex: 1 },
  card: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#fffdf6",
    borderWidth: 1,
    borderColor: "#d8ccb0",
    gap: 12,
    shadowColor: "#5c5133",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6
  },
  signupIntro: {
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ece3cb",
    marginBottom: 2
  },
  sectionTitle: { fontSize: 22, fontWeight: "900", color: "#1d2d44", marginBottom: 4 },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#5b6472"
  },
  groupCard: {
    borderWidth: 1,
    borderColor: "#e0d6bc",
    backgroundColor: "#fffaf0",
    borderRadius: 14,
    padding: 12,
    gap: 8
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1f2937"
  },
  groupHint: {
    fontSize: 12,
    lineHeight: 17,
    color: "#6b7280"
  },
  field: { gap: 4 },
  label: { color: "#374151", fontSize: 12, fontWeight: "800" },
  input: {
    borderWidth: 1,
    borderColor: "#cbc7b5",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
    backgroundColor: "#fcfbf7",
    color: "#0f172a"
  },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  dropdownWrap: { marginBottom: 4 },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#cbc7b5",
    borderRadius: 10,
    backgroundColor: "#fcfbf7",
    paddingHorizontal: 11,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropdownTriggerDisabled: {
    opacity: 0.55
  },
  dropdownTriggerText: { color: "#0f172a", fontSize: 14, fontWeight: "700" },
  dropdownChevron: { color: "#475569", fontSize: 12, fontWeight: "700" },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#cbc7b5",
    borderRadius: 10,
    backgroundColor: "#fffdf8",
    overflow: "hidden"
  },
  dropdownStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 12
  },
  dropdownStatusText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600"
  },
  dropdownEmptyText: {
    color: "#64748b",
    fontSize: 13,
    paddingHorizontal: 11,
    paddingVertical: 12
  },
  dropdownItem: { paddingHorizontal: 11, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: "#edf3ff" },
  dropdownItemText: { color: "#0f172a", fontWeight: "600" },
  dropdownItemTextActive: { color: "#1e3a8a", fontWeight: "800" },
  uploadCard: {
    borderWidth: 1,
    borderColor: "#d8ccb0",
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 12,
    gap: 12
  },
  uploadPreview: {
    height: 148,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d7deea",
    backgroundColor: "#f7f9fc",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  uploadPreviewImage: {
    width: "100%",
    height: "100%"
  },
  uploadPreviewPlaceholder: {
    color: "#7c8797",
    fontSize: 15,
    fontWeight: "700"
  },
  uploadCopy: {
    gap: 6
  },
  uploadTitle: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "900"
  },
  uploadHint: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 17
  },
  uploadButton: {
    alignSelf: "flex-start",
    backgroundColor: "#e6eefc",
    borderWidth: 1,
    borderColor: "#a9bce6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  uploadButtonText: {
    color: "#1e3a8a",
    fontSize: 13,
    fontWeight: "800"
  },
  uploadFileName: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600"
  },
  locationButtonCompact: {
    marginTop: -2,
    marginBottom: 2
  },
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
  neutral: { color: "#64748b" },
  locationButton: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#9eb9a1",
    backgroundColor: "#eef7ee",
    padding: 11
  },
  locationButtonText: { color: "#166534", fontWeight: "700", fontSize: 12 },
  primary: {
    backgroundColor: "#224a93",
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#17356d",
    shadowColor: "#224a93",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.27,
    shadowRadius: 10,
    elevation: 5
  },
  primaryDisabled: {
    opacity: 0.7
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
  crpPreviewValue: { marginTop: 2, color: "#1e3a8a", fontWeight: "800" },
  apiResponseCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4
  },
  apiResponseCardSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#86efac"
  },
  apiResponseCardError: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5"
  },
  apiResponseTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1f2937"
  },
  apiResponseText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#334155"
  }
});




