import React from "react";
import { Pressable, Text, View } from "react-native";
import LabelInput from "../../components/LabelInput";
import MiniBarChart from "../../components/MiniBarChart";
import PrimaryButton from "../../components/PrimaryButton";
import styles from "../../styles/appStyles";

export default function DashboardHomeTab({
  user,
  dashboardMetrics,
  workingReport,
  setWorkingReport,
  onSubmitWorkingReport,
  onOpenWorkingReport,
  onOpenNewEnrolment,
  onOpenUpdateData,
  alerts,
  activities
}) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.enhancedCard}>
        <View style={styles.dashboardHeaderRow}>
          <View style={styles.crpAvatarCircle}>
            <Text style={styles.crpAvatarText}>TRLM</Text>
          </View>
          <View style={styles.crpInfoBox}>
            <Text style={styles.crpNameText}>{user.name || "Pratik User"}</Text>
            <Text style={styles.crpDetailText}>CRP ID: {user.identity || "Pratik-id"}</Text>
            <Text style={styles.crpDetailText}>Block: {user.block || "Block A"}</Text>
            <View style={styles.crpBadge}>
              <Text style={styles.crpBadgeText}>{user.idType || "CRP ID"}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.enhancedCard}>
        <Text style={styles.metricsTitle}>Dashboard Overview</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{dashboardMetrics.shgMembersAssigned}</Text>
            <Text style={styles.metricLabel}>SHG Members</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{dashboardMetrics.totalVisits30}</Text>
            <Text style={styles.metricLabel}>Total Visits</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>${dashboardMetrics.honorariumToBeClaimed}</Text>
            <Text style={styles.metricLabel}>Honorarium</Text>
          </View>
        </View>
        <MiniBarChart
          title="Visit Graph"
          values={dashboardMetrics.visitGraph}
          color="#2a9d8f"
        />
      </View>

      <View style={styles.enhancedCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <Pressable style={styles.actionCard} onPress={onOpenWorkingReport}>
            <Text style={styles.actionLabel}>Working Report</Text>
          </Pressable>
          <Pressable style={[styles.actionCard, styles.actionCardPrimary]} onPress={onOpenNewEnrolment}>
            <Text style={styles.actionLabel}>New Enrolment</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={onOpenUpdateData}>
            <Text style={styles.actionLabel}>Update Data</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.enhancedCard}>
        <Text style={styles.sectionTitle}>Working Report</Text>
        <View style={styles.reportStatsRow}>
          <View style={styles.reportStat}>
            <Text style={styles.reportStatValue}>{dashboardMetrics.totalVisits30}</Text>
            <Text style={styles.reportStatLabel}>Visits</Text>
          </View>
          <View style={styles.reportStat}>
            <Text style={styles.reportStatValue}>{dashboardMetrics.totalMembersVisited}</Text>
            <Text style={styles.reportStatLabel}>Members</Text>
          </View>
          <View style={styles.reportStat}>
            <Text style={styles.reportStatValue}>${dashboardMetrics.honorariumToBeClaimed}</Text>
            <Text style={styles.reportStatLabel}>Claim</Text>
          </View>
        </View>
        <LabelInput
          label="Amount Received"
          value={workingReport.amountReceived}
          onChangeText={(text) =>
            setWorkingReport((prev) => ({
              ...prev,
              amountReceived: text.replace(/\D/g, "")
            }))
          }
          placeholder="Enter amount"
          keyboardType="numeric"
        />
        <LabelInput
          label="Last Received Date"
          value={workingReport.lastReceivedDate}
          onChangeText={(text) =>
            setWorkingReport((prev) => ({ ...prev, lastReceivedDate: text }))
          }
          placeholder="2026-02-20"
        />
        <PrimaryButton 
          label={workingReport.submitted ? "Submitted" : "Submit Report"} 
          onPress={onSubmitWorkingReport} 
        />
      </View>

      <View style={styles.enhancedCard}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        {alerts.map((item) => (
          <View key={item.id} style={styles.alertItem}>
            <View style={[styles.alertDot, item.type === "Pending" ? styles.alertDotPending : styles.alertDotUpcoming]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertType}>{item.type}</Text>
              <Text style={styles.alertMessage}>{item.message}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.enhancedCard}>
        <Text style={styles.sectionTitle}>Activities</Text>
        {activities.map((item) => (
          <View key={item.id} style={styles.activityItem}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <View style={[styles.activityBadge, item.action === "Completed" ? styles.activityBadgeDone : styles.activityBadgeProgress]}>
                <Text style={[styles.activityBadgeText, item.action === "Completed" ? styles.activityBadgeTextDone : styles.activityBadgeTextProgress]}>
                  {item.action}
                </Text>
              </View>
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityDetail}>{item.membersVisited} members</Text>
              <Text style={styles.activityDetail}>{item.date}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
            </View>
          </View>
        ))}
        <MiniBarChart
          title="Progress"
          values={activities.map((item) => item.progress)}
          color="#3b82f6"
        />
      </View>
    </View>
  );
}
