import React, { useEffect, useMemo, useState } from "react";
import { Alert, SafeAreaView, ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../components/BottomNav";
import TrlmHeader from "../components/TrlmHeader";
import DashboardHomeTab from "../screens/tabs/DashboardHomeTab.js";
import LoanTab from "../screens/tabs/LoanTab";
import ProfileTab from "../screens/tabs/ProfileTab";
import LanguageScreen from "../screens/LanguageScreen";
import LoginScreen from "../screens/LoginScreen";
import SplashScreen from "../screens/SplashScreen";
import { I18nProvider } from "../i18n/I18nProvider";
import { translateText } from "../i18n/translations";
import styles from "../styles/appStyles";
import {
  calculateEmi,
  detectRole,
  isAadhaarValid,
  isContactValid,
  isEmailValid,
  isLokosValid,
  isPasswordStrong
} from "../utils/appCalculations";
import { loginUser, submitCrpSignup } from "../services/masterApi";
import {
  signupStart,
  signupSuccess,
  signupFailure,
  clearSignupError
} from "../store/authSlice";

export default function AppRouter() {
  const [step, setStep] = useState("splash");
  const [language, setLanguage] = useState("English");
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
    crpTypes: [],
    pictureFile: ""
  });

  const [user, setUser] = useState({
    identity: "",
    role: "",
    name: "",
    block: "",
    gpVcName: "",
    villageName: "",
    language: ""
  });

  const [workingReport, setWorkingReport] = useState({
    amountReceived: "",
    lastReceivedDate: "",
    submitted: false
  });

  const [alerts, setAlerts] = useState([]);
  const dispatch = useDispatch();
  const signupStatus = useSelector((state) => state.auth.signupStatus);
  const signupError = useSelector((state) => state.auth.signupError);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [pendingApprovalCrpId, setPendingApprovalCrpId] = useState("");

  const [activities] = useState([]);

  const [loan, setLoan] = useState({
    screen: "",
    amount: "",
    rate: "",
    duration: "",
    startDate: "",
    emiPaid: "",
    paymentDate: "",
    outstanding: "0",
    daysDelayed: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => setStep("language"), 1800);
    return () => clearTimeout(timer);
  }, []);

  const t = (text) => translateText(language, text);
  const homeViewTitles = {
    dashboard: {
      title: "Field Dashboard",
      subtitle: "Review your village activity, claims, and pending work."
    },
    workingReport: {
      title: "Working Report",
      subtitle: "Track visits, honorarium, and monthly report submission."
    },
    newEnrolment: {
      title: "New Enrolment",
      subtitle: "Capture beneficiary onboarding details in the field."
    },
    shgMember: {
      title: "SHG Member Visit",
      subtitle: "Update member support details with live location checks."
    },
    lhCboActivity: {
      title: "LH-CBO Activity",
      subtitle: "Record activity updates, evidence, and geo-validated visits."
    }
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
    const totalMembersVisited = activities.reduce(
      (sum, item) => sum + item.membersVisited,
      0
    );
    const honorariumToBeClaimed = totalVisits30 * 150;

    return {
      totalVisits30,
      totalMembersVisited,
      honorariumToBeClaimed,
      shgMembersAssigned: 0,
      honorariumReceived: workingReport.amountReceived || 0,
      visitGraph: [0, 0, 0, 0, 0, 0],
      activityGraph: [0, 0, 0, 0, 0, 0]
    };
  }, [activities, workingReport.amountReceived]);

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
      passwordhash: loginForm.password
    };

    try {
      setLoginSubmitting(true);
      const response = await loginUser(payload);

      if (isApprovalPendingStatus(response)) {
        Alert.alert(
          t("Approval pending"),
          t("Your account is still waiting for approval. Please try again after approval is completed.")
        );
        return;
      }

      const resolvedIdentity = extractIdentity(response, identity);
      const resolvedRole =
        response?.role || response?.userRole || response?.designation || detectRole(resolvedIdentity);
      const resolvedName =
        response?.name || response?.fullName || response?.userName || user.name || identity;

      setUser({
        identity: resolvedIdentity,
        role: resolvedRole,
        name: resolvedName,
        block: response?.block || response?.blockName || user.block || "",
        gpVcName: response?.gpVcName || response?.gpName || user.gpVcName || "",
        villageName:
          response?.villageName || response?.village || user.villageName || "",
        language
      });

      setActiveTab("Home");
      setHomeView("dashboard");
      setStep("dashboard");
    } catch (error) {
      Alert.alert(t("Login error"), error.message || t("Unable to login right now."));
    } finally {
      setLoginSubmitting(false);
    }
  };

  const onSignup = async (generatedCrpId, currentLocation) => {
    setSignupResponse({ type: "", message: "" });
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

    if (signupForm.crpTypes.length === 0) {
      // Keep UI validation permissive until CRP type master API is wired.
    }

    if (!signupForm.pictureFile) {
      Alert.alert(t("Validation"), t("Please select a profile photo."));
      return;
    }

    const payload = {
      fullName: signupForm.name.trim(),
      aadhaarNo: signupForm.uid.trim(),
      lokoSId: signupForm.lokosId.trim(),
      villageId: Number(signupForm.villageId) || 0,
      blockId: Number(signupForm.blockId) || 0,
      contactNo: signupForm.contactNo,
      emailId: signupForm.email,
      password: signupForm.password,
      crpTypeId: Number(signupForm.crpTypes[0]) || 0,
      shgId: 0,
      picturePath: signupForm.pictureFile,
      latitude: Number(currentLocation?.latitude) || 0,
      longitude: Number(currentLocation?.longitude) || 0
    };

    try {
      setSignupSubmitting(true);
      const response = await submitCrpSignup(payload);
      const responseMessage =
        typeof response?.message === "string"
          ? response.message
          : typeof response === "string"
            ? response
            : "";
      const createdIdentity =
        response?.crpId ||
        response?.CRPId ||
        response?.id ||
        response?.Id ||
        extractCrpId(responseMessage) ||
        generatedCrpId;

      setUser({
        identity: createdIdentity,
        idType: "CRP ID",
        role: "CRP",
        name: signupForm.name,
        block: signupForm.block,
        gpVcName: signupForm.gpVc.join(", "),
        villageName: signupForm.villages.join(", "),
        language
      });

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
          : responseMessage || `${t("Generated CRP ID")}: ${createdIdentity}`;

      setSignupResponse({
        type: "success",
        message: signupSuccessMessage
      });

      Alert.alert(
        t("Registration submitted"),
        signupSuccessMessage
      );
      setHomeView("dashboard");
      setActiveTab("Home");
      setStep("login");
    } catch (error) {
      setSignupResponse({
        type: "error",
        message: error.message || t("Unable to create CRP ID.")
      });
      Alert.alert(t("Signup error"), error.message || t("Unable to create CRP ID."));
    } finally {
      setSignupSubmitting(false);
    }
  };

  const onSubmitWorkingReport = () => {
    if (!workingReport.amountReceived || !workingReport.lastReceivedDate) {
      Alert.alert(t("Working Report"), t("Enter amount received and last honorarium received date before submission."));
      return;
    }

    setWorkingReport((prev) => ({ ...prev, submitted: true }));
    setAlerts((prev) => prev.filter((item) => item.id !== "ALT-3"));
    Alert.alert(t("Working Report"), t("Working report submitted successfully."));
  };

  const onOpenWorkingReport = () => {
    setHomeView("workingReport");
    setActiveTab("Home");
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

  const onSaveLoan = () => {
    const outstanding =
      calculateEmi(loan.amount, loan.rate, loan.duration) *
      (Number(loan.duration) || 0);
    setLoan((prev) => ({ ...prev, outstanding: outstanding.toFixed(2) }));
    Alert.alert(t("Loan saved"), t("Loan details saved with EMI calculation."));
  };

  const onRepay = () => {
    const paid = Number(loan.emiPaid) || 0;
    const current = Number(loan.outstanding) || 0;
    const next = Math.max(current - paid, 0);

    setLoan((prev) => ({ ...prev, outstanding: next.toFixed(2), emiPaid: "" }));
    Alert.alert(t("Updated"), t("Repayment marked as paid."));
  };

  const onNotify = () => {
    Alert.alert(t("Admin notified"), t("Overdue loan alert sent to admin."));
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
        onPress: () => {
          setStep("login");
          setHomeView("dashboard");
          setActiveTab("Home");
        }
      }
    ]);
  };

  const currentHeaderCopy = useMemo(() => {
    if (activeTab === "Home") {
      return homeViewTitles[homeView] || homeViewTitles.dashboard;
    }

    if (activeTab === "Loan") {
      return {
        title: loan.screen || "Loan Services",
        subtitle: "Manage loan creation, repayment updates, and alerts."
      };
    }

    return {
      title: "Profile",
      subtitle: "View your assigned role, language, and session details."
    };
  }, [activeTab, homeView, loan.screen]);

  const headerBadge = user.name
    ? `${user.name}${user.identity ? ` - ${user.identity}` : ""}`
    : user.identity || "TRLM Field Session";

  return (
    <I18nProvider language={language}>
      <SafeAreaView style={styles.safe}>
      {step === "splash" ? <SplashScreen /> : null}

      {step === "language" ? (
        <LanguageScreen
          language={language}
          setLanguage={setLanguage}
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
        />
      ) : null}

      {step === "dashboard" ? (
        <View style={styles.dashboardWrap}>
          <View style={styles.dashboardHeaderWrap}>
            <View style={styles.languageTopBand} />
            <TrlmHeader
              title={currentHeaderCopy.title}
              subtitle={currentHeaderCopy.subtitle}
              badge={headerBadge}
              showLogout
              onLogout={onLogout}
              compact
            />
          </View>
          <ScrollView contentContainerStyle={styles.screenPad}>
            {activeTab === "Home" ? (
              <DashboardHomeTab
                user={user}
                dashboardMetrics={dashboardMetrics}
                workingReport={workingReport}
                setWorkingReport={setWorkingReport}
                onSubmitWorkingReport={onSubmitWorkingReport}
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
            {activeTab === "Loan" ? (
              <LoanTab
                loan={loan}
                setLoan={setLoan}
                onSaveLoan={onSaveLoan}
                onRepay={onRepay}
                onNotify={onNotify}
              />
            ) : null}
            {activeTab === "Profile" ? (
              <ProfileTab user={user} onLogout={onLogout} />
            ) : null}
          </ScrollView>
          <BottomNav active={activeTab} setActive={setActiveTab} />
        </View>
      ) : null}
      </SafeAreaView>
    </I18nProvider>
  );
}






