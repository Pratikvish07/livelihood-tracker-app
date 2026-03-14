import React, { useEffect, useMemo, useState } from "react";
import { Alert, SafeAreaView, ScrollView, View } from "react-native";
import BottomNav from "../components/BottomNav";
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
import { submitCrpSignup } from "../services/masterApi";

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
  const [signupSubmitting, setSignupSubmitting] = useState(false);
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
  const extractCrpId = (value) => {
    const text = typeof value === "string" ? value : "";
    const match = text.match(/CRP-\d+/i);
    return match ? match[0].toUpperCase() : "";
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

  const onLogin = () => {
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

    Alert.alert(
      t("Login API required"),
      t("Dashboard access is blocked until the real login and approval-check API is connected.")
    );
  };

  const onSignup = async (generatedCrpId, currentLocation) => {
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
      aadhaarNo: signupForm.uid,
      lokOSId: signupForm.lokosId,
      villageId: Number(signupForm.villageId) || 0,
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

      Alert.alert(
        t("Registration submitted"),
        extractCrpId(responseMessage)
          ? `${t("Generated CRP ID")}: ${createdIdentity}\n${t("Please wait for admin approval before logging in.")}`
          : responseMessage || `${t("Generated CRP ID")}: ${createdIdentity}`
      );
      setHomeView("dashboard");
      setActiveTab("Home");
      setStep("login");
    } catch (error) {
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
    setStep("login");
    setHomeView("dashboard");
    setActiveTab("Home");
  };

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
          signupSubmitting={signupSubmitting}
        />
      ) : null}

      {step === "dashboard" ? (
        <View style={styles.dashboardWrap}>
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
