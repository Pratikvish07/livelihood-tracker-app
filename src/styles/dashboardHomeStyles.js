import { StyleSheet } from "react-native";

export const pageStyles = StyleSheet.create({
  screen: { paddingVertical: 8, paddingHorizontal: 2, position: "relative" },
  bgGlowTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(59,130,246,0.14)",
    top: -70,
    right: -50
  },
  bgGlowBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(20,184,166,0.12)",
    bottom: -80,
    left: -60
  },
  frame: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "rgba(255,255,255,0.88)",
    padding: 14,
    gap: 12,
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5
  },
  topRow: { flexDirection: "row", gap: 10 },
  imageCard: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#dbe3ea",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2
  },
  imageText: { color: "#334155", fontSize: 10, fontWeight: "800", textAlign: "center" },
  infoCard: {
    flex: 1,
    backgroundColor: "#102a43",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    gap: 4
  },
  infoLine: { color: "#f8fafc", fontSize: 12, fontWeight: "700" },
  dropdownWrap: { position: "relative", zIndex: 10 },
  dropdownTrigger: {
    borderRadius: 9,
    backgroundColor: "#3b65c2",
    borderWidth: 1,
    borderColor: "#2f56a2",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropdownText: { color: "#ffffff", fontSize: 12, fontWeight: "800", letterSpacing: 0.2 },
  dropdownArrow: { color: "#fbbf24", fontWeight: "900" },
  dropdownMenu: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#3259a3",
    borderRadius: 6,
    overflow: "hidden"
  },
  dropdownItem: { paddingVertical: 9, paddingHorizontal: 10, backgroundColor: "#e6eefc" },
  dropdownItemActive: { backgroundColor: "#bfd2f7" },
  dropdownItemText: { color: "#1f2937", fontSize: 12, fontWeight: "700" },
  dropdownItemTextActive: { color: "#1e3a8a" },
  dashboardCard: {
    backgroundColor: "#fff6da",
    borderWidth: 1,
    borderColor: "#efc35c",
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: "#a16207",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2
  },
  dashboardTitle: {
    fontSize: 34,
    textAlign: "center",
    color: "#102a43",
    fontWeight: "900"
  },
  metricCompactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  metricCompactLeft: {
    flex: 1,
    flexDirection: "column",
    gap: 4
  },
  metricCompactLabel: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "800"
  },
  metricCompactValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
    minWidth: 88
  },
  graphPill: {
    alignSelf: "flex-start",
    backgroundColor: "#3b67b8",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  graphText: { color: "#dbeafe", fontSize: 11, fontWeight: "700" },
  graphPageCard: {
    borderWidth: 1,
    borderColor: "#d4a017",
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 10
  },
  graphPageTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  piePreviewWrap: {
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 10,
    backgroundColor: "#fffbeb",
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  piePreviewImage: {
    width: "100%",
    height: 200
  },
  pieFallbackWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  pieFallbackText: {
    color: "#92400e",
    fontSize: 13,
    fontWeight: "800"
  },
  pieFallbackSubText: {
    color: "#78350f",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3
  },
  legendWrap: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 7
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendLabel: {
    flex: 1,
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "700"
  },
  legendValue: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800"
  },
  backToDashboardBtn: {
    alignSelf: "center",
    minWidth: 160,
    backgroundColor: "#1e3a8a",
    borderWidth: 1,
    borderColor: "#1e40af",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 12
  },
  backToDashboardText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  },
  quickActionsCard: {
    borderWidth: 1,
    borderColor: "#dbe5ef",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1
  },
  quickActionsTitle: { color: "#111827", fontSize: 18, fontWeight: "800" },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  submitActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  graphActionBtn: {
    flex: 1,
    backgroundColor: "#2f4cb5",
    borderRadius: 12,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center"
  },
  graphActionBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  submitActionBtn: {
    minWidth: 104,
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center"
  },
  submitActionBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  dashboardInlineAlert: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    backgroundColor: "#fffaf2",
    padding: 12
  },
  dashboardAlertDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fb923c",
    marginTop: 2
  },
  dashboardInlineAlertText: {
    flex: 1,
    color: "#475569",
    fontSize: 12,
    lineHeight: 18
  },
  dashboardActivityPanel: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#204e8a",
    minHeight: 124,
    padding: 14
  },
  dashboardActivityTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    textDecorationLine: "underline"
  },
  dashboardActivityLine: {
    marginTop: 10,
    color: "#dbeafe",
    fontSize: 13,
    lineHeight: 18
  },
  dashboardActivityEmpty: {
    marginTop: 12,
    color: "#dbeafe",
    fontSize: 13,
    lineHeight: 18
  },
  alertPopupOverlay: {
    position: "absolute",
    top: 92,
    left: 12,
    right: 12,
    zIndex: 50,
    justifyContent: "flex-start",
    alignItems: "stretch"
  },
  alertPopupCard: {
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#f8edd7",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3
  },
  dashboardAlertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  dashboardAlertIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d97706"
  },
  dashboardAlertIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900"
  },
  dashboardAlertCopy: {
    flex: 1,
    gap: 1
  },
  dashboardAlertTitle: {
    color: "#9a3412",
    fontSize: 18,
    fontWeight: "900"
  },
  dashboardAlertHint: {
    color: "#7c2d12",
    fontSize: 12,
    fontWeight: "700"
  },
  dashboardAlertBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6
  },
  dashboardAlertBadgeText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "900"
    },
    dashboardAlertList: {
      marginTop: 10,
      gap: 8
    },
    dashboardAlertListRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8
    },
    dashboardAlertListDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#f59e0b",
      marginTop: 5
    },
    dashboardAlertListText: {
      flex: 1,
      color: "#7c2d12",
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18
    },
    actionBtnMuted: {
      flex: 1,
      backgroundColor: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 9,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    shadowColor: "#334155",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: "#0f766e",
    borderWidth: 1,
    borderColor: "#0f766e",
    borderRadius: 9,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    shadowColor: "#0f766e",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    elevation: 2
  },
  actionTextMuted: { color: "#1f2937", fontSize: 12, fontWeight: "700", textAlign: "center" },
  actionTextPrimary: { color: "#ffffff", fontSize: 12, fontWeight: "800", textAlign: "center" }
});

