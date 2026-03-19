import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";

// ✅ FIXED IMPORT
import * as masterApi from "../services/masterApi";

export default function LoginScreen() {
  const [mode, setMode] = useState("login");

  // LOGIN STATE
  const [loginForm, setLoginForm] = useState({
    identity: "",
    password: ""
  });

  // SIGNUP STATE
  const [signupForm, setSignupForm] = useState({
    name: "",
    districtId: "",
    blockId: "",
    gpId: "",
    villageId: ""
  });

  // DROPDOWN DATA
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [gps, setGps] = useState([]);
  const [villages, setVillages] = useState([]);
  const [crpTypes, setCrpTypes] = useState([]);

  // LOADING
  const [loading, setLoading] = useState(false);

  // ==============================
  // ✅ LOAD CRP TYPES
  // ==============================
  useEffect(() => {
    if (mode !== "signup") return;

    async function loadCrpTypes() {
      try {
        const res = await masterApi.fetchCrpTypes();
        setCrpTypes(res);
      } catch (err) {
        console.log("CRP Error:", err.message);
      }
    }

    loadCrpTypes();
  }, [mode]);

  // ==============================
  // ✅ LOAD DISTRICTS
  // ==============================
  useEffect(() => {
    if (mode !== "signup") return;

    async function loadDistricts() {
      try {
        const res = await masterApi.fetchDistricts();
        setDistricts(res);
      } catch (err) {
        console.log("District Error:", err.message);
      }
    }

    loadDistricts();
  }, [mode]);

  // ==============================
  // ✅ LOAD BLOCKS
  // ==============================
  useEffect(() => {
    if (!signupForm.districtId) return;

    async function loadBlocks() {
      try {
        const res = await masterApi.fetchBlocksByDistrict(
          signupForm.districtId
        );
        setBlocks(res);
      } catch (err) {
        console.log("Block Error:", err.message);
      }
    }

    loadBlocks();
  }, [signupForm.districtId]);

  // ==============================
  // ✅ LOAD GP
  // ==============================
  useEffect(() => {
    if (!signupForm.blockId) return;

    async function loadGp() {
      try {
        const res = await masterApi.fetchGpsByBlock(signupForm.blockId);
        setGps(res);
      } catch (err) {
        console.log("GP Error:", err.message);
      }
    }

    loadGp();
  }, [signupForm.blockId]);

  // ==============================
  // ✅ LOAD VILLAGES
  // ==============================
  useEffect(() => {
    if (!signupForm.gpId) return;

    async function loadVillage() {
      try {
        const res = await masterApi.fetchVillagesByGp(signupForm.gpId);
        setVillages(res);
      } catch (err) {
        console.log("Village Error:", err.message);
      }
    }

    loadVillage();
  }, [signupForm.gpId]);

  // ==============================
  // UI
  // ==============================
  return (
    <ScrollView style={styles.container}>
      <View style={styles.switchRow}>
        <Pressable onPress={() => setMode("login")}>
          <Text style={styles.tab}>Login</Text>
        </Pressable>
        <Pressable onPress={() => setMode("signup")}>
          <Text style={styles.tab}>Signup</Text>
        </Pressable>
      </View>

      {mode === "login" ? (
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>

          <TextInput
            placeholder="Enter ID"
            style={styles.input}
            value={loginForm.identity}
            onChangeText={(t) =>
              setLoginForm({ ...loginForm, identity: t })
            }
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={loginForm.password}
            onChangeText={(t) =>
              setLoginForm({ ...loginForm, password: t })
            }
          />

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>Signup</Text>

          {/* NAME */}
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={signupForm.name}
            onChangeText={(t) =>
              setSignupForm({ ...signupForm, name: t })
            }
          />

          {/* DISTRICT */}
          <Text style={styles.label}>District</Text>
          {districts.map((d) => (
            <Pressable
              key={d.id}
              onPress={() =>
                setSignupForm({ ...signupForm, districtId: d.id })
              }
            >
              <Text style={styles.option}>{d.name}</Text>
            </Pressable>
          ))}

          {/* BLOCK */}
          <Text style={styles.label}>Block</Text>
          {blocks.map((b) => (
            <Pressable
              key={b.id}
              onPress={() =>
                setSignupForm({ ...signupForm, blockId: b.id })
              }
            >
              <Text style={styles.option}>{b.name}</Text>
            </Pressable>
          ))}

          {/* GP */}
          <Text style={styles.label}>GP</Text>
          {gps.map((g) => (
            <Pressable
              key={g.id}
              onPress={() =>
                setSignupForm({ ...signupForm, gpId: g.id })
              }
            >
              <Text style={styles.option}>{g.name}</Text>
            </Pressable>
          ))}

          {/* VILLAGE */}
          <Text style={styles.label}>Village</Text>
          {villages.map((v) => (
            <Pressable
              key={v.id}
              onPress={() =>
                setSignupForm({ ...signupForm, villageId: v.id })
              }
            >
              <Text style={styles.option}>{v.name}</Text>
            </Pressable>
          ))}

          {/* CRP TYPES */}
          <Text style={styles.label}>CRP Type</Text>
          {crpTypes.length === 0 ? (
            <ActivityIndicator />
          ) : (
            crpTypes.map((c) => (
              <Text key={c.id} style={styles.option}>
                {c.name}
              </Text>
            ))
          )}

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>SIGNUP</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

// ==============================
// STYLES
// ==============================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20
  },

  tab: {
    fontSize: 18,
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },

  label: {
    fontWeight: "bold",
    marginTop: 10
  },

  option: {
    padding: 8,
    backgroundColor: "#eee",
    marginTop: 5
  },

  button: {
    backgroundColor: "blue",
    padding: 12,
    marginTop: 20,
    borderRadius: 5
  },

  buttonText: {
    color: "#fff",
    textAlign: "center"
  }
});