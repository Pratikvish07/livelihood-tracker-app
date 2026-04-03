import React, { useEffect, useMemo, useState } from "react";
import { Alert, SafeAreaView, ScrollView, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../components/BottomNav";
import DashboardHomeTab from "../screens/tabs/DashboardHomeTab.js";
import ProfileTab from "../screens/tabs/ProfileTab";
import LanguageScreen from "../screens/LanguageScreen";
import LoginScreen from "../screens/LoginScreen";
import SplashScreen from "../screens/SplashScreen";
import { I18nProvider } from "../i18n/I18nProvider";
import { translateText } from "../i18n/translations";
import styles from "../styles/appStyles";
import {
  detectRole,
  isAadhaarValid,
  isContactValid,
  isEmailValid,
  isLokosValid,
  isPasswordStrong
} from "../utils/appCalculations";
import {
  fetchGpsByBlock,
  fetchVillagesByGp,
  loginUser,
  submitCrpSignup
} from "../services/masterApi";
import {
  loginSuccess,
  setAuthError,
  logout,
  signupStart,
  signupSuccess,
  signupFailure,
  clearSignupError,
  setLanguage
} from "../store/authSlice";

const USER_STORAGE_KEY = "trlmUserProfile";
const USER_DIRECTORY_KEY = "trlmUserProfilesByIdentity";
const STATIC_HONORARIUM_PER_VISIT = 150;
const STATIC_LAST_HONORARIUM_RECEIVED = 1200;
const ASSIGNED_SHG_MEMBERS = [
  {
    id: "asg-1",
    shgName: "Maa Tripura SHG",
    memberName: "Anita Debbarma",
    latitude: null,
    longitude: null,
    village: "Udaipur"
  },
  {
    id: "asg-2",
    shgName: "Laxmi SHG",
    memberName: "Rina Tripura",
    latitude: null,
    longitude: null,
    village: "Matabari"
  },
  {
    id: "asg-3",
    shgName: "Asha SHG",
    memberName: "Bina Reang",
    latitude: null,
    longitude: null,
    village: "Killa"
  }
];
const EMPTY_SESSION_INFO = {
  isActive: false,
  loginAt: "",
  logoutAt: "",
  elapsedSeconds: 0
};

export default function AppRouter() {
  const [step, setStep] = useState("splash");
  const [activeTab, setActiveTab] = useState("Home");
  const [homeView, setHomeView] = useState("dashboard");

  const [loginForm, setLoginForm] = useState({
    idType: "",
    identity: "",
    password: ""
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    uid: "",
    lokosId: "",
    district: "",
    districtId: "",
    block: "",
    blockId: "",
    gpId: "",
    villageId: "",
    gpVc: [],
    villages: [],
    password: "",
    confirmPassword: "",
    contactNo: "",
    email: "",
    crpTypes: "",
    shgId: "",
    pictureFile: ""
  });

  const [user, setUser] = useState({
    identity: "",
    role: "",
    name: "",
    block: "",
    blockId: "",
    gpId: "",
    villageId: "",
    gpVcName: "",
    villageName: "",
    language: ""
  });

  const [workingReport, setWorkingReport] = useState({
    amountReceived: String(STATIC_LAST_HONORARIUM_RECEIVED),
    lastReceivedDate: new Date().toISOString().slice(0, 10),
    submitted: false
  });

  const [alerts, setAlerts] = useState([]);
  const [assignedShgMembers, setAssignedShgMembers] = useState(ASSIGNED_SHG_MEMBERS);
  const [sessionInfo, setSessionInfo] = useState(EMPTY_SESSION_INFO);
  const dispatch = useDispatch();
  const signupStatus = useSelector((state) => state.auth.signupStatus);
  const signupError = useSelector((state) => state.auth.signupError);
  const language = useSelector((state) => state.auth.language);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedLanguage, savedUserProfile] = await Promise.all([
          AsyncStorage.getItem("selectedLanguage"),
          AsyncStorage.getItem(USER_STORAGE_KEY)
        ]);

        if (savedLanguage) {
          dispatch(setLanguage(savedLanguage));
        }

        if (savedUserProfile) {
          setUser((prev) => ({
            ...prev,
            ...JSON.parse(savedUserProfile)
          }));
        }
      } catch (error) {
        console.error("Error loading saved app preferences:", error);
      }
    };

    loadPreferences();
  }, [dispatch]);

  useEffect(() => {
    if (!sessionInfo.isActive || !sessionInfo.loginAt) {
      return undefined;
    }

    const timer = setInterval(() => {
      const loginTime = new Date(sessionInfo.loginAt).getTime();
      setSessionInfo((prev) => ({
        ...prev,
        elapsedSeconds: Math.max(0, Math.floor((Date.now() - loginTime) / 1000))
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionInfo.isActive, sessionInfo.loginAt]);

  const persistUserProfile = async (profile) => {
    try {
      const identityKey = String(profile?.identity || "").trim().toUpperCase();
      const existingDirectoryRaw = await AsyncStorage.getItem(USER_DIRECTORY_KEY);
      const existingDirectory = existingDirectoryRaw
        ? JSON.parse(existingDirectoryRaw)
        : {};
      const updatedDirectory = identityKey
        ? {
            ...existingDirectory,
            [identityKey]: profile
          }
        : existingDirectory;

      await Promise.all([
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile)),
        AsyncStorage.setItem(USER_DIRECTORY_KEY, JSON.stringify(updatedDirectory))
      ]);
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  };

  const getStoredProfileByIdentity = async (identity) => {
    try {
      const identityKey = String(identity || "").trim().toUpperCase();
      if (!identityKey) {
        return null;
      }

      const existingDirectoryRaw = await AsyncStorage.getItem(USER_DIRECTORY_KEY);
      const existingDirectory = existingDirectoryRaw
        ? JSON.parse(existingDirectoryRaw)
        : {};

      return existingDirectory?.[identityKey] || null;
    } catch (error) {
      console.error("Error loading stored user profile:", error);
      return null;
    }
  };

  const handleSetLanguage = async (selectedLanguage) => {
    dispatch(setLanguage(selectedLanguage));
    try {
      await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };
  const [pendingApprovalCrpId, setPendingApprovalCrpId] = useState("");
  const [signupApiModal, setSignupApiModal] = useState({
    visible: false,
    title: "",
    message: ""
  });

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setStep("language"), 1800);
    return () => clearTimeout(timer);
  }, []);

  const t = (text) => translateText(language, text);
  const formatSessionDuration = (totalSeconds) => {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };
  const extractCrpId = (value) => {
    const text = typeof value === "string" ? value : "";
    const match = text.match(/CRP-\d+/i);
    return match ? match[0].toUpperCase() : "";
  };

  const extractIdentity = (payload, fallbackIdentity) => {
    const message = typeof payload?.message === "string" ? payload.message : "";

    return (
      payload?.crpId ||
      payload?.CRPId ||
      payload?.masterId ||
      payload?.MasterId ||
      payload?.userId ||
      payload?.UserId ||
      payload?.id ||
      payload?.Id ||
      extractCrpId(message) ||
      fallbackIdentity
    );
  };

  const extractEntityId = (payload, keys = []) =>
    keys
      .map((key) => payload?.[key])
      .find((value) => value !== undefined && value !== null && value !== "");

  const resolveMappedName = async (loader, parentId, targetId) => {
    if (!parentId || !targetId) {
      return "";
    }

    try {
      const options = await loader(parentId);
      const matched = options.find(
        (item) => String(item.id) === String(targetId)
      );
      return matched?.name || "";
    } catch (error) {
      console.warn("Unable to resolve mapped name:", error);
      return "";
    }
  };

  const isApprovalPendingStatus = (payload) => {
    const statusText = String(
      payload?.status || payload?.approvalStatus || payload?.message || ""
    ).toLowerCase();

    return (
      statusText.includes("pending") ||
      statusText.includes("awaiting approval") ||
      statusText.includes("approval")
    );
  };

  const dashboardMetrics = useMemo(() => {
    const totalVisits30 = activities.length;
    const totalMembersVisited = new Set(
      activities.map((item) => item.memberName).filter(Boolean)
    ).size;
    const attendanceDays = new Set(
      activities.map((item) => item.reportDate).filter(Boolean)
    ).size;
    const today = new Date().toISOString().slice(0, 10);
    const totalMembersVisitedToday = new Set(
      activities
        .filter((item) => item.reportDate === today)
        .map((item) => item.memberName)
        .filter(Boolean)
    ).size;
    const honorariumToBeClaimed = totalVisits30 * STATIC_HONORARIUM_PER_VISIT;

    return {
      totalVisits30,
      totalMembersVisited,
      totalMembersVisitedToday,
      attendanceDays,
      honorariumToBeClaimed,
      shgMembersAssigned: assignedShgMembers.length,
      honorariumReceived: STATIC_LAST_HONORARIUM_RECEIVED,
      visitGraph: [0, 0, 0, 0, 0, 0],
      activityGraph: [0, 0, 0, 0, 0, 0]
    };
  }, [activities, assignedShgMembers.length]);

  const onLogin = async () => {
    if (!loginForm.identity || !loginForm.password) {
      Alert.alert(t("Login error"), t("Please enter Master ID/CRP ID and Password."));
      return;
    }

    if (
      pendingApprovalCrpId &&
      loginForm.identity.trim().toUpperCase() === pendingApprovalCrpId.toUpperCase()
    ) {
      Alert.alert(
        t("Approval pending"),
        t("Your CRP registration is submitted, but admin approval is still pending. Please wait for approval before logging in.")
      );
      return;
    }

    const selectedIdType = loginForm.idType || "CRP ID";
    if (selectedIdType !== "CRP ID") {
      Alert.alert(
        t("Login error"),
        t("Master ID login API is not connected yet. Please use CRP ID for now.")
      );
      return;
    }

    const identity = loginForm.identity.trim();
    const payload = {
      crpId: identity,
      passwordHash: loginForm.password
    };

    try {
      setLoginSubmitting(true);
      dispatch(setAuthError(""));
      const response = await loginUser(payload);

      if (isApprovalPendingStatus(response)) {
        Alert.alert(
          t("Approval pending"),
          t("Your account is still waiting for approval. Please try again after approval is completed.")
        );
        return;
      }

      const resolvedIdentity = extractIdentity(response, identity);
      const storedProfile = await getStoredProfileByIdentity(resolvedIdentity);
      const resolvedRole =
        response?.role || response?.userRole || response?.designation || detectRole(resolvedIdentity);
      const resolvedName =
        response?.name || response?.fullName || response?.userName || user.name || identity;
      const token = typeof response?.token === "string" ? response.token : "";
      const resolvedBlock =
        response?.block || response?.blockName || storedProfile?.block || user.block || "";
      const resolvedBlockId = extractEntityId(response, ["blockId", "BlockId"]);
      const resolvedGpId = extractEntityId(response, ["gpId", "GPId"]);
      const resolvedVillageId = extractEntityId(response, ["villageId", "VillageId"]);
      const fallbackGpName =
        response?.gpVcName ||
        response?.gpName ||
        response?.GPName ||
        storedProfile?.gpVcName ||
        user.gpVcName ||
        "";
      const fallbackVillageName =
        response?.villageName ||
        response?.VillageName ||
        response?.village ||
        storedProfile?.villageName ||
        user.villageName ||
        "";
      const [resolvedGpName, resolvedVillageName] = await Promise.all([
        fallbackGpName
          ? Promise.resolve(fallbackGpName)
          : resolveMappedName(fetchGpsByBlock, resolvedBlockId, resolvedGpId),
        fallbackVillageName
          ? Promise.resolve(fallbackVillageName)
          : resolveMappedName(fetchVillagesByGp, resolvedGpId, resolvedVillageId)
      ]);

      const nextUser = {
        identity: resolvedIdentity,
        role: resolvedRole,
        name: resolvedName,
        block: resolvedBlock,
        blockId: resolvedBlockId || storedProfile?.blockId || user.blockId || "",
        gpId: resolvedGpId || storedProfile?.gpId || user.gpId || "",
        villageId: resolvedVillageId || storedProfile?.villageId || user.villageId || "",
        gpVcName: resolvedGpName,
        villageName: resolvedVillageName,
        language,
        token
      };
      const loginAt = new Date().toISOString();
      const nextSessionInfo = {
        isActive: true,
        loginAt,
        logoutAt: "",
        elapsedSeconds: 0
      };
      const userWithSession = {
        ...nextUser,
        sessionStartedAt: loginAt,
        sessionEndedAt: "",
        lastSessionDurationSeconds: 0,
        lastSessionDurationLabel: formatSessionDuration(0),
        sessionActive: true
      };

      setSessionInfo(nextSessionInfo);
      setUser(userWithSession);
      persistUserProfile(userWithSession);
      dispatch(
        loginSuccess({
          crpId: resolvedIdentity,
          role: resolvedRole,
          token
        })
      );

      setActiveTab("Home");
      setHomeView("dashboard");
      setStep("dashboard");
    } catch (error) {
      dispatch(setAuthError(error.message || t("Unable to login right now.")));
      Alert.alert(t("Login error"), error.message || t("Unable to login right now."));
    } finally {
      setLoginSubmitting(false);
    }
  };

  const onSignup = async (generatedCrpId, currentLocation) => {
    dispatch(clearSignupError());
    if (!signupForm.name.trim()) {
      Alert.alert(t("Validation"), t("Name is required."));
      return;
    }

    if (!isAadhaarValid(signupForm.uid)) {
      Alert.alert(t("Validation"), t("UID (Aadhaar ID) must be exactly 12 digits."));
      return;
    }

    if (!isLokosValid(signupForm.lokosId)) {
      Alert.alert(t("Validation"), t("LokOS ID must be exactly 12 digits."));
      return;
    }

    if (!signupForm.district || !signupForm.block) {
      Alert.alert(t("Validation"), t("Select District and Block."));
      return;
    }

    if (signupForm.gpVc.length === 0 || signupForm.villages.length === 0) {
      Alert.alert(t("Validation"), t("Select GP/VC and Village Covered."));
      return;
    }

    if (!isPasswordStrong(signupForm.password)) {
      Alert.alert(t("Validation"), t("Password must include upper, lower, number, and special character (example: Aa@1)."));
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      Alert.alert(t("Validation"), t("Password and Confirm Password do not match."));
      return;
    }

    if (!isContactValid(signupForm.contactNo)) {
      Alert.alert(t("Validation"), t("Contact number must be 10 digits (+91)."));
      return;
    }

    if (!isEmailValid(signupForm.email)) {
      Alert.alert(t("Validation"), t("Enter a valid Email ID."));
      return;
    }

    if (!signupForm.crpTypes) {
      // Keep UI validation permissive until CRP type master API is wired.
    }

    if (!signupForm.pictureFile) {
      Alert.alert(t("Validation"), t("Please select a profile photo."));
      return;
    }

    const payload = {
      fullName: String(signupForm.name?.trim() || ""),
      aadhaarNo: String(signupForm.uid?.trim() || ""),
      lokOSId: String(signupForm.lokosId?.trim() || ""),
      villageId: Number(signupForm.villageId) || 0,
      blockId: Number(signupForm.blockId) || 0,
      contactNo: String(signupForm.contactNo || ""),
      emailId: String(signupForm.email?.trim().toLowerCase() || ""),
      password: String(signupForm.password || ""),
      crpTypeId: Number(signupForm.crpTypes) || 0,
      shgId: Number(signupForm.shgId) || 0,
      picturePath: String(signupForm.pictureFile || ""),
      latitude: Number(currentLocation?.latitude) || 0,
      longitude: Number(currentLocation?.longitude) || 0
    };

    const signupDebugPayload = {
      districtId: Number(signupForm.districtId) || 0,
      districtName: String(signupForm.district || ""),
      ...payload
    };

    console.log("CRP signup payload:", signupDebugPayload);

    try {
      dispatch(signupStart());
      const response = await submitCrpSignup(payload);
      console.log("CRP signup response:", response);
      const responseDump =
        typeof response === "string"
          ? response
          : JSON.stringify(response, null, 2);
      const responseMessage =
        typeof response === "string"
          ? response
          : response?.message ||
            response?.status ||
            response?.title ||
            response?.details ||
            "Going for Block Staff Approval";
      const createdIdentity =
        response?.crpId ||
        response?.CRPId ||
        response?.id ||
        response?.Id ||
        extractCrpId(responseMessage) ||
        generatedCrpId;

      const nextUser = {
        identity: createdIdentity,
        idType: "CRP ID",
        role: "CRP",
        name: signupForm.name,
        block: signupForm.block,
        blockId: signupForm.blockId,
        gpId: signupForm.gpId,
        villageId: signupForm.villageId,
        gpVcName: signupForm.gpVc.join(", "),
        villageName: signupForm.villages.join(", "),
        language
      };

      setUser(nextUser);
      persistUserProfile(nextUser);

      setPendingApprovalCrpId(createdIdentity);
      setLoginForm((prev) => ({
        ...prev,
        idType: "CRP ID",
        identity: createdIdentity,
        password: ""
      }));

      const signupSuccessMessage =
        extractCrpId(responseMessage)
          ? `${t("Generated CRP ID")}: ${createdIdentity}\n${t("Please wait for admin approval before logging in.")}`
          : responseMessage;

      dispatch(signupSuccess({ crpId: createdIdentity, message: signupSuccessMessage }));
      setSignupApiModal({
        visible: true,
        title: t("Signup API Response"),
        message:
          responseMessage === responseDump
            ? responseMessage
            : `${responseMessage}\n\n${responseDump}`
      });
      setHomeView("dashboard");
      setActiveTab("Home");
      setStep("login");
    } catch (error) {
      const errorMessage = error.message || t("Unable to create CRP ID.");
      dispatch(signupFailure(errorMessage));
      setSignupApiModal({
        visible: true,
        title: t("Signup API Response"),
        message: errorMessage
      });
    }
  };

  const onSubmitWorkingReport = (reportPayload) => {
    if (!reportPayload?.assignmentId || !reportPayload?.reportDate) {
      Alert.alert(t("Working Report"), t("Unable to submit working report right now."));
      return;
    }

    const alreadyReported = activities.some(
      (item) =>
        item.assignmentId === reportPayload.assignmentId &&
        item.reportDate === reportPayload.reportDate
    );

    if (alreadyReported) {
      Alert.alert(
        t("Working Report"),
        t("Attendance for this SHG member is already counted for today.")
      );
      return;
    }

    const assignment = assignedShgMembers.find(
      (item) => item.id === reportPayload.assignmentId
    );
    const nextActivity = {
      id: `ACT-${Date.now()}`,
      title: assignment
        ? `${assignment.shgName} - ${assignment.memberName}`
        : "CRP Field Visit",
      action: "Daily report submitted",
      membersVisited: 1,
      assignmentId: reportPayload.assignmentId,
      shgName: reportPayload.shgName,
      memberName: reportPayload.memberName,
      reportDate: reportPayload.reportDate,
      imageName: reportPayload.imageName,
      videoName: reportPayload.videoName,
      distanceMeters: reportPayload.distanceMeters
    };

    setActivities((prev) => [nextActivity, ...prev].slice(0, 30));
    setWorkingReport((prev) => ({
      ...prev,
      amountReceived: String(STATIC_LAST_HONORARIUM_RECEIVED),
      lastReceivedDate: reportPayload.reportDate,
      submitted: true
    }));
    setAlerts((prev) => prev.filter((item) => item.id !== "ALT-3"));
    Alert.alert(
      t("Working Report"),
      t("Working report submitted successfully. Attendance has been counted for today.")
    );
  };

  const onOpenWorkingReport = () => {
    setHomeView("workingReport");
    setActiveTab("Home");
  };

  const onLockAssignedShgLocation = (assignmentId, coords) => {
    if (!assignmentId || !coords) {
      return;
    }

    setAssignedShgMembers((prev) =>
      prev.map((item) =>
        item.id === assignmentId
          ? {
              ...item,
              latitude: Number(coords.latitude),
              longitude: Number(coords.longitude)
            }
          : item
      )
    );
  };

  const onOpenNewEnrolment = () => {
    setHomeView("newEnrolment");
    setActiveTab("Home");
  };

  const onOpenShgMember = () => {
    setHomeView("shgMember");
    setActiveTab("Home");
  };

  const onOpenLhCboActivity = (targetView = "lhCboActivity") => {
    setHomeView(targetView);
    setActiveTab("Home");
  };

  const onOpenUpdateData = (targetView = "dashboard") => {
    setHomeView(targetView);
    setActiveTab("Home");
  };

  const onLogout = () => {
    Alert.alert(t("Logout"), t("Are you sure you want to logout from this session?"), [
      {
        text: t("Cancel"),
        style: "cancel"
      },
      {
        text: t("Logout"),
        style: "destructive",
        onPress: async () => {
          const logoutAt = new Date().toISOString();
          const loginTime = sessionInfo.loginAt
            ? new Date(sessionInfo.loginAt).getTime()
            : Date.now();
          const elapsedSeconds = Math.max(
            0,
            Math.floor((new Date(logoutAt).getTime() - loginTime) / 1000)
          );
          const finalUserProfile = {
            ...user,
            sessionStartedAt: sessionInfo.loginAt || "",
            sessionEndedAt: logoutAt,
            lastSessionDurationSeconds: elapsedSeconds,
            lastSessionDurationLabel: formatSessionDuration(elapsedSeconds),
            sessionActive: false
          };

          setSessionInfo({
            isActive: false,
            loginAt: sessionInfo.loginAt || "",
            logoutAt,
            elapsedSeconds
          });
          setUser(finalUserProfile);

          dispatch(logout());
          try {
            await persistUserProfile(finalUserProfile);
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
          } catch (error) {
            console.error("Error clearing user profile:", error);
          }
          setStep("login");
          setHomeView("dashboard");
          setActiveTab("Home");
        }
      }
    ]);
  };

  return (
    <I18nProvider language={language}>
      <SafeAreaView style={styles.safe}>
      {step === "splash" ? <SplashScreen /> : null}

      {step === "language" ? (
        <LanguageScreen
          language={language}
          setLanguage={handleSetLanguage}
          onContinue={() => setStep("login")}
        />
      ) : null}

      {step === "login" ? (
      <LoginScreen
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          onLogin={onLogin}
          signupForm={signupForm}
          setSignupForm={setSignupForm}
          onSignup={onSignup}
          signupStatus={signupStatus}
          signupError={signupError}
          loginSubmitting={loginSubmitting}
          signupApiModal={signupApiModal}
          onCloseSignupApiModal={() =>
            setSignupApiModal({
              visible: false,
              title: "",
              message: ""
            })
          }
        />
      ) : null}

      {step === "dashboard" ? (
        <View style={styles.dashboardWrap}>
          <View pointerEvents="none" style={styles.dashboardGlowTop} />
          <View pointerEvents="none" style={styles.dashboardGlowBottom} />
          <View style={styles.dashboardContentShell}>
            <ScrollView contentContainerStyle={styles.screenPad}>
              {activeTab === "Home" ? (
                <DashboardHomeTab
                  user={user}
                  dashboardMetrics={dashboardMetrics}
                  workingReport={workingReport}
                  setWorkingReport={setWorkingReport}
                  onSubmitWorkingReport={onSubmitWorkingReport}
                  assignedShgMembers={assignedShgMembers}
                  onLockAssignedShgLocation={onLockAssignedShgLocation}
                  onOpenWorkingReport={onOpenWorkingReport}
                  onOpenShgMember={onOpenShgMember}
                  onOpenLhCboActivity={onOpenLhCboActivity}
                  onOpenNewEnrolment={onOpenNewEnrolment}
                  onOpenUpdateData={onOpenUpdateData}
                  alerts={alerts}
                  activities={activities}
                  homeView={homeView}
                  onBackToDashboard={() => setHomeView("dashboard")}
                />
              ) : null}
              {activeTab === "Profile" ? (
                <ProfileTab user={user} sessionInfo={sessionInfo} onLogout={onLogout} />
              ) : null}
            </ScrollView>
          </View>
          <BottomNav active={activeTab} setActive={setActiveTab} />
        </View>
      ) : null}
      </SafeAreaView>
    </I18nProvider>
  );
}