export const wrStyles = StyleSheet.create({
  metricBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "#f8fbff",
    borderRadius: 14,
    overflow: "hidden"
  },
  metricLabel: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: "#111827",
    fontSize: 13,
    fontWeight: "700"
  },
  metricValueBox: {
    width: 62,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  },
  metricValueText: { color: "#ffffff", fontWeight: "800", fontSize: 13 },
  metricInput: {
    width: 86,
    backgroundColor: "#1e3a8a",
    color: "#ffffff",
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  submitRow: { flexDirection: "row", gap: 8 },
  reportWorkflowCard: {
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "#f8fbff",
    borderRadius: 16,
    padding: 12,
    gap: 8
  },
  workflowTitle: {
    color: "#102a43",
    fontSize: 15,
    fontWeight: "800"
  },
  workflowHint: {
    color: "#475569",
    fontSize: 12,
    lineHeight: 18
  },
  workflowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  workflowLabel: {
    width: 118,
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "700"
  },
  workflowValue: {
    flex: 1,
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700"
  },
  workflowMediaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4
  },
  mediaBtn: {
    flex: 1,
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  },
  mediaBtnText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "800"
  },
  mediaStatusText: {
    color: "#334155",
    fontSize: 12
  },
  workflowActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4
  },
  locationBtn: {
    flex: 1,
    backgroundColor: "#1e40af",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12
  },
  locationBtnText: {
    color: "#dbeafe",
    fontWeight: "700"
  },
  graphBtn: {
    flex: 1,
    backgroundColor: "#1e40af",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12
  },
  graphBtnText: { color: "#dbeafe", fontWeight: "700" },
  submitBtn: {
    width: 84,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12
  },
  submitBtnText: { color: "#ffffff", fontWeight: "800" },
  distanceText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700"
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "#fffdf8",
    borderRadius: 14
  },
  alertDot: { width: 12, height: 12, borderRadius: 6, marginHorizontal: 8, backgroundColor: "#f97316" },
  alertText: { flex: 1, fontSize: 12, color: "#1f2937", paddingVertical: 8, paddingRight: 8 },
  activityCard: {
    borderWidth: 1,
    borderColor: "#cfe0ff",
    backgroundColor: "#143d73",
    padding: 14,
    minHeight: 128,
    borderRadius: 16
  },
  activityTitle: {
    color: "#eff6ff",
    fontWeight: "800",
    textDecorationLine: "underline",
    textAlign: "center",
    marginBottom: 8
  },
  activityLine: { color: "#e2e8f0", fontSize: 12, marginTop: 2 },
  backBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#102a43",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12
  },
  backBtnText: { color: "#ffffff", fontSize: 11, fontWeight: "700" }
});

