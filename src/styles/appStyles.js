import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f2f6f9"
  },
  screenPad: {
    padding: 14,
    gap: 12,
    paddingBottom: 90
  },
  languageScreenPad: {
    padding: 16,
    gap: 14,
    paddingBottom: 90
  },
  languageHero: {
    backgroundColor: "#dbf4ee",
    borderWidth: 1,
    borderColor: "#a7ddd0",
    borderRadius: 20,
    padding: 16,
    gap: 6
  },
  languageEyebrow: {
    color: "#0f766e",
    fontWeight: "800",
    letterSpacing: 1
  },
  languageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cfd8e3",
    padding: 12,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#9caec6",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fbff"
  },
  languageOptionActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e"
  },
  languageOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  languageOptionText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 15
  },
  languageOptionTextActive: {
    color: "#ffffff"
  },
  languageDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#64748b",
    backgroundColor: "#ffffff"
  },
  languageDotActive: {
    borderColor: "#ffffff",
    backgroundColor: "#34d399"
  },
  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12
  },
  logoCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f766e"
  },
  logoText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 24
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a"
  },
  subtitleCenter: {
    color: "#334155"
  },
  loader: {
    marginTop: 12,
    color: "#0f766e",
    fontWeight: "700"
  },
  
  // Enhanced Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  splashBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0f766e",
  },
  splashDecoCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -100,
    right: -80,
  },
  splashDecoCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.03)",
    bottom: -50,
    left: -50,
  },
  splashDecoCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: "40%",
    left: -30,
  },
  splashLogoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  splashLogoOuterGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(52, 211, 153, 0.3)",
  },
  splashLogoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 4,
    borderColor: "rgba(52, 211, 153, 0.5)",
  },
  splashLogoText: {
    color: "#0f766e",
    fontWeight: "900",
    fontSize: 32,
    letterSpacing: 2,
  },
  splashAppName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  splashSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  splashLoaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  splashLoaderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  splashLoaderDotActive: {
    backgroundColor: "#ffffff",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  splashVersion: {
    position: "absolute",
    bottom: 40,
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  splashTagline: {
    position: "absolute",
    bottom: 60,
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  headerTextWrap: {
    gap: 3
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a"
  },
  subtitle: {
    color: "#475569"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dbe3ea",
    gap: 10
  },
  diagramCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#9ec5ff",
    gap: 10
  },
  mediaBox: {
    backgroundColor: "#ffe7d3",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f7b98f",
    gap: 6
  },
  modeSwitch: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#0f172a",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryBtnText: {
    color: "#0f172a",
    fontWeight: "700"
  },
  inputWrap: {
    gap: 6
  },
  label: {
    fontWeight: "600",
    color: "#1e293b"
  },
  required: {
    color: "#dc2626",
    fontWeight: "700"
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#fff"
  },
  inputDisabled: {
    backgroundColor: "#eef2f7",
    color: "#475569"
  },
  helperText: {
    fontSize: 12
  },
  validText: {
    color: "#15803d"
  },
  invalidText: {
    color: "#b91c1c"
  },
  link: {
    color: "#0f766e",
    fontWeight: "700"
  },
  secureNote: {
    color: "#475569",
    fontSize: 12
  },
  button: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700"
  },
  pill: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999
  },
  pillActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e"
  },
  pillText: {
    color: "#334155",
    fontWeight: "600"
  },
  pillTextActive: {
    color: "#fff"
  },
  dashboardWrap: {
    flex: 1
  },
  tabContent: {
    gap: 10
  },
  dashboardHeaderRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  crpImageBox: {
    width: 58,
    height: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center"
  },
  crpImageIcon: {
    fontWeight: "700",
    color: "#1f2937"
  },
  crpInfoBox: {
    flex: 1,
    backgroundColor: "#6b7280",
    borderRadius: 8,
    padding: 8,
    gap: 3
  },
  crpInfoText: {
    color: "#fff",
    fontWeight: "600"
  },
  diagramTopInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  memberHeaderBox: {
    backgroundColor: "#6b7280",
    borderRadius: 8,
    padding: 8,
    gap: 4
  },
  memberHeaderText: {
    color: "#fff",
    fontWeight: "600"
  },
  dashboardYellowBox: {
    marginTop: 10,
    backgroundColor: "#facc15",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ca8a04",
    padding: 10,
    gap: 8
  },
  dashboardActionRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 6
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center"
  },
  quickActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  },
  imageActivityBox: {
    backgroundColor: "#e5edff",
    borderWidth: 1,
    borderColor: "#8ea7dd",
    borderRadius: 10,
    padding: 10,
    gap: 8
  },
  imageActivityText: {
    color: "#1e3a8a",
    fontWeight: "700",
    textAlign: "center"
  },
  geoPinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  geoPin: {
    fontSize: 18
  },
  processNoteBox: {
    backgroundColor: "#fff5f5",
    borderColor: "#ef4444",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 4
  },
  processNoteText: {
    color: "#991b1b",
    fontSize: 12,
    fontWeight: "600"
  },
  innerPanel: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 10,
    gap: 8
  },
  profileBtnStack: {
    gap: 8,
    width: "60%"
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#e2f3f0",
    borderRadius: 10,
    padding: 10,
    gap: 4
  },
  metricCardWarn: {
    backgroundColor: "#fef3c7"
  },
  metricLabel: {
    color: "#334155",
    fontSize: 12
  },
  metricValue: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a"
  },
  infoGrid: {
    gap: 4
  },
  infoLine: {
    color: "#334155"
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dbe3ea",
    gap: 8
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 110
  },
  barCol: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end"
  },
  bar: {
    width: "100%",
    borderRadius: 5,
    minHeight: 8
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontWeight: "700"
  },
  badgeGood: {
    backgroundColor: "#dcfce7",
    color: "#166534"
  },
  badgeWarn: {
    backgroundColor: "#fee2e2",
    color: "#991b1b"
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  outlineText: {
    color: "#334155",
    fontWeight: "600"
  },
  mapBox: {
    height: 150,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#edf5ff"
  },
  mapText: {
    color: "#334155",
    fontWeight: "600"
  },
  radiusCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#16a34a",
    backgroundColor: "rgba(34,197,94,0.2)"
  },
  radiusCircleInvalid: {
    borderColor: "#dc2626",
    backgroundColor: "rgba(239,68,68,0.2)"
  },
  badgeAlert: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    fontWeight: "700"
  },
  noteBox: {
    backgroundColor: "#e6f0ff",
    borderColor: "#8fb5ff",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6
  },
  noteTitle: {
    color: "#1e3a8a",
    fontWeight: "800"
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#dbe3ea",
    paddingVertical: 10
  },
  navItem: {
    flex: 1,
    alignItems: "center"
  },
  navText: {
    color: "#64748b",
    fontWeight: "600"
  },
  navTextActive: {
    color: "#0f766e"
  },

  // Enhanced Login/Signup Screen Styles
  loginContainer: {
    flex: 1,
    backgroundColor: "#0f766e",
  },
  loginHeader: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 24,
    paddingTop: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loginLogoWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  loginLogoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#0f766e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginLogoText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 2,
  },
  loginAppName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  loginTagline: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  loginFormArea: {
    flex: 1,
    padding: 16,
  },
  loginTabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loginTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  loginTabActive: {
    backgroundColor: "#0f766e",
  },
  loginTabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748b",
  },
  loginTabTextActive: {
    color: "#ffffff",
  },
  loginCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loginCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  loginInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 12,
  },
  loginInputFocus: {
    borderColor: "#0f766e",
    backgroundColor: "#ffffff",
  },
  loginIdTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  loginIdPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  loginIdPillActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e",
  },
  loginIdPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  loginIdPillTextActive: {
    color: "#ffffff",
  },
  loginButton: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#0f766e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  loginSwitchMode: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 6,
  },
  loginSwitchModeText: {
    color: "#64748b",
    fontSize: 14,
  },
  loginSwitchModeBtn: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "700",
  },
  loginDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  loginDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  loginDividerText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  loginFooter: {
    alignItems: "center",
    paddingVertical: 16,
  },
  loginFooterText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  signupContainer: {
    flex: 1,
  },
  signupSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
    marginTop: 8,
  },
  signupRow: {
    flexDirection: "row",
    gap: 10,
  },
  signupHalfInput: {
    flex: 1,
  },
  signupValidIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: -8,
    marginBottom: 8,
  },
  signupValidText: {
    fontSize: 11,
    fontWeight: "600",
  },
  signupNoteBox: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  signupNoteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 4,
  },
  signupNoteText: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 18,
  },
  signupScrollView: {
    flex: 1,
  },
  enhancedCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  crpAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#34d399",
  },
  crpAvatarText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 18,
  },
  crpNameText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  crpDetailText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  crpBadge: {
    backgroundColor: "#0f766e",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  crpBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  metricsHeader: {
    marginBottom: 12,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionCardPrimary: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e",
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  reportStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  reportStat: {
    alignItems: "center",
    flex: 1,
  },
  reportStatValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f766e",
  },
  reportStatLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  statusSuccess: {
    backgroundColor: "#dcfce7",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  statusTextSuccess: {
    color: "#166534",
  },
  statusTextPending: {
    color: "#92400e",
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 10,
  },
  alertDotPending: {
    backgroundColor: "#f59e0b",
  },
  alertDotUpcoming: {
    backgroundColor: "#3b82f6",
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  activityItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  activityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityBadgeDone: {
    backgroundColor: "#dcfce7",
  },
  activityBadgeProgress: {
    backgroundColor: "#dbeafe",
  },
  activityBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  activityBadgeTextDone: {
    color: "#166534",
  },
  activityBadgeTextProgress: {
    color: "#1d4ed8",
  },
  activityDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  activityDetail: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0f766e",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
});

export default styles;
