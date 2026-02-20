import React from "react";
import { Pressable, Text, View } from "react-native";
import LabelInput from "../../components/LabelInput";
import Pill from "../../components/Pill";
import PrimaryButton from "../../components/PrimaryButton";
import styles from "../../styles/appStyles";

const TYPES = ["Farm", "Livestock", "Fishery", "Non-Farm"];

export default function LivelihoodTab({ livelihood, setLivelihood, onSave }) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.rowWrap}>
        {TYPES.map((item) => (
          <Pill
            key={item}
            label={item}
            active={livelihood.type === item}
            onPress={() => setLivelihood((prev) => ({ ...prev, type: item }))}
          />
        ))}
      </View>

      {livelihood.type === "Farm" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Farm Activity Screen</Text>
          <LabelInput
            label="Crop Type Dropdown"
            value={livelihood.fields.cropType}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, cropType: text }
              }))
            }
            placeholder="Paddy / Wheat"
          />
          <LabelInput
            label="Land Size"
            value={livelihood.fields.landSize}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, landSize: text }
              }))
            }
            placeholder="Acres"
            keyboardType="numeric"
          />
          <LabelInput
            label="Production Quantity"
            value={livelihood.fields.production}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, production: text }
              }))
            }
            placeholder="Kg"
            keyboardType="numeric"
          />
          <LabelInput
            label="Income Generated"
            value={livelihood.fields.income}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, income: text }
              }))
            }
            placeholder="INR"
            keyboardType="numeric"
          />
          <Pressable style={styles.outlineButton}>
            <Text style={styles.outlineText}>Upload Image</Text>
          </Pressable>
          <PrimaryButton label="Save" onPress={onSave} />
        </View>
      ) : null}

      {livelihood.type === "Livestock" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Livestock Activity Screen</Text>
          <LabelInput
            label="Animal Type"
            value={livelihood.fields.animalType}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, animalType: text }
              }))
            }
            placeholder="Goat / Cow"
          />
          <LabelInput
            label="Quantity"
            value={livelihood.fields.quantity}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, quantity: text }
              }))
            }
            placeholder="Count"
            keyboardType="numeric"
          />
          <LabelInput
            label="Health Status"
            value={livelihood.fields.health}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, health: text }
              }))
            }
            placeholder="Good / Moderate"
          />
          <LabelInput
            label="Milk/Meat Production"
            value={livelihood.fields.production}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, production: text }
              }))
            }
            placeholder="Liters / Kg"
            keyboardType="numeric"
          />
          <LabelInput
            label="Income"
            value={livelihood.fields.income}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, income: text }
              }))
            }
            placeholder="INR"
            keyboardType="numeric"
          />
          <PrimaryButton label="Save" onPress={onSave} />
        </View>
      ) : null}

      {livelihood.type === "Fishery" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fishery Activity Screen</Text>
          <LabelInput
            label="Pond Size"
            value={livelihood.fields.pondSize}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, pondSize: text }
              }))
            }
            placeholder="Sq ft"
            keyboardType="numeric"
          />
          <LabelInput
            label="Fish Type"
            value={livelihood.fields.fishType}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, fishType: text }
              }))
            }
            placeholder="Rohu / Catla"
          />
          <LabelInput
            label="Production"
            value={livelihood.fields.production}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, production: text }
              }))
            }
            placeholder="Kg"
            keyboardType="numeric"
          />
          <LabelInput
            label="Income"
            value={livelihood.fields.income}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, income: text }
              }))
            }
            placeholder="INR"
            keyboardType="numeric"
          />
          <PrimaryButton label="Save" onPress={onSave} />
        </View>
      ) : null}

      {livelihood.type === "Non-Farm" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Non-Farm Enterprise Screen</Text>
          <LabelInput
            label="Enterprise Type"
            value={livelihood.fields.enterpriseType}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, enterpriseType: text }
              }))
            }
            placeholder="Tailoring / Shop"
          />
          <LabelInput
            label="Investment"
            value={livelihood.fields.investment}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, investment: text }
              }))
            }
            placeholder="INR"
            keyboardType="numeric"
          />
          <LabelInput
            label="Revenue"
            value={livelihood.fields.revenue}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, revenue: text }
              }))
            }
            placeholder="INR"
            keyboardType="numeric"
          />
          <LabelInput
            label="Monthly Profit"
            value={livelihood.fields.profit}
            onChangeText={(text) =>
              setLivelihood((prev) => ({
                ...prev,
                fields: { ...prev.fields, profit: text }
              }))
            }
            placeholder="INR"
            keyboardType="numeric"
          />
          <PrimaryButton label="Save" onPress={onSave} />
        </View>
      ) : null}
    </View>
  );
}