export const neStyles = StyleSheet.create({
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "#f8fbff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8
  },
  fieldLabel: {
    width: 88,
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  fieldValue: {
    flex: 1,
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "700"
  },
  selectStrip: {
    backgroundColor: "#143d73",
    borderWidth: 1,
    borderColor: "#1d4f91",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 14
  },
  selectText: {
    color: "#dbeafe",
    fontWeight: "700",
    fontSize: 12
  },
  portionRow: {
    flexDirection: "row",
    gap: 8
  },
  portionBtn: {
    flex: 1,
    backgroundColor: "#1e40af",
    borderWidth: 1,
    borderColor: "#1d4ed8",
    borderRadius: 14,
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  portionBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "#fffdf8",
    borderRadius: 14
  },
  alertDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 8,
    backgroundColor: "#facc15"
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: "#1f2937",
    paddingVertical: 8,
    paddingRight: 8
  },
  activityCard: {
    borderWidth: 1,
    borderColor: "#f3c78a",
    backgroundColor: "#b45309",
    padding: 14,
    minHeight: 152,
    borderRadius: 16
  },
  activityTitle: {
    color: "#fff7ed",
    fontWeight: "800",
    textDecorationLine: "underline",
    textAlign: "center",
    marginBottom: 8
  },
  activityLine: {
    color: "#fff7ed",
    fontSize: 12,
    marginTop: 3
  }
});

