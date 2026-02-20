import React from "react";
import { Pressable, Text, View } from "react-native";
import LabelInput from "../../components/LabelInput";
import Pill from "../../components/Pill";
import PrimaryButton from "../../components/PrimaryButton";
import styles from "../../styles/appStyles";
import { calculateEmi } from "../../utils/appCalculations";

const LOAN_SCREENS = ["Add Loan", "Repayment", "Alerts"];

export default function LoanTab({ loan, setLoan, onSaveLoan, onRepay, onNotify }) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.rowWrap}>
        {LOAN_SCREENS.map((item) => (
          <Pill
            key={item}
            label={item}
            active={loan.screen === item}
            onPress={() => setLoan((prev) => ({ ...prev, screen: item }))}
          />
        ))}
      </View>

      {loan.screen === "Add Loan" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Loan Screen</Text>
          <LabelInput
            label="Loan Amount"
            value={loan.amount}
            onChangeText={(text) => setLoan((prev) => ({ ...prev, amount: text }))}
            placeholder="INR"
            keyboardType="numeric"
          />
          <LabelInput
            label="Interest Rate"
            value={loan.rate}
            onChangeText={(text) => setLoan((prev) => ({ ...prev, rate: text }))}
            placeholder="%"
            keyboardType="numeric"
          />
          <LabelInput
            label="Duration"
            value={loan.duration}
            onChangeText={(text) => setLoan((prev) => ({ ...prev, duration: text }))}
            placeholder="Months"
            keyboardType="numeric"
          />
          <LabelInput
            label="EMI Auto Calculation"
            value={calculateEmi(loan.amount, loan.rate, loan.duration).toFixed(2)}
            editable={false}
          />
          <LabelInput
            label="Start Date"
            value={loan.startDate}
            onChangeText={(text) => setLoan((prev) => ({ ...prev, startDate: text }))}
            placeholder="YYYY-MM-DD"
          />
          <PrimaryButton label="Save Loan" onPress={onSaveLoan} />
        </View>
      ) : null}

      {loan.screen === "Repayment" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Repayment Entry Screen</Text>
          <LabelInput
            label="EMI Amount"
            value={loan.emiPaid}
            onChangeText={(text) => setLoan((prev) => ({ ...prev, emiPaid: text }))}
            placeholder="INR"
            keyboardType="numeric"
          />
          <LabelInput
            label="Payment Date"
            value={loan.paymentDate}
            onChangeText={(text) =>
              setLoan((prev) => ({ ...prev, paymentDate: text }))
            }
            placeholder="YYYY-MM-DD"
          />
          <Pressable style={styles.outlineButton}>
            <Text style={styles.outlineText}>Upload Payment Slip</Text>
          </Pressable>
          <LabelInput
            label="Outstanding Balance (Auto)"
            value={`${Math.max(
              (Number(loan.outstanding) || 0) - (Number(loan.emiPaid) || 0),
              0
            ).toFixed(2)}`}
            editable={false}
          />
          <PrimaryButton label="Mark as Paid" onPress={onRepay} />
        </View>
      ) : null}

      {loan.screen === "Alerts" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loan Alert Screen</Text>
          <Text style={styles.badgeAlert}>Overdue Badge</Text>
          <Text style={styles.infoLine}>Days Delayed: {loan.daysDelayed}</Text>
          <PrimaryButton label="Notify Admin" onPress={onNotify} />
        </View>
      ) : null}
    </View>
  );
}
