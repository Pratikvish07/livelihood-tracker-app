import React, { useEffect, useMemo, useState } from "react";
import { Alert, SafeAreaView, ScrollView, View } from "react-native";
import BottomNav from "../components/BottomNav";
import DashboardHomeTab from "../screens/tabs/DashboardHomeTab.js";
import LoanTab from "../screens/tabs/LoanTab";
import ProfileTab from "../screens/tabs/ProfileTab";
import ReportsTab from "../screens/tabs/ReportsTab";
import ShgVisitTab from "../screens/tabs/ShgVisitTab";
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
  isJpegFile,
  isLokosValid,
  isPasswordStrong
} from "../utils/appCalculations";

export default function AppRouter() {
  const [step, setStep] = useState("splash");
  const [language, setLanguage] = useState("English");
  const [activeTab, setActiveTab] = useState("Home");
  const [homeView, setHomeView] = useState("dashboard");
  const [reportsFlowPreset, setReportsFlowPreset] = useState("Update Data");

  const [loginForm, setLoginForm] = useState({
    idType: "CRP ID",
    identity: "Pratik-id",
    password: "Pratik"
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    uid: "",
    lokosId: "",
    district: "",
    block: "",
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
    role: "CRP",
    name: "",
    block: "Block A",
    gpVcName: "GP-A",
    villageName: "Village 1",
    language: "English"
  });

  const [workingReport, setWorkingReport] = useState({
    amountReceived: "",
    lastReceivedDate: "",
    submitted: false
  });

  const [alerts, setAlerts] = useState([
    { id: "ALT-1", type: "Pending", message: "2 field visits pending this week." },
    { id: "ALT-2", type: "Upcoming", message: "Livestock activity review due tomorrow." },
    { id: "ALT-3", type: "Upcoming", message: "Honorarium data submission due in 2 days." }
  ]);

  const [activities] = useState([
    {
      id: "ACT-1",
      title: "Farm Monitoring Visit",
      photo: "farm_visit_01.jpg",
      action: "Completed",
      membersVisited: 9,
      progress: 70,
      date: "2026-02-18"
    },
    {
      id: "ACT-2",
      title: "Pashu Sakhi Follow-up",
      photo: "pashu_followup_02.jpg",
      action: "In Progress",
      membersVisited: 6,
      progress: 45,
      date: "2026-02-15"
    },
    {
      id: "ACT-3",
      title: "SHG Enterprise Review",
      photo: "enterprise_review_03.jpg",
      action: "Completed",
      membersVisited: 11,
      progress: 85,
      date: "2026-02-10"
    }
  ]);

  const [shgState, setShgState] = useState({
    screen: "list",
    search: "",
    block: "All",
    village: "All",
    selectedId: "SHG-101",
    visitStarted: false,
    timestamp: "",
    distance: 72,
    photoCaptured: false,
    remarks: ""
  });

  const [loan, setLoan] = useState({
    screen: "Add Loan",
    amount: "",
    rate: "12",
    duration: "12",
    startDate: "2026-02-20",
    emiPaid: "",
    paymentDate: "",
    outstanding: "0",
    daysDelayed: 9
  });

  useEffect(() => {
    const timer = setTimeout(() => setStep("language"), 1800);
    return () => clearTimeout(timer);
  }, []);

  const t = (text) => translateText(language, text);

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
      shgMembersAssigned: 42,
      honorariumReceived: workingReport.amountReceived || 0,
      visitGraph: [3, 5, 4, 6, 7, 8],
      activityGraph: [18, 22, 25, 20, 28, 30]
    };
  }, [activities, workingReport.amountReceived]);

  const onLogin = () => {
    if (!loginForm.identity || !loginForm.password) {
      Alert.alert(t("Login error"), t("Please enter Master ID/CRP ID and Password."));
      return;
    }

    setUser({
      identity: loginForm.identity,
      idType: loginForm.idType,
      role: detectRole(loginForm.identity),
      name: "Existing User",
      block: "Block A",
      gpVcName: "GP-A",
      villageName: "Village 1",
      language
    });

    setHomeView("dashboard");
    setStep("dashboard");
  };

  const onSignup = (generatedCrpId) => {
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
      Alert.alert(t("Validation"), t("Select at least one CRP Type."));
      return;
    }

    if (!isJpegFile(signupForm.pictureFile)) {
      Alert.alert(t("Validation"), t("Upload picture must be .jpeg or .jpg."));
      return;
    }

    setUser({
      identity: generatedCrpId,
      idType: "CRP ID",
      role: "CRP",
      name: signupForm.name,
      block: signupForm.block,
      gpVcName: signupForm.gpVc.join(", "),
      villageName: signupForm.villages.join(", "),
      language
    });

    Alert.alert(t("CRP ID Created"), `${t("Generated CRP ID")}: ${generatedCrpId}`);
    setHomeView("dashboard");
    setStep("dashboard");
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

  const onOpenLhCboActivity = () => {
    setHomeView("lhCboActivity");
    setActiveTab("Home");
  };

  const onOpenUpdateData = () => {
    setHomeView("dashboard");
    setReportsFlowPreset("Update Data");
    setActiveTab("Reports");
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
            {activeTab === "SHG" ? (
              <ShgVisitTab shgState={shgState} setShgState={setShgState} />
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
            {activeTab === "Reports" ? (
              <ReportsTab
                user={user}
                alerts={alerts}
                activities={activities}
                flowPreset={reportsFlowPreset}
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
