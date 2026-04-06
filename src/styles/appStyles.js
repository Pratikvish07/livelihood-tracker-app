import { Platform, StyleSheet } from "react-native";

const isWeb = Platform.OS === "web";

const webShadow = (color = "#000", offset = { width: 0, height: 0 }, opacity = 0.2, radius = 4) => {
  if (!isWeb) return {};

  const normalizeColor = (value) => {
    if (!value) return `rgba(0,0,0,${opacity})`;
    const trimmed = value.trim();
    if (trimmed.startsWith("#")) {
      let hex = trimmed.slice(1);
      if (hex.length === 3) {
        hex = hex.split("").map((c) => c + c).join("");
      }
      const intValue = parseInt(hex, 16);
      const r = (intValue >> 16) & 255;
      const g = (intValue >> 8) & 255;
      const b = intValue & 255;
      return `rgba(${r},${g},${b},${opacity})`;
    }
    if (trimmed.startsWith("rgb(")) {
      return trimmed.replace("rgb(", "rgba(").replace(")", `,${opacity})`);
    }
    if (trimmed.startsWith("rgba(")) {
      return trimmed;
    }
    return trimmed;
  };

  return {
    boxShadow: `${offset.width}px ${offset.height}px ${radius}px ${normalizeColor(color)}`,
  };
};

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
  dashboardHeaderWrap: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 2,
    gap: 10
  },
  languageScreenPad: {
    padding: 18,
    gap: 16,
    paddingBottom: 90,
    backgroundColor: "#edf2f7"
  },
  languageTopBand: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#d97706",
    marginHorizontal: 6
  },
  languageHero: {
    backgroundColor: "#f5f0df",
    borderWidth: 1,
    borderColor: "#d4c59a",
    borderRadius: 22,
    padding: 18,
    gap: 14,
    shadowColor: "#5b5b39",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden"
  },
  languageHeroAura: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(15,118,110,0.12)",
    top: -120,
    right: -80
  },
  languageHeroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  languageSeal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#a07f2f",
    backgroundColor: "#fff8df",
    alignItems: "center",
    justifyContent: "center"
  },
  languageSealText: {
    color: "#7c5a10",
    fontWeight: "900",
    fontSize: 18
  },
  languageGovtCopy: {
    flex: 1,
    gap: 2
  },
  languageGovtLabel: {
    color: "#53634c",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7
  },
  languageGovtDept: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "800"
  },
  languageTitleWrap: {
    paddingTop: 4,
    gap: 4
  },
  languageEyebrow: {
    color: "#0f766e",
    fontWeight: "800",
    letterSpacing: 1.2
  },
  languageCard: {
    backgroundColor: "#fffdf8",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d5c9ab",
    padding: 14,
    gap: 12,
    shadowColor: "#534d3a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  languageCardHeader: {
    gap: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ebe2ca"
  },
  languageCardTitle: {
    color: "#1b2b45",
    fontSize: 16,
    fontWeight: "800"
  },
  languageCardHint: {
    color: "#5b6472",
    fontSize: 12,
    lineHeight: 18
  },
  languagePillBanner: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  languagePillBannerText: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  languageOption: {
    width: "48%",
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#b5bfd0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f9fbff"
  },
  languageOptionActive: {
    backgroundColor: "#1f7a74",
    borderColor: "#175d58"
  },
  languageOptionLeft: {
    gap: 4
  },
  languageOptionPrefix: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  languageOptionPrefixActive: {
    color: "#d7f7ef"
  },
  languageOptionText: {
    color: "#10213d",
    fontWeight: "700",
    fontSize: 16
  },
  languageOptionTextActive: {
    color: "#ffffff"
  },
  languageOptionSubtext: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600"
  },
  languageOptionSubtextActive: {
    color: "#dbeafe"
  },
  languageDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: "#64748b",
    backgroundColor: "#ffffff"
  },
  languageDotActive: {
    borderColor: "#ffffff",
    backgroundColor: "#6ee7b7"
  },
  trlmHeaderCard: {
    backgroundColor: "#f5f0df",
    borderWidth: 1,
    borderColor: "#d4c59a",
    borderRadius: 22,
    padding: 18,
    gap: 14,
    shadowColor: "#5b5b39",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3
  },
  trlmHeaderCardCompact: {
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  trlmHeaderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  trlmBrandRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  trlmSeal: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: "#a07f2f",
    backgroundColor: "#fff8df",
    alignItems: "center",
    justifyContent: "center"
  },
  trlmSealText: {
    color: "#7c5a10",
    fontWeight: "900",
    fontSize: 17
  },
  trlmBrandCopy: {
    flex: 1,
    gap: 2
  },
  trlmGovtLabel: {
    color: "#53634c",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7
  },
  trlmGovtDept: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "800"
  },
  trlmHeaderBody: {
    gap: 6
  },
  trlmBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fff9eb",
    borderWidth: 1,
    borderColor: "#d6c38f",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  trlmBadgeText: {
    color: "#6c5718",
    fontSize: 11,
    fontWeight: "800"
  },
  trlmHeaderTitle: {
    color: "#1b2b45",
    fontSize: 20,
    fontWeight: "900"
  },
  trlmHeaderSubtitle: {
    color: "#5b6472",
    fontSize: 12,
    lineHeight: 18
  },
  trlmLogoutButton: {
    minWidth: 106,
    borderRadius: 14,
    backgroundColor: "#13213a",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    shadowColor: "#13213a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  trlmLogoutButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800"
  },
  trlmLogoutIcon: {
    color: "#bfdbfe",
    fontSize: 13,
    fontWeight: "900"
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
    backgroundColor: "#f4efe2",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  splashTopBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: "#d97706"
  },
  splashBottomBand: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: "#1f4b3f"
  },
  splashBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f4efe2",
  },
  splashDecoCircle1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(31,75,63,0.08)",
    top: -110,
    right: -90,
  },
  splashDecoCircle2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(217,119,6,0.08)",
    bottom: -70,
    left: -60,
  },
  splashDecoCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(30,58,138,0.05)",
    top: "37%",
    left: -35,
  },
  splashGridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    left: "18%",
    backgroundColor: "rgba(31,75,63,0.08)"
  },
  splashGridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    top: "32%",
    backgroundColor: "rgba(217,119,6,0.08)"
  },
  splashAuthorityBadge: {
    position: "absolute",
    top: 74,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#fff8df",
    borderWidth: 1,
    borderColor: "#c6a54d"
  },
  splashAuthorityText: {
    color: "#7c5a10",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  splashLogoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  splashLogoOuterGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(217,119,6,0.18)",
  },
  splashLogoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffdf7",
    ...Platform.select({
      web: webShadow("#5c5133", { width: 0, height: 8 }, 0.16, 16),
      default: {
        shadowColor: "#5c5133",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
    borderWidth: 4,
    borderColor: "rgba(31,75,63,0.25)",
  },
  splashLogoImage: {
    width: 92,
    height: 92,
    borderRadius: 46
  },
  splashLogoText: {
    color: "#1f4b3f",
    fontWeight: "900",
    fontSize: 32,
    letterSpacing: 2,
  },
  splashAppName: {
    fontSize: 30,
    fontWeight: "900",
    color: "#13294b",
    textAlign: "center",
    marginBottom: 8,
    maxWidth: 320,
    lineHeight: 36,
  },
  splashSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#556272",
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 0.5,
    maxWidth: 300,
    lineHeight: 22
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
    backgroundColor: "rgba(31,75,63,0.35)",
  },
  splashLoaderDotActive: {
    backgroundColor: "#1f4b3f",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  splashVersion: {
    position: "absolute",
    bottom: 40,
    color: "rgba(19,41,75,0.45)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  splashTagline: {
    position: "absolute",
    bottom: 60,
    color: "rgba(31,75,63,0.78)",
    fontSize: 13,
    fontWeight: "700",
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
    padding: 14,
    borderWidth: 1,
    borderColor: "#dbe3ea",
    gap: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
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
    flex: 1,
    position: "relative",
    backgroundColor: "#e7eef6"
  },
  dashboardGlowTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(59,130,246,0.12)",
    top: -90,
    right: -80
  },
  dashboardGlowBottom: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(13,148,136,0.1)",
    bottom: 30,
    left: -90
  },
  dashboardContentShell: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 76,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.62)",
    borderWidth: 1,
    borderColor: "#dbe5ef",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden"
  },
  tabContent: {
    gap: 12
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
  profileHeroCard: {
    backgroundColor: "#102a43",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    shadowColor: "#102a43",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4
  },
  profileAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fde68a"
  },
  profileAvatarText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900"
  },
  profileHeroCopy: {
    flex: 1,
    gap: 4
  },
  profileHeroTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900"
  },
  profileHeroSubtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600"
  },
  profileRoleBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  profileRoleBadgeText: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  profileInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dbe3ea",
    gap: 12
  },
  profileInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7"
  },
  profileInfoLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700"
  },
  profileInfoValue: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 12
  },
  profileActionCard: {
    backgroundColor: "#fffaf0",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fcd9a7",
    gap: 10
  },
  profileActionTitle: {
    color: "#7c2d12",
    fontSize: 16,
    fontWeight: "800"
  },
  profileActionHint: {
    color: "#9a3412",
    fontSize: 12,
    lineHeight: 18
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
  loanHeroCard: {
    backgroundColor: "#f8fbff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#cfe0ff",
    gap: 12
  },
  loanHeroTitle: {
    color: "#102a43",
    fontSize: 20,
    fontWeight: "900"
  },
  loanHeroSubtitle: {
    color: "#52606d",
    fontSize: 13,
    lineHeight: 19
  },
  loanSegmentWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  govPanelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dbe3ea",
    gap: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3
  },
  alertPanelCard: {
    backgroundColor: "#fff7f7",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
    gap: 10
  },
  bottomNavShell: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fbfdff",
    borderTopWidth: 1,
    borderColor: "#dbe3ea",
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12
  },
  languageMenuPopup: {
    alignSelf: "flex-end",
    marginRight: 12,
    marginBottom: 8,
    width: 172,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ea",
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8
  },
  languageMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2
  },
  languageMenuItemActive: {
    backgroundColor: "#eff6ff"
  },
  languageMenuText: {
    color: "#102a43",
    fontSize: 14,
    fontWeight: "700"
  },
  languageMenuHint: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600"
  },
  languageMenuTextActive: {
    color: "#1e3a8a"
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    borderRadius: 14
  },
  navItemActive: {
    backgroundColor: "#eff6ff"
  },
  navIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center"
  },
  navIconWrapActive: {
    backgroundColor: "#1e3a8a"
  },
  navIconText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "800"
  },
  navIconTextActive: {
    color: "#ffffff"
  },
  navText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 12
  },
  navTextActive: {
    color: "#0f766e"
  },
  languageNavItem: {
    flex: 1.2
  },
  languageSwitcherButton: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  languageSwitcherCode: {
    color: "#1e3a8a",
    fontSize: 11,
    fontWeight: "800"
  },

  // Enhanced Login/Signup Screen Styles
  loginContainer: {
    flex: 1,
    backgroundColor: "#e9eff7",
    position: "relative",
    overflow: "hidden"
  },
  authGlowPrimary: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(30,58,138,0.16)",
    top: -80,
    right: -90
  },
  authGlowSecondary: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(13,148,136,0.12)",
    bottom: 140,
    left: -90
  },
  loginHeader: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    padding: 24,
    paddingTop: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14
  },
  loginLogoWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  loginGlassChip: {
    marginBottom: 14,
    backgroundColor: "rgba(15,23,42,0.82)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7
  },
  loginGlassChipText: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  loginLogoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: "#93c5fd",
  },
  loginLogoText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 2,
  },
  loginLogoImage: {
    width: 58,
    height: 58,
    borderRadius: 29
  },
  loginAppName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e3a8a",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  loginTagline: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
  },
  loginHeroMetricRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  loginHeroMetric: {
    minWidth: 78,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  loginHeroMetricValue: {
    color: "#1e3a8a",
    fontSize: 14,
    fontWeight: "900"
  },
  loginHeroMetricLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3
  },
  loginFormArea: {
    flex: 1,
    padding: 16,
    paddingBottom: 42
  },
  loginTabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    padding: 5,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#d8e2ee",
  },
  loginTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
  },
  loginTabActive: {
    backgroundColor: "#1e3a8a",
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
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  loginCardGlass: {
    backgroundColor: "rgba(255,255,255,0.84)"
  },
  responseModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.48)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  responseModalCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "72%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#dbe4ef",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
    gap: 14
  },
  responseModalTitle: {
    color: "#102a43",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  responseModalScroll: {
    maxHeight: 260
  },
  responseModalMessage: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600"
  },
  loginCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e3a8a",
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  formRibbon: {
    alignSelf: "center",
    backgroundColor: "#e0ecff",
    borderWidth: 1,
    borderColor: "#b8d0ff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 16
  },
  formRibbonText: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  loginInput: {
    backgroundColor: "rgba(248,250,252,0.95)",
    borderWidth: 1,
    borderColor: "#dbe4ef",
    borderRadius: 16,
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
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  loginIdPillActive: {
    backgroundColor: "#1e3a8a",
    borderColor: "#1e3a8a",
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
    backgroundColor: "#1e3a8a",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#3b82f6",
    minHeight: 56,
    zIndex: 100,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
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
    color: "#1e3a8a",
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
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
    marginTop: 0,
    textTransform: "uppercase",
    letterSpacing: 0.7
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
  formSectionCard: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  dropdownWrap: {
    gap: 8
  },
  dropdownTrigger: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#d7deea",
    borderRadius: 16,
    backgroundColor: "rgba(248,250,252,0.98)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropdownTriggerOpen: {
    borderColor: "#1e3a8a",
    backgroundColor: "#ffffff"
  },
  dropdownTriggerText: {
    flex: 1,
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "600",
    paddingRight: 12
  },
  dropdownPlaceholder: {
    color: "#94a3b8",
    fontWeight: "500"
  },
  dropdownChevron: {
    color: "#1e3a8a",
    fontSize: 12,
    fontWeight: "900"
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: "#d7deea",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.98)",
    overflow: "hidden"
  },
  dropdownScroll: {
    maxHeight: 220
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7"
  },
  dropdownOptionActive: {
    backgroundColor: "#e8efff"
  },
  dropdownOptionText: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "600"
  },
  dropdownOptionTextActive: {
    color: "#1e3a8a"
  },
  dropdownDisabled: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    backgroundColor: "rgba(248,250,252,0.95)",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  dropdownDisabledText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500"
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

  // Geofence Styles
  geofenceContainer: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  geofenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  geofenceLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e3a8a",
  },
  geofenceValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  geofenceCoords: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  geofenceMessage: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  geofenceRefreshBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  geofenceRefreshText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  geofenceBtnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  geofenceMapBtn: {
    flex: 1,
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
    alignItems: "center",
  },
  geofenceMapText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  geofenceInfoBox: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  geofenceInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
  },
  geofenceInfoText: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 18,
  },

  // Government Form Style Styles
  govFormCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  govFormTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e3a8a",
    marginBottom: 4,
    textAlign: "center",
  },
  govFormSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 20,
    textAlign: "center",
  },
  govFormField: {
    marginBottom: 16,
  },
  govFormLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  govFormInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1e293b",
  },
  govFormValidation: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  govFormRow: {
    flexDirection: "row",
    gap: 12,
  },
  govFormHalf: {
    flex: 1,
  },
  govFormPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});

export default styles;
