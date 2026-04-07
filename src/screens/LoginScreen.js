import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useI18n } from "../i18n/I18nProvider";
import {
  fetchBlocksByDistrict,
  fetchCrpTypes,
  fetchDistricts,
  fetchGpsByBlock,
  fetchVillagesByGp
} from "../services/masterApi";
import styles from "../styles/loginScreenStyles";
import {
  generateCrpId,
  isAadhaarValid,
  isContactValid,
  isEmailValid,
  isLokosValid,
  isPasswordStrong
} from "../utils/appCalculations";
import { getCurrentLocation } from "../utils/geofence";

const EMPTY_ARRAY = [];
const ID_TYPE_OPTIONS = ["CRP ID", "Master ID"];
const TRLM_BRAND_IMAGE = require("../../assets/branding/livelihood-tracker-icon.png");

function Field({ label, required = false, helper, children }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {children}
      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
}

function OptionSelector({
  selectorKey,
  options,
  selectedId,
  onSelect,
  emptyText,
  disabled = false,
  placeholder,
  openDropdown,
  setOpenDropdown
}) {
  const selectedItem = options.find(
    (item) => String(item.id) === String(selectedId)
  );
  const isOpen = openDropdown === selectorKey;

  if (disabled) {
    return (
      <View style={styles.dropdownDisabled}>
        <Text style={styles.dropdownDisabledText}>{emptyText}</Text>
      </View>
    );
  }

  if (!options.length) {
    return (
      <View style={styles.dropdownDisabled}>
        <Text style={styles.dropdownDisabledText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.dropdownWrap}>
      <Pressable
        style={[styles.dropdownTrigger, isOpen && styles.dropdownTriggerOpen]}
        onPress={() => setOpenDropdown(isOpen ? "" : selectorKey)}
      >
        <Text
          style={[
            styles.dropdownTriggerText,
            !selectedItem && styles.dropdownPlaceholder
          ]}
        >
          {selectedItem?.name || placeholder}
        </Text>
        <Text style={styles.dropdownChevron}>{isOpen ? "▲" : "▼"}</Text>
      </Pressable>

      {isOpen ? (
        <View style={styles.dropdownMenu}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={styles.dropdownScroll}
          >
            {options.map((item) => {
              const isActive = String(item.id) === String(selectedId);
              return (
                <Pressable
                  key={`${item.id}-${item.name}`}
                  style={[styles.dropdownOption, isActive && styles.dropdownOptionActive]}
                  onPress={() => {
                    onSelect(item);
                    setOpenDropdown("");
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isActive && styles.dropdownOptionTextActive
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export default function LoginScreen({
  loginForm,
  setLoginForm,
  onLogin,
  signupForm,
  setSignupForm,
  onSignup,
  signupStatus,
  signupError,
  loginSubmitting = false,
  signupApiModal,
  onCloseSignupApiModal
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState("login");
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [gps, setGps] = useState([]);
  const [villages, setVillages] = useState([]);
  const [crpTypes, setCrpTypes] = useState([]);
  const [mastersLoading, setMastersLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const [locationState, setLocationState] = useState({
    loading: false,
    coords: null
  });
  const floatAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  const signupSubmitting = signupStatus === "loading";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 2600,
            useNativeDriver: true
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2600,
            useNativeDriver: true
          })
        ])
      )
    ]).start();
  }, [cardAnim, floatAnim]);

  useEffect(() => {
    if (mode !== "signup") {
      return;
    }

    let active = true;

    async function loadSignupMasters() {
      try {
        setMastersLoading(true);
        const [districtData, typeData] = await Promise.all([
          fetchDistricts(),
          fetchCrpTypes()
        ]);

        if (!active) {
          return;
        }

        setDistricts(districtData);
        setCrpTypes(typeData);
      } catch (error) {
        if (active) {
          Alert.alert(
            t("Signup data"),
            error.message || t("Unable to load signup master data.")
          );
        }
      } finally {
        if (active) {
          setMastersLoading(false);
        }
      }
    }

    loadSignupMasters();

    return () => {
      active = false;
    };
  }, [mode, t]);

  useEffect(() => {
    if (!signupForm.districtId) {
      setBlocks([]);
      return;
    }

    let active = true;

    async function loadBlocks() {
      try {
        const payload = await fetchBlocksByDistrict(signupForm.districtId);
        if (active) {
          setBlocks(payload);
        }
      } catch (error) {
        if (active) {
          Alert.alert(t("Signup data"), error.message || t("Unable to load blocks."));
        }
      }
    }

    loadBlocks();

    return () => {
      active = false;
    };
  }, [signupForm.districtId, t]);

  useEffect(() => {
    if (!signupForm.blockId) {
      setGps([]);
      return;
    }

    let active = true;

    async function loadGps() {
      try {
        const payload = await fetchGpsByBlock(signupForm.blockId);
        if (active) {
          setGps(payload);
        }
      } catch (error) {
        if (active) {
          Alert.alert(
            t("Signup data"),
            error.message || t("Unable to load Gram Panchayat / VC list.")
          );
        }
      }
    }

    loadGps();

    return () => {
      active = false;
    };
  }, [signupForm.blockId, t]);

  useEffect(() => {
    if (!signupForm.gpId) {
      setVillages([]);
      return;
    }

    let active = true;

    async function loadVillages() {
      try {
        const payload = await fetchVillagesByGp(signupForm.gpId);
        if (active) {
          setVillages(payload);
        }
      } catch (error) {
        if (active) {
          Alert.alert(
            t("Signup data"),
            error.message || t("Unable to load villages.")
          );
        }
      }
    }

    loadVillages();

    return () => {
      active = false;
    };
  }, [signupForm.gpId, t]);

  const generatedCrpId = useMemo(
    () =>
      generateCrpId({
        district: signupForm.district,
        block: signupForm.block,
        name: signupForm.name
      }),
    [signupForm.block, signupForm.district, signupForm.name]
  );

  const updateSignup = (patch) => {
    setSignupForm((prev) => ({
      ...prev,
      ...patch
    }));
  };

  const selectDistrict = (item) => {
    updateSignup({
      district: item.name,
      districtId: item.id,
      block: "",
      blockId: "",
      gpId: "",
      villageId: "",
      gpVc: EMPTY_ARRAY,
      villages: EMPTY_ARRAY
    });
    setOpenDropdown("");
    setBlocks([]);
    setGps([]);
    setVillages([]);
  };

  const selectBlock = (item) => {
    updateSignup({
      block: item.name,
      blockId: item.id,
      gpId: "",
      villageId: "",
      gpVc: EMPTY_ARRAY,
      villages: EMPTY_ARRAY
    });
    setOpenDropdown("");
    setGps([]);
    setVillages([]);
  };

  const selectGp = (item) => {
    updateSignup({
      gpId: item.id,
      gpVc: [item.name],
      villageId: "",
      villages: EMPTY_ARRAY
    });
    setOpenDropdown("");
    setVillages([]);
  };

  const selectVillage = (item) => {
    updateSignup({
      villageId: item.id,
      villages: [item.name]
    });
    setOpenDropdown("");
  };

  const selectCrpType = (item) => {
    updateSignup({
      crpTypes: String(item.id)
    });
    setOpenDropdown("");
  };

  const pickProfilePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          t("Permission needed"),
          t("Photo library permission is required to select a profile photo.")
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8
      });

      if (!result.canceled && result.assets?.length) {
        updateSignup({
          pictureFile: result.assets[0].uri
        });
      }
    } catch (error) {
      Alert.alert(
        t("Photo selection"),
        error.message || t("Unable to select profile photo.")
      );
    }
  };

  const captureLocation = async () => {
    try {
      setLocationState((prev) => ({ ...prev, loading: true }));
      const coords = await getCurrentLocation();
      if (!coords) {
        Alert.alert(
          t("Location"),
          t("Unable to capture current location. You can still continue and submit 0,0 coordinates.")
        );
      }
      setLocationState({
        loading: false,
        coords
      });
    } catch (error) {
      setLocationState({
        loading: false,
        coords: null
      });
      Alert.alert(
        t("Location"),
        error.message || t("Unable to capture current location.")
      );
    }
  };

  const handleSignup = async () => {
    await onSignup(generatedCrpId, locationState.coords);
  };

  return (
    <View style={styles.loginContainer}>
      <Modal
        visible={Boolean(signupApiModal?.visible)}
        transparent
        animationType="fade"
        onRequestClose={onCloseSignupApiModal}
      >
        <View style={styles.responseModalOverlay}>
          <View style={styles.responseModalCard}>
            <Text style={styles.responseModalTitle}>
              {signupApiModal?.title || "Signup API Response"}
            </Text>
            <ScrollView style={styles.responseModalScroll}>
              <Text style={styles.responseModalMessage}>
                {signupApiModal?.message || ""}
              </Text>
            </ScrollView>
            <Pressable style={styles.loginButton} onPress={onCloseSignupApiModal}>
              <Text style={styles.loginButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Animated.View
        style={[
          styles.authGlowPrimary,
          { pointerEvents: "none" },
          {
            transform: [
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -14]
                })
              }
            ]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.authGlowSecondary,
          { pointerEvents: "none" },
          {
            transform: [
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 18]
                })
              }
            ]
          }
        ]}
      />
      <ScrollView
        style={styles.signupScrollView}
        contentContainerStyle={styles.loginFormArea}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.loginHeader,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.loginLogoWrapper}>
            <View style={styles.loginGlassChip}>
              <Text style={styles.loginGlassChipText}>Secure Field Access</Text>
            </View>
            <View style={styles.loginLogoCircle}>
              <Image source={TRLM_BRAND_IMAGE} style={styles.loginLogoImage} />
            </View>
            <Text style={styles.loginAppName}>Livelihood Tracker</Text>
            <Text style={styles.loginTagline}>
              {t("Digital Livelihood Monitoring System")}
            </Text>
            <View style={styles.loginHeroMetricRow}>
              <View style={styles.loginHeroMetric}>
                <Text style={styles.loginHeroMetricValue}>24x7</Text>
                <Text style={styles.loginHeroMetricLabel}>Access</Text>
              </View>
              <View style={styles.loginHeroMetric}>
                <Text style={styles.loginHeroMetricValue}>Geo</Text>
                <Text style={styles.loginHeroMetricLabel}>Verified</Text>
              </View>
              <View style={styles.loginHeroMetric}>
                <Text style={styles.loginHeroMetricValue}>Gov</Text>
                <Text style={styles.loginHeroMetricLabel}>Aligned</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.loginTabContainer,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [32, 0]
                  })
                }
              ]
            }
          ]}
        >
          {["login", "signup"].map((item) => {
            const active = mode === item;
            return (
              <Pressable
                key={item}
                style={[styles.loginTab, active && styles.loginTabActive]}
                onPress={() => setMode(item)}
              >
                <Text
                  style={[styles.loginTabText, active && styles.loginTabTextActive]}
                >
                  {item === "login" ? t("Log-In") : t("Sign-up")}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>

        {mode === "login" ? (
          <Animated.View
            style={[
              styles.loginCard,
              styles.loginCardGlass,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.loginCardTitle}>{t("Log-In")}</Text>

            <Field label={t("Identity Type")} required>
              <View style={styles.loginIdTypeRow}>
                {ID_TYPE_OPTIONS.map((item) => {
                  const active = (loginForm.idType || "CRP ID") === item;
                  return (
                    <Pressable
                      key={item}
                      style={[styles.loginIdPill, active && styles.loginIdPillActive]}
                      onPress={() =>
                        setLoginForm((prev) => ({
                          ...prev,
                          idType: item
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.loginIdPillText,
                          active && styles.loginIdPillTextActive
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label={t("CRP ID / Master ID")} required>
              <TextInput
                style={styles.loginInput}
                placeholder={t("Enter ID")}
                value={loginForm.identity}
                autoCapitalize="characters"
                onChangeText={(value) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    identity: value
                  }))
                }
              />
            </Field>

            <Field label={t("Password")} required>
              <TextInput
                style={styles.loginInput}
                placeholder={t("Password")}
                value={loginForm.password}
                secureTextEntry
                onChangeText={(value) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: value
                  }))
                }
              />
            </Field>

            <Pressable
              style={styles.loginButton}
              onPress={onLogin}
              disabled={loginSubmitting}
            >
              {loginSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>{t("Log-In")}</Text>
              )}
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.loginCard,
              styles.loginCardGlass,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.loginCardTitle}>{t("Sign-up")}</Text>

            <View style={styles.formSectionCard}>
            <Text style={styles.signupSectionTitle}>{t("Personal Details")}</Text>

            <Field label={t("Full Name")} required>
              <TextInput
                style={styles.loginInput}
                placeholder={t("Enter full name")}
                value={signupForm.name}
                onChangeText={(value) => updateSignup({ name: value })}
              />
            </Field>

            <View style={styles.signupRow}>
              <View style={styles.signupHalfInput}>
                <Field label={t("Aadhaar No")} required>
                  <TextInput
                    style={styles.loginInput}
                    placeholder="12 digits"
                    keyboardType="numeric"
                    maxLength={12}
                    value={signupForm.uid}
                    onChangeText={(value) =>
                      updateSignup({ uid: value.replace(/[^0-9]/g, "") })
                    }
                  />
                  {signupForm.uid ? (
                    <View style={styles.signupValidIndicator}>
                      <Text
                        style={[
                          styles.signupValidText,
                          isAadhaarValid(signupForm.uid)
                            ? styles.validText
                            : styles.invalidText
                        ]}
                      >
                        {isAadhaarValid(signupForm.uid)
                          ? t("Valid Aadhaar")
                          : t("Aadhaar must be 12 digits")}
                      </Text>
                    </View>
                  ) : null}
                </Field>
              </View>

              <View style={styles.signupHalfInput}>
                <Field label={t("LokOS ID")} required>
                  <TextInput
                    style={styles.loginInput}
                    placeholder="12 digits"
                    keyboardType="numeric"
                    maxLength={12}
                    value={signupForm.lokosId}
                    onChangeText={(value) =>
                      updateSignup({ lokosId: value.replace(/[^0-9]/g, "") })
                    }
                  />
                  {signupForm.lokosId ? (
                    <View style={styles.signupValidIndicator}>
                      <Text
                        style={[
                          styles.signupValidText,
                          isLokosValid(signupForm.lokosId)
                            ? styles.validText
                            : styles.invalidText
                        ]}
                      >
                        {isLokosValid(signupForm.lokosId)
                          ? t("Valid LokOS ID")
                          : t("LokOS ID must be 12 digits")}
                      </Text>
                    </View>
                  ) : null}
                </Field>
              </View>
            </View>
            </View>

            <View style={styles.formSectionCard}>
            <Text style={styles.signupSectionTitle}>{t("Location Mapping")}</Text>

            {mastersLoading ? <ActivityIndicator color="#1e3a8a" /> : null}

            <Field label={t("District")} required>
              <OptionSelector
                selectorKey="district"
                options={districts}
                selectedId={signupForm.districtId}
                onSelect={selectDistrict}
                emptyText={t("No districts available")}
                placeholder={t("Select district")}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
            </Field>

            <Field label={t("Block")} required>
              <OptionSelector
                selectorKey="block"
                options={blocks}
                selectedId={signupForm.blockId}
                onSelect={selectBlock}
                emptyText={t("Select district first")}
                disabled={!signupForm.districtId}
                placeholder={t("Select block")}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
            </Field>

            <Field label={t("GP / VC")} required>
              <OptionSelector
                selectorKey="gp"
                options={gps}
                selectedId={signupForm.gpId}
                onSelect={selectGp}
                emptyText={t("Select block first")}
                disabled={!signupForm.blockId}
                placeholder={t("Select GP / VC")}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
            </Field>

            <Field label={t("Village")} required>
              <OptionSelector
                selectorKey="village"
                options={villages}
                selectedId={signupForm.villageId}
                onSelect={selectVillage}
                emptyText={t("Select GP / VC first")}
                disabled={!signupForm.gpId}
                placeholder={t("Select village")}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
            </Field>
            </View>

            <View style={styles.formSectionCard}>
            <Text style={styles.signupSectionTitle}>{t("Contact & Access")}</Text>

            <View style={styles.signupRow}>
              <View style={styles.signupHalfInput}>
                <Field label={t("Contact No")} required>
                  <TextInput
                    style={styles.loginInput}
                    placeholder="10 digits"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={signupForm.contactNo}
                    onChangeText={(value) =>
                      updateSignup({ contactNo: value.replace(/[^0-9]/g, "") })
                    }
                  />
                  {signupForm.contactNo ? (
                    <View style={styles.signupValidIndicator}>
                      <Text
                        style={[
                          styles.signupValidText,
                          isContactValid(signupForm.contactNo)
                            ? styles.validText
                            : styles.invalidText
                        ]}
                      >
                        {isContactValid(signupForm.contactNo)
                          ? t("Valid contact number")
                          : t("Contact number must be 10 digits")}
                      </Text>
                    </View>
                  ) : null}
                </Field>
              </View>

              <View style={styles.signupHalfInput}>
                <Field label={t("Email ID")} required>
                  <TextInput
                    style={styles.loginInput}
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={signupForm.email}
                    onChangeText={(value) => updateSignup({ email: value.trim() })}
                  />
                  {signupForm.email ? (
                    <View style={styles.signupValidIndicator}>
                      <Text
                        style={[
                          styles.signupValidText,
                          isEmailValid(signupForm.email)
                            ? styles.validText
                            : styles.invalidText
                        ]}
                      >
                        {isEmailValid(signupForm.email)
                          ? t("Valid email")
                          : t("Enter a valid email")}
                      </Text>
                    </View>
                  ) : null}
                </Field>
              </View>
            </View>

            <Field label={t("CRP Type")} required>
              <OptionSelector
                selectorKey="crpType"
                options={crpTypes}
                selectedId={signupForm.crpTypes}
                onSelect={selectCrpType}
                emptyText={t("No CRP types available")}
                placeholder={t("Select CRP type")}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
            </Field>

            <View style={styles.signupRow}>
              <View style={styles.signupHalfInput}>
                <Field label={t("Password")} required>
                  <TextInput
                    style={styles.loginInput}
                    placeholder={t("Set password")}
                    secureTextEntry
                    value={signupForm.password}
                    onChangeText={(value) => updateSignup({ password: value })}
                  />
                  {signupForm.password ? (
                    <View style={styles.signupValidIndicator}>
                      <Text
                        style={[
                          styles.signupValidText,
                          isPasswordStrong(signupForm.password)
                            ? styles.validText
                            : styles.invalidText
                        ]}
                      >
                        {isPasswordStrong(signupForm.password)
                          ? t("Strong password")
                          : t("Use upper, lower, number, and special character")}
                      </Text>
                    </View>
                  ) : null}
                </Field>
              </View>

              <View style={styles.signupHalfInput}>
                <Field label={t("Confirm Password")} required>
                  <TextInput
                    style={styles.loginInput}
                    placeholder={t("Re-enter password")}
                    secureTextEntry
                    value={signupForm.confirmPassword}
                    onChangeText={(value) => updateSignup({ confirmPassword: value })}
                  />
                  {signupForm.confirmPassword ? (
                    <View style={styles.signupValidIndicator}>
                      <Text
                        style={[
                          styles.signupValidText,
                          signupForm.confirmPassword === signupForm.password
                            ? styles.validText
                            : styles.invalidText
                        ]}
                      >
                        {signupForm.confirmPassword === signupForm.password
                          ? t("Passwords match")
                          : t("Passwords do not match")}
                      </Text>
                    </View>
                  ) : null}
                </Field>
              </View>
            </View>
            </View>

            <View style={styles.formSectionCard}>
            <Text style={styles.signupSectionTitle}>{t("Evidence & GPS")}</Text>

            <Field
              label={t("Profile Photo")}
              required
              helper={
                signupForm.pictureFile
                  ? signupForm.pictureFile
                  : t("Upload a photo for picturePath")
              }
            >
              <Pressable style={styles.secondaryBtn} onPress={pickProfilePhoto}>
                <Text style={styles.secondaryBtnText}>
                  {signupForm.pictureFile ? t("Change Photo") : t("Select Photo")}
                </Text>
              </Pressable>
            </Field>

            <Field
              label={t("Current Coordinates")}
              helper={
                locationState.coords
                  ? `${locationState.coords.latitude.toFixed(6)}, ${locationState.coords.longitude.toFixed(6)}`
                  : t("Latitude and longitude will default to 0 if not captured.")
              }
            >
              <Pressable style={styles.secondaryBtn} onPress={captureLocation}>
                {locationState.loading ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text style={styles.secondaryBtnText}>{t("Capture Location")}</Text>
                )}
              </Pressable>
            </Field>
            </View>

            {signupError ? (
              <View style={styles.processNoteBox}>
                <Text style={styles.processNoteText}>{signupError}</Text>
              </View>
            ) : null}

            <Pressable
              style={styles.loginButton}
              onPress={handleSignup}
              disabled={signupSubmitting}
            >
              {signupSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>{t("Sign-up")}</Text>
              )}
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