export const smStyles = StyleSheet.create({
  fieldRow: {
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "#f8fbff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6
  },
  fieldLabel: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#c8d5e6",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dropdownTriggerText: {
    color: "#1e293b",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    marginRight: 6
  },
  dropdownArrow: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900"
  },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#c8d5e6",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden"
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff"
  },
  dropdownItemActive: {
    backgroundColor: "#dbeafe"
  },
  dropdownItemText: {
    color: "#1e293b",
    fontSize: 12,
    fontWeight: "600"
  },
  dropdownItemTextActive: {
    color: "#1e3a8a",
    fontWeight: "800"
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  optionPill: {
    borderWidth: 1,
    borderColor: "#93a3c9",
    backgroundColor: "#eaf0ff",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  optionPillActive: {
    backgroundColor: "#3b67b8",
    borderColor: "#3159a5"
  },
  optionPillText: {
    color: "#1e293b",
    fontSize: 11,
    fontWeight: "700"
  },
  optionPillTextActive: {
    color: "#ffffff"
  },
  readonlyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "#f8fbff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8
  },
  readonlyLabel: {
    flex: 1,
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  readonlyValue: {
    color: "#1e3a8a",
    fontSize: 12,
    fontWeight: "800"
  },
  uploadBtn: {
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  uploadBtnText: {
    color: "#111827",
    fontSize: 10,
    fontWeight: "700"
  },
  previewCard: {
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "#f8fbff",
    padding: 10,
    borderRadius: 14,
    gap: 6
  },
  previewTitle: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800"
  },
  previewBox: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: "#3159a5",
    backgroundColor: "#3b67b8",
    alignItems: "center",
    justifyContent: "center",
    padding: 8
  },
  previewImage: {
    width: "100%",
    height: 140,
    borderRadius: 4,
    resizeMode: "cover"
  },
  previewText: {
    color: "#dbeafe",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  dotToggle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1
  },
  lhIndicatorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  lhIndicatorBtnOn: {
    backgroundColor: "#dcfce7",
    borderColor: "#15803d"
  },
  lhIndicatorBtnOff: {
    backgroundColor: "#e2e8f0",
    borderColor: "#64748b"
  },
  lhIndicatorText: {
    fontSize: 11,
    fontWeight: "800"
  },
  lhIndicatorTextOn: {
    color: "#166534"
  },
  lhIndicatorTextOff: {
    color: "#334155"
  },
  dotToggleOn: {
    backgroundColor: "#22c55e",
    borderColor: "#15803d"
  },
  dotToggleOff: {
    backgroundColor: "#cbd5e1",
    borderColor: "#94a3b8"
  },
  cboInput: {
    width: 142,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 4,
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: "#111827",
    fontSize: 12
  },
  cboInputDisabled: {
    backgroundColor: "#e5e7eb",
    color: "#64748b"
  },
  radiusRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6e0eb",
    backgroundColor: "#f8fbff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8
  },
  radiusStatusIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1
  },
  radiusStatusIdle: {
    backgroundColor: "#94a3b8",
    borderColor: "#64748b"
  },
  radiusStatusGreen: {
    backgroundColor: "#22c55e",
    borderColor: "#15803d"
  },
  radiusStatusRed: {
    backgroundColor: "#ef4444",
    borderColor: "#b91c1c"
  },
  radiusText: {
    flex: 1,
    fontSize: 12,
    color: "#111827",
    fontWeight: "700"
  },
  bottomRow: {
    flexDirection: "row",
    gap: 8
  },
  checkBtn: {
    flex: 1,
    backgroundColor: "#1e40af",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11
  },
  checkBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#d97706",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  }
});

