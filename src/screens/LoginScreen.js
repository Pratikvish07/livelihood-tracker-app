import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import styles from "../styles/appStyles";
import {
  detectRole,
  generateCrpId,
  isAadhaarValid,
  isContactValid,
  isEmailValid,
  isJpegFile,
  isLokosValid,
  isPasswordStrong
} from "../utils/appCalculations";

const DISTRICTS = ["Birbhum", "Bankura", "Purulia"];
const BLOCKS = ["Suri-I", "Suri-II", "Dubrajpur", "Manbazar"];
const GP_VC_OPTIONS = ["GP-A", "GP-B", "VC-A", "VC-B"];
const VILLAGE_OPTIONS = ["Village 1", "Village 2", "Village 3", "Village 4"];
const CRP_TYPES = ["Pashu Sakhi", "Krishi Sakhi", "CRP-EP", "Udyog Sakhi"];
const ID_TYPES = ["Master ID", "CRP ID", "High Level CRP"];

function Pill({ label, active, onPress }) {
  return (
    <Pressable
      style={[styles.loginIdPill, active && styles.loginIdPillActive]}
      onPress={onPress}
    >
      <Text style={[styles.loginIdPillText, active && styles.loginIdPillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleGroup({ options, values, onToggle }) {
  return (
    <View style={styles.rowWrap}>
      {options.map((item) => (
        <Pill
          key={item}
          label={item}
          active={values.includes(item)}
          onPress={() => onToggle(item)}
        />
      ))}
    </View>
  );
}

function RequiredLabel({ children }) {
  return (
    <Text style={styles.label}>
      {children} <Text style={styles.required}>*</Text>
    </Text>
  );
}

function FormInput({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, editable = true }) {
  return (
    <View style={styles.inputWrap}>
      {label && label.length > 0 && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );
}

function PrimaryButton({ label, onPress, style }) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
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
  const role = detectRole(loginForm.identity);

  const generatedCrpId = useMemo(
    () => generateCrpId(signupForm),
    [signupForm.block, signupForm.district, signupForm.name]
  );

  const signupAadhaarValid = isAadhaarValid(signupForm.uid);
  const signupLokosValid = isLokosValid(signupForm.lokosId);
  const signupPasswordValid = isPasswordStrong(signupForm.password);
  const contactValid = isContactValid(signupForm.contactNo);
  const emailValid = isEmailValid(signupForm.email);
  const pictureValid = isJpegFile(signupForm.pictureFile);
  const passwordMatch =
    signupForm.password.length > 0 &&
    signupForm.password === signupForm.confirmPassword;

  return (
    <View style={styles.loginContainer}>
      {/* Header Section */}
      <View style={styles.loginHeader}>
        <View style={styles.loginLogoWrapper}>
          <View style={styles.loginLogoCircle}>
            <Text style={styles.loginLogoText}>TRLM</Text>
          </View>
        </View>
        <Text style={styles.loginAppName}>SRS Livelihood</Text>
        <Text style={styles.loginTagline}>Digital Livelihood Monitoring</Text>
      </View>

      {/* Form Section */}
      <KeyboardAvoidingView 
        style={styles.loginFormArea} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Tab Toggle */}
        <View style={styles.loginTabContainer}>
          <Pressable
            style={[styles.loginTab, mode === "login" && styles.loginTabActive]}
            onPress={() => setMode("login")}
          >
            <Text style={[styles.loginTabText, mode === "login" && styles.loginTabTextActive]}>
              Log In
            </Text>
          </Pressable>
          <Pressable
            style={[styles.loginTab, mode === "signup" && styles.loginTabActive]}
            onPress={() => setMode("signup")}
          >
            <Text style={[styles.loginTabText, mode === "signup" && styles.loginTabTextActive]}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        {mode === "login" ? (
          <View style={styles.loginCard}>
            <Text style={styles.loginCardTitle}>Welcome Back</Text>
            
            <Text style={styles.signupSectionTitle}>ID Type</Text>
            <View style={styles.loginIdTypeRow}>
              {ID_TYPES.map((item) => (
                <Pill
                  key={item}
                  label={item}
                  active={loginForm.idType === item}
                  onPress={() => setLoginForm((prev) => ({ ...prev, idType: item }))}
                />
              ))}
            </View>

            <FormInput
              label="CRP ID / Master ID"
              value={loginForm.identity}
              onChangeText={(text) =>
                setLoginForm((prev) => ({ ...prev, identity: text.trim() }))
              }
              placeholder="CRP001 / MASTER001"
            />
            <FormInput
              label="Password"
              value={loginForm.password}
              onChangeText={(text) =>
                setLoginForm((prev) => ({ ...prev, password: text }))
              }
              placeholder="Enter password"
              secureTextEntry
            />
            <FormInput label="Role" value={role} editable={false} />

            <Pressable style={styles.loginButton} onPress={onLogin}>
              <Text style={styles.loginButtonText}>Log In</Text>
            </Pressable>

            <View style={styles.loginSwitchMode}>
              <Text style={styles.loginSwitchModeText}>Don't have an account?</Text>
              <Pressable onPress={() => setMode("signup")}>
                <Text style={styles.loginSwitchModeBtn}>Sign Up</Text>
              </Pressable>
            </View>

            <View style={styles.signupNoteBox}>
              <Text style={styles.signupNoteTitle}>Note</Text>
              <Text style={styles.signupNoteText}>
                After Sign-up, CRP ID needs approval from Master Block Admin.
              </Text>
            </View>
          </View>
        ) : (
          /* Signup Form - with ScrollView */
          <ScrollView style={styles.signupScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.loginCard}>
              <Text style={styles.loginCardTitle}>Create Account</Text>

              <RequiredLabel>Name</RequiredLabel>
              <FormInput
                label=""
                value={signupForm.name}
                onChangeText={(text) => setSignupForm((prev) => ({ ...prev, name: text }))}
                placeholder="Enter CRP name"
              />

              <View style={styles.signupRow}>
                <View style={styles.signupHalfInput}>
                  <RequiredLabel>UID (Aadhaar)</RequiredLabel>
                  <FormInput
                    label=""
                    value={signupForm.uid}
                    onChangeText={(text) =>
                      setSignupForm((prev) => ({
                        ...prev,
                        uid: text.replace(/\D/g, "").slice(0, 12)
                      }))
                    }
                    placeholder="12 digit"
                    keyboardType="numeric"
                  />
                  <Text style={[styles.signupValidText, signupAadhaarValid ? styles.validText : styles.invalidText]}>
                    {signupAadhaarValid ? "✓ Valid" : "12 digits"}
                  </Text>
                </View>
                <View style={styles.signupHalfInput}>
                  <RequiredLabel>LokOS ID</RequiredLabel>
                  <FormInput
                    label=""
                    value={signupForm.lokosId}
                    onChangeText={(text) =>
                      setSignupForm((prev) => ({
                        ...prev,
                        lokosId: text.replace(/\D/g, "").slice(0, 12)
                      }))
                    }
                    placeholder="12 digit"
                    keyboardType="numeric"
                  />
                  <Text style={[styles.signupValidText, signupLokosValid ? styles.validText : styles.invalidText]}>
                    {signupLokosValid ? "✓ Valid" : "12 digits"}
                  </Text>
                </View>
              </View>

              <RequiredLabel>District</RequiredLabel>
              <View style={styles.rowWrap}>
                {DISTRICTS.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={signupForm.district === item}
                    onPress={() => setSignupForm((prev) => ({ ...prev, district: item }))}
                  />
                ))}
              </View>

              <RequiredLabel>Block</RequiredLabel>
              <View style={styles.rowWrap}>
                {BLOCKS.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={signupForm.block === item}
                    onPress={() => setSignupForm((prev) => ({ ...prev, block: item }))}
                  />
                ))}
              </View>

              <RequiredLabel>GP/VC (Multi)</RequiredLabel>
              <ToggleGroup
                options={GP_VC_OPTIONS}
                values={signupForm.gpVc}
                onToggle={(item) =>
                  setSignupForm((prev) => ({
                    ...prev,
                    gpVc: prev.gpVc.includes(item)
                      ? prev.gpVc.filter((x) => x !== item)
                      : [...prev.gpVc, item]
                  }))
                }
              />

              <RequiredLabel>Village (Multi)</RequiredLabel>
              <ToggleGroup
                options={VILLAGE_OPTIONS}
                values={signupForm.villages}
                onToggle={(item) =>
                  setSignupForm((prev) => ({
                    ...prev,
                    villages: prev.villages.includes(item)
                      ? prev.villages.filter((x) => x !== item)
                      : [...prev.villages, item]
                  }))
                }
              />

              <FormInput label="CRP ID (Auto)" value={generatedCrpId} editable={false} />

              <View style={styles.signupRow}>
                <View style={styles.signupHalfInput}>
                  <RequiredLabel>Password</RequiredLabel>
                  <FormInput
                    label=""
                    value={signupForm.password}
                    onChangeText={(text) => setSignupForm((prev) => ({ ...prev, password: text }))}
                    placeholder="Create password"
                    secureTextEntry
                  />
                  <Text style={[styles.signupValidText, signupPasswordValid ? styles.validText : styles.invalidText]}>
                    {signupPasswordValid ? "✓ Strong" : "Use Aa@1"}
                  </Text>
                </View>
                <View style={styles.signupHalfInput}>
                  <RequiredLabel>Confirm</RequiredLabel>
                  <FormInput
                    label=""
                    value={signupForm.confirmPassword}
                    onChangeText={(text) =>
                      setSignupForm((prev) => ({ ...prev, confirmPassword: text }))
                    }
                    placeholder="Re-enter"
                    secureTextEntry
                  />
                  <Text style={[styles.signupValidText, passwordMatch ? styles.validText : styles.invalidText]}>
                    {passwordMatch ? "✓ Matched" : "Not matched"}
                  </Text>
                </View>
              </View>

              <View style={styles.signupRow}>
                <View style={styles.signupHalfInput}>
                  <RequiredLabel>Contact</RequiredLabel>
                  <FormInput
                    label=""
                    value={signupForm.contactNo}
                    onChangeText={(text) =>
                      setSignupForm((prev) => ({
                        ...prev,
                        contactNo: text.replace(/\D/g, "").slice(0, 10)
                      }))
                    }
                    placeholder="10 digit"
                    keyboardType="numeric"
                  />
                  <Text style={[styles.signupValidText, contactValid ? styles.validText : styles.invalidText]}>
                    {contactValid ? "✓ Valid" : "10 digits"}
                  </Text>
                </View>
                <View style={styles.signupHalfInput}>
                  <RequiredLabel>Email</RequiredLabel>
                  <FormInput
                    label=""
                    value={signupForm.email}
                    onChangeText={(text) => setSignupForm((prev) => ({ ...prev, email: text }))}
                    placeholder="email@example"
                  />
                  <Text style={[styles.signupValidText, emailValid ? styles.validText : styles.invalidText]}>
                    {emailValid ? "✓ Valid" : "Valid email"}
                  </Text>
                </View>
              </View>

              <RequiredLabel>CRP Type (Multi)</RequiredLabel>
              <ToggleGroup
                options={CRP_TYPES}
                values={signupForm.crpTypes}
                onToggle={(item) =>
                  setSignupForm((prev) => ({
                    ...prev,
                    crpTypes: prev.crpTypes.includes(item)
                      ? prev.crpTypes.filter((x) => x !== item)
                      : [...prev.crpTypes, item]
                  }))
                }
              />

              <FormInput
                label="Upload Picture"
                value={signupForm.pictureFile}
                onChangeText={(text) =>
                  setSignupForm((prev) => ({ ...prev, pictureFile: text.trim() }))
                }
                placeholder="photo.jpg"
              />

              <Pressable style={styles.loginButton} onPress={() => onSignup(generatedCrpId)}>
                <Text style={styles.loginButtonText}>Create Account</Text>
              </Pressable>

              <View style={styles.loginSwitchMode}>
                <Text style={styles.loginSwitchModeText}>Already have an account?</Text>
                <Pressable onPress={() => setMode("login")}>
                  <Text style={styles.loginSwitchModeBtn}>Log In</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.loginFooter}>
        <Text style={styles.loginFooterText}>v1.0.0 • SRS Livelihood App</Text>
      </View>
    </View>
  );
}