export const flowStyles = StyleSheet.create({
  statusHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#0f2f50",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4
  },
  statusHeroAccent: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f59e0b",
    borderWidth: 3,
    borderColor: "#fde68a"
  },
  statusHeroCopy: {
    flex: 1,
    gap: 3
  },
  statusHeroEyebrow: {
    color: "#bfdbfe",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  statusHeroTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900"
  },
  statusHeroSubtitle: {
    color: "#dbeafe",
    fontSize: 12,
    fontWeight: "700"
  },
  statusTitleWrap: {
    marginTop: 14,
    marginBottom: 8,
    gap: 4
  },
  statusTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "900"
  },
  statusHint: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 18
  },
  moduleStack: {
    gap: 10
  },
  profileButton: {
    backgroundColor: "#3157b7",
    borderWidth: 1,
    borderColor: "#27479b",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2
  },
  profileButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800"
  },
  trackingEntryBtn: {
    backgroundColor: "#0f766e",
    borderWidth: 1,
    borderColor: "#115e59",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    shadowColor: "#0f766e",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2
  },
  trackingEntryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800"
  },
  statusFooterCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#f8fbff",
    borderRadius: 18,
    padding: 12,
    gap: 10
  },
  footerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10
    },
  footerStatusText: {
    flex: 1,
    color: "#334155",
    fontSize: 12,
    fontWeight: "700"
  },
  geoDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1
  },
  geoDotGreen: {
    backgroundColor: "#22c55e",
    borderColor: "#15803d"
  },
  geoDotIdle: {
    backgroundColor: "#94a3b8",
    borderColor: "#64748b"
  },
  geoDotRed: {
    backgroundColor: "#ef4444",
    borderColor: "#b91c1c"
  },
  primarySaveBtn: {
      width: "100%",
      backgroundColor: "#f97316",
      borderWidth: 1,
      borderColor: "#c2410c",
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      shadowColor: "#ea580c",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
      elevation: 2
    },
  primarySaveText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "800"
    },
  statusBackBtn: {
      marginTop: 12,
      backgroundColor: "#1e3a8a",
      borderWidth: 1,
      borderColor: "#172554",
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12
    },
  statusBackBtnText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "800"
      },
    trackingCard: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: "#cbd5e1",
      backgroundColor: "#f8fafc",
      borderRadius: 10,
      padding: 10,
      gap: 8
    },
    trackingTitle: {
      color: "#111827",
      fontSize: 13,
      fontWeight: "900"
    },
    trackingHint: {
      color: "#475569",
      fontSize: 11,
      lineHeight: 16
    },
    trackingActionRow: {
      flexDirection: "row",
      gap: 8
    },
    secondaryTrackBtn: {
      flex: 1,
      backgroundColor: "#dbeafe",
      borderWidth: 1,
      borderColor: "#93c5fd",
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 9,
      paddingHorizontal: 8
    },
    secondaryTrackBtnText: {
      color: "#1d4ed8",
      fontSize: 11,
      fontWeight: "800",
      textAlign: "center"
    },
    mediaMetaText: {
      color: "#334155",
      fontSize: 11,
      fontWeight: "700"
    },
    remarksInput: {
      minHeight: 70,
      borderWidth: 1,
      borderColor: "#cbd5e1",
      borderRadius: 8,
      backgroundColor: "#ffffff",
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: "#111827",
      textAlignVertical: "top"
    },
    formTitle: {
      color: "#111827",
      fontSize: 15,
      fontWeight: "800"
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  formLabel: {
    flex: 1,
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  input: {
    width: 128,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 4,
    backgroundColor: "#ffffff",
    color: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "700"
  },
  ddWrap: {
    width: "100%",
    position: "relative",
    zIndex: 40
  },
  ddBox: {
    width: "100%",
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#d8e3f2",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  ddText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    marginRight: 10
  },
  ddArrow: {
    color: "#f97316",
    fontSize: 12,
    fontWeight: "900"
  },
  ddMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#d8e3f2",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    maxHeight: 190,
    boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.12)",
    elevation: 6,
    zIndex: 50
  },
  ddScroll: {
    maxHeight: 190
  },
  ddOption: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3fb",
    backgroundColor: "#ffffff"
  },
  ddOptionActive: {
    backgroundColor: "#edf4ff"
  },
  ddOptionText: {
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "600"
  },
  ddOptionTextActive: {
    color: "#1d4ed8"
  }
});

export const apStyles = StyleSheet.create({
  frame: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#f7fbff",
    padding: 16,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  },
  heroCard: {
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2ebf5",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)"
  },
  titleWrap: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#d7e2ee",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1
  },
  title: {
    color: "#0f172a",
    fontSize: 21,
    fontWeight: "900"
  },
  sectionType: {
    alignSelf: "flex-start",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  sectionHint: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 18
  },
  sectionCard: {
    width: "100%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1
  },
  fieldBlock: {
    width: "100%",
    gap: 7
  },
  label: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800"
  },
  input: {
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  dropdown: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4d7dc9",
    borderWidth: 1,
    borderColor: "#3159a5",
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  actionBtnText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800"
  }
});

export const nfStyles = StyleSheet.create({
  frame: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#7f7f7f",
    backgroundColor: "#d8d8d8",
    padding: 8
  },
  titleWrap: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#666666",
    backgroundColor: "#ececec",
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6
  },
  title: {
    color: "#1f1f1f",
    fontSize: 24,
    fontWeight: "700"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  label: {
    width: 84,
    color: "#111827",
    fontSize: 10,
    fontWeight: "700"
  },
  input: {
    width: 132,
    borderWidth: 1,
    borderColor: "#535353",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 3
  },
  dropdown: {
    width: 132,
    borderRadius: 0,
    borderColor: "#535353",
    paddingVertical: 3
  },
  toggleWrap: {
    width: 132,
    flexDirection: "row",
    gap: 6
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#818181",
    borderRadius: 999,
    backgroundColor: "#efefef",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3
  },
  toggleBtnActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#1d4ed8"
  },
  toggleText: {
    color: "#111827",
    fontSize: 10,
    fontWeight: "700"
  },
  complianceHeader: {
    alignItems: "center",
    marginTop: 4
  },
  complianceTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
    textDecorationLine: "underline"
  },
  saveBtn: {
    alignSelf: "flex-start",
    marginTop: 6,
    minWidth: 120,
    backgroundColor: "#f97316",
    borderWidth: 1,
    borderColor: "#c2410c",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  }
});

export const tsCardStyles = StyleSheet.create({
  frame: {
    borderRadius: 26,
    borderColor: "#222222",
    backgroundColor: "#d9d9d9",
    borderWidth: 1.2,
    padding: 10
  },
  headerCard: {
    backgroundColor: "#7b7f87",
    borderWidth: 1,
    borderColor: "#4b4f56",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4
  },
  headerLine: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800"
  },
  mainButton: {
    backgroundColor: "#3f6bbe",
    borderWidth: 1,
    borderColor: "#3159a5",
    borderRadius: 12,
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#334155",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  mainButtonText: {
    color: "#f8fafc",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24
  },
  segmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8
  },
  segmentBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: "#4b6ca9",
    borderWidth: 1,
    borderColor: "#2f4f86",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#334155",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  segmentBtnActive: {
    backgroundColor: "#3f6bbe",
    borderColor: "#274c94"
  },
  segmentBtnText: {
    color: "#f8fafc",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  geoDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1
  },
  geoDotGreen: {
    backgroundColor: "#22c55e",
    borderColor: "#15803d"
  },
  geoDotIdle: {
    backgroundColor: "#94a3b8",
    borderColor: "#64748b"
  },
  geoDotRed: {
    backgroundColor: "#ef4444",
    borderColor: "#b91c1c"
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    borderWidth: 1,
    borderColor: "#c2410c",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800"
  }
});

export const tsDetailStyles = StyleSheet.create({
  frame: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#8b8b8b",
    backgroundColor: "#d8d8d8",
    padding: 10
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  label: {
    width: 134,
    color: "#111827",
    fontSize: 11,
    fontWeight: "700"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#666666",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  dropdown: {
    flex: 1,
    borderRadius: 0,
    borderColor: "#666666",
    paddingVertical: 5
  },
  divider: {
    height: 1,
    backgroundColor: "#8b8b8b",
    marginVertical: 4
  },
  saveBtn: {
    alignSelf: "center",
    minWidth: 120,
    backgroundColor: "#f97316",
    borderWidth: 1,
    borderColor: "#c2410c",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    marginTop: 4
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800"
  }
});

export const fsStyles = StyleSheet.create({
  frame: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#8b8b8b",
    backgroundColor: "#d8d8d8",
    padding: 10
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  label: {
    width: 142,
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  dropdown: {
    flex: 1,
    borderRadius: 0,
    borderColor: "#666666",
    paddingVertical: 5
  },
  toggleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1
  },
  toggleDotOn: {
    backgroundColor: "#16a34a",
    borderColor: "#166534"
  },
  toggleDotOff: {
    backgroundColor: "#cbd5e1",
    borderColor: "#64748b"
  },
  toggleText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  popupBtn: {
    width: 74,
    minHeight: 64,
    backgroundColor: "#06b6d4",
    borderWidth: 1,
    borderColor: "#0e7490",
    alignItems: "center",
    justifyContent: "center"
  },
  popupBtnText: {
    color: "#0f172a",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    textDecorationLine: "underline"
  },
  saveBtn: {
    minWidth: 96,
    backgroundColor: "#22c55e",
    borderWidth: 1,
    borderColor: "#15803d",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 18
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800"
  }
});

export const pastStyles = StyleSheet.create({
  frame: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#8b8b8b",
    backgroundColor: "#d8d8d8",
    padding: 8
  },
  section: {
    borderWidth: 1,
    borderColor: "#8b8b8b",
    backgroundColor: "#eeeeee",
    padding: 8,
    gap: 4
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  label: {
    width: 144,
    color: "#111827",
    fontSize: 11,
    fontWeight: "700"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#666666",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  inputReadOnly: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#666666",
    backgroundColor: "#e2e8f0",
    color: "#111827",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  dropdown: {
    flex: 1,
    borderRadius: 0,
    borderColor: "#666666",
    paddingVertical: 5
  },
  saveBtn: {
    alignSelf: "flex-end",
    minWidth: 88,
    backgroundColor: "#3b67b8",
    borderWidth: 1,
    borderColor: "#3159a5",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 4
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  },
  linkBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#1d4ed8",
    backgroundColor: "#dbeafe",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  linkBtnText: {
    color: "#1e3a8a",
    fontSize: 11,
    fontWeight: "800"
  }
});

export const txnStyles = StyleSheet.create({
  frame: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#8b8b8b",
    backgroundColor: "#d8d8d8",
    padding: 8
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  label: {
    width: 188,
    color: "#111827",
    fontSize: 11,
    fontWeight: "700"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#666666",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  inputReadOnly: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#666666",
    backgroundColor: "#e2e8f0",
    color: "#111827",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  dropdown: {
    flex: 1,
    borderRadius: 0,
    borderColor: "#666666",
    paddingVertical: 5
  },
  tableTitle: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6
  },
  table: {
    borderWidth: 1,
    borderColor: "#555555",
    backgroundColor: "#f3f4f6"
  },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#555555",
    backgroundColor: "#e5e7eb"
  },
  tableRow: {
    flexDirection: "row"
  },
  thMonth: {
    width: 58,
    borderRightWidth: 1,
    borderRightColor: "#555555",
    padding: 4,
    fontSize: 10,
    fontWeight: "800",
    color: "#111827"
  },
  th: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#555555",
    padding: 4,
    fontSize: 10,
    fontWeight: "800",
    color: "#111827"
  },
  tdMonth: {
    width: 58,
    borderRightWidth: 1,
    borderRightColor: "#555555",
    padding: 4,
    fontSize: 10,
    color: "#111827"
  },
  td: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#555555",
    padding: 4,
    fontSize: 10,
    color: "#111827"
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  },
  actionBtn: {
    minWidth: 86,
    backgroundColor: "#3b67b8",
    borderWidth: 1,
    borderColor: "#3159a5",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  },
  backBtn: {
    minWidth: 70,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8
  },
  backBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  }
});

export const lhcboStyles = StyleSheet.create({
  frame: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#94a3b8",
    backgroundColor: "#e2e8f0",
    padding: 10,
    gap: 10
  },
  formCard: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#f3f4f6",
    padding: 10,
    gap: 6
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  label: {
    flex: 1,
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  dropdown: {
    width: 174
  },
  input: {
    width: 174,
    borderWidth: 1,
    borderColor: "#6b7280",
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
    color: "#1f2937",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  uploadBtn: {
    width: 174,
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8
  },
  uploadBtnText: {
    color: "#1e3a8a",
    fontSize: 11,
    fontWeight: "800"
  },
  helpText: {
    color: "#2563eb",
    fontSize: 12,
    lineHeight: 16
  },
  autoText: {
    color: "#dc2626",
    fontWeight: "800"
  },
  previewHeading: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
    textDecorationLine: "underline",
    marginTop: 2
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6
  },
  navBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center"
  },
  navBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900"
  },
  previewBox: {
    flex: 1,
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#3159a5",
    backgroundColor: "#4f76c4",
    alignItems: "center",
    justifyContent: "center",
    padding: 8
  },
  previewImage: {
    width: "100%",
    height: 140
  },
  previewText: {
    color: "#f8fafc",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20
  },
  radiusRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  geoDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1
  },
  geoDotIdle: {
    backgroundColor: "#94a3b8",
    borderColor: "#64748b"
  },
  geoDotGreen: {
    backgroundColor: "#22c55e",
    borderColor: "#15803d"
  },
  geoDotIdle: {
    backgroundColor: "#94a3b8",
    borderColor: "#64748b"
  },
  geoDotRed: {
    backgroundColor: "#ef4444",
    borderColor: "#b91c1c"
  },
  radiusText: {
    flex: 1,
    color: "#1e40af",
    fontSize: 11,
    fontWeight: "700"
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4
  },
  checkBtn: {
    flex: 1,
    backgroundColor: "#1d4ed8",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9
  },
  checkBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  }
});

export const lhGuideStyles = StyleSheet.create({
  frame: {
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#a5b4c8",
    backgroundColor: "#e2e8f0",
    padding: 10
  },
  headerCard: {
    backgroundColor: "#6b7280",
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2
  },
  headerLine: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800"
  },
  formCard: {
    borderWidth: 1,
    borderColor: "#a8b2c3",
    backgroundColor: "#d9dee6",
    padding: 8,
    gap: 8
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  dropdownLabel: {
    width: 118,
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  dropdownValueBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#ffffff",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dropdownValue: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "700"
  },
  dropdownArrow: {
    color: "#f97316",
    fontWeight: "900"
  },
  rulesCard: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#e5e7eb",
    padding: 8,
    gap: 4
  },
  ruleLine: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 24,
    fontWeight: "800"
  },
  ruleLineActive: {
    color: "#dc2626"
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2
  },
  geoDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1
  },
  geoDotGreen: {
    backgroundColor: "#22c55e",
    borderColor: "#15803d"
  },
  geoDotIdle: {
    backgroundColor: "#94a3b8",
    borderColor: "#64748b"
  },
  geoDotRed: {
    backgroundColor: "#ef4444",
    borderColor: "#b91c1c"
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    borderWidth: 1,
    borderColor: "#c2410c",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800"
  },
  backBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  backBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  }
});

export const lhcboStatusStyles = StyleSheet.create({
  frame: {
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#e5e7eb",
    padding: 10
  },
  titleText: {
    fontSize: 15,
    fontWeight: "900",
    textAlign: "left"
  },
  titlePage: {
    color: "#111827"
  },
  titleRed: {
    color: "#dc2626"
  },
  headerCard: {
    backgroundColor: "#6b7280",
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2
  },
  headerLine: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800"
  },
  contentCard: {
    borderWidth: 1,
    borderColor: "#7f8794",
    backgroundColor: "#e5e7eb",
    minHeight: 470,
    paddingVertical: 18,
    paddingHorizontal: 10,
    justifyContent: "space-between"
  },
  buttonStack: {
    gap: 34,
    marginTop: 10
  },
  blockBtn: {
    alignSelf: "center",
    width: "74%",
    backgroundColor: "#4a75c6",
    borderWidth: 1,
    borderColor: "#3159a5",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    shadowColor: "#334155",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  blockBtnText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800"
  },
  chcPlaceholder: {
    alignSelf: "center",
    width: 136,
    height: 176,
    borderWidth: 1.5,
    borderColor: "#111827",
    backgroundColor: "#e5e7eb",
    marginTop: 90
  },
  footerRow: {
    width: "82%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  geoDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1
  },
  geoDotGreen: {
    backgroundColor: "#22c55e",
    borderColor: "#15803d"
  },
  geoDotRed: {
    backgroundColor: "#ef4444",
    borderColor: "#b91c1c"
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    borderWidth: 1,
    borderColor: "#c2410c",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800"
  }
});

export const lhStyles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#6b7280",
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3
  },
  headerLine: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700"
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  dropdownLabel: {
    width: 108,
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  dropdownValueBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#ffffff",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropdownValue: {
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "700"
  },
  dropdownArrow: {
    color: "#f97316",
    fontWeight: "900"
  },
  notesCard: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  noteLine: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 18
  },
  noteDivider: {
    color: "#6b7280",
    marginVertical: 3
  },
  notePlain: {
    color: "#111827",
    fontWeight: "700"
  },
  noteHighlight: {
    color: "#dc2626",
    fontWeight: "800"
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  geoDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1
  },
  geoDotGreen: {
    backgroundColor: "#22c55e",
    borderColor: "#15803d"
  },
  geoDotRed: {
    backgroundColor: "#ef4444",
    borderColor: "#b91c1c"
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    borderWidth: 1,
    borderColor: "#c2410c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  }
});





