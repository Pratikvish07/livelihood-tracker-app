import React, { useEffect, useMemo, useState } from "react";
import PostCheckoutModal from "./PostCheckoutModal";
import { Alert, Image, Modal, Platform, Pressable, ScrollView, Text as RNText, TextInput as RNTextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslatedValue } from "../../i18n/I18nProvider";
import { getCurrentLocation, calculateDistance } from "../../utils/geofence";
import { fetchActivities, fetchAllCrps, fetchGpsByBlock, fetchShgMembersByVillage, fetchSubCategoriesByActivity, fetchVillagesByGp } from "../../services/masterApi";
import { pageStyles, wrStyles, neStyles, smStyles, flowStyles, apStyles, nfStyles, tsCardStyles, tsDetailStyles, fsStyles, pastStyles, txnStyles, lhcboStyles, lhGuideStyles, lhcboStatusStyles, lhStyles } from "../../styles/dashboardHomeStyles";

function Text({ children, ...props }) {
  const plainText = typeof children === "string" || typeof children === "number"
    ? String(children)
    : "";
  const translated = useTranslatedValue(plainText);
  const resolvedChildren =
    plainText && typeof translated === "string" && translated.trim()
      ? translated
      : children;

  return <RNText {...props}>{resolvedChildren}</RNText>;
}

function TextInput({ placeholder, ...props }) {
  const translatedPlaceholder = useTranslatedValue(placeholder);
  const resolvedPlaceholder =
    typeof translatedPlaceholder === "string" && translatedPlaceholder.trim()
      ? translatedPlaceholder
      : placeholder;

  return <RNTextInput {...props} placeholder={resolvedPlaceholder} />;
}

function DropdownField({
  label,
  value,
  options,
  open,
  onToggle,
  onSelect
}) {
  const normalizedOptions = options.map((item) =>
    typeof item === "string"
      ? { id: item, name: item, rawValue: item }
      : { id: item.id, name: item.name, rawValue: item }
  );

  return (
    <View style={smStyles.fieldRow}>
      <Text style={smStyles.fieldLabel}>{label}</Text>
      <Pressable style={smStyles.dropdownTrigger} onPress={onToggle}>
        <Text style={smStyles.dropdownTriggerText}>{value}</Text>
        <Text style={smStyles.dropdownArrow}>{open ? "^" : "v"}</Text>
      </Pressable>
      {open ? (
        <View style={smStyles.dropdownMenu}>
          {normalizedOptions.map((item) => (
            <Pressable
              key={`${item.id}-${item.name}`}
              style={[smStyles.dropdownItem, value === item.name && smStyles.dropdownItemActive]}
              onPress={() => onSelect(item.rawValue)}
            >
              <Text
                style={[
                  smStyles.dropdownItemText,
                  value === item.name && smStyles.dropdownItemTextActive
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function CycleDropdown({ value, options, onChange, style }) {
  const [open, setOpen] = useState(false);
  const normalizedOptions = options.map((item) =>
    typeof item === "string" ? item : item?.name || item?.label || ""
  ).filter(Boolean);
  const displayValue = typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";

  return (
    <View style={flowStyles.ddWrap}>
      <Pressable
        style={[flowStyles.ddBox, style]}
        disabled={normalizedOptions.length === 0}
        onPress={() => {
          if (!normalizedOptions.length) {
            return;
          }
          setOpen((prev) => !prev);
        }}
      >
        <Text style={flowStyles.ddText}>{displayValue}</Text>
        <Text style={flowStyles.ddArrow}>{open ? "^" : "v"}</Text>
      </Pressable>

      {open ? (
        <View style={flowStyles.ddMenu}>
          <ScrollView nestedScrollEnabled style={flowStyles.ddScroll}>
            {normalizedOptions.map((option) => {
              const active = option === value;

              return (
                <Pressable
                  key={option}
                  style={[flowStyles.ddOption, active && flowStyles.ddOptionActive]}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[flowStyles.ddOptionText, active && flowStyles.ddOptionTextActive]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function firstOption(options) {
  const first = options[0];

  if (!first) {
    return "";
  }

  if (typeof first === "string" || typeof first === "number") {
    return String(first);
  }

  if (typeof first === "object") {
    return first.name || first.label || first.value || first.id || "";
  }

  return "";
}

function humanizeKey(key) {
  return String(key || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function formatIsoDateToDisplay(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}-${month}-${year}`;
}

function formatDisplayDateToIso(value) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const [day, month, year] = String(value).split("-");
  if (!day || !month || !year) {
    return "";
  }

  return `${year.padStart(4, "20")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function DateField({ value, placeholder, onPress, style, textStyle, placeholderStyle, iconStyle }) {
  return (
    <Pressable style={[tsDetailStyles.dateTrigger, style]} onPress={onPress}>
      <Text
        style={[
          tsDetailStyles.dateTriggerText,
          textStyle,
          !value && tsDetailStyles.datePlaceholderText,
          !value && placeholderStyle
        ]}
      >
        {value || placeholder}
      </Text>
      <Text style={[tsDetailStyles.dateTriggerIcon, iconStyle]}>Cal</Text>
    </Pressable>
  );
}

function DatePickerInput({ value, onChange }) {
  if (Platform.OS === "web") {
    return (
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          minHeight: "48px",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          color: "#111827",
          fontSize: "14px",
          padding: "12px",
          outline: "none",
          boxSizing: "border-box"
        }}
      />
    );
  }

  return (
    <RNTextInput
      style={tsDetailStyles.modalDateInput}
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor="#94a3b8"
    />
  );
}

function EditableSelect({ value, options, onChange, placeholder, inputStyle }) {
  const [open, setOpen] = useState(false);
  const normalizedOptions = options.map((item) =>
    typeof item === "string" ? item : item?.name || item?.label || ""
  ).filter(Boolean);
  const filteredOptions = normalizedOptions.filter((item) =>
    !value ? true : item.toLowerCase().includes(String(value).toLowerCase())
  );

  return (
    <View style={tsDetailStyles.selectWrap}>
      <RNTextInput
        style={[tsDetailStyles.selectInput, inputStyle]}
        value={value}
        onFocus={() => setOpen(true)}
        onChangeText={(text) => {
          onChange(text);
          setOpen(true);
        }}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
      />
      <Pressable style={tsDetailStyles.selectChevronWrap} onPress={() => setOpen((prev) => !prev)}>
        <Text style={tsDetailStyles.selectChevron}>{open ? "^" : "v"}</Text>
      </Pressable>

      {open && filteredOptions.length ? (
        <View style={tsDetailStyles.selectMenu}>
          <ScrollView nestedScrollEnabled style={tsDetailStyles.selectScroll}>
            {filteredOptions.map((option) => (
              <Pressable
                key={option}
                style={tsDetailStyles.selectOption}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <Text style={tsDetailStyles.selectOptionText}>{option}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const FARM_UNIT_AREA_OPTIONS = ["Kani", "Gonda"];
const FARM_TYPE_OPTIONS = ["Seasonal", "Perennial"];
const FARM_SEASON_OPTIONS = ["Rabi", "Kharif", "Summer", "Winter", "Rainy"];
const FARM_LAND_OPTIONS = ["Tilla", "Low", "Plain"];
const FARM_PRODUCTION_UNIT_OPTIONS = ["KG", "Quintal"];
const TRAINING_TRADE_OPTIONS = [
  "Tailoring",
  "Piggery",
  "Poultry",
  "Fishery",
  "Goat Rearing",
  "Mushroom Cultivation",
  "Handicraft"
];
const TRAINING_THROUGH_OPTIONS = [
  "TRLM",
  "RSETI",
  "KVK",
  "NGO",
  "Block Office",
  "Self Sponsored"
];
const SUPPORT_ACTIVITY_OPTIONS = [
  "Paddy Cultivation",
  "Vegetable Farming",
  "Piggery",
  "Poultry",
  "Fishery",
  "Goat Rearing"
];
const SUPPORT_SOURCE_OPTIONS = [
  "SHG Loan",
  "Bank Loan",
  "VO Support",
  "CLF Support",
  "Own Contribution"
];
const LIVELIHOOD_CBO_TYPE_OPTIONS = [
  "Producer Group (PG)",
  "Non-Farm Collective (NFC)",
  "Integrated Farming Cluster (IFC)",
  "Custom Hiring Center (CHC)",
  "Farmer Producer Company (FPC)"
];
const LIVELIHOOD_CBO_ACTIVITY_OPTIONS = [
  "Farming",
  "Livestock",
  "Fishery",
  "Enterprise"
];
const LIVELIHOOD_CBO_NAME_OPTIONS = {
  "Producer Group (PG)": [
    "PG Green Harvest",
    "PG Maa Laxmi",
    "PG Rural Producers"
  ],
  "Non-Farm Collective (NFC)": [
    "NFC Women Enterprise",
    "NFC Bamboo Craft Cluster",
    "NFC Village Value Group"
  ],
  "Integrated Farming Cluster (IFC)": [
    "IFC Sunrise Cluster",
    "IFC Tripura Farm Net",
    "IFC Green Field Circle"
  ],
  "Custom Hiring Center (CHC)": [
    "CHC Farm Equipment Hub",
    "CHC Rural Service Point",
    "CHC Mechanised Support Unit"
  ],
  "Farmer Producer Company (FPC)": [
    "FPC Agro Growth Ltd",
    "FPC Rural Harvest Producer Co",
    "FPC Tripura Farmer Collective"
  ]
};

function getLhCboTypeKey(type) {
  switch (type) {
    case "Producer Group (PG)":
      return "pg";
    case "Non-Farm Collective (NFC)":
      return "nfc";
    case "Integrated Farming Cluster (IFC)":
      return "ifc";
    case "Custom Hiring Center (CHC)":
      return "chc";
    case "Farmer Producer Company (FPC)":
      return "fpc";
    default:
      return "pg";
  }
}

export default function DashboardHomeTab({
  user,
  dashboardMetrics,
  workingReport,
  setWorkingReport,
  onSubmitWorkingReport,
  assignedShgMembers = [],
  onLockAssignedShgLocation,
  onOpenWorkingReport,
  onOpenShgMember,
  onOpenLhCboActivity,
  onOpenNewEnrolment,
  onOpenUpdateData,
  alerts,
  activities,
  homeView,
  onBackToDashboard,
  showPostCheckoutModal,
  setShowPostCheckoutModal,
  onLogout
}) {
  // Fixed buggy early return - modal now rendered conditionally in JSX
  const reportGeofenceRadius = 150;
  const [apiAssignedShgMembers, setApiAssignedShgMembers] = useState([]);
  const [showCrpTypeMenu, setShowCrpTypeMenu] = useState(false);
  const [activityOptions, setActivityOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [selectedCrpType, setSelectedCrpType] = useState(user.idType || "");
  const crpTypeOptions = [];
  const effectiveAssignedShgMembers =
    apiAssignedShgMembers.length > 0 ? apiAssignedShgMembers : assignedShgMembers;
  const shgNames = Array.from(
    new Set(effectiveAssignedShgMembers.map((item) => item.shgName).filter(Boolean))
  );
  const activityTypes = activityOptions.length ? activityOptions : [{ id: 1, name: "Farm" }];
  const subCategories = subCategoryOptions.length ? subCategoryOptions : [{ id: 1, name: "Farm" }];
  const livelihoodCboTypeOptions = LIVELIHOOD_CBO_TYPE_OPTIONS;
  const livelihoodCboActivityOptions = LIVELIHOOD_CBO_ACTIVITY_OPTIONS;
  const [shgName, setShgName] = useState(firstOption(shgNames));
  const shgMembers = effectiveAssignedShgMembers
    .filter((item) => !shgName || item.shgName === shgName)
    .map((item) => item.memberName);
  const [memberName, setMemberName] = useState(firstOption(shgMembers));
  const [activityType, setActivityType] = useState(firstOption(activityTypes));
  const [subCategory, setSubCategory] = useState(firstOption(subCategories));
  const [openShgDropdown, setOpenShgDropdown] = useState(false);
  const [openMemberDropdown, setOpenMemberDropdown] = useState(false);
  const [openActivityDropdown, setOpenActivityDropdown] = useState(false);
  const [openSubCategoryDropdown, setOpenSubCategoryDropdown] = useState(false);
  const [lhCboType, setLhCboType] = useState(firstOption(LIVELIHOOD_CBO_TYPE_OPTIONS));
  const [selectedLhCboName, setSelectedLhCboName] = useState(
    firstOption(LIVELIHOOD_CBO_NAME_OPTIONS[firstOption(LIVELIHOOD_CBO_TYPE_OPTIONS)] || [])
  );
  const [selectedLhCboActivity, setSelectedLhCboActivity] = useState(
    firstOption(LIVELIHOOD_CBO_ACTIVITY_OPTIONS)
  );
  const livelihoodCboNameOptions = LIVELIHOOD_CBO_NAME_OPTIONS[lhCboType] || [];
  const [lhCboImages, setLhCboImages] = useState([]);
  const [lhCboImageIndex, setLhCboImageIndex] = useState(0);
  const [memberBelongsToLhCbo, setMemberBelongsToLhCbo] = useState(false);
  const [lhCboName, setLhCboName] = useState("");
  const [distanceToMember, setDistanceToMember] = useState(null);
  const [isDistanceLoading, setIsDistanceLoading] = useState(false);
  const [locationPromptRequired, setLocationPromptRequired] = useState(false);
  const [currentCrpLocation, setCurrentCrpLocation] = useState(null);
  const [activityCoordinates, setActivityCoordinates] = useState(null);
  const [uploadedImageName, setUploadedImageName] = useState("");
  const [uploadedImageDate, setUploadedImageDate] = useState("");
  const [uploadedImageUri, setUploadedImageUri] = useState("");
  const [uploadedVideoName, setUploadedVideoName] = useState("");
  const [uploadedVideoDate, setUploadedVideoDate] = useState("");
  const [uploadedVideoUri, setUploadedVideoUri] = useState("");
  const [trackingRemarks, setTrackingRemarks] = useState("");
  const [supportStage, setSupportStage] = useState("");
  const [activityProfile, setActivityProfile] = useState({
    activityName: "",
    areaQuantity: "",
    areaUnit: "",
    activityMode: "",
    seasonality: "",
    period: "",
    landType: "",
    productionName: "",
    productionQty: "",
    productionUnit: "",
    totalLivestock: "",
    waterbodyArea: "",
    waterbodyType: ""
  });
  const [nonFarmEnterprise, setNonFarmEnterprise] = useState({
    enterpriseName: "",
    setupType: "",
    enterpriseLevel: "",
    signboardMounted: "",
    totalEmployment: "",
    marketLinked: "",
    gstNo: "",
    gstRenewalDate: "",
    panNo: "",
    panRenewalDate: "",
    udhyamNo: "",
    udhyamRenewalDate: "",
    fssaiNo: "",
    fssaiRenewalDate: "",
    tinNo: "",
    tinRenewalDate: ""
  });
  const [technicalSupportForm, setTechnicalSupportForm] = useState({
    havingSkillTraining: "",
    skillTrade: "",
    skillDate: "",
    skillThrough: "",
    havingEdpTraining: "",
    edpTrade: "",
    edpDate: "",
    edpThrough: "",
    trainingRequirement: "",
    trainingRequiredTrade: ""
  });
  const [trainingDatePicker, setTrainingDatePicker] = useState({
    visible: false,
    scope: "",
    field: "",
    title: "",
    value: ""
  });
  const [responsePopup, setResponsePopup] = useState({
    visible: false,
    badge: "Response",
    title: "",
    message: "",
    nextView: "",
    imageUri: ""
  });
  const [pgActivityProfileForm, setPgActivityProfileForm] = useState({
    primaryCommodity: "",
    trainingGovernance: "",
    trainingBooks: "",
    businessPlanPrepared: "",
    businessPlanSubmitted: "",
    fundReceivedFromNrlm: "",
    booksMaintained: "",
    dailyBusinessRegister: "",
    memberLedger: "",
    memberPassbook: "",
    assetRegister: ""
  });
  const [nfcActivityProfileForm, setNfcActivityProfileForm] = useState({
    productActivityDetails: "",
    setUpCategory: "",
    machineryProcured: "",
    signboardMounted: "",
    totalEmploymentAssociated: "",
    marketLinked: "",
    gst: "",
    gstRenewalDate: "",
    pan: "",
    panRenewalDate: "",
    tradeLicense: "",
    tradeRenewalDate: "",
    fssai: "",
    fssaiRenewDate: "",
    monthlyProductionVolume: "",
    volumeUnit: "",
    productionShed: "",
    homeBasedProduction: ""
  });
  const [chcDetailForm, setChcDetailForm] = useState({
    districtName: "",
    blockName: "",
    gpVcName: "",
    villageOrganizationName: "",
    chcName: "",
    establishedDate: "",
    establishedThroughConvergence: "",
    departmentAndScheme: "",
    separateBankAccount: "",
    bankAccountNumber: "",
    bankName: "",
    bankBranchName: "",
    amountFromTrlm: "",
    amountFromDepartment: "",
    availableMachineries: "",
    chcManagerDeployed: "",
    chcManagerName: "",
    chcManagerContact: "",
    totalIncomeSinceInception: "",
    totalExpenditureSinceInception: "",
    netProfitOrLoss: "",
    cashInHand: "",
    cashAtBank: ""
  });
  const [lhCboFinancialForms, setLhCboFinancialForms] = useState({
    pg: {
      totalWorkingCapitalReceived: "",
      totalInfrastructureFundReceived: "",
      totalFundReceivedFromOtherSource: "",
      otherSourceDetails: "",
      totalRepaymentDone: "",
      balanceFundToBeRepaid: ""
    },
    nfc: {
      totalWorkingCapitalApproved: "",
      totalWorkingCapitalUsed: "",
      totalRepaymentDone: "",
      balanceFundToBeRepaid: ""
    },
    ifc: {
      totalWorkingCapitalApproved: "",
      totalWorkingCapitalUsed: "",
      totalShareMoneyUsed: "",
      balanceFund: ""
    },
    fpc: {
      totalWorkingCapitalApproved: "",
      totalWorkingCapitalUsed: "",
      totalShareMoneyUsed: "",
      balanceFund: ""
    }
  });
  const [lhCboIncomeForms, setLhCboIncomeForms] = useState({
    pg: {
      totalIncomeSinceLastYear: "",
      totalIncomeUpToLastMonth: "",
      totalRecurringExpenditureLastMonth: "",
      netProfitUpToLastMonth: ""
    },
    nfc: {
      totalIncomeSinceLastYear: "",
      totalIncomeUpToLastMonth: "",
      totalRecurringExpenditureLastMonth: "",
      netProfitUpToLastMonth: ""
    },
    ifc: {
      totalIncomeSinceLastYear: "",
      totalIncomeUpToLastMonth: "",
      totalRecurringExpenditureLastMonth: "",
      netProfitUpToLastMonth: ""
    },
    fpc: {
      totalIncomeSinceLastYear: "",
      totalIncomeUpToLastMonth: "",
      totalRecurringExpenditureLastMonth: "",
      netProfitUpToLastMonth: ""
    }
  });
  const [financialSupportForm, setFinancialSupportForm] = useState({
    activityOfMember: "",
    financialSupportRequired: false,
    loanCyclePreferred: ""
  });
  const [pastSupportForm, setPastSupportForm] = useState({
    topActivity: "",
    topAmount: "",
    topLoanThrough: "",
    bottomActivity: "",
    bottomAmount: "",
    bottomLoanThrough: "",
    interestRate: "",
    repaymentCompleted: "",
    transactionStatus: ""
  });
  const [transactionDetailsForm, setTransactionDetailsForm] = useState({
    presentMonthLoanRepaymentStatus: "",
    paymentDetailsBy: "",
    paymentSlipName: "",
    paymentSlipUri: "",
    paymentSlipType: "",
    principalPaid: "",
    interestPaid: "",
    totalPaid: ""
  });
  const [investmentProfile, setInvestmentProfile] = useState({
    totalInvestment: "",
    loanFromShg: "",
    loanFromBank: "",
    individualFinancing: "",
    ownContribution: "",
    csr: "",
    governmentGrant: "",
    otherSource: ""
  });
  const [incomeProfile, setIncomeProfile] = useState({
    totalIncomeLastYear: "",
    presentMonthIncome: "",
    futureProjection: "",
    month1: "",
    month2: "",
    month3: "",
    month4: "",
    month5: "",
    month6: ""
  });

  // Graph page state
  const [graphType, setGraphType] = useState(null);
  const [graphImageFailed, setGraphImageFailed] = useState(false);
  const [gpOptions, setGpOptions] = useState([]);
  const [villageOptions, setVillageOptions] = useState([]);
  const [selectedGpId, setSelectedGpId] = useState(user.gpId || "");
  const [selectedVillageId, setSelectedVillageId] = useState(user.villageId || "");
  const [openGpSelector, setOpenGpSelector] = useState(false);
  const [openVillageSelector, setOpenVillageSelector] = useState(false);
  const [crpOptions, setCrpOptions] = useState([]);
  const [selectedCrpRegistrationId, setSelectedCrpRegistrationId] = useState("");
  const [openCrpSelector, setOpenCrpSelector] = useState(false);
  const [showDashboardAlerts, setShowDashboardAlerts] = useState(false);
  const [hasAutoShownDashboardAlerts, setHasAutoShownDashboardAlerts] = useState(false);
  const dashboardNotificationItems = alerts.length
    ? alerts.map((item) => item.message).filter(Boolean)
    : [
        "Type of CRP is still pending",
        "No of SHG Registeration is still pending",
      ];
  const dashboardAlertCount = dashboardNotificationItems.length;
  const firstDashboardNotification =
    dashboardNotificationItems[0] || "No pending alerts";
  const dashboardInlineAlertMessage =
    dashboardNotificationItems.length > 0
      ? dashboardNotificationItems.join(" | ")
      : "No pending alerts";
  const selectedAssignedMember =
    effectiveAssignedShgMembers.find(
      (item) => item.shgName === shgName && item.memberName === memberName
    ) ||
    effectiveAssignedShgMembers.find((item) => item.memberName === memberName) ||
    effectiveAssignedShgMembers[0] ||
    null;
  const selectedShgName = selectedAssignedMember?.shgName || shgName || "-";
  const selectedMemberName = selectedAssignedMember?.memberName || memberName || "-";

  const showResponsePopup = (title, message, nextView = "", badge = "Response") => {
    setResponsePopup({
      visible: true,
      badge,
      title,
      message,
      nextView,
      imageUri: ""
    });
  };

  const showResponsePopupWithImage = (
    title,
    message,
    nextView = "",
    badge = "Response",
    imageUri = ""
  ) => {
    setResponsePopup({
      visible: true,
      badge,
      title,
      message,
      nextView,
      imageUri
    });
  };

  const closeResponsePopup = () => {
    const nextView = responsePopup.nextView;

    setResponsePopup({
      visible: false,
      badge: "Response",
      title: "",
      message: "",
      nextView: "",
      imageUri: ""
    });

    if (nextView) {
      onOpenUpdateData(nextView);
    }
  };

  const renderResponsePopup = () => (
    <Modal
      animationType="fade"
      transparent
      visible={responsePopup.visible}
      onRequestClose={closeResponsePopup}
    >
      <View style={tsDetailStyles.modalOverlay}>
        <View style={tsDetailStyles.modalCard}>
          <View style={tsDetailStyles.modalBadge}>
            <Text style={tsDetailStyles.modalBadgeText}>{responsePopup.badge}</Text>
          </View>
          <Text style={tsDetailStyles.modalTitle}>{responsePopup.title}</Text>
          <View style={tsDetailStyles.modalContentCard}>
            <ScrollView style={tsDetailStyles.modalScroll} showsVerticalScrollIndicator={false}>
            {responsePopup.imageUri ? (
              <Image source={{ uri: responsePopup.imageUri }} style={tsDetailStyles.modalPreviewImage} />
            ) : null}
            <Text style={tsDetailStyles.modalMessage}>{responsePopup.message}</Text>
            </ScrollView>
          </View>
          <Pressable style={tsDetailStyles.modalPrimaryBtnWide} onPress={closeResponsePopup}>
            <Text style={tsDetailStyles.modalPrimaryBtnText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  const buildSaveSummary = (data) => {
    if (!data || typeof data !== "object") {
      return "No values entered yet.";
    }

    const lines = Object.entries(data)
      .filter(([, value]) => value !== "" && value !== null && value !== undefined)
      .map(([key, value]) => {
        const resolvedValue = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "boolean"
            ? value ? "Yes" : "No"
            : String(value);
        return `${humanizeKey(key)}: ${resolvedValue}`;
      });

    return lines.length ? lines.join("\n") : "No values entered yet.";
  };

  const showSavedDataPopup = (title, data, nextView = "") => {
    showResponsePopupWithImage(
      title,
      `${title} saved successfully.\n\n${buildSaveSummary(data)}`,
      nextView,
      "Saved",
      activeLhCboImage || uploadedImageUri || ""
    );
  };

  const buildFinancialSupportProjection = () => {
    if (!financialSupportForm.financialSupportRequired) {
      return "";
    }

    const cycleMatch = String(financialSupportForm.loanCyclePreferred || "").match(/(\d+)/);
    const cycleNumber = Number(cycleMatch?.[1] || 1);
    const principalMap = {
      1: 25000,
      2: 40000,
      3: 60000
    };
    const tenureMap = {
      1: 12,
      2: 18,
      3: 24
    };
    const principal = principalMap[cycleNumber] || 25000;
    const tenureMonths = tenureMap[cycleNumber] || 12;
    const roi = 8.75;
    const interestAmount = Number(((principal * roi * tenureMonths) / (12 * 100)).toFixed(2));
    const totalRepayable = Number((principal + interestAmount).toFixed(2));
    const monthlyInstallment = Number((totalRepayable / tenureMonths).toFixed(2));

    return [
      `Activity: ${financialSupportForm.activityOfMember || "-"}`,
      `Support Required: Yes`,
      `Preferred Cycle: ${financialSupportForm.loanCyclePreferred || "-"}`,
      "",
      `Loan Amount: Rs. ${principal}`,
      `Tenure for Returns: ${tenureMonths} months`,
      `ROI Fixed: ${roi}%`,
      `Interest Amount: Rs. ${interestAmount}`,
      `Total Repayable: Rs. ${totalRepayable}`,
      `Monthly Installment: Rs. ${monthlyInstallment}`
    ].join("\n");
  };

  const handleOpenTechnicalSupportModule = async (targetView, stageLabel = "") => {
    const meters = await checkRadiusDistance(false);
    const canProceed = meters !== null && meters <= 50;

    if (!canProceed) {
      showResponsePopup(
        "Geo Verification Required",
        "Enable location and get the green geo token before opening support modules."
      );
      return;
    }

    if (stageLabel) {
      setSupportStage(stageLabel);
    }
    onOpenUpdateData(targetView);
  };

  const openDatePicker = (scope, field, title, currentValue = "") => {
    setTrainingDatePicker({
      visible: true,
      scope,
      field,
      title,
      value: formatDisplayDateToIso(currentValue)
    });
  };

  const closeTrainingDatePicker = () => {
    setTrainingDatePicker({
      visible: false,
      scope: "",
      field: "",
      title: "",
      value: ""
    });
  };

  const confirmTrainingDatePicker = () => {
    if (!trainingDatePicker.field || !trainingDatePicker.value) {
      closeTrainingDatePicker();
      return;
    }

    const displayDate = formatIsoDateToDisplay(trainingDatePicker.value);
    if (trainingDatePicker.scope === "technicalSupport") {
      setTechnicalSupportForm((prev) => ({
        ...prev,
        [trainingDatePicker.field]: displayDate
      }));
    }
    if (trainingDatePicker.scope === "nonFarm") {
      setNonFarmEnterprise((prev) => ({
        ...prev,
        [trainingDatePicker.field]: displayDate
      }));
    }
    closeTrainingDatePicker();
    showResponsePopup("Date Selected", `${trainingDatePicker.title}: ${displayDate}`);
  };

  const renderAlertPopup = () =>
    showDashboardAlerts ? (
      <View style={[pageStyles.alertPopupOverlay, { pointerEvents: "box-none" }]}>
        <Pressable
          style={pageStyles.alertPopupCard}
          onPress={() => setShowDashboardAlerts(false)}
        >
          <View style={pageStyles.dashboardAlertHeader}>
            <View style={pageStyles.dashboardAlertIconWrap}>
              <RNText style={pageStyles.dashboardAlertIcon}>!</RNText>
            </View>
            <View style={pageStyles.dashboardAlertCopy}>
              <RNText style={pageStyles.dashboardAlertTitle}>Notifications</RNText>
              <RNText style={pageStyles.dashboardAlertHint}>{firstDashboardNotification}</RNText>
            </View>
            <View style={pageStyles.dashboardAlertBadge}>
              <RNText style={pageStyles.dashboardAlertBadgeText}>{dashboardAlertCount}</RNText>
            </View>
          </View>
          <View style={pageStyles.dashboardAlertList}>
            {dashboardNotificationItems.map((item, index) => (
              <View key={`${item}-${index}`} style={pageStyles.dashboardAlertListRow}>
                <View style={pageStyles.dashboardAlertListDot} />
                <RNText style={pageStyles.dashboardAlertListText}>{item}</RNText>
              </View>
            ))}
          </View>
        </Pressable>
      </View>
    ) : null;

  const handleGraphPress = (type) => {
    setGraphType(type);
    setGraphImageFailed(false);
  };

  const closeGraphView = () => {
    setGraphType(null);
  };

  const graphData = useMemo(
    () => ({
      visits: {
        title: "visits",
        values:
          Array.isArray(dashboardMetrics.visitGraph) && dashboardMetrics.visitGraph.length
            ? dashboardMetrics.visitGraph
            : [2, 3, 4, 2, 5, 2, 3],
        color: "#3b67b8"
      },
      members: {
        title: "members",
        values: [
          Number(dashboardMetrics.shgMembersAssigned || 0),
          Number(dashboardMetrics.totalMembersVisited || 0),
          Math.max(Number(dashboardMetrics.totalMembersVisitedToday || 0), 1),
          Math.max(
            Number(dashboardMetrics.shgMembersAssigned || 0) -
              Number(dashboardMetrics.totalMembersVisited || 0),
            0
          )
        ],
        color: "#0f766e"
      },
      honorarium: {
        title: "honorarium",
        values: [
          Number(dashboardMetrics.honorariumReceived || 0),
          Number(dashboardMetrics.honorariumToBeClaimed || 0),
          Math.max(Math.round(Number(dashboardMetrics.honorariumToBeClaimed || 0) * 0.1), 0)
        ],
        color: "#f97316"
      }
    }),
    [
      dashboardMetrics.honorariumReceived,
      dashboardMetrics.honorariumToBeClaimed,
      dashboardMetrics.shgMembersAssigned,
      dashboardMetrics.totalMembersVisited,
      dashboardMetrics.totalMembersVisitedToday,
      dashboardMetrics.visitGraph
    ]
  );

  const pieMetaByType = useMemo(
    () => ({
      visits: {
        title: "Visit Distribution (Last 30 days)",
        unit: "visits",
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        values: [
          graphData.visits.values[0] + graphData.visits.values[1],
          graphData.visits.values[2] + graphData.visits.values[3],
          graphData.visits.values[4] + graphData.visits.values[5],
          graphData.visits.values[6]
        ],
        colors: ["#2563eb", "#0f766e", "#f97316", "#9333ea"]
      },
      members: {
        title: "SHG Member Coverage",
        unit: "members",
        labels: ["Assigned", "Visited", "Revisit", "Pending"],
        values: [
          Number(dashboardMetrics.shgMembersAssigned || 0),
          Number(dashboardMetrics.totalMembersVisited || 0),
          0,
          0
        ],
        colors: ["#1d4ed8", "#0891b2", "#16a34a", "#f59e0b"]
      },
      honorarium: {
        title: "Honorarium Composition",
        unit: "amount",
        labels: ["Received", "To be Claimed", "Expected Bonus"],
        values: [
          Number(dashboardMetrics.honorariumReceived || 0),
          Number(dashboardMetrics.honorariumToBeClaimed || 0),
          0
        ],
        colors: ["#f97316", "#22c55e", "#3b82f6"]
      }
    }),
    [
      dashboardMetrics.honorariumReceived,
      dashboardMetrics.honorariumToBeClaimed,
      dashboardMetrics.shgMembersAssigned,
      dashboardMetrics.totalMembersVisited,
      dashboardMetrics.totalMembersVisitedToday,
      graphData
    ]
  );

  const selectedPieMeta = graphType ? pieMetaByType[graphType] : null;
  const selectedPieTotal = selectedPieMeta
    ? selectedPieMeta.values.reduce((sum, current) => sum + Math.max(0, Number(current) || 0), 0)
    : 0;
  const selectedGraphMax = selectedPieMeta
    ? Math.max(...selectedPieMeta.values.map((value) => Math.max(0, Number(value) || 0)), 1)
    : 1;

  const isWithin50Meters = distanceToMember !== null && distanceToMember <= 50;
  const geoStatusVariant =
    locationPromptRequired || distanceToMember === null
      ? "idle"
      : isWithin50Meters
        ? "green"
        : "red";
  const selectedGp =
    gpOptions.find((item) => String(item.id) === String(selectedGpId)) || null;
  const selectedVillage =
    villageOptions.find((item) => String(item.id) === String(selectedVillageId)) || null;
  const selectedCrpRecord =
    crpOptions.find((item) => String(item.id) === String(selectedCrpRegistrationId)) || null;
  const headerCrpId = selectedCrpRecord?.crpId || user.identity || "CRP-XXX";
  const headerCrpName = selectedCrpRecord?.fullName || user.name || "CRP User";
  const headerCrpInitials = String(headerCrpName || "CRP User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "CR";
  const dashboardDateLabel = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const dashboardHighlights = [
    {
      key: "visits",
      label: "Field Visits",
      value: dashboardMetrics.totalVisits30,
      hint: "Last 30 days",
      tint: "#295fd6"
    },
    {
      key: "members",
      label: "Members Visited",
      value: dashboardMetrics.totalMembersVisited,
      hint: "Coverage till today",
      tint: "#0f766e"
    },
    {
      key: "claim",
      label: "To Be Claimed",
      value: dashboardMetrics.honorariumToBeClaimed,
      hint: "Current honorarium",
      tint: "#f97316"
    },
    {
      key: "received",
      label: "Last Received",
      value: dashboardMetrics.honorariumReceived || 0,
      hint: "Previous credit",
      tint: "#7c3aed"
    }
  ];
  const effectiveBlockId = selectedCrpRecord?.blockId || user.blockId || "";
  const normalizedSubCategory =
    subCategory === "Non-Farm" ? "NonFarm" : subCategory;
  const statusBySubCategory = {
    Farm: "lhStatusFarm",
    NonFarm: "lhStatusNonFarm",
    Livestock: "lhStatusLivestock",
    Fishery: "lhStatusFishery"
  };
  const activityBySubCategory = {
    Farm: "lhActivityFarm",
    NonFarm: "lhActivityNonFarm",
    Livestock: "lhActivityLivestock",
    Fishery: "lhActivityFishery"
  };
  const currentStatusView = statusBySubCategory[normalizedSubCategory] || "lhStatusFarm";
  const selectedLhCboTypeKey = getLhCboTypeKey(lhCboType);
  const lhCboStatusViewByType = {
    "Producer Group (PG)": "lhCboStatusPg",
    "Non-Farm Collective (NFC)": "lhCboStatusNfc",
    "Integrated Farming Cluster (IFC)": "lhCboStatusIfc",
    "Custom Hiring Center (CHC)": "lhCboStatusChc",
    "Farmer Producer Company (FPC)": "lhCboStatusFpc"
  };
  const selectedLhCboStatusView = lhCboStatusViewByType[lhCboType] || "lhCboStatusPg";
  const activeLhCboImage =
    lhCboImages.length > 0 ? lhCboImages[Math.min(lhCboImageIndex, lhCboImages.length - 1)] : "";

  const checkRadiusDistance = async (silent = false) => {
    setIsDistanceLoading(true);
    setLocationPromptRequired(false);
    try {
      const current = await getCurrentLocation();
      if (!current) {
        setDistanceToMember(null);
        setCurrentCrpLocation(null);
        setLocationPromptRequired(true);
        if (!silent) {
          const locationHelp =
            Platform.OS === "web"
              ? "Allow browser location, ensure page is running in secure context (https/localhost), then tap Check 50m Radius again."
              : "Please enable device location permission and GPS, then tap Check 50m Radius again.";
          Alert.alert("Enable Location", locationHelp);
        }
        return null;
      }
      setCurrentCrpLocation(current);
      if (homeView === "workingReport" && selectedAssignedMember) {
        const hasLockedGeo =
          Number.isFinite(Number(selectedAssignedMember.latitude)) &&
          Number.isFinite(Number(selectedAssignedMember.longitude));

        if (!hasLockedGeo) {
          const lockedLocation = {
            latitude: current.latitude,
            longitude: current.longitude
          };

          setActivityCoordinates(lockedLocation);
          setDistanceToMember(0);
          onLockAssignedShgLocation?.(selectedAssignedMember.id, lockedLocation);
          if (!silent) {
            Alert.alert(
              "SHG Geolocation Locked",
              "Current device location has been locked for this assigned SHG. Next checks will compare against this point."
            );
          }
          return 0;
        }
      }
      if (!activityCoordinates) {
        const autoGeneratedLocation = {
          latitude: current.latitude,
          longitude: current.longitude
        };
        setActivityCoordinates(autoGeneratedLocation);
        setDistanceToMember(0);
        if (!silent) {
          Alert.alert(
            "Location Captured",
            "Longitude and latitude were auto-generated from current GPS location."
          );
        }
        return 0;
      }
      const meters = calculateDistance(
        current.latitude,
        current.longitude,
        activityCoordinates.latitude,
        activityCoordinates.longitude
      );
      const rounded = Math.round(meters);
      setDistanceToMember(rounded);
      return rounded;
    } finally {
      setIsDistanceLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    const meters = await checkRadiusDistance(false);
    if (meters === null) {
      Alert.alert(
        "Location Required",
        "Enable location and check radius before continuing."
      );
      return;
    }
    if (meters > 50) {
      Alert.alert(
        "Outside 50m Radius",
        `You are ${meters}m away. Move within 50m of the SHG member location to continue.`
      );
      return;
    }
    showSavedDataPopup(
      "SHG Member Details",
      {
        memberBelongsToLhCbo: memberBelongsToLhCbo ? "Yes" : "No",
        nameOfLhCbo: lhCboName || "Not provided",
        radiusStatus: `Within 50m (${meters}m)`,
        currentCrpLocation: currentCrpLocation
          ? `${currentCrpLocation.latitude.toFixed(6)}, ${currentCrpLocation.longitude.toFixed(6)}`
          : "Captured"
      },
      normalizedSubCategory === "Farm" ? "lhActivityFarm" : currentStatusView
    );
  };

  const handleLhCboSaveAndNext = async () => {
    const meters = await checkRadiusDistance(false);
    if (meters === null) {
      Alert.alert(
        "Location Required",
        "Enable location and check radius before continuing."
      );
      return;
    }
    if (meters > 50) {
      Alert.alert(
        "Outside 50m Radius",
        `You are ${meters}m away. Move within 50m of the activity location to continue.`
      );
      return;
    }
    onOpenUpdateData(selectedLhCboStatusView);
  };

  const handleLhCboGuideSaveAndNext = () => {
    onOpenUpdateData(selectedLhCboStatusView);
  };

  const handleProfileSave = (title, data, nextView = "") => {
    showSavedDataPopup(title, data, nextView);
  };

  const closeAllShgDropdowns = () => {
    setOpenShgDropdown(false);
    setOpenMemberDropdown(false);
    setOpenActivityDropdown(false);
    setOpenSubCategoryDropdown(false);
  };

  useEffect(() => {
    setActivityCoordinates(null);
    setDistanceToMember(null);
    setLocationPromptRequired(false);
    setCurrentCrpLocation(null);
  }, [memberName, homeView]);

  useEffect(() => {
    const hasSelectedShg = shgNames.some((item) => item === shgName);

    if ((!shgName || !hasSelectedShg) && shgNames.length > 0) {
      setShgName(shgNames[0]);
    }
  }, [shgName, shgNames]);

  useEffect(() => {
    const hasSelectedMember = shgMembers.some((item) => item === memberName);

    if ((!memberName || !hasSelectedMember) && shgMembers.length > 0) {
      setMemberName(shgMembers[0]);
    }
  }, [memberName, shgMembers]);

  useEffect(() => {
    if (!activityTypes.length) {
      return;
    }

    const hasSelectedActivity = activityTypes.some((item) => item.name === activityType);

    if (!activityType || !hasSelectedActivity) {
      setActivityType(activityTypes[0]?.name || "");
    }
  }, [activityType, activityTypes]);

  useEffect(() => {
    if (!subCategories.length) {
      return;
    }

    const hasSelectedSubCategory = subCategories.some((item) => item.name === subCategory);

    if (!subCategory || !hasSelectedSubCategory) {
      setSubCategory(subCategories[0]?.name || "");
    }
  }, [subCategory, subCategories]);

  useEffect(() => {
    if (!livelihoodCboTypeOptions.length) {
      return;
    }

    if (!livelihoodCboTypeOptions.includes(lhCboType)) {
      setLhCboType(livelihoodCboTypeOptions[0]);
    }
  }, [lhCboType, livelihoodCboTypeOptions]);

  useEffect(() => {
    if (!livelihoodCboNameOptions.length) {
      setSelectedLhCboName("");
      return;
    }

    if (!livelihoodCboNameOptions.includes(selectedLhCboName)) {
      setSelectedLhCboName(livelihoodCboNameOptions[0]);
    }
  }, [livelihoodCboNameOptions, selectedLhCboName]);

  useEffect(() => {
    if (!livelihoodCboActivityOptions.length) {
      return;
    }

    if (!livelihoodCboActivityOptions.includes(selectedLhCboActivity)) {
      setSelectedLhCboActivity(livelihoodCboActivityOptions[0]);
    }
  }, [livelihoodCboActivityOptions, selectedLhCboActivity]);

  useEffect(() => {
    setActivityProfile((prev) => ({
      ...prev,
      activityName: activityType || prev.activityName,
      productionName: subCategory || prev.productionName
    }));
  }, [activityType, subCategory]);

  useEffect(() => {
    if (homeView !== "lhActivityFarm") {
      return;
    }

    setActivityProfile((prev) => ({
      ...prev,
      areaUnit: prev.areaUnit || FARM_UNIT_AREA_OPTIONS[0],
      activityMode: prev.activityMode || FARM_TYPE_OPTIONS[0],
      seasonality: prev.seasonality || FARM_SEASON_OPTIONS[0],
      landType: prev.landType || FARM_LAND_OPTIONS[0],
      productionUnit: prev.productionUnit || FARM_PRODUCTION_UNIT_OPTIONS[0]
    }));
  }, [homeView]);

  useEffect(() => {
    if (homeView !== "workingReport" || !selectedAssignedMember) {
      return;
    }

    const hasLockedGeo =
      Number.isFinite(Number(selectedAssignedMember.latitude)) &&
      Number.isFinite(Number(selectedAssignedMember.longitude));

    if (!hasLockedGeo) {
      setActivityCoordinates(null);
      return;
    }

    setActivityCoordinates({
      latitude: selectedAssignedMember.latitude,
      longitude: selectedAssignedMember.longitude
    });
  }, [homeView, selectedAssignedMember]);

  useEffect(() => {
    setSelectedGpId(user.gpId || "");
    setSelectedVillageId(user.villageId || "");
  }, [user.gpId, user.villageId]);

  useEffect(() => {
    if (!gpOptions.length) {
      return;
    }

    const hasSelectedGp = gpOptions.some((item) => String(item.id) === String(selectedGpId));

    if (!hasSelectedGp) {
      setSelectedGpId(String(gpOptions[0].id));
    }
  }, [gpOptions, selectedGpId]);

  useEffect(() => {
    if (!villageOptions.length) {
      return;
    }

    const hasSelectedVillage = villageOptions.some(
      (item) => String(item.id) === String(selectedVillageId)
    );

    if (!hasSelectedVillage) {
      setSelectedVillageId(String(villageOptions[0].id));
    }
  }, [selectedVillageId, villageOptions]);

  useEffect(() => {
    if (!selectedVillageId) {
      setApiAssignedShgMembers([]);
      return;
    }

    let active = true;

    async function loadShgMembers() {
      try {
        const payload = await fetchShgMembersByVillage(selectedVillageId);

        if (active) {
          setApiAssignedShgMembers(payload);
        }
      } catch (error) {
        if (active) {
          setApiAssignedShgMembers([]);
        }
      }
    }

    loadShgMembers();

    return () => {
      active = false;
    };
  }, [selectedVillageId]);

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      try {
        const payload = await fetchActivities();

        if (active) {
          setActivityOptions(payload);
        }
      } catch (error) {
        if (active) {
          setActivityOptions([{ id: 1, name: "Farm" }]);
        }
      }
    }

    loadActivities();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const selectedActivity = activityTypes.find((item) => item.name === activityType);

    if (!selectedActivity?.id) {
      setSubCategoryOptions([{ id: 1, name: "Farm" }]);
      return;
    }

    let active = true;

    async function loadSubCategories() {
      try {
        const payload = await fetchSubCategoriesByActivity(selectedActivity.id);

        if (active) {
          setSubCategoryOptions(payload);
        }
      } catch (error) {
        if (active) {
          setSubCategoryOptions([{ id: 1, name: "Farm" }]);
        }
      }
    }

    loadSubCategories();

    return () => {
      active = false;
    };
  }, [activityType, activityTypes]);

  useEffect(() => {
    let active = true;

    async function loadCrpOptions() {
      try {
        const payload = await fetchAllCrps();
        if (!active) {
          return;
        }
        const approvedCrps = payload.filter((item) => Number(item.approvalStatus) === 1);
        setCrpOptions(approvedCrps);
        if (!selectedCrpRegistrationId && approvedCrps.length > 0) {
          const matchedCrp = approvedCrps.find((item) => item.crpId === user.identity);
          setSelectedCrpRegistrationId(String((matchedCrp || approvedCrps[0]).id));
        }
      } catch (error) {
        if (active) {
          setCrpOptions([]);
        }
      }
    }

    loadCrpOptions();

    return () => {
      active = false;
    };
  }, [selectedCrpRegistrationId, user.identity]);

  useEffect(() => {
    const shouldLoadGpOptions =
      homeView === "dashboard" || homeView === "newEnrolment";

    if (!shouldLoadGpOptions || !effectiveBlockId) {
      setGpOptions([]);
      return;
    }

    let active = true;

    async function loadGpOptions() {
      try {
        const payload = await fetchGpsByBlock(effectiveBlockId);
        if (active) {
          setGpOptions(payload);
        }
      } catch (error) {
        if (active) {
          setGpOptions([]);
        }
      }
    }

    loadGpOptions();

    return () => {
      active = false;
    };
  }, [effectiveBlockId, homeView]);

  useEffect(() => {
    const shouldLoadVillageOptions =
      homeView === "dashboard" || homeView === "newEnrolment";

    if (!shouldLoadVillageOptions || !selectedGpId) {
      setVillageOptions([]);
      return;
    }

    let active = true;

    async function loadVillageOptions() {
      try {
        const payload = await fetchVillagesByGp(selectedGpId);
        if (active) {
          setVillageOptions(payload);
        }
      } catch (error) {
        if (active) {
          setVillageOptions([]);
        }
      }
    }

    loadVillageOptions();

    return () => {
      active = false;
    };
  }, [homeView, selectedGpId]);

  useEffect(() => {
    if (homeView !== "shgMember" && homeView !== "lhCboActivity") {
      return undefined;
    }
    if (!activityCoordinates) {
      return undefined;
    }
    const timer = setInterval(() => {
      checkRadiusDistance(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [homeView, memberName, activityCoordinates]);

  useEffect(() => {
    if (homeView !== "dashboard" || hasAutoShownDashboardAlerts || dashboardAlertCount === 0) {
      return;
    }

    setShowDashboardAlerts(true);
    setHasAutoShownDashboardAlerts(true);
  }, [dashboardAlertCount, hasAutoShownDashboardAlerts, homeView]);

  useEffect(() => {
    if (!showDashboardAlerts) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setShowDashboardAlerts(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showDashboardAlerts]);

  const handleUploadImage = (source = "library") => {
    const picker =
      source === "camera"
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    picker({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8
    })
      .then((result) => {
        if (result.canceled || !result.assets?.length) {
          return;
        }

        const asset = result.assets[0];
        const now = new Date();
        const imageDate = now.toISOString().slice(0, 10);

        setUploadedImageName(asset.fileName || "selected-image");
        setUploadedImageDate(imageDate);
        setUploadedImageUri(asset.uri || "");
        showResponsePopup(
          "Image Selected",
          `Selected: ${asset.fileName || "image"}`
        );
        })
        .catch((error) => {
          showResponsePopup("Upload Failed", error.message || "Unable to select image.");
        });
  };

  const handleUploadVideo = () => {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 0.8
    })
      .then((result) => {
        if (result.canceled || !result.assets?.length) {
          return;
        }

        const asset = result.assets[0];
        const now = new Date();
        const videoDate = now.toISOString().slice(0, 10);

        setUploadedVideoName(asset.fileName || "selected-video");
        setUploadedVideoDate(videoDate);
        setUploadedVideoUri(asset.uri || "");
        showResponsePopup("Video Selected", `Selected: ${asset.fileName || "video"}`);
      })
      .catch((error) => {
        showResponsePopup("Upload Failed", error.message || "Unable to select video.");
      });
  };

  const handleUploadPaymentSlip = async () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,image/*";

      input.onchange = (event) => {
        const file = event.target?.files?.[0];
        if (!file) {
          return;
        }

        const fileType = file.type?.includes("pdf") ? "PDF" : "Image";
        setTransactionDetailsForm((prev) => ({
          ...prev,
          paymentSlipName: file.name || "payment-slip",
          paymentSlipUri: "",
          paymentSlipType: fileType
        }));
        showResponsePopup("Payment Slip Uploaded", `${fileType} selected: ${file.name}`);
      };

      input.click();
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      setTransactionDetailsForm((prev) => ({
        ...prev,
        paymentSlipName: asset.fileName || "payment-slip-image",
        paymentSlipUri: asset.uri || "",
        paymentSlipType: "Image"
      }));
      showResponsePopup("Payment Slip Uploaded", `Image selected: ${asset.fileName || "payment-slip-image"}`);
    } catch (error) {
      showResponsePopup("Upload Failed", error.message || "Unable to select payment slip.");
    }
  };

  const handleSubmitCrpTrackingReport = async () => {
    if (!selectedAssignedMember) {
      Alert.alert("Working Report", "No SHG member is assigned for reporting.");
      return;
    }
    if (!uploadedImageUri) {
      Alert.alert("Working Report", "Upload image is mandatory for daily reporting.");
      return;
    }
    if (!uploadedVideoUri) {
      Alert.alert("Working Report", "Upload video is mandatory for daily reporting.");
      return;
    }

    const meters = await checkRadiusDistance(false);
    if (meters === null) {
      Alert.alert("Working Report", "Enable location and match SHG geolocation before submission.");
      return;
    }
    if (meters > reportGeofenceRadius) {
      Alert.alert(
        "Outside 150m Radius",
        `Current location is ${meters}m away. Move within 150m of the assigned SHG location.`
      );
      return;
    }

    onSubmitWorkingReport({
      assignmentId: selectedAssignedMember.id,
      shgName: selectedAssignedMember.shgName,
      memberName: selectedAssignedMember.memberName,
      reportDate: new Date().toISOString().slice(0, 10),
      imageName: uploadedImageName,
      videoName: uploadedVideoName,
      distanceMeters: meters
    });
  };

  const handleSaveTrackedStatus = async (nextView = "technicalSupport") => {
    if (!selectedAssignedMember) {
      Alert.alert("Tracking", "No SHG member selected for tracking.");
      return;
    }

    if (!uploadedImageUri) {
      Alert.alert("Tracking", "Capture or upload a live image before saving.");
      return;
    }

    if (!uploadedVideoUri) {
      Alert.alert("Tracking", "Upload a video before saving.");
      return;
    }

    if (!trackingRemarks.trim()) {
      Alert.alert("Tracking", "Remarks are required before saving.");
      return;
    }

    const meters = await checkRadiusDistance(false);

    if (meters === null) {
      Alert.alert("Tracking", "Enable location and validate geolocation before saving.");
      return;
    }

    if (meters > 50) {
      Alert.alert(
        "Tracking",
        `Current location is ${meters}m away. Attendance will count only when the CRP matches the assigned SHG location.`
      );
      return;
    }

    onSubmitWorkingReport({
      assignmentId: selectedAssignedMember.id,
      shgName: selectedAssignedMember.shgName,
      memberName: selectedAssignedMember.memberName,
      reportDate: new Date().toISOString().slice(0, 10),
      imageName: uploadedImageName || "captured-image",
      videoName: uploadedVideoName || "uploaded-video",
      distanceMeters: meters,
      remarks: trackingRemarks.trim()
    });

    Alert.alert(
      "Tracking Saved",
      "Geolocation matched, evidence uploaded, and CRP attendance counted successfully."
    );

    if (nextView) {
      onOpenUpdateData(nextView);
    }
  };

  const handleUploadLhCboImage = () => {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8
    })
      .then((result) => {
        if (result.canceled || !result.assets?.length) {
          return;
        }

        const asset = result.assets[0];

        setLhCboImages((prev) => {
          const updated = [...prev, asset.uri || ""];
          setLhCboImageIndex(updated.length - 1);
          return updated;
        });
        Alert.alert("Image Uploaded", `Selected: ${asset.fileName || "image"}`);
      })
      .catch((error) => {
        Alert.alert("Upload Failed", error.message || "Unable to select image.");
      });
  };

    if (homeView === "workingReport") {
      return (
        <View style={pageStyles.screen}>
          {renderAlertPopup()}
          <View style={pageStyles.frame}>
          <View style={pageStyles.topRow}>
            <View style={pageStyles.imageCard}>
              <Text style={pageStyles.imageText}>CRP{"\n"}Image</Text>
            </View>
            <View style={pageStyles.infoCard}>
              <Text style={pageStyles.infoLine}>CRP ID: {headerCrpId}</Text>
              <Text style={pageStyles.infoLine}>Name: {headerCrpName}</Text>
            </View>
          </View>

          <View style={wrStyles.metricBox}>
            <Text style={wrStyles.metricLabel}>Total Field Visit in last 30 days</Text>
            <View style={wrStyles.metricValueBox}>
              <Text style={wrStyles.metricValueText}>{dashboardMetrics.totalVisits30}</Text>
            </View>
          </View>

          <View style={wrStyles.metricBox}>
            <Text style={wrStyles.metricLabel}>Total SHG Members Visited</Text>
            <View style={wrStyles.metricValueBox}>
              <Text style={wrStyles.metricValueText}>{dashboardMetrics.totalMembersVisited}</Text>
            </View>
          </View>

          <View style={wrStyles.metricBox}>
            <Text style={wrStyles.metricLabel}>No. of Days Attendance Counted</Text>
            <View style={wrStyles.metricValueBox}>
              <Text style={wrStyles.metricValueText}>{dashboardMetrics.attendanceDays}</Text>
            </View>
          </View>

          <View style={wrStyles.metricBox}>
            <Text style={wrStyles.metricLabel}>Honorarium to be Claimed</Text>
            <View style={wrStyles.metricValueBox}>
              <Text style={wrStyles.metricValueText}>
                {dashboardMetrics.honorariumToBeClaimed}
              </Text>
            </View>
          </View>

          <View style={wrStyles.metricBox}>
            <Text style={wrStyles.metricLabel}>Last Honorarium Received</Text>
            <View style={wrStyles.metricValueBox}>
              <Text style={wrStyles.metricValueText}>{workingReport.amountReceived}</Text>
            </View>
          </View>

          <View style={wrStyles.reportWorkflowCard}>
            <Text style={wrStyles.workflowTitle}>CRP Daily Tracking Workflow</Text>
            <Text style={wrStyles.workflowHint}>
              SHG assignment is locked with geolocation. Image and video upload are mandatory,
              and attendance counts only when CRP location matches within 150 metres.
            </Text>
            <Text style={wrStyles.workflowHint}>
              First tap on `Match 150m Geo` to lock the SHG location from the current device position.
            </Text>

            <View style={wrStyles.workflowRow}>
              <Text style={wrStyles.workflowLabel}>Assigned SHG</Text>
              <Text style={wrStyles.workflowValue}>
                {selectedAssignedMember?.shgName || "No SHG assigned"}
              </Text>
            </View>
            <View style={wrStyles.workflowRow}>
              <Text style={wrStyles.workflowLabel}>Assigned Member</Text>
              <Text style={wrStyles.workflowValue}>
                {selectedAssignedMember?.memberName || "No member assigned"}
              </Text>
            </View>
            <View style={wrStyles.workflowRow}>
              <Text style={wrStyles.workflowLabel}>Locked SHG Geo</Text>
              <Text style={wrStyles.workflowValue}>
                {selectedAssignedMember &&
                Number.isFinite(Number(selectedAssignedMember.latitude)) &&
                Number.isFinite(Number(selectedAssignedMember.longitude))
                  ? `${selectedAssignedMember.latitude.toFixed(6)}, ${selectedAssignedMember.longitude.toFixed(6)}`
                  : "Not locked yet"}
              </Text>
            </View>
            <View style={wrStyles.workflowRow}>
              <Text style={wrStyles.workflowLabel}>Members Visited Today</Text>
              <Text style={wrStyles.workflowValue}>{dashboardMetrics.totalMembersVisitedToday}</Text>
            </View>
            <View style={wrStyles.workflowRow}>
              <Text style={wrStyles.workflowLabel}>Static Honorarium/Visit</Text>
              <Text style={wrStyles.workflowValue}>150</Text>
            </View>

            <View style={wrStyles.workflowMediaRow}>
              <Pressable style={wrStyles.mediaBtn} onPress={handleUploadImage}>
                <Text style={wrStyles.mediaBtnText}>Upload Image*</Text>
              </Pressable>
              <Pressable style={wrStyles.mediaBtn} onPress={handleUploadVideo}>
                <Text style={wrStyles.mediaBtnText}>Upload Video*</Text>
              </Pressable>
            </View>

            <Text style={wrStyles.mediaStatusText}>
              Image: {uploadedImageName ? `${uploadedImageName} (${uploadedImageDate})` : "Pending"}
            </Text>
            <Text style={wrStyles.mediaStatusText}>
              Video: {uploadedVideoName ? `${uploadedVideoName} (${uploadedVideoDate})` : "Pending"}
            </Text>

            <View style={wrStyles.workflowActions}>
              <Pressable style={wrStyles.locationBtn} onPress={() => checkRadiusDistance(false)}>
                <Text style={wrStyles.locationBtnText}>
                  {isDistanceLoading ? "Checking..." : "Match 150m Geo"}
                </Text>
              </Pressable>
              <Pressable style={wrStyles.submitBtn} onPress={handleSubmitCrpTrackingReport}>
                <Text style={wrStyles.submitBtnText}>Submit Daily Report</Text>
              </Pressable>
            </View>

            <Text style={wrStyles.distanceText}>
              {distanceToMember === null
                ? "Distance not checked yet."
                : `Current distance from SHG geolocation: ${distanceToMember}m`}
            </Text>
          </View>

          <Pressable style={pageStyles.dashboardInlineAlert} onPress={() => setShowDashboardAlerts(true)}>
            <View style={pageStyles.dashboardInlineAlertHeader}>
              <View style={pageStyles.dashboardInlineAlertBadge}>
                <Text style={pageStyles.dashboardInlineAlertBadgeText}>!</Text>
              </View>
              <View style={pageStyles.dashboardInlineAlertCopy}>
                <Text style={pageStyles.dashboardInlineAlertTitle}>Pending & Upcoming Notifications</Text>
                <Text style={pageStyles.dashboardInlineAlertSubtitle}>
                  {dashboardAlertCount} item{dashboardAlertCount > 1 ? "s" : ""} need attention
                </Text>
              </View>
            </View>

            <View style={pageStyles.dashboardInlineAlertList}>
              {dashboardNotificationItems.map((item, index) => (
                <View key={`wr-inline-alert-${index}-${item}`} style={pageStyles.dashboardInlineAlertItem}>
                  <View style={pageStyles.dashboardAlertDot} />
                  <Text style={pageStyles.dashboardInlineAlertText}>{item}</Text>
                </View>
              ))}
            </View>
          </Pressable>

          <View style={wrStyles.activityCard}>
            <Text style={wrStyles.activityTitle}>Different Activities of the Concern CRP</Text>
            {activities.length ? (
              activities.slice(0, 3).map((item) => (
                <Text key={item.id} style={wrStyles.activityLine}>
                  - {item.title} ({item.reportDate})
                </Text>
              ))
            ) : (
              <Text style={wrStyles.activityLine}>- No daily report submitted yet</Text>
            )}
          </View>

          <Pressable style={wrStyles.backBtn} onPress={onBackToDashboard}>
            <Text style={wrStyles.backBtnText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </View>
    );
  }

    if (homeView === "newEnrolment") {
      return (
        <View style={pageStyles.screen}>
          {renderAlertPopup()}
          <View style={pageStyles.frame}>
          <View style={pageStyles.topRow}>
            <View style={pageStyles.imageCard}>
              <Text style={pageStyles.imageText}>CRP{"\n"}Image</Text>
            </View>
            <View style={pageStyles.infoCard}>
              <Text style={pageStyles.infoLine}>CRP ID: {headerCrpId}</Text>
              <Text style={pageStyles.infoLine}>Name: {headerCrpName}</Text>
            </View>
          </View>

          
          <DropdownField
            label="CRP ID / Name:"
            value={selectedCrpRecord?.name || "Select CRP"}
            options={crpOptions}
            open={openCrpSelector}
            onToggle={() => {
              setOpenCrpSelector((prev) => !prev);
              setOpenGpSelector(false);
              setOpenVillageSelector(false);
            }}
            onSelect={(item) => {
              setSelectedCrpRegistrationId(String(item.id));
              setSelectedGpId("");
              setSelectedVillageId("");
              setOpenCrpSelector(false);
            }}
          />

          <DropdownField
            label="GP/VC Name:"
            value={selectedGp?.name || user.gpVcName || "Select GP/VC"}
            options={gpOptions}
            open={openGpSelector}
            onToggle={() => {
              setOpenGpSelector((prev) => !prev);
              setOpenVillageSelector(false);
            }}
            onSelect={(item) => {
              setSelectedGpId(item.id);
              setSelectedVillageId("");
              setOpenGpSelector(false);
            }}
          />
          <DropdownField
            label="Village Name:"
            value={selectedVillage?.name || user.villageName || "Select Village"}
            options={villageOptions}
            open={openVillageSelector}
            onToggle={() => {
              if (!selectedGpId) {
                return;
              }
              setOpenVillageSelector((prev) => !prev);
              setOpenGpSelector(false);
            }}
            onSelect={(item) => {
              setSelectedVillageId(item.id);
              setOpenVillageSelector(false);
            }}
          />

          <View style={neStyles.selectStrip}>
            <Text style={neStyles.selectText}>Select from below</Text>
          </View>

          <View style={neStyles.portionRow}>
            <Pressable style={neStyles.portionBtn} onPress={onOpenShgMember}>
              <Text style={neStyles.portionBtnText}>SHG{"\n"}Member</Text>
            </Pressable>
            <Pressable style={neStyles.portionBtn} onPress={() => onOpenUpdateData("lhCboActivity")}>
              <Text style={neStyles.portionBtnText}>PG/NFC/{"\n"}FPC/CHC</Text>
            </Pressable>
          </View>

          <Pressable style={pageStyles.dashboardInlineAlert} onPress={() => setShowDashboardAlerts(true)}>
            <View style={pageStyles.dashboardInlineAlertHeader}>
              <View style={pageStyles.dashboardInlineAlertBadge}>
                <Text style={pageStyles.dashboardInlineAlertBadgeText}>!</Text>
              </View>
              <View style={pageStyles.dashboardInlineAlertCopy}>
                <Text style={pageStyles.dashboardInlineAlertTitle}>Pending & Upcoming Notifications</Text>
                <Text style={pageStyles.dashboardInlineAlertSubtitle}>
                  {dashboardAlertCount} item{dashboardAlertCount > 1 ? "s" : ""} need attention
                </Text>
              </View>
            </View>

            <View style={pageStyles.dashboardInlineAlertList}>
              {dashboardNotificationItems.map((item, index) => (
                <View key={`ne-inline-alert-${index}-${item}`} style={pageStyles.dashboardInlineAlertItem}>
                  <View style={pageStyles.dashboardAlertDot} />
                  <Text style={pageStyles.dashboardInlineAlertText}>{item}</Text>
                </View>
              ))}
            </View>
          </Pressable>

          <View style={neStyles.activityCard}>
            <Text style={neStyles.activityTitle}>Different Activities of the Concern CRP</Text>
            {activities.slice(0, 3).map((item) => (
              <Text key={item.id} style={neStyles.activityLine}>
                - {item.title} ({item.action})
              </Text>
            ))}
          </View>

          <Pressable style={wrStyles.backBtn} onPress={onBackToDashboard}>
            <Text style={wrStyles.backBtnText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (homeView === "shgMember") {
    return (
      <View style={pageStyles.screen}>
        <View style={pageStyles.frame}>
          <View style={pageStyles.topRow}>
            <View style={pageStyles.imageCard}>
              <Text style={pageStyles.imageText}>CRP{"\n"}Image</Text>
            </View>
            <View style={pageStyles.infoCard}>
              <Text style={pageStyles.infoLine}>CRP ID: {headerCrpId}</Text>
              <Text style={pageStyles.infoLine}>Name: {headerCrpName}</Text>
            </View>
          </View>

          <DropdownField
            label="SHG Name:"
            value={shgName}
            options={shgNames}
            open={openShgDropdown}
            onToggle={() => {
              const next = !openShgDropdown;
              closeAllShgDropdowns();
              setOpenShgDropdown(next);
            }}
            onSelect={(item) => {
              setShgName(item);
              setOpenShgDropdown(false);
            }}
          />

          <DropdownField
            label="SHG Members Name:"
            value={memberName}
            options={shgMembers}
            open={openMemberDropdown}
            onToggle={() => {
              const next = !openMemberDropdown;
              closeAllShgDropdowns();
              setOpenMemberDropdown(next);
            }}
            onSelect={(item) => {
              setMemberName(item);
              setOpenMemberDropdown(false);
            }}
          />

            <DropdownField
              label="Select Livelihood Activity:"
              value={activityType}
              options={activityTypes}
            open={openActivityDropdown}
            onToggle={() => {
              const next = !openActivityDropdown;
              closeAllShgDropdowns();
              setOpenActivityDropdown(next);
            }}
              onSelect={(item) => {
                setActivityType(item?.name || item || "");
                setOpenActivityDropdown(false);
              }}
            />

            <DropdownField
              label="Sub-Category:"
              value={subCategory}
              options={subCategories}
            open={openSubCategoryDropdown}
            onToggle={() => {
              const next = !openSubCategoryDropdown;
              closeAllShgDropdowns();
              setOpenSubCategoryDropdown(next);
            }}
              onSelect={(item) => {
                setSubCategory(item?.name || item || "");
                setOpenSubCategoryDropdown(false);
              }}
            />

          <View style={smStyles.readonlyRow}>
            <Text style={smStyles.readonlyLabel}>Longitude of the Activity*:</Text>
            <Text style={smStyles.readonlyValue}>
              {activityCoordinates ? activityCoordinates.longitude.toFixed(6) : "--"}
            </Text>
          </View>
          <View style={smStyles.readonlyRow}>
            <Text style={smStyles.readonlyLabel}>Latitude of the Activity*:</Text>
            <Text style={smStyles.readonlyValue}>
              {activityCoordinates ? activityCoordinates.latitude.toFixed(6) : "--"}
            </Text>
          </View>
          <View style={smStyles.readonlyRow}>
            <Text style={smStyles.readonlyLabel}>Latest Image of the Activity*:</Text>
            <Pressable style={smStyles.uploadBtn} onPress={handleUploadImage}>
              <Text style={smStyles.uploadBtnText}>Upload Image</Text>
            </Pressable>
          </View>
          {uploadedImageName ? (
            <View style={smStyles.readonlyRow}>
              <Text style={smStyles.readonlyLabel}>Latest Uploaded:</Text>
              <Text style={smStyles.readonlyValue}>{uploadedImageName} ({uploadedImageDate})</Text>
            </View>
          ) : null}

          <View style={smStyles.previewCard}>
            <Text style={smStyles.previewTitle}>Previous & Latest Uploaded Images</Text>
            <View style={smStyles.previewBox}>
              {uploadedImageUri ? (
                <Image source={{ uri: uploadedImageUri }} style={smStyles.previewImage} />
              ) : (
                <Text style={smStyles.previewText}>
                  Images of Activities of the SHG Member
                </Text>
              )}
            </View>
          </View>

          <View style={smStyles.readonlyRow}>
            <Text style={smStyles.readonlyLabel}>Member belongs to LH CBO:</Text>
            <Pressable
              style={[
                smStyles.lhIndicatorBtn,
                memberBelongsToLhCbo
                  ? smStyles.lhIndicatorBtnOn
                  : smStyles.lhIndicatorBtnOff
              ]}
              onPress={() => {
                setMemberBelongsToLhCbo((prev) => {
                  const next = !prev;
                  if (!next) {
                    setLhCboName("");
                  }
                  return next;
                });
              }}
            >
              <View
                style={[
                  smStyles.dotToggle,
                  memberBelongsToLhCbo ? smStyles.dotToggleOn : smStyles.dotToggleOff
                ]}
              />
              <Text
                style={[
                  smStyles.lhIndicatorText,
                  memberBelongsToLhCbo
                    ? smStyles.lhIndicatorTextOn
                    : smStyles.lhIndicatorTextOff
                ]}
              >
                {memberBelongsToLhCbo ? "ON" : "OFF"}
              </Text>
            </Pressable>
          </View>

          <View style={smStyles.readonlyRow}>
            <Text style={smStyles.readonlyLabel}>Name of the LH CBO:</Text>
            <TextInput
              value={lhCboName}
              onChangeText={setLhCboName}
              placeholder={memberBelongsToLhCbo ? "Type LH CBO name" : "Enable LH CBO first"}
              placeholderTextColor="#64748b"
              style={[
                smStyles.cboInput,
                !memberBelongsToLhCbo && smStyles.cboInputDisabled
              ]}
              editable={memberBelongsToLhCbo}
            />
          </View>

          <View style={smStyles.radiusRow}>
            <View
              style={[
                smStyles.radiusStatusIcon,
                locationPromptRequired || distanceToMember === null
                  ? smStyles.radiusStatusIdle
                  : isWithin50Meters
                    ? smStyles.radiusStatusGreen
                    : smStyles.radiusStatusRed
              ]}
            />
            <Text style={smStyles.radiusText}>
              {locationPromptRequired
                ? "Location permission is off. Enable location for SHG onboarding."
                : distanceToMember === null
                ? "Radius Status: Check distance to validate 50m rule"
                : isWithin50Meters
                  ? `Within 50m (${distanceToMember}m) - GREEN`
                  : `Outside 50m (${distanceToMember}m) - RED`}
            </Text>
          </View>
          {currentCrpLocation ? (
            <View style={smStyles.readonlyRow}>
              <Text style={smStyles.readonlyLabel}>Current CRP Location:</Text>
              <Text style={smStyles.readonlyValue}>
                {currentCrpLocation.latitude.toFixed(6)}, {currentCrpLocation.longitude.toFixed(6)}
              </Text>
            </View>
          ) : null}

          <View style={smStyles.bottomRow}>
            <Pressable style={smStyles.checkBtn} onPress={() => checkRadiusDistance(false)}>
              <Text style={smStyles.checkBtnText}>
                {isDistanceLoading ? "Checking..." : "Check 50m Radius"}
              </Text>
            </Pressable>
            <Pressable style={smStyles.saveBtn} onPress={handleSaveAndNext}>
              <Text style={smStyles.saveBtnText}>Save & Next</Text>
            </Pressable>
          </View>

          <Pressable style={wrStyles.backBtn} onPress={onBackToDashboard}>
            <Text style={wrStyles.backBtnText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (graphType && selectedPieMeta) {
    return (
      <View style={pageStyles.screen}>
        <View style={pageStyles.bgGlowTop} />
        <View style={pageStyles.bgGlowBottom} />
        <View style={pageStyles.frame}>
          <View style={pageStyles.topRow}>
            <View style={pageStyles.imageCard}>
              <Text style={pageStyles.imageAvatarText}>{headerCrpInitials}</Text>
              <Text style={pageStyles.imageText}>CRP</Text>
            </View>
            <View style={pageStyles.infoCard}>
              <Text style={pageStyles.infoLine}>CRP ID: {headerCrpId}</Text>
              <Text style={pageStyles.infoLine}>Name: {headerCrpName}</Text>
            </View>
          </View>

          <View style={pageStyles.graphPageCard}>
            <View style={pageStyles.graphPageHeader}>
              <View>
                <Text style={pageStyles.graphPageEyebrow}>Performance View</Text>
                <Text style={pageStyles.graphPageTitle}>{selectedPieMeta.title}</Text>
              </View>
              <View style={pageStyles.graphTotalBadge}>
                <Text style={pageStyles.graphTotalBadgeLabel}>Total</Text>
                <Text style={pageStyles.graphTotalBadgeValue}>{selectedPieTotal}</Text>
              </View>
            </View>

            <View style={pageStyles.graphSpotlightCard}>
              <Text style={pageStyles.graphSpotlightTitle}>Distribution Overview</Text>
              <View style={pageStyles.graphSpotlightBars}>
                {selectedPieMeta.labels.map((label, index) => {
                  const value = Math.max(0, Number(selectedPieMeta.values[index]) || 0);
                  const heightPercent = Math.max((value / selectedGraphMax) * 100, value > 0 ? 16 : 8);
                  return (
                    <View key={`spotlight-${graphType}-${label}`} style={pageStyles.graphSpotlightBarCol}>
                      <Text style={pageStyles.graphSpotlightValue}>{value}</Text>
                      <View style={pageStyles.graphSpotlightTrack}>
                        <View
                          style={[
                            pageStyles.graphSpotlightFill,
                            {
                              height: `${heightPercent}%`,
                              backgroundColor: selectedPieMeta.colors[index]
                            }
                          ]}
                        />
                      </View>
                      <Text style={pageStyles.graphSpotlightLabel}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={pageStyles.legendWrap}>
              {selectedPieMeta.labels.map((label, index) => {
                const value = Math.max(0, Number(selectedPieMeta.values[index]) || 0);
                const share =
                  selectedPieTotal > 0 ? Math.round((value / selectedPieTotal) * 100) : 0;
                return (
                  <View key={`${graphType}-${label}`} style={pageStyles.legendCard}>
                    <View style={pageStyles.legendRow}>
                      <View
                        style={[
                          pageStyles.legendDot,
                          { backgroundColor: selectedPieMeta.colors[index] }
                        ]}
                      />
                      <Text style={pageStyles.legendLabel}>{label}</Text>
                      <Text style={pageStyles.legendValue}>
                        {value} ({share}%)
                      </Text>
                    </View>
                    <View style={pageStyles.legendProgressTrack}>
                      <View
                        style={[
                          pageStyles.legendProgressFill,
                          {
                            width: `${share}%`,
                            backgroundColor: selectedPieMeta.colors[index]
                          }
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <Pressable style={pageStyles.backToDashboardBtn} onPress={closeGraphView}>
              <Text style={pageStyles.backToDashboardText}>Back to Dashboard</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (
    homeView === "lhStatusFarm" ||
    homeView === "lhStatusNonFarm" ||
    homeView === "lhStatusLivestock" ||
    homeView === "lhStatusFishery"
  ) {
    const statusTitleMap = {
      lhStatusFarm: "SHG Member Farm-based Activity Status",
      lhStatusNonFarm: "SHG Member Non-Farm-based Activity Status",
      lhStatusLivestock: "SHG Member Livestock-based Activity Status",
      lhStatusFishery: "SHG Member Fishery-based Activity Status"
    };
    const statusToSubCategory = {
      lhStatusFarm: "Farm",
      lhStatusNonFarm: "NonFarm",
      lhStatusLivestock: "Livestock",
      lhStatusFishery: "Fishery"
    };
    const selectedSubCategory = statusToSubCategory[homeView] || "Farm";

      return (
        <View style={pageStyles.screen}>
          <View style={pageStyles.frame}>
            <View style={flowStyles.statusHeroCard}>
              <View style={flowStyles.statusHeroAccent} />
              <View style={flowStyles.statusHeroCopy}>
                <Text style={flowStyles.statusHeroEyebrow}>Tracking Context</Text>
                <Text style={flowStyles.statusHeroTitle}>{selectedMemberName}</Text>
                <Text style={flowStyles.statusHeroSubtitle}>{selectedShgName}</Text>
              </View>
            </View>

            <View style={flowStyles.statusTitleWrap}>
              <Text style={flowStyles.statusTitle}>{statusTitleMap[homeView]}</Text>
              <Text style={flowStyles.statusHint}>Choose a module to continue CRP tracking.</Text>
            </View>

            <View style={flowStyles.moduleStack}>
              <Pressable
                style={flowStyles.profileButton}
                onPress={() => onOpenUpdateData(activityBySubCategory[selectedSubCategory])}
              >
                <Text style={flowStyles.profileButtonText}>Activity Profile</Text>
              </Pressable>

              <Pressable
                style={flowStyles.profileButton}
                onPress={() => onOpenUpdateData("lhInvestment")}
              >
                <Text style={flowStyles.profileButtonText}>Investment Profile</Text>
              </Pressable>

              <Pressable style={flowStyles.profileButton} onPress={() => onOpenUpdateData("lhIncome")}>
                <Text style={flowStyles.profileButtonText}>Income Profile</Text>
              </Pressable>

              <Pressable style={flowStyles.trackingEntryBtn} onPress={() => onOpenUpdateData("shgTracking")}>
                <Text style={flowStyles.trackingEntryBtnText}>Tracking</Text>
              </Pressable>
            </View>

            <View style={flowStyles.statusFooterCard}>
              <Pressable
                style={flowStyles.primarySaveBtn}
                onPress={() => onOpenUpdateData("technicalSupport")}
              >
                <Text style={flowStyles.primarySaveText}>Save</Text>
              </Pressable>
            </View>

            <Pressable style={flowStyles.statusBackBtn} onPress={onOpenShgMember}>
            <Text style={flowStyles.statusBackBtnText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </View>
      );
    }

    if (homeView === "shgTracking") {
      return (
        <View style={pageStyles.screen}>
          <View style={flowStyles.trackingShell}>
            <View style={flowStyles.trackingHero}>
              <View style={flowStyles.trackingTitleWrap}>
                <Text style={flowStyles.trackingHeroTitle}>SHG Tracking</Text>
              </View>
              <Text style={flowStyles.trackingEyebrow}>Field Verification</Text>
              <Text style={flowStyles.trackingHeroHint}>
                Validate geolocation, capture evidence, and submit the tracking update for this SHG member.
              </Text>
            </View>

            <View style={flowStyles.trackingMemberCard}>
              <View style={flowStyles.trackingMemberRow}>
                <Text style={flowStyles.trackingMemberLabel}>SHG Member</Text>
                <Text style={flowStyles.trackingMemberValue}>{selectedMemberName}</Text>
              </View>
              <View style={flowStyles.trackingMemberRow}>
                <Text style={flowStyles.trackingMemberLabel}>SHG Name</Text>
                <Text style={flowStyles.trackingMemberValue}>{selectedShgName}</Text>
              </View>
            </View>

            <View style={flowStyles.trackingStatusCard}>
              <Text style={flowStyles.trackingTitle}>SHG Tracking Under CRP</Text>
              <Text style={flowStyles.trackingHint}>
                Enable location, click or upload live image, upload video, add remarks, then save.
                Attendance counts only when assigned SHG geolocation matches.
              </Text>
              <View style={flowStyles.trackingActionRow}>
                <Pressable style={flowStyles.secondaryTrackBtn} onPress={() => checkRadiusDistance(false)}>
                  <Text style={flowStyles.secondaryTrackBtnText}>
                    {isDistanceLoading ? "Checking..." : "Enable / Match Geo"}
                  </Text>
                </Pressable>
                <Pressable style={flowStyles.secondaryTrackBtn} onPress={() => handleUploadImage("library")}>
                  <Text style={flowStyles.secondaryTrackBtnText}>Click / Upload Image</Text>
                </Pressable>
                <Pressable style={flowStyles.secondaryTrackBtn} onPress={handleUploadVideo}>
                  <Text style={flowStyles.secondaryTrackBtnText}>Upload Video</Text>
                </Pressable>
              </View>

              <View style={flowStyles.trackingStatusGrid}>
                <View style={flowStyles.trackingStatusPill}>
                  <Text style={flowStyles.trackingStatusLabel}>Image</Text>
                  <Text style={flowStyles.trackingStatusValue}>{uploadedImageName || "Pending"}</Text>
                </View>
                <View style={flowStyles.trackingStatusPill}>
                  <Text style={flowStyles.trackingStatusLabel}>Video</Text>
                  <Text style={flowStyles.trackingStatusValue}>{uploadedVideoName || "Pending"}</Text>
                </View>
                <View style={flowStyles.trackingStatusPill}>
                  <Text style={flowStyles.trackingStatusLabel}>Geo Status</Text>
                  <Text style={flowStyles.trackingStatusValue}>
                    {locationPromptRequired ? "Location off" : distanceToMember === null ? "Not checked" : `${distanceToMember}m matched`}
                  </Text>
                </View>
              </View>

              <TextInput
                style={flowStyles.remarksInput}
                value={trackingRemarks}
                onChangeText={setTrackingRemarks}
                placeholder="Add remarks"
                multiline
              />
            </View>

            <View style={flowStyles.trackingFooterCard}>
              <View style={flowStyles.trackingSaveRow}>
                <View
                  style={[
                    flowStyles.geoDot,
                    geoStatusVariant === "green"
                      ? flowStyles.geoDotGreen
                      : geoStatusVariant === "red"
                        ? flowStyles.geoDotRed
                        : flowStyles.geoDotIdle
                  ]}
                />
                <Pressable
                  style={flowStyles.primarySaveBtn}
                  onPress={() => handleSaveTrackedStatus("technicalSupport")}
                >
                  <Text style={flowStyles.primarySaveText}>Save</Text>
                </Pressable>
              </View>

              <Pressable style={flowStyles.statusBackBtn} onPress={() => onOpenUpdateData(currentStatusView)}>
                <Text style={flowStyles.statusBackBtnText}>Back</Text>
              </Pressable>
            </View>
            {renderResponsePopup()}
          </View>
        </View>
      );
    }

  if (homeView === "lhActivityFarm") {
    const activityNameOptions = activityTypes.map((item) => item.name).filter(Boolean);
    const unitAreaOptions = FARM_UNIT_AREA_OPTIONS;
    const typeOptions = FARM_TYPE_OPTIONS;
    const seasonOptions = FARM_SEASON_OPTIONS;
    const landOptions = FARM_LAND_OPTIONS;
    const productionOptions = subCategories.map((item) => item.name).filter(Boolean);
    const productionUnitOptions = FARM_PRODUCTION_UNIT_OPTIONS;

      return (
        <View style={pageStyles.screen}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[pageStyles.frame, apStyles.frame]}>
              <View style={apStyles.heroCard}>
                <View style={apStyles.titleWrap}>
                  <Text style={apStyles.title}>Activity Profile</Text>
                </View>
                <Text style={apStyles.sectionType}>{activityType || "Farm"}</Text>
                <Text style={apStyles.sectionHint}>
                  Fill the selected farm-based activity details below.
                </Text>
              </View>

              <View style={apStyles.sectionCard}>
                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>Name of the Activity</Text>
                  <CycleDropdown
                    value={activityProfile.activityName}
                    options={activityNameOptions}
                    style={apStyles.dropdown}
                    onChange={(value) =>
                      setActivityProfile((prev) => ({ ...prev, activityName: value }))
                    }
                  />
                </View>

                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>Quantum of Area</Text>
                  <TextInput
                    style={apStyles.input}
                    value={activityProfile.areaQuantity}
                    onChangeText={(text) =>
                      setActivityProfile((prev) => ({
                        ...prev,
                        areaQuantity: text.replace(/[^\d.]/g, "")
                      }))
                    }
                    keyboardType="numeric"
                    placeholder="Enter number"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>Unit of Area</Text>
                  <CycleDropdown
                    value={activityProfile.areaUnit}
                    options={unitAreaOptions}
                    style={apStyles.dropdown}
                    onChange={(value) => setActivityProfile((prev) => ({ ...prev, areaUnit: value }))}
                  />
                </View>

                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>Type of Activity</Text>
                  <CycleDropdown
                    value={activityProfile.activityMode}
                    options={typeOptions}
                    style={apStyles.dropdown}
                    onChange={(value) =>
                      setActivityProfile((prev) => ({ ...prev, activityMode: value }))
                    }
                  />
                </View>

                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>If Seasonal</Text>
                  <CycleDropdown
                    value={activityProfile.seasonality}
                    options={seasonOptions}
                    style={apStyles.dropdown}
                    onChange={(value) =>
                      setActivityProfile((prev) => ({ ...prev, seasonality: value }))
                    }
                  />
                </View>

                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>If Perennial</Text>
                  <TextInput
                    style={apStyles.input}
                    value={activityProfile.period}
                    onChangeText={(text) =>
                      setActivityProfile((prev) => ({
                        ...prev,
                        period: text.replace(/\D/g, "")
                      }))
                    }
                    keyboardType="numeric"
                    placeholder="Enter value"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>Type of Land</Text>
                  <CycleDropdown
                    value={activityProfile.landType}
                    options={landOptions}
                    style={apStyles.dropdown}
                    onChange={(value) => setActivityProfile((prev) => ({ ...prev, landType: value }))}
                  />
                </View>
              </View>

              <View style={apStyles.actionRow}>
                <Pressable
                  style={apStyles.actionBtn}
                  onPress={() => {
                    handleProfileSave("Activity profile", activityProfile, "lhStatusFarm");
                  }}
                >
                  <Text style={apStyles.actionBtnText}>Save</Text>
                </Pressable>
                <Pressable
                  style={apStyles.actionBtn}
                  onPress={() => Alert.alert("Edit", "Modify values and press Save to proceed.")}
                >
                  <Text style={apStyles.actionBtnText}>Edit</Text>
                </Pressable>
              </View>

              <View style={apStyles.sectionCard}>
                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>Name of the Production</Text>
                  <CycleDropdown
                    value={activityProfile.productionName}
                    options={productionOptions}
                  style={apStyles.dropdown}
                  onChange={(value) =>
                      setActivityProfile((prev) => ({ ...prev, productionName: value }))
                    }
                  />
                </View>

                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>Production Quantity</Text>
                  <TextInput
                    style={apStyles.input}
                    value={activityProfile.productionQty}
                  onChangeText={(text) =>
                    setActivityProfile((prev) => ({
                      ...prev,
                        productionQty: text.replace(/[^\d.]/g, "")
                      }))
                    }
                    keyboardType="numeric"
                    placeholder="Enter number"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View style={apStyles.fieldBlock}>
                  <Text style={apStyles.label}>Production Unit</Text>
                  <CycleDropdown
                    value={activityProfile.productionUnit}
                    options={productionUnitOptions}
                  style={apStyles.dropdown}
                  onChange={(value) =>
                      setActivityProfile((prev) => ({ ...prev, productionUnit: value }))
                    }
                  />
                </View>
              </View>

            <Pressable style={wrStyles.backBtn} onPress={() => onOpenUpdateData(currentStatusView)}>
              <Text style={wrStyles.backBtnText}>Back to Status</Text>
            </Pressable>
          </View>
        </ScrollView>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "lhActivityNonFarm") {
    const setupTypeOptions = [];
    const yesNoOptions = ["Yes", "No"];
    const marketLinkedOptions = ["Local", "Block", "District", "State", "National"];

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, nfStyles.frame]}>
            <View style={nfStyles.titleWrap}>
              <Text style={nfStyles.title}>Activity Profile</Text>
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Enterprise Name:</Text>
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.enterpriseName}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, enterpriseName: text }))
                }
                placeholder="Type"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Set-up Type:</Text>
              <CycleDropdown
                value={nonFarmEnterprise.setupType}
                options={setupTypeOptions}
                style={nfStyles.dropdown}
                onChange={(value) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, setupType: value }))
                }
              />
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Enterprise Level:</Text>
              <View style={nfStyles.toggleWrap}>
                <Pressable
                  style={[
                    nfStyles.toggleBtn,
                    nonFarmEnterprise.enterpriseLevel === "Primary" && nfStyles.toggleBtnActive
                  ]}
                  onPress={() =>
                    setNonFarmEnterprise((prev) => ({ ...prev, enterpriseLevel: "Primary" }))
                  }
                >
                  <Text style={nfStyles.toggleText}>Primary</Text>
                </Pressable>
                <Pressable
                  style={[
                    nfStyles.toggleBtn,
                    nonFarmEnterprise.enterpriseLevel === "Secondary" && nfStyles.toggleBtnActive
                  ]}
                  onPress={() =>
                    setNonFarmEnterprise((prev) => ({ ...prev, enterpriseLevel: "Secondary" }))
                  }
                >
                  <Text style={nfStyles.toggleText}>Secondary</Text>
                </Pressable>
              </View>
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Signboard Mounted on Enterprise:</Text>
              <CycleDropdown
                value={nonFarmEnterprise.signboardMounted}
                options={yesNoOptions}
                style={nfStyles.dropdown}
                onChange={(value) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, signboardMounted: value }))
                }
              />
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Total Employment associated:</Text>
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.totalEmployment}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({
                    ...prev,
                    totalEmployment: text.replace(/\D/g, "")
                  }))
                }
                keyboardType="numeric"
                placeholder="Type"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Market Linked:</Text>
              <CycleDropdown
                value={nonFarmEnterprise.marketLinked}
                options={marketLinkedOptions}
                style={nfStyles.dropdown}
                onChange={(value) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, marketLinked: value }))
                }
              />
            </View>

            <View style={nfStyles.complianceHeader}>
              <Text style={nfStyles.complianceTitle}>Legal Compliances</Text>
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>GST:</Text>
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.gstNo}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, gstNo: text.toUpperCase() }))
                }
                placeholder="Number"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Renewal Date:</Text>
              <DateField
                value={nonFarmEnterprise.gstRenewalDate}
                placeholder="DD-MM-YY"
                onPress={() =>
                  openDatePicker(
                    "nonFarm",
                    "gstRenewalDate",
                    "GST Renewal Date",
                    nonFarmEnterprise.gstRenewalDate
                  )
                }
                style={nfStyles.dateTrigger}
                textStyle={nfStyles.dateTriggerText}
                placeholderStyle={nfStyles.datePlaceholderText}
                iconStyle={nfStyles.dateTriggerIcon}
              />
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>PAN:</Text>
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.panNo}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, panNo: text.toUpperCase() }))
                }
                placeholder="Number"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Renewal Date:</Text>
              <DateField
                value={nonFarmEnterprise.panRenewalDate}
                placeholder="DD-MM-YY"
                onPress={() =>
                  openDatePicker(
                    "nonFarm",
                    "panRenewalDate",
                    "PAN Renewal Date",
                    nonFarmEnterprise.panRenewalDate
                  )
                }
                style={nfStyles.dateTrigger}
                textStyle={nfStyles.dateTriggerText}
                placeholderStyle={nfStyles.datePlaceholderText}
                iconStyle={nfStyles.dateTriggerIcon}
              />
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Udhyam:</Text>
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.udhyamNo}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, udhyamNo: text.toUpperCase() }))
                }
                placeholder="Number"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Renewal Date:</Text>
              <DateField
                value={nonFarmEnterprise.udhyamRenewalDate}
                placeholder="DD-MM-YY"
                onPress={() =>
                  openDatePicker(
                    "nonFarm",
                    "udhyamRenewalDate",
                    "Udhyam Renewal Date",
                    nonFarmEnterprise.udhyamRenewalDate
                  )
                }
                style={nfStyles.dateTrigger}
                textStyle={nfStyles.dateTriggerText}
                placeholderStyle={nfStyles.datePlaceholderText}
                iconStyle={nfStyles.dateTriggerIcon}
              />
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>FSSAI:</Text>
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.fssaiNo}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, fssaiNo: text.toUpperCase() }))
                }
                placeholder="Number"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Renewal Date:</Text>
              <DateField
                value={nonFarmEnterprise.fssaiRenewalDate}
                placeholder="DD-MM-YY"
                onPress={() =>
                  openDatePicker(
                    "nonFarm",
                    "fssaiRenewalDate",
                    "FSSAI Renewal Date",
                    nonFarmEnterprise.fssaiRenewalDate
                  )
                }
                style={nfStyles.dateTrigger}
                textStyle={nfStyles.dateTriggerText}
                placeholderStyle={nfStyles.datePlaceholderText}
                iconStyle={nfStyles.dateTriggerIcon}
              />
            </View>

            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>TIN:</Text>
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.tinNo}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, tinNo: text.toUpperCase() }))
                }
                placeholder="Number"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={nfStyles.row}>
              <Text style={nfStyles.label}>Renewal Date:</Text>
              <DateField
                value={nonFarmEnterprise.tinRenewalDate}
                placeholder="DD-MM-YY"
                onPress={() =>
                  openDatePicker(
                    "nonFarm",
                    "tinRenewalDate",
                    "TIN Renewal Date",
                    nonFarmEnterprise.tinRenewalDate
                  )
                }
                style={nfStyles.dateTrigger}
                textStyle={nfStyles.dateTriggerText}
                placeholderStyle={nfStyles.datePlaceholderText}
                iconStyle={nfStyles.dateTriggerIcon}
              />
            </View>

            <Pressable
              style={nfStyles.saveBtn}
              onPress={() => {
                handleProfileSave("Non-Farm enterprise profile", nonFarmEnterprise, currentStatusView);
              }}
            >
              <Text style={nfStyles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        </ScrollView>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "lhActivityLivestock") {
    const activityNameOptions = [];
    const productionOptions = ["Milk", "Egg", "Meat"];
    const productionUnitOptions = ["Litre", "KG", "Quintal", "Nos"];

    return (
      <View style={pageStyles.screen}>
        <View style={pageStyles.frame}>
          <Text style={flowStyles.formTitle}>Activity Profile - Livestock</Text>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Name of the Activity:</Text>
            <CycleDropdown
              value={activityProfile.activityName}
              options={activityNameOptions}
              onChange={(value) => setActivityProfile((prev) => ({ ...prev, activityName: value }))}
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Total Number of Livestock:</Text>
            <TextInput
              style={flowStyles.input}
              value={activityProfile.totalLivestock}
              onChangeText={(text) =>
                setActivityProfile((prev) => ({ ...prev, totalLivestock: text.replace(/\D/g, "") }))
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Name of Production:</Text>
            <CycleDropdown
              value={activityProfile.productionName}
              options={productionOptions}
              onChange={(value) =>
                setActivityProfile((prev) => ({ ...prev, productionName: value }))
              }
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Production Quantity:</Text>
            <TextInput
              style={flowStyles.input}
              value={activityProfile.productionQty}
              onChangeText={(text) =>
                setActivityProfile((prev) => ({
                  ...prev,
                  productionQty: text.replace(/[^\d.]/g, "")
                }))
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Production Unit:</Text>
            <CycleDropdown
              value={activityProfile.productionUnit}
              options={productionUnitOptions}
              onChange={(value) =>
                setActivityProfile((prev) => ({ ...prev, productionUnit: value }))
              }
            />
          </View>
          <Pressable
            style={flowStyles.primarySaveBtn}
            onPress={() => handleProfileSave("Livestock activity profile", activityProfile)}
          >
            <Text style={flowStyles.primarySaveText}>Save</Text>
          </Pressable>
          <Pressable style={wrStyles.backBtn} onPress={() => onOpenUpdateData("lhStatusLivestock")}>
            <Text style={wrStyles.backBtnText}>Back to Status</Text>
          </Pressable>
        </View>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "lhActivityFishery") {
    const activityNameOptions = ["Fishery", "Pond Culture", "Canal Fishery"];
    const areaTypeOptions = ["Kani", "Gonda", "Bigha"];
    const waterbodyTypeOptions = ["Seasonal", "Perennial", "Canal", "Pond"];
    const productionOptions = ["Fish", "Seed"];
    const productionUnitOptions = ["KG", "Quintal"];

    return (
      <View style={pageStyles.screen}>
        <View style={pageStyles.frame}>
          <Text style={flowStyles.formTitle}>Activity Profile - Fishery</Text>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Name of the Activity:</Text>
            <CycleDropdown
              value={activityProfile.activityName}
              options={activityNameOptions}
              onChange={(value) => setActivityProfile((prev) => ({ ...prev, activityName: value }))}
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Total Waterbody Area:</Text>
            <TextInput
              style={flowStyles.input}
              value={activityProfile.waterbodyArea}
              onChangeText={(text) =>
                setActivityProfile((prev) => ({
                  ...prev,
                  waterbodyArea: text.replace(/[^\d.]/g, "")
                }))
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Unit of Area:</Text>
            <CycleDropdown
              value={activityProfile.areaUnit}
              options={areaTypeOptions}
              onChange={(value) => setActivityProfile((prev) => ({ ...prev, areaUnit: value }))}
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Type of Activity:</Text>
            <CycleDropdown
              value={activityProfile.activityMode}
              options={["Rabi", "Kharif", "Summer", "Winter", "Rainy"]}
              onChange={(value) =>
                setActivityProfile((prev) => ({ ...prev, activityMode: value }))
              }
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Type of Waterbody:</Text>
            <CycleDropdown
              value={activityProfile.waterbodyType}
              options={waterbodyTypeOptions}
              onChange={(value) =>
                setActivityProfile((prev) => ({ ...prev, waterbodyType: value }))
              }
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Name of Production:</Text>
            <CycleDropdown
              value={activityProfile.productionName}
              options={productionOptions}
              onChange={(value) =>
                setActivityProfile((prev) => ({ ...prev, productionName: value }))
              }
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Production Quantity:</Text>
            <TextInput
              style={flowStyles.input}
              value={activityProfile.productionQty}
              onChangeText={(text) =>
                setActivityProfile((prev) => ({
                  ...prev,
                  productionQty: text.replace(/[^\d.]/g, "")
                }))
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Production Unit:</Text>
            <CycleDropdown
              value={activityProfile.productionUnit}
              options={productionUnitOptions}
              onChange={(value) =>
                setActivityProfile((prev) => ({ ...prev, productionUnit: value }))
              }
            />
          </View>
          <Pressable
            style={flowStyles.primarySaveBtn}
            onPress={() => handleProfileSave("Fishery activity profile", activityProfile)}
          >
            <Text style={flowStyles.primarySaveText}>Save</Text>
          </Pressable>
          <Pressable style={wrStyles.backBtn} onPress={() => onOpenUpdateData("lhStatusFishery")}>
            <Text style={wrStyles.backBtnText}>Back to Status</Text>
          </Pressable>
        </View>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "lhInvestment") {
    const numericFields = [
      { key: "totalInvestment", label: "Total Investment" },
      { key: "loanFromShg", label: "Loan from SHG" },
      { key: "loanFromBank", label: "Loan from Bank" },
      { key: "individualFinancing", label: "Individual Financing" },
      { key: "ownContribution", label: "Own Contribution" },
      { key: "csr", label: "CSR" },
      { key: "governmentGrant", label: "Government Grant" },
      { key: "otherSource", label: "Other Source" }
    ];

    return (
      <View style={pageStyles.screen}>
        <View style={flowStyles.investmentShell}>
          <View style={flowStyles.investmentHero}>
            <View style={flowStyles.investmentTitleWrap}>
              <Text style={flowStyles.investmentTitle}>Investment Profile</Text>
            </View>
            <Text style={flowStyles.investmentEyebrow}>Livelihood Finance</Text>
            <Text style={flowStyles.investmentHint}>
              Capture the current investment details for this livelihood activity.
            </Text>
          </View>

          <View style={flowStyles.investmentCard}>
            {numericFields.map((item) => (
            <View style={flowStyles.investmentFieldRow} key={item.key}>
              <Text style={flowStyles.investmentFieldLabel}>{item.label}</Text>
              <TextInput
                style={flowStyles.investmentInput}
                value={investmentProfile[item.key]}
                onChangeText={(text) =>
                  setInvestmentProfile((prev) => ({
                    ...prev,
                    [item.key]: text.replace(/[^\d.]/g, "")
                  }))
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#64748b"
              />
            </View>
          ))}

            <View style={flowStyles.investmentActionRow}>
              <Pressable
                style={flowStyles.investmentSaveBtn}
                onPress={() => showSavedDataPopup("Investment profile", investmentProfile)}
              >
                <Text style={flowStyles.investmentSaveBtnText}>Save</Text>
              </Pressable>
              <Pressable
                style={flowStyles.investmentBackBtn}
                onPress={() => onOpenUpdateData(currentStatusView)}
              >
                <Text style={flowStyles.investmentBackBtnText}>Back to Status</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "lhIncome") {
    const monthRows = ["month1", "month2", "month3", "month4", "month5", "month6"];
    const incomeFields = [
      { key: "totalIncomeLastYear", label: "Total Income Since last year" },
      { key: "presentMonthIncome", label: "Present Month Income" },
      { key: "futureProjection", label: "Future Projection (Next Six Month)" }
    ];

    return (
      <View style={pageStyles.screen}>
        <View style={flowStyles.investmentShell}>
          <View style={flowStyles.investmentHero}>
            <View style={flowStyles.investmentTitleWrap}>
              <Text style={flowStyles.investmentTitle}>Income Profile</Text>
            </View>
            <Text style={flowStyles.investmentEyebrow}>Income Tracking</Text>
            <Text style={flowStyles.investmentHint}>
              Capture the latest and projected income details for this activity.
            </Text>
          </View>

          <View style={flowStyles.investmentCard}>
            {incomeFields.map((item) => (
              <View style={flowStyles.investmentFieldRow} key={item.key}>
                <Text style={flowStyles.investmentFieldLabel}>{item.label}</Text>
                <TextInput
                  style={flowStyles.investmentInput}
                  value={incomeProfile[item.key]}
                  onChangeText={(text) =>
                    setIncomeProfile((prev) => ({
                      ...prev,
                      [item.key]: text.replace(/[^\d.]/g, "")
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
            ))}

            {monthRows.map((monthKey, index) => (
              <View style={flowStyles.investmentFieldRow} key={monthKey}>
                <Text style={flowStyles.investmentFieldLabel}>Month {index + 1} Actual Income</Text>
                <TextInput
                  style={flowStyles.investmentInput}
                  value={incomeProfile[monthKey]}
                  onChangeText={(text) =>
                    setIncomeProfile((prev) => ({
                      ...prev,
                      [monthKey]: text.replace(/[^\d.]/g, "")
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
            ))}

            <View style={flowStyles.investmentActionRow}>
              <Pressable
                style={flowStyles.investmentSaveBtn}
                onPress={() => showSavedDataPopup("Income profile", incomeProfile)}
              >
                <Text style={flowStyles.investmentSaveBtnText}>Save</Text>
              </Pressable>
              <Pressable
                style={flowStyles.investmentBackBtn}
                onPress={() => onOpenUpdateData(currentStatusView)}
              >
                <Text style={flowStyles.investmentBackBtnText}>Back to Status</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "lhCboActivity") {
    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, lhcboStyles.frame]}>
            <View style={pageStyles.topRow}>
              <View style={pageStyles.imageCard}>
                <Text style={pageStyles.imageText}>CRP{"\n"}Image</Text>
              </View>
              <View style={pageStyles.infoCard}>
                <Text style={pageStyles.infoLine}>CRP ID: {headerCrpId}</Text>
                <Text style={pageStyles.infoLine}>Name: {headerCrpName}</Text>
              </View>
            </View>

            <View style={lhcboStyles.formCard}>
              <View style={lhcboStyles.formHeader}>
                <Text style={lhcboStyles.formEyebrow}>NFC / PG / IFC / CHC</Text>
                <Text style={lhcboStyles.formTitle}>Livelihood CBO Activity</Text>
                <Text style={lhcboStyles.formHint}>
                  Select the livelihood collective, map the activity, and capture the latest field image.
                </Text>
              </View>

              <View style={lhcboStyles.row}>
                <Text style={lhcboStyles.label}>Type of Livelihood CBO</Text>
                <CycleDropdown
                  value={lhCboType}
                  options={livelihoodCboTypeOptions}
                  style={lhcboStyles.dropdown}
                  onChange={setLhCboType}
                />
              </View>

              <View style={lhcboStyles.row}>
                <Text style={lhcboStyles.label}>Name of the Livelihood CBO</Text>
                <CycleDropdown
                  value={selectedLhCboName}
                  options={livelihoodCboNameOptions}
                  style={lhcboStyles.dropdown}
                  onChange={setSelectedLhCboName}
                />
              </View>

              <View style={lhcboStyles.row}>
                <Text style={lhcboStyles.label}>Activity of the LH-CBO</Text>
                <CycleDropdown
                  value={selectedLhCboActivity}
                  options={livelihoodCboActivityOptions}
                  style={lhcboStyles.dropdown}
                  onChange={setSelectedLhCboActivity}
                />
              </View>

              <View style={lhcboStyles.metaPanel}>
                <View style={lhcboStyles.metaChip}>
                  <Text style={lhcboStyles.metaChipLabel}>Selected Type</Text>
                  <Text style={lhcboStyles.metaChipValue}>{lhCboType || "Not selected"}</Text>
                </View>
                <View style={lhcboStyles.metaChip}>
                  <Text style={lhcboStyles.metaChipLabel}>Activity</Text>
                  <Text style={lhcboStyles.metaChipValue}>
                    {selectedLhCboActivity || "Not selected"}
                  </Text>
                </View>
              </View>

              <View style={lhcboStyles.row}>
                <Text style={lhcboStyles.label}>Longitude of Activity*</Text>
                <TextInput
                  style={lhcboStyles.input}
                  editable={false}
                  value={activityCoordinates ? activityCoordinates.longitude.toFixed(6) : "--"}
                />
              </View>

              <View style={lhcboStyles.row}>
                <Text style={lhcboStyles.label}>Latitude of Activity*</Text>
                <TextInput
                  style={lhcboStyles.input}
                  editable={false}
                  value={activityCoordinates ? activityCoordinates.latitude.toFixed(6) : "--"}
                />
              </View>

              <View style={lhcboStyles.row}>
                <Text style={lhcboStyles.label}>Latest Image of the Activity*</Text>
                <Pressable style={lhcboStyles.uploadBtn} onPress={handleUploadLhCboImage}>
                  <Text style={lhcboStyles.uploadBtnText}>Upload Image</Text>
                </Pressable>
              </View>

              <Text style={lhcboStyles.previewHeading}>Previous & Latest Uploaded Images</Text>
              <View style={lhcboStyles.previewRow}>
                <Pressable
                  style={lhcboStyles.navBtn}
                  onPress={() =>
                    setLhCboImageIndex((prev) =>
                      lhCboImages.length ? (prev - 1 + lhCboImages.length) % lhCboImages.length : 0
                    )
                  }
                >
                  <Text style={lhcboStyles.navBtnText}>{"<"}</Text>
                </Pressable>

                <View style={lhcboStyles.previewBox}>
                  {activeLhCboImage ? (
                    <Image source={{ uri: activeLhCboImage }} style={lhcboStyles.previewImage} />
                  ) : (
                    <Text style={lhcboStyles.previewText}>Images of Activities of the SHG Member</Text>
                  )}
                </View>

                <Pressable
                  style={lhcboStyles.navBtn}
                  onPress={() =>
                    setLhCboImageIndex((prev) =>
                      lhCboImages.length ? (prev + 1) % lhCboImages.length : 0
                    )
                  }
                >
                  <Text style={lhcboStyles.navBtnText}>{">"}</Text>
                </Pressable>
              </View>

              <View style={lhcboStyles.radiusRow}>
                <View
                  style={[
                    lhcboStyles.geoDot,
                    locationPromptRequired || distanceToMember === null
                      ? lhcboStyles.geoDotIdle
                      : isWithin50Meters
                      ? lhcboStyles.geoDotGreen
                      : lhcboStyles.geoDotRed
                  ]}
                />
                <Text style={lhcboStyles.radiusText}>
                  {locationPromptRequired
                    ? "Enable location permission for 50m radius check."
                    : distanceToMember === null
                    ? "If CRP reaches 50m radius, indicator turns green, else red."
                    : isWithin50Meters
                    ? `Within 50m (${distanceToMember}m) - GREEN`
                    : `Outside 50m (${distanceToMember}m) - RED`}
                </Text>
              </View>

              <View style={lhcboStyles.actionRow}>
                <Pressable style={lhcboStyles.checkBtn} onPress={() => checkRadiusDistance(false)}>
                  <Text style={lhcboStyles.checkBtnText}>
                    {isDistanceLoading ? "Checking..." : "Check 50m Radius"}
                  </Text>
                </Pressable>
                <Pressable style={lhcboStyles.saveBtn} onPress={handleLhCboSaveAndNext}>
                  <Text style={lhcboStyles.saveBtnText}>Save & Next</Text>
                </Pressable>
              </View>
            </View>

            <Pressable style={wrStyles.backBtn} onPress={onOpenNewEnrolment}>
              <Text style={wrStyles.backBtnText}>Back to Selection</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (homeView === "lhCboStatusGuide") {
    const selectedRuleTextByType = {
      "Producer Group (PG)":
        "- If Producers Group Activity is selected, further details will be shown on Page 1B.8A",
      "Non-Farm Collective (NFC)":
        "- If Non-Farm Collective Activity is selected, further details will be shown on Page 1B.8B",
      "Integrated Farming Cluster (IFC)":
        "- If Integrated Farming Cluster Activity is selected, further details will be shown on Page 1B.8C",
      "Custom Hiring Center (CHC)":
        "- If Custom Hiring Center Activity is selected, further details will be shown on Page 1B.8D",
      "Farmer Producer Company (FPC)":
        "- If Farmer Producer Company Activity is selected, further details will be shown on Page 1B.8E"
    };
    const selectedRuleText =
      selectedRuleTextByType[lhCboType] || selectedRuleTextByType["Producer Group (PG)"];

    return (
      <View style={pageStyles.screen}>
        <View style={[pageStyles.frame, lhGuideStyles.frame]}>
          <View style={lhGuideStyles.headerCard}>
            <Text style={lhGuideStyles.headerLine}>LH CBO Name: {selectedLhCboName}</Text>
            <Text style={lhGuideStyles.headerLine}>GP/VC Name: {user.gpVcName || "-"}</Text>
          </View>

          <View style={lhGuideStyles.formCard}>
            <View style={lhGuideStyles.dropdownRow}>
              <Text style={lhGuideStyles.dropdownLabel}>Livelihood Activity:</Text>
              <View style={lhGuideStyles.dropdownValueBox}>
                <Text style={lhGuideStyles.dropdownValue}>{selectedLhCboActivity}</Text>
                <Text style={lhGuideStyles.dropdownArrow}>v</Text>
              </View>
            </View>
            <View style={lhGuideStyles.dropdownRow}>
              <Text style={lhGuideStyles.dropdownLabel}>Category:</Text>
              <View style={lhGuideStyles.dropdownValueBox}>
                <Text style={lhGuideStyles.dropdownValue}>{lhCboType}</Text>
                <Text style={lhGuideStyles.dropdownArrow}>v</Text>
              </View>
            </View>

            <View style={lhGuideStyles.rulesCard}>
              <Text style={[lhGuideStyles.ruleLine, lhGuideStyles.ruleLineActive]}>
                {selectedRuleText}
              </Text>
            </View>

              <View style={lhGuideStyles.footerRow}>
                <View
                  style={[
                    lhGuideStyles.geoDot,
                    geoStatusVariant === "green"
                      ? lhGuideStyles.geoDotGreen
                      : geoStatusVariant === "red"
                        ? lhGuideStyles.geoDotRed
                        : lhGuideStyles.geoDotIdle
                  ]}
                />
                <Pressable style={lhGuideStyles.saveBtn} onPress={handleLhCboGuideSaveAndNext}>
                  <Text style={lhGuideStyles.saveBtnText}>Save & Next</Text>
                </Pressable>
            </View>
          </View>

          <Pressable style={lhGuideStyles.backBtn} onPress={() => onOpenUpdateData("lhCboActivity")}>
            <Text style={lhGuideStyles.backBtnText}>Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (
    homeView === "lhCboStatusPg" ||
    homeView === "lhCboStatusNfc" ||
    homeView === "lhCboStatusIfc" ||
    homeView === "lhCboStatusChc" ||
    homeView === "lhCboStatusFpc"
  ) {
    const isChcView = homeView === "lhCboStatusChc";
    const titleMetaMap = {
      lhCboStatusPg: { page: "Page:1B.8A", red: "Producer Group", tail: " Activity Status" },
      lhCboStatusNfc: { page: "Page:1B.8B", red: "Non-Farm Collective", tail: " Activity Status" },
      lhCboStatusIfc: {
        page: "Page:1B.8C",
        red: "Integrated Farming Cluster",
        tail: " Activity Status"
      },
      lhCboStatusChc: {
        page: "Page:1B.8D",
        red: "Custom Hiring Center",
        tail: " Activity Status"
      },
      lhCboStatusFpc: {
        page: "Page:1B.8E",
        red: "Farmer Producer Company",
        tail: " Activity Status"
      }
    };
    const headerNameMap = {
      lhCboStatusPg: "PG Name",
      lhCboStatusNfc: "NFC Name",
      lhCboStatusIfc: "IFC Name",
      lhCboStatusChc: "CHC Name",
      lhCboStatusFpc: "FPC Name"
    };
    const buttonLabelMap = {
      lhCboStatusPg: ["Activity Profile", "Financial Status", "Income\nStatus"],
      lhCboStatusNfc: ["Activity Profile", "Financial Status", "Income\nStatus"],
      lhCboStatusIfc: ["Activity Profile", "Financial Status", "Income\nStatus"],
      lhCboStatusFpc: ["Activity Profile", "Financial Status", "Income\nStatus"]
    };
    const activityRouteMap = {
      lhCboStatusPg: "lhCboPgActivityProfile",
      lhCboStatusNfc: "lhCboNfcActivityProfile",
      lhCboStatusIfc: "",
      lhCboStatusFpc: ""
    };

    return (
      <View style={pageStyles.screen}>
        <View style={[pageStyles.frame, lhcboStatusStyles.frame]}>
          {homeView !== "lhCboStatusPg" ? (
            <Text style={lhcboStatusStyles.titleText}>
              <Text style={lhcboStatusStyles.titlePage}>{titleMetaMap[homeView].page} </Text>
              <Text style={lhcboStatusStyles.titleRed}>{titleMetaMap[homeView].red}</Text>
              <Text style={lhcboStatusStyles.titlePage}>{titleMetaMap[homeView].tail}</Text>
            </Text>
          ) : null}
          <View style={lhcboStatusStyles.headerCard}>
            <Text style={lhcboStatusStyles.headerLine}>
              {headerNameMap[homeView]}: {selectedLhCboName}
            </Text>
            <Text style={lhcboStatusStyles.headerLine}>GP/VC Name: {user.gpVcName || "-"}</Text>
          </View>

          <View style={lhcboStatusStyles.contentCard}>
            {isChcView ? (
              <View style={lhcboStatusStyles.chcPlaceholder}>
                <View style={tsDetailStyles.sectionCard}>
                  <Text style={tsDetailStyles.sectionTitle}>Custom Hiring Center Details</Text>
                  {[
                    ["districtName", "Name of the District"],
                    ["blockName", "Name of the Block"],
                    ["gpVcName", "Name of the GP/VC"],
                    ["villageOrganizationName", "Name of the Village Organization"],
                    ["chcName", "Name of the CHC"],
                    ["establishedDate", "Date of CHC established"],
                    ["establishedThroughConvergence", "CHC establishment through convergence (Y/N)"],
                    ["departmentAndScheme", "If Yes, Name of Department and Scheme"],
                    ["separateBankAccount", "Having Separate Bank Account (Y/N)"],
                    ["bankAccountNumber", "CHC Bank Account Number"],
                    ["bankName", "Name of the Bank"],
                    ["bankBranchName", "Name of the Bank Branch"],
                    ["amountFromTrlm", "Amount received from TRLM"],
                    ["amountFromDepartment", "Amount received from line Department"],
                    ["availableMachineries", "Available machineries"],
                    ["chcManagerDeployed", "CHC Manager deployed (Y/N)"],
                    ["chcManagerName", "Name of the CHC Manager"],
                    ["chcManagerContact", "Contact No of the CHC Manager"],
                    ["totalIncomeSinceInception", "Total Income (since inception)"],
                    ["totalExpenditureSinceInception", "Total Expenditure (since inception)"],
                    ["netProfitOrLoss", "Net Profit / Loss"],
                    ["cashInHand", "Cash in Hand"],
                    ["cashAtBank", "Cash at Bank"]
                  ].map(([key, label]) => (
                    <View key={key} style={tsDetailStyles.fieldBlock}>
                      <Text style={tsDetailStyles.label}>{label}</Text>
                      <RNTextInput
                        style={tsDetailStyles.selectInput}
                        value={chcDetailForm[key]}
                        onChangeText={(text) =>
                          setChcDetailForm((prev) => ({
                            ...prev,
                            [key]: text
                          }))
                        }
                        placeholder={label}
                        placeholderTextColor="#64748b"
                      />
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={lhcboStatusStyles.buttonStack}>
                <Pressable
                  style={lhcboStatusStyles.blockBtn}
                  onPress={() => {
                    if (!activityRouteMap[homeView]) {
                      showResponsePopup(
                        "Activity Profile",
                        "This type does not have a separate activity-profile page in the current flow."
                      );
                      return;
                    }
                    onOpenUpdateData(activityRouteMap[homeView]);
                  }}
                >
                  <Text style={lhcboStatusStyles.blockBtnText}>{buttonLabelMap[homeView][0]}</Text>
                </Pressable>
                <Pressable
                  style={lhcboStatusStyles.blockBtn}
                  onPress={() => onOpenUpdateData("lhCboFinancialStatus")}
                >
                  <Text style={lhcboStatusStyles.blockBtnText}>{buttonLabelMap[homeView][1]}</Text>
                </Pressable>
                <Pressable
                  style={lhcboStatusStyles.blockBtn}
                  onPress={() => onOpenUpdateData("lhCboIncomeStatus")}
                >
                  <Text style={lhcboStatusStyles.blockBtnText}>{buttonLabelMap[homeView][2]}</Text>
                </Pressable>
              </View>
            )}

            <View style={lhcboStatusStyles.footerRow}>
              <View
                style={[
                  lhcboStatusStyles.geoDot,
                  geoStatusVariant === "green"
                    ? lhcboStatusStyles.geoDotGreen
                    : geoStatusVariant === "red"
                      ? lhcboStatusStyles.geoDotRed
                      : lhcboStatusStyles.geoDotIdle
                ]}
              />
              <Pressable
                style={lhcboStatusStyles.saveBtn}
                onPress={() =>
                  showSavedDataPopup(
                    `${titleMetaMap[homeView].red} status`,
                    isChcView
                      ? chcDetailForm
                      : {
                          name: selectedLhCboName,
                          gpVcName: user.gpVcName || "-",
                          activity: selectedLhCboActivity,
                          category: lhCboType,
                          geoStatus: geoStatusVariant
                        },
                    "technicalSupportTech"
                  )
                }
              >
                <Text style={lhcboStatusStyles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
          {renderResponsePopup()}
        </View>
      </View>
    );
  }

  if (homeView === "lhCboPgActivityProfile") {
    const yesNoOptions = ["Yes", "No"];
    const commodityOptions = activityOptions.map((item) => item.name).filter(Boolean);
    const pgFields = [
      ["trainingGovernance", "Training received on PG Governance & Management"],
      ["trainingBooks", "Training received on PG books on records"],
      ["businessPlanPrepared", "Whether a Business Plan has been prepared"],
      ["businessPlanSubmitted", "Whether Business Plan has been submitted for financial support from NRLM"],
      ["fundReceivedFromNrlm", "Whether any fund has been received from NRLM"],
      ["booksMaintained", "Whether PG maintaining books of records"],
      ["dailyBusinessRegister", "Whether PG maintaining Daily Business Register"],
      ["memberLedger", "Whether PG maintaining Member Ledger"],
      ["memberPassbook", "Whether PG maintaining Member Passbook"],
      ["assetRegister", "Whether PG maintaining Asset Register"]
    ];

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, tsDetailStyles.frame]}>
            <View style={tsDetailStyles.heroCard}>
              <View style={tsDetailStyles.titleWrap}>
                <Text style={tsDetailStyles.title}>Activity Profile</Text>
              </View>
              <Text style={tsDetailStyles.sectionType}>Producer Group</Text>
              <Text style={tsDetailStyles.sectionHint}>
                Capture the producer group activity profile and governance readiness details.
              </Text>
            </View>

            <View style={tsDetailStyles.sectionCard}>
              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Primary Commodity of the PG</Text>
                <EditableSelect
                  value={pgActivityProfileForm.primaryCommodity}
                  options={commodityOptions}
                  onChange={(value) =>
                    setPgActivityProfileForm((prev) => ({ ...prev, primaryCommodity: value }))
                  }
                  placeholder="Select or type commodity"
                />
              </View>

              {pgFields.map(([key, label]) => (
                <View key={key} style={tsDetailStyles.fieldBlock}>
                  <Text style={tsDetailStyles.label}>{label}</Text>
                  <EditableSelect
                    value={pgActivityProfileForm[key]}
                    options={yesNoOptions}
                    onChange={(value) =>
                      setPgActivityProfileForm((prev) => ({ ...prev, [key]: value }))
                    }
                    placeholder="Select Yes / No"
                  />
                </View>
              ))}

              <Pressable
                style={tsDetailStyles.modalPrimaryBtnWide}
                onPress={() =>
                  showSavedDataPopup("Producer Group Activity Profile", pgActivityProfileForm, selectedLhCboStatusView)
                }
              >
                <Text style={tsDetailStyles.modalPrimaryBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "lhCboNfcActivityProfile") {
    const yesNoOptions = ["Yes", "No"];
    const setUpCategoryOptions = ["Manufacturing", "Service", "Trading"];
    const volumeUnitOptions = ["KG", "Unit", "Litre", "Piece"];

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, tsDetailStyles.frame]}>
            <View style={tsDetailStyles.heroCard}>
              <View style={tsDetailStyles.titleWrap}>
                <Text style={tsDetailStyles.title}>Activity Profile</Text>
              </View>
              <Text style={tsDetailStyles.sectionType}>Non-Farm Collective</Text>
              <Text style={tsDetailStyles.sectionHint}>
                Record product details, compliances, and monthly production information.
              </Text>
            </View>

            <View style={tsDetailStyles.sectionCard}>
              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Product / Activity Details</Text>
                <RNTextInput
                  style={tsDetailStyles.selectInput}
                  value={nfcActivityProfileForm.productActivityDetails}
                  onChangeText={(text) =>
                    setNfcActivityProfileForm((prev) => ({ ...prev, productActivityDetails: text }))
                  }
                  placeholder="Enter product or activity details"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Set-up Category</Text>
                <EditableSelect
                  value={nfcActivityProfileForm.setUpCategory}
                  options={setUpCategoryOptions}
                  onChange={(value) =>
                    setNfcActivityProfileForm((prev) => ({ ...prev, setUpCategory: value }))
                  }
                  placeholder="Select category"
                />
              </View>
              {[
                ["machineryProcured", "Machinery Procured"],
                ["signboardMounted", "Signboard Mounted on Enterprise"],
                ["marketLinked", "Market Linked"],
                ["productionShed", "Production Shed"],
                ["homeBasedProduction", "Home-based Production"]
              ].map(([key, label]) => (
                <View key={key} style={tsDetailStyles.fieldBlock}>
                  <Text style={tsDetailStyles.label}>{label}</Text>
                  <EditableSelect
                    value={nfcActivityProfileForm[key]}
                    options={yesNoOptions}
                    onChange={(value) =>
                      setNfcActivityProfileForm((prev) => ({ ...prev, [key]: value }))
                    }
                    placeholder="Select Yes / No"
                  />
                </View>
              ))}
              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Total Employment associated</Text>
                <RNTextInput
                  style={tsDetailStyles.selectInput}
                  value={nfcActivityProfileForm.totalEmploymentAssociated}
                  onChangeText={(text) =>
                    setNfcActivityProfileForm((prev) => ({
                      ...prev,
                      totalEmploymentAssociated: text.replace(/[^\d]/g, "")
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Enter number"
                  placeholderTextColor="#64748b"
                />
              </View>
              {[
                ["gst", "GST"],
                ["gstRenewalDate", "GST Renewal Date"],
                ["pan", "PAN"],
                ["panRenewalDate", "PAN Renewal Date"],
                ["tradeLicense", "Trade License"],
                ["tradeRenewalDate", "Trade Renewal Date"],
                ["fssai", "FSSAI"],
                ["fssaiRenewDate", "FSSAI Renewal Date"]
              ].map(([key, label]) => (
                <View key={key} style={tsDetailStyles.fieldBlock}>
                  <Text style={tsDetailStyles.label}>{label}</Text>
                  <RNTextInput
                    style={tsDetailStyles.selectInput}
                    value={nfcActivityProfileForm[key]}
                    onChangeText={(text) =>
                      setNfcActivityProfileForm((prev) => ({ ...prev, [key]: text }))
                    }
                    placeholder={label}
                    placeholderTextColor="#64748b"
                  />
                </View>
              ))}
              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Monthly Production Volume</Text>
                <RNTextInput
                  style={tsDetailStyles.selectInput}
                  value={nfcActivityProfileForm.monthlyProductionVolume}
                  onChangeText={(text) =>
                    setNfcActivityProfileForm((prev) => ({
                      ...prev,
                      monthlyProductionVolume: text.replace(/[^\d.]/g, "")
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Enter amount"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Volume Unit</Text>
                <EditableSelect
                  value={nfcActivityProfileForm.volumeUnit}
                  options={volumeUnitOptions}
                  onChange={(value) =>
                    setNfcActivityProfileForm((prev) => ({ ...prev, volumeUnit: value }))
                  }
                  placeholder="Select unit"
                />
              </View>

              <Pressable
                style={tsDetailStyles.modalPrimaryBtnWide}
                onPress={() =>
                  showSavedDataPopup("Non-Farm Collective Activity Profile", nfcActivityProfileForm, selectedLhCboStatusView)
                }
              >
                <Text style={tsDetailStyles.modalPrimaryBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "lhCboFinancialStatus") {
    const financialMetaByType = {
      pg: {
        title: "Financial Status",
        subtitle: "Producer Group",
        fields: [
          ["totalWorkingCapitalReceived", "Total Working Capital Received"],
          ["totalInfrastructureFundReceived", "Total Infrastructure Fund Received"],
          ["totalFundReceivedFromOtherSource", "Total Fund received from Other Source"],
          ["otherSourceDetails", "Other Source Details"],
          ["totalRepaymentDone", "Total Repayment done as on reporting Month"],
          ["balanceFundToBeRepaid", "Balance Fund to be repaid"]
        ]
      },
      nfc: {
        title: "Financial Status",
        subtitle: "Non-Farm Collective",
        fields: [
          ["totalWorkingCapitalApproved", "Total Working Capital Approved"],
          ["totalWorkingCapitalUsed", "Total Working Capital Used"],
          ["totalRepaymentDone", "Total Repayment done as on reporting Month"],
          ["balanceFundToBeRepaid", "Balance Fund to be repaid"]
        ]
      },
      ifc: {
        title: "Financial Status",
        subtitle: "Integrated Farming Cluster",
        fields: [
          ["totalWorkingCapitalApproved", "Total Working Capital Approved"],
          ["totalWorkingCapitalUsed", "Total Working Capital Used"],
          ["totalShareMoneyUsed", "Total Share Money Used"],
          ["balanceFund", "Balance Fund"]
        ]
      },
      fpc: {
        title: "Loan Status",
        subtitle: "Farmer Producer Company",
        fields: [
          ["totalWorkingCapitalApproved", "Total Working Capital Approved"],
          ["totalWorkingCapitalUsed", "Total Working Capital Used"],
          ["totalShareMoneyUsed", "Total Share Money Used"],
          ["balanceFund", "Balance Fund"]
        ]
      }
    };
    const financialMeta = financialMetaByType[selectedLhCboTypeKey] || financialMetaByType.pg;
    const activeFinancialForm = lhCboFinancialForms[selectedLhCboTypeKey] || lhCboFinancialForms.pg;

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, tsDetailStyles.frame]}>
            <View style={tsDetailStyles.heroCard}>
              <View style={tsDetailStyles.titleWrap}>
                <Text style={tsDetailStyles.title}>{financialMeta.title}</Text>
              </View>
              <Text style={tsDetailStyles.sectionType}>{financialMeta.subtitle}</Text>
              <Text style={tsDetailStyles.sectionHint}>
                Enter the financial values and save to review them in the response popup.
              </Text>
            </View>
            <View style={tsDetailStyles.sectionCard}>
              {financialMeta.fields.map(([key, label]) => (
                <View key={key} style={tsDetailStyles.fieldBlock}>
                  <Text style={tsDetailStyles.label}>{label}</Text>
                  <RNTextInput
                    style={tsDetailStyles.selectInput}
                    value={activeFinancialForm[key]}
                    onChangeText={(text) =>
                      setLhCboFinancialForms((prev) => ({
                        ...prev,
                        [selectedLhCboTypeKey]: {
                          ...prev[selectedLhCboTypeKey],
                          [key]: key.toLowerCase().includes("detail") ? text : text.replace(/[^\d.]/g, "")
                        }
                      }))
                    }
                    keyboardType={key.toLowerCase().includes("detail") ? "default" : "numeric"}
                    placeholder={label}
                    placeholderTextColor="#64748b"
                  />
                </View>
              ))}
              <Pressable
                style={tsDetailStyles.modalPrimaryBtnWide}
                onPress={() =>
                  showSavedDataPopup(`${financialMeta.subtitle} ${financialMeta.title}`, activeFinancialForm, selectedLhCboStatusView)
                }
              >
                <Text style={tsDetailStyles.modalPrimaryBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "lhCboIncomeStatus") {
    const incomeTitleByType = {
      pg: "Income Status - Producer Group",
      nfc: "Income Status - Non-Farm Collective",
      ifc: "Income Status - Integrated Farming Cluster",
      fpc: "Income Status - Farmer Producer Company"
    };
    const activeIncomeForm = lhCboIncomeForms[selectedLhCboTypeKey] || lhCboIncomeForms.pg;

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, tsDetailStyles.frame]}>
            <View style={tsDetailStyles.heroCard}>
              <View style={tsDetailStyles.titleWrap}>
                <Text style={tsDetailStyles.title}>Income Status</Text>
              </View>
              <Text style={tsDetailStyles.sectionType}>{incomeTitleByType[selectedLhCboTypeKey] || incomeTitleByType.pg}</Text>
              <Text style={tsDetailStyles.sectionHint}>
                Save the latest income and expenditure numbers for the selected livelihood CBO.
              </Text>
            </View>
            <View style={tsDetailStyles.sectionCard}>
              {[
                ["totalIncomeSinceLastYear", "Total Income Since last year"],
                ["totalIncomeUpToLastMonth", "Total Income incurred up to last Month"],
                ["totalRecurringExpenditureLastMonth", "Total Recurring expenditure on last month"],
                ["netProfitUpToLastMonth", "Net Profit incurred up to last month"]
              ].map(([key, label]) => (
                <View key={key} style={tsDetailStyles.fieldBlock}>
                  <Text style={tsDetailStyles.label}>{label}</Text>
                  <RNTextInput
                    style={tsDetailStyles.selectInput}
                    value={activeIncomeForm[key]}
                    onChangeText={(text) =>
                      setLhCboIncomeForms((prev) => ({
                        ...prev,
                        [selectedLhCboTypeKey]: {
                          ...prev[selectedLhCboTypeKey],
                          [key]: text.replace(/[^\d.]/g, "")
                        }
                      }))
                    }
                    keyboardType="numeric"
                    placeholder={label}
                    placeholderTextColor="#64748b"
                  />
                </View>
              ))}
              <Pressable
                style={tsDetailStyles.modalPrimaryBtnWide}
                onPress={() =>
                  showSavedDataPopup("Income Status", activeIncomeForm, selectedLhCboStatusView)
                }
              >
                <Text style={tsDetailStyles.modalPrimaryBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "technicalSupport") {
    return (
      <View style={pageStyles.screen}>
        <View style={tsCardStyles.frame}>
          <View style={tsCardStyles.heroCard}>
            <View style={tsCardStyles.titleWrap}>
              <Text style={tsCardStyles.title}>Support Status</Text>
            </View>
            <Text style={tsCardStyles.sectionType}>Geo Locked Access</Text>
            <Text style={tsCardStyles.sectionHint}>
              Enable geolocation first. Only when the token turns green can you open support modules.
            </Text>
          </View>

          <View style={tsCardStyles.memberCard}>
            <View style={tsCardStyles.memberRow}>
              <Text style={tsCardStyles.memberLabel}>SHG Member</Text>
              <Text style={tsCardStyles.memberValue}>{selectedMemberName}</Text>
            </View>
            <View style={tsCardStyles.memberRow}>
              <Text style={tsCardStyles.memberLabel}>SHG Name</Text>
              <Text style={tsCardStyles.memberValue}>{selectedShgName}</Text>
            </View>
          </View>

          <View style={tsCardStyles.geoCard}>
            <View style={tsCardStyles.geoHeaderRow}>
              <View
                style={[
                  tsCardStyles.geoDot,
                  geoStatusVariant === "green"
                    ? tsCardStyles.geoDotGreen
                    : geoStatusVariant === "red"
                      ? tsCardStyles.geoDotRed
                      : tsCardStyles.geoDotIdle
                ]}
              />
              <View style={tsCardStyles.geoCopy}>
                <Text style={tsCardStyles.geoTitle}>Geo Access Token</Text>
                <Text style={tsCardStyles.geoHint}>
                  {geoStatusVariant === "green"
                    ? "Verified. You can proceed to support modules."
                    : geoStatusVariant === "red"
                      ? "Location mismatch. Verify again near the assigned SHG."
                      : "Verification pending. Enable location to continue."}
                </Text>
              </View>
            </View>

            <Pressable style={tsCardStyles.geoActionBtn} onPress={() => checkRadiusDistance(false)}>
              <Text style={tsCardStyles.geoActionBtnText}>
                {isDistanceLoading ? "Checking Geo..." : "Enable / Match Geo"}
              </Text>
            </Pressable>
          </View>

          <View style={tsCardStyles.moduleCard}>
            <Pressable
              style={[
                tsCardStyles.mainButton,
                geoStatusVariant !== "green" && tsCardStyles.lockedButton
              ]}
              onPress={() => handleOpenTechnicalSupportModule("technicalSupportTech")}
            >
              <Text style={tsCardStyles.mainButtonText}>Technical Support{"\n"}Details</Text>
            </Pressable>
            <Pressable
              style={[
                tsCardStyles.mainButton,
                geoStatusVariant !== "green" && tsCardStyles.lockedButton
              ]}
              onPress={() => handleOpenTechnicalSupportModule("technicalSupportFinancial")}
            >
              <Text style={tsCardStyles.mainButtonText}>Financial Support{"\n"}Details</Text>
            </Pressable>

            <View style={tsCardStyles.segmentRow}>
              {["Past Supports", "Present Support", "Support Required"].map((item) => (
                <Pressable
                  key={item}
                  style={[
                    tsCardStyles.segmentBtn,
                    supportStage === item && tsCardStyles.segmentBtnActive,
                    geoStatusVariant !== "green" && tsCardStyles.lockedButton
                  ]}
                  onPress={() => {
                    if (item === "Past Supports") {
                      handleOpenTechnicalSupportModule("technicalSupportPast", item);
                      return;
                    }
                    handleOpenTechnicalSupportModule("technicalSupportFinancial", item);
                  }}
                >
                  <Text style={tsCardStyles.segmentBtnText}>
                    {item === "Past Supports"
                      ? "Past\nSupports"
                      : item === "Present Support"
                        ? "Present\nSupport"
                        : "Support\nRequired"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={tsCardStyles.footerCard}>
            <Pressable
              style={tsCardStyles.saveBtn}
              onPress={() => {
                if (geoStatusVariant !== "green") {
                  showResponsePopup(
                    "Geo Verification Required",
                    "Get the green geo token before proceeding from this screen."
                  );
                  return;
                }
                showSavedDataPopup(
                  "Technical support status",
                  {
                    shgMember: selectedMemberName,
                    shgName: selectedShgName,
                    geoToken: geoStatusVariant,
                    supportStage
                  },
                  "shgMember"
                );
              }}
            >
              <Text style={tsCardStyles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
          {renderResponsePopup()}
        </View>
      </View>
    );
  }

  if (homeView === "technicalSupportTech") {
    const yesNoOptions = ["Yes", "No"];
    const tradeOptions = TRAINING_TRADE_OPTIONS;
    const throughOptions = TRAINING_THROUGH_OPTIONS;

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, tsDetailStyles.frame]}>
            <View style={tsDetailStyles.heroCard}>
              <View style={tsDetailStyles.titleWrap}>
                <Text style={tsDetailStyles.title}>Technical Support</Text>
              </View>
              <Text style={tsDetailStyles.sectionType}>Training Details</Text>
              <Text style={tsDetailStyles.sectionHint}>
                Fill the member training support details below.
              </Text>
            </View>

            <View style={tsDetailStyles.sectionCard}>
              <Text style={tsDetailStyles.sectionTitle}>Skill Training</Text>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Having Skill Training</Text>
                <EditableSelect
                  value={technicalSupportForm.havingSkillTraining}
                  options={yesNoOptions}
                  onChange={(value) =>
                    setTechnicalSupportForm((prev) => ({ ...prev, havingSkillTraining: value }))
                  }
                  placeholder="Select or type"
                />
              </View>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>If Yes, Name of the Trade</Text>
                <EditableSelect
                  value={technicalSupportForm.skillTrade}
                  options={tradeOptions}
                  onChange={(value) =>
                    setTechnicalSupportForm((prev) => ({ ...prev, skillTrade: value }))
                  }
                  placeholder="Select or type trade"
                />
              </View>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Date of Training</Text>
                <DateField
                  value={technicalSupportForm.skillDate}
                  placeholder="DD-MM-YY"
                  onPress={() =>
                    openDatePicker(
                      "technicalSupport",
                      "skillDate",
                      "Skill Training Date",
                      technicalSupportForm.skillDate
                    )
                  }
                />
              </View>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Training Executed Through</Text>
                <EditableSelect
                  value={technicalSupportForm.skillThrough}
                  options={throughOptions}
                  onChange={(value) =>
                    setTechnicalSupportForm((prev) => ({ ...prev, skillThrough: value }))
                  }
                  placeholder="Select or type source"
                />
              </View>
            </View>

            <View style={tsDetailStyles.sectionCard}>
              <Text style={tsDetailStyles.sectionTitle}>EDP Training</Text>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Having EDP Training</Text>
                <EditableSelect
                  value={technicalSupportForm.havingEdpTraining}
                  options={yesNoOptions}
                  onChange={(value) =>
                    setTechnicalSupportForm((prev) => ({ ...prev, havingEdpTraining: value }))
                  }
                  placeholder="Select or type"
                />
              </View>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>If Yes, Name of the Trade</Text>
                <EditableSelect
                  value={technicalSupportForm.edpTrade}
                  options={tradeOptions}
                  onChange={(value) =>
                    setTechnicalSupportForm((prev) => ({ ...prev, edpTrade: value }))
                  }
                  placeholder="Select or type trade"
                />
              </View>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Date of Training</Text>
                <DateField
                  value={technicalSupportForm.edpDate}
                  placeholder="DD-MM-YY"
                  onPress={() =>
                    openDatePicker(
                      "technicalSupport",
                      "edpDate",
                      "EDP Training Date",
                      technicalSupportForm.edpDate
                    )
                  }
                />
              </View>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Training Executed Through</Text>
                <EditableSelect
                  value={technicalSupportForm.edpThrough}
                  options={throughOptions}
                  onChange={(value) =>
                    setTechnicalSupportForm((prev) => ({ ...prev, edpThrough: value }))
                  }
                  placeholder="Select or type source"
                />
              </View>
            </View>

            <View style={tsDetailStyles.sectionCard}>
              <Text style={tsDetailStyles.sectionTitle}>Training Requirement</Text>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Training Requirement</Text>
                <EditableSelect
                  value={technicalSupportForm.trainingRequirement}
                  options={yesNoOptions}
                  onChange={(value) =>
                    setTechnicalSupportForm((prev) => ({ ...prev, trainingRequirement: value }))
                  }
                  placeholder="Select or type"
                />
              </View>

              <View style={tsDetailStyles.fieldBlock}>
                <Text style={tsDetailStyles.label}>Training Required Trade</Text>
                <EditableSelect
                  value={technicalSupportForm.trainingRequiredTrade}
                  options={tradeOptions}
                  onChange={(value) =>
                    setTechnicalSupportForm((prev) => ({ ...prev, trainingRequiredTrade: value }))
                  }
                  placeholder="Select or type trade"
                />
              </View>
            </View>

            <Pressable
              style={tsDetailStyles.saveBtn}
              onPress={() => {
                showSavedDataPopup("Technical support details", technicalSupportForm, "technicalSupport");
              }}
            >
              <Text style={tsDetailStyles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        </ScrollView>

        <Modal
          animationType="fade"
          transparent
          visible={trainingDatePicker.visible}
          onRequestClose={closeTrainingDatePicker}
        >
          <View style={tsDetailStyles.modalOverlay}>
            <View style={tsDetailStyles.modalCard}>
              <Text style={tsDetailStyles.modalTitle}>
                {trainingDatePicker.title || "Select Date"}
              </Text>
              <DatePickerInput
                value={trainingDatePicker.value}
                onChange={(text) =>
                  setTrainingDatePicker((prev) => ({
                    ...prev,
                    value: text
                  }))
                }
              />
              <View style={tsDetailStyles.modalActionRow}>
                <Pressable style={tsDetailStyles.modalSecondaryBtn} onPress={closeTrainingDatePicker}>
                  <Text style={tsDetailStyles.modalSecondaryBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={tsDetailStyles.modalPrimaryBtn} onPress={confirmTrainingDatePicker}>
                  <Text style={tsDetailStyles.modalPrimaryBtnText}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "technicalSupportFinancial") {
    const activityOptions = SUPPORT_ACTIVITY_OPTIONS;
    const loanCycleOptions = ["Cycle 1", "Cycle 2", "Cycle 3"];

    return (
      <View style={pageStyles.screen}>
        <View style={flowStyles.investmentShell}>
          <View style={flowStyles.investmentHero}>
            <View style={flowStyles.investmentTitleWrap}>
              <Text style={flowStyles.investmentTitle}>Financial Support</Text>
            </View>
            <Text style={flowStyles.investmentEyebrow}>Loan Assessment</Text>
            <Text style={flowStyles.investmentHint}>
              Select the support requirement and preferred cycle to view the static loan projection.
            </Text>
          </View>

          <View style={fsStyles.card}>
            <View style={fsStyles.fieldBlock}>
              <Text style={fsStyles.fieldLabel}>Activity of the Member</Text>
              <EditableSelect
                value={financialSupportForm.activityOfMember}
                options={activityOptions}
                onChange={(value) =>
                  setFinancialSupportForm((prev) => ({ ...prev, activityOfMember: value }))
                }
                placeholder="Select or type activity"
                inputStyle={fsStyles.cardInput}
              />
            </View>

            <View style={fsStyles.fieldBlock}>
              <Text style={fsStyles.fieldLabel}>Financial Support Required</Text>
              <View style={fsStyles.togglePillRow}>
                <Pressable
                  style={[
                    fsStyles.togglePill,
                    financialSupportForm.financialSupportRequired && fsStyles.togglePillActive
                  ]}
                  onPress={() =>
                    setFinancialSupportForm((prev) => ({
                      ...prev,
                      financialSupportRequired: true
                    }))
                  }
                >
                  <Text
                    style={[
                      fsStyles.togglePillText,
                      financialSupportForm.financialSupportRequired && fsStyles.togglePillTextActive
                    ]}
                  >
                    Yes
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    fsStyles.togglePill,
                    !financialSupportForm.financialSupportRequired && fsStyles.togglePillActive
                  ]}
                  onPress={() =>
                    setFinancialSupportForm((prev) => ({
                      ...prev,
                      financialSupportRequired: false
                    }))
                  }
                >
                  <Text
                    style={[
                      fsStyles.togglePillText,
                      !financialSupportForm.financialSupportRequired && fsStyles.togglePillTextActive
                    ]}
                  >
                    No
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={fsStyles.fieldBlock}>
              <Text style={fsStyles.fieldLabel}>Loan Cycle of Support Preferred</Text>
              <EditableSelect
                value={financialSupportForm.loanCyclePreferred}
                options={loanCycleOptions}
                onChange={(value) =>
                  setFinancialSupportForm((prev) => ({ ...prev, loanCyclePreferred: value }))
                }
                placeholder="Select or type cycle"
                inputStyle={fsStyles.cardInput}
              />
            </View>

            <View style={fsStyles.actionRow}>
              <Pressable
                style={[
                  fsStyles.popupActionBtn,
                  !financialSupportForm.financialSupportRequired && fsStyles.popupActionBtnDisabled
                ]}
                onPress={() => {
                  if (!financialSupportForm.financialSupportRequired) {
                    return;
                  }
                  if (!financialSupportForm.activityOfMember || !financialSupportForm.loanCyclePreferred) {
                    showResponsePopup(
                      "Incomplete Details",
                      "Select activity and loan cycle before viewing the loan projection."
                    );
                    return;
                  }
                  showResponsePopup("Loan Projection", buildFinancialSupportProjection());
                }}
              >
                <Text style={fsStyles.popupActionBtnText}>Loan Projection</Text>
              </Pressable>
              <Pressable
                style={fsStyles.saveActionBtn}
                onPress={() => {
                  const calculationSummary = buildFinancialSupportProjection();
                  const enteredValuesSummary = buildSaveSummary(financialSupportForm);
                  const popupMessage = calculationSummary
                    ? `${calculationSummary}\n\nEntered Values\n${enteredValuesSummary}`
                    : enteredValuesSummary;

                  showResponsePopup("Saved", popupMessage, "technicalSupport");
                }}
              >
                <Text style={fsStyles.saveActionBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "technicalSupportPast") {
    const activityOptions = SUPPORT_ACTIVITY_OPTIONS;
    const sourceOptions = SUPPORT_SOURCE_OPTIONS;
    const rateOptions = ["8", "10", "12", "14"];
    const statusOptions = ["Pending", "Completed"];
    const topBalance = Math.max(
      (Number(pastSupportForm.topAmount) || 0) - (Number(pastSupportForm.repaymentCompleted) || 0),
      0
    );

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={flowStyles.investmentShell}>
            <View style={flowStyles.investmentHero}>
              <View style={flowStyles.investmentTitleWrap}>
                <Text style={flowStyles.investmentTitle}>Past Support</Text>
              </View>
              <Text style={flowStyles.investmentEyebrow}>Loan History</Text>
              <Text style={flowStyles.investmentHint}>
                Review earlier financial support details and repayment status for this member.
              </Text>
            </View>

            <View style={pastStyles.sectionCard}>
              <Text style={pastStyles.sectionTitle}>Previous Support Snapshot</Text>

              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>Financial Support Taken on LH Activity</Text>
                <EditableSelect
                  value={pastSupportForm.topActivity}
                  options={activityOptions}
                  onChange={(value) => setPastSupportForm((prev) => ({ ...prev, topActivity: value }))}
                  placeholder="Select or type activity"
                  inputStyle={pastStyles.cardInput}
                />
              </View>
              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>Amount of Loan Taken</Text>
                <TextInput
                  style={pastStyles.cardInput}
                  value={pastSupportForm.topAmount}
                  onChangeText={(text) =>
                    setPastSupportForm((prev) => ({ ...prev, topAmount: text.replace(/[^\d.]/g, "") }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>SHG Loan taken through</Text>
                <EditableSelect
                  value={pastSupportForm.topLoanThrough}
                  options={sourceOptions}
                  onChange={(value) =>
                    setPastSupportForm((prev) => ({ ...prev, topLoanThrough: value }))
                  }
                  placeholder="Select or type source"
                  inputStyle={pastStyles.cardInput}
                />
              </View>
            </View>

            <View style={pastStyles.sectionCard}>
              <Text style={pastStyles.sectionTitle}>Repayment & Transaction Status</Text>

              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>Financial Support Taken on LH Activity</Text>
                <EditableSelect
                  value={pastSupportForm.bottomActivity}
                  options={activityOptions}
                  onChange={(value) =>
                    setPastSupportForm((prev) => ({ ...prev, bottomActivity: value }))
                  }
                  placeholder="Select or type activity"
                  inputStyle={pastStyles.cardInput}
                />
              </View>
              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>Amount of Loan Taken</Text>
                <TextInput
                  style={pastStyles.cardInput}
                  value={pastSupportForm.bottomAmount}
                  onChangeText={(text) =>
                    setPastSupportForm((prev) => ({ ...prev, bottomAmount: text.replace(/[^\d.]/g, "") }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>SHG Loan taken through</Text>
                <EditableSelect
                  value={pastSupportForm.bottomLoanThrough}
                  options={sourceOptions}
                  onChange={(value) =>
                    setPastSupportForm((prev) => ({ ...prev, bottomLoanThrough: value }))
                  }
                  placeholder="Select or type source"
                  inputStyle={pastStyles.cardInput}
                />
              </View>
              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>Rate of Interest</Text>
                <EditableSelect
                  value={pastSupportForm.interestRate}
                  options={rateOptions}
                  onChange={(value) => setPastSupportForm((prev) => ({ ...prev, interestRate: value }))}
                  placeholder="Select or type rate"
                  inputStyle={pastStyles.cardInput}
                />
              </View>
              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>Repayment Completed</Text>
                <TextInput
                  style={pastStyles.cardInput}
                  value={pastSupportForm.repaymentCompleted}
                  onChangeText={(text) =>
                    setPastSupportForm((prev) => ({
                      ...prev,
                      repaymentCompleted: text.replace(/[^\d.]/g, "")
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>Balance Amount</Text>
                <TextInput style={pastStyles.cardInputReadOnly} value={`${topBalance}`} editable={false} />
              </View>
              <View style={pastStyles.fieldBlock}>
                <Text style={pastStyles.fieldLabel}>Transaction Status</Text>
                <EditableSelect
                  value={pastSupportForm.transactionStatus}
                  options={statusOptions}
                  onChange={(value) =>
                    setPastSupportForm((prev) => ({ ...prev, transactionStatus: value }))
                  }
                  placeholder="Select or type status"
                  inputStyle={pastStyles.cardInput}
                />
              </View>

              <View style={pastStyles.actionRow}>
                <Pressable
                  style={pastStyles.linkBtn}
                  onPress={() => onOpenUpdateData("technicalSupportTransaction")}
                >
                  <Text style={pastStyles.linkBtnText}>Transaction Details</Text>
                </Pressable>
                <Pressable
                  style={pastStyles.saveBtn}
                  onPress={() => {
                    showSavedDataPopup("Past support details", pastSupportForm, "technicalSupport");
                  }}
                >
                  <Text style={pastStyles.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
        {renderResponsePopup()}
      </View>
    );
  }

  if (homeView === "technicalSupportTransaction") {
    const paymentByOptions = ["SHG", "VO", "CLF", "Bank"];
    const principalDue = Number(pastSupportForm.bottomAmount) || 0;
    const interestDue = Number(((principalDue * (Number(pastSupportForm.interestRate) || 0)) / 100).toFixed(2));
    const totalDue = Number((principalDue + interestDue).toFixed(2));
    const monthName = new Date().toLocaleString("en-US", { month: "short" });
    const outstandingAmount = Math.max(
      totalDue - ((Number(transactionDetailsForm.principalPaid) || 0) + (Number(transactionDetailsForm.interestPaid) || 0)),
      0
    ).toFixed(2);

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={flowStyles.investmentShell}>
            <View style={flowStyles.investmentHero}>
              <View style={flowStyles.investmentTitleWrap}>
                <Text style={flowStyles.investmentTitle}>Transaction Details</Text>
              </View>
              <Text style={flowStyles.investmentEyebrow}>Repayment Record</Text>
              <Text style={flowStyles.investmentHint}>
                Capture monthly repayment, upload the payment slip, and review the outstanding amount.
              </Text>
            </View>

            <View style={txnStyles.sectionCard}>
              <Text style={txnStyles.sectionTitle}>Payment Entry</Text>

              <View style={txnStyles.fieldBlock}>
                <Text style={txnStyles.fieldLabel}>Present Month Loan Repayment Status</Text>
                <TextInput
                  style={txnStyles.cardInput}
                  value={transactionDetailsForm.presentMonthLoanRepaymentStatus}
                  onChangeText={(text) =>
                    setTransactionDetailsForm((prev) => ({
                      ...prev,
                      presentMonthLoanRepaymentStatus: text
                    }))
                  }
                  placeholder="Auto (Present Month)"
                  placeholderTextColor="#64748b"
                />
              </View>

              <View style={txnStyles.fieldBlock}>
                <Text style={txnStyles.fieldLabel}>Payment Details of Loan Taken By</Text>
                <EditableSelect
                  value={transactionDetailsForm.paymentDetailsBy}
                  options={paymentByOptions}
                  onChange={(value) =>
                    setTransactionDetailsForm((prev) => ({ ...prev, paymentDetailsBy: value }))
                  }
                  placeholder="Select or type payment source"
                  inputStyle={txnStyles.cardInput}
                />
              </View>

              <View style={txnStyles.fieldBlock}>
                <Text style={txnStyles.fieldLabel}>Upload Payment Slip (PDF / Image)</Text>
                <View style={txnStyles.uploadRow}>
                  <Pressable style={txnStyles.uploadBtn} onPress={handleUploadPaymentSlip}>
                    <Text style={txnStyles.uploadBtnText}>Upload Slip</Text>
                  </Pressable>
                  <View style={txnStyles.uploadMetaCard}>
                    <Text style={txnStyles.uploadMetaLabel}>
                      {transactionDetailsForm.paymentSlipType || "Pending"}
                    </Text>
                    <Text style={txnStyles.uploadMetaValue}>
                      {transactionDetailsForm.paymentSlipName || "No file selected"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={txnStyles.metricsGrid}>
                <View style={txnStyles.metricCard}>
                  <Text style={txnStyles.metricLabel}>Principal Due</Text>
                  <Text style={txnStyles.metricValue}>{principalDue}</Text>
                </View>
                <View style={txnStyles.metricCard}>
                  <Text style={txnStyles.metricLabel}>Interest Due</Text>
                  <Text style={txnStyles.metricValue}>{interestDue}</Text>
                </View>
                <View style={txnStyles.metricCard}>
                  <Text style={txnStyles.metricLabel}>Total Due</Text>
                  <Text style={txnStyles.metricValue}>{totalDue}</Text>
                </View>
              </View>

              <View style={txnStyles.fieldBlock}>
                <Text style={txnStyles.fieldLabel}>Principal (Amount Paid)</Text>
                <TextInput
                  style={txnStyles.cardInput}
                  value={transactionDetailsForm.principalPaid}
                  onChangeText={(text) =>
                    setTransactionDetailsForm((prev) => ({
                      ...prev,
                      principalPaid: text.replace(/[^\d.]/g, "")
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={txnStyles.fieldBlock}>
                <Text style={txnStyles.fieldLabel}>Interest (Amount Paid)</Text>
                <TextInput
                  style={txnStyles.cardInput}
                  value={transactionDetailsForm.interestPaid}
                  onChangeText={(text) =>
                    setTransactionDetailsForm((prev) => ({
                      ...prev,
                      interestPaid: text.replace(/[^\d.]/g, "")
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={txnStyles.fieldBlock}>
                <Text style={txnStyles.fieldLabel}>Total (Amount Paid)</Text>
                <TextInput
                  style={txnStyles.cardInput}
                  value={transactionDetailsForm.totalPaid}
                  onChangeText={(text) =>
                    setTransactionDetailsForm((prev) => ({
                      ...prev,
                      totalPaid: text.replace(/[^\d.]/g, "")
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={txnStyles.sectionCard}>
              <Text style={txnStyles.sectionTitle}>Month-wise Repayment Status</Text>
              <View style={txnStyles.summaryCard}>
                <View style={txnStyles.summaryRow}>
                  <Text style={txnStyles.summaryLabel}>Month</Text>
                  <Text style={txnStyles.summaryValue}>{monthName}</Text>
                </View>
                <View style={txnStyles.summaryRow}>
                  <Text style={txnStyles.summaryLabel}>Principal to be Paid</Text>
                  <Text style={txnStyles.summaryValue}>{principalDue}</Text>
                </View>
                <View style={txnStyles.summaryRow}>
                  <Text style={txnStyles.summaryLabel}>Interest to be Paid</Text>
                  <Text style={txnStyles.summaryValue}>{interestDue}</Text>
                </View>
                <View style={txnStyles.summaryRow}>
                  <Text style={txnStyles.summaryLabel}>Principal Paid</Text>
                  <Text style={txnStyles.summaryValue}>{transactionDetailsForm.principalPaid || "0"}</Text>
                </View>
                <View style={txnStyles.summaryRow}>
                  <Text style={txnStyles.summaryLabel}>Interest Paid</Text>
                  <Text style={txnStyles.summaryValue}>{transactionDetailsForm.interestPaid || "0"}</Text>
                </View>
                <View style={txnStyles.summaryRow}>
                  <Text style={txnStyles.summaryLabel}>Outstanding</Text>
                  <Text style={txnStyles.summaryValue}>{outstandingAmount}</Text>
                </View>
              </View>

              <View style={txnStyles.actionRow}>
                <Pressable
                  style={txnStyles.saveBtn}
                  onPress={() => {
                    showSavedDataPopup("Transaction details", transactionDetailsForm, "technicalSupportPast");
                  }}
                >
                  <Text style={txnStyles.saveBtnText}>Save</Text>
                </Pressable>
                <Pressable
                  style={txnStyles.backBtn}
                  onPress={() => onOpenUpdateData("technicalSupportPast")}
                >
                  <Text style={txnStyles.backBtnText}>Back</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
        {renderResponsePopup()}
      </View>
    );
  }

  return (
    <View style={pageStyles.screen}>
      <View style={pageStyles.bgGlowTop} />
      <View style={pageStyles.bgGlowBottom} />
      <View style={pageStyles.frame}>
        <View style={pageStyles.topRow}>
          <View style={pageStyles.imageCard}>
            <Text style={pageStyles.imageAvatarText}>{headerCrpInitials}</Text>
            <Text style={pageStyles.imageText}>CRP</Text>
          </View>
          <View style={pageStyles.infoCard}>
            <Text style={pageStyles.infoLine}>CRP ID: {headerCrpId}</Text>
            <Text style={pageStyles.infoLine}>Name: {headerCrpName}</Text>
          </View>
        </View>

        <View style={pageStyles.dropdownWrap}>
          <Pressable
            style={pageStyles.dropdownTrigger}
            onPress={() => setShowCrpTypeMenu((prev) => !prev)}
          >
            <Text style={pageStyles.dropdownText}>Type of CRP: {selectedCrpType}</Text>
            <Text style={pageStyles.dropdownArrow}>{showCrpTypeMenu ? "^" : "v"}</Text>
          </Pressable>
          {showCrpTypeMenu ? (
            <View style={pageStyles.dropdownMenu}>
              {crpTypeOptions.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    pageStyles.dropdownItem,
                    selectedCrpType === item && pageStyles.dropdownItemActive
                  ]}
                  onPress={() => {
                    setSelectedCrpType(item);
                    setShowCrpTypeMenu(false);
                  }}
                >
                  <Text
                    style={[
                      pageStyles.dropdownItemText,
                      selectedCrpType === item && pageStyles.dropdownItemTextActive
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {renderAlertPopup()}

        <View style={pageStyles.dashboardCard}>
          <View style={pageStyles.dashboardHeadingRow}>
            <View>
              <Text style={pageStyles.dashboardEyebrow}>Live Performance</Text>
              <Text style={pageStyles.dashboardTitle}>Dashboard</Text>
            </View>
            <View style={pageStyles.dashboardDateBadge}>
              <Text style={pageStyles.dashboardDateLabel}>{dashboardDateLabel}</Text>
            </View>
          </View>

          <View style={pageStyles.metricGrid}>
            {dashboardHighlights.map((item) => (
              <View key={item.key} style={pageStyles.metricStatCard}>
                <View style={[pageStyles.metricAccent, { backgroundColor: item.tint }]} />
                <Text style={pageStyles.metricStatLabel}>{item.label}</Text>
                <Text style={pageStyles.metricStatValue}>{item.value}</Text>
                <Text style={pageStyles.metricStatHint}>{item.hint}</Text>
              </View>
            ))}
          </View>

          <View style={pageStyles.dashboardGraphStrip}>
            <View style={pageStyles.dashboardGraphStripCopy}>
              <Text style={pageStyles.dashboardGraphStripTitle}>Insights & Trends</Text>
              <Text style={pageStyles.dashboardGraphStripHint}>
                Open visual summaries for visits, member coverage, and honorarium.
              </Text>
            </View>
            <View style={pageStyles.dashboardGraphStripActions}>
              <Pressable style={pageStyles.graphPill} onPress={() => handleGraphPress("visits")}>
                <Text style={pageStyles.graphText}>Visits</Text>
              </Pressable>
              <Pressable style={[pageStyles.graphPill, pageStyles.graphPillTeal]} onPress={() => handleGraphPress("members")}>
                <Text style={pageStyles.graphText}>Members</Text>
              </Pressable>
              <Pressable style={[pageStyles.graphPill, pageStyles.graphPillOrange]} onPress={() => handleGraphPress("honorarium")}>
                <Text style={pageStyles.graphText}>Honorarium</Text>
              </Pressable>
            </View>
          </View>

          <View style={pageStyles.submitActionRow}>
            <Pressable style={pageStyles.graphActionBtn} onPress={() => handleGraphPress("visits")}>
              <Text style={pageStyles.graphActionBtnText}>Open Graphs</Text>
            </Pressable>
            <Pressable style={pageStyles.submitActionBtn} onPress={onOpenWorkingReport}>
              <Text style={pageStyles.submitActionBtnText}>Submit</Text>
            </Pressable>
          </View>

          <View style={pageStyles.dashboardInlineAlert}>
            <View style={pageStyles.dashboardInlineAlertHeader}>
              <View style={pageStyles.dashboardInlineAlertBadge}>
                <Text style={pageStyles.dashboardInlineAlertBadgeText}>!</Text>
              </View>
              <View style={pageStyles.dashboardInlineAlertCopy}>
                <Text style={pageStyles.dashboardInlineAlertTitle}>Pending & Upcoming Notifications</Text>
                <Text style={pageStyles.dashboardInlineAlertSubtitle}>
                  {dashboardAlertCount} item{dashboardAlertCount > 1 ? "s" : ""} need attention
                </Text>
              </View>
            </View>

            <View style={pageStyles.dashboardInlineAlertList}>
              {dashboardNotificationItems.map((item, index) => (
                <View key={`inline-alert-${index}-${item}`} style={pageStyles.dashboardInlineAlertItem}>
                  <View style={pageStyles.dashboardAlertDot} />
                  <Text style={pageStyles.dashboardInlineAlertText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={pageStyles.dashboardActivityPanel}>
            <Text style={pageStyles.dashboardActivityTitle}>Different Activities of the Concern CRP</Text>
            {activities.length ? (
              activities.slice(0, 3).map((item) => (
                <Text key={item.id} style={pageStyles.dashboardActivityLine}>
                  - {item.title}
                </Text>
              ))
            ) : (
              <Text style={pageStyles.dashboardActivityEmpty}>Daily visit reports will appear here.</Text>
            )}
          </View>
        </View>

        <View style={pageStyles.quickActionsCard}>
          <Text style={pageStyles.quickActionsTitle}>Quick Actions</Text>
          <View style={pageStyles.actionsRow}>
            <Pressable style={[pageStyles.actionBtnMuted, pageStyles.actionBtnAmber]} onPress={onOpenNewEnrolment}>
              <Text style={pageStyles.actionTextMuted}>New{"\n"}Enrolment</Text>
            </Pressable>
            <Pressable style={pageStyles.actionBtnPrimary} onPress={onOpenShgMember}>
              <Text style={pageStyles.actionTextPrimary}>SHG{"\n"}Member</Text>
            </Pressable>
            <Pressable style={[pageStyles.actionBtnMuted, pageStyles.actionBtnSlate]} onPress={onOpenUpdateData}>
              <Text style={pageStyles.actionTextMuted}>Update Data</Text>
            </Pressable>
          </View>
        </View>

        <PostCheckoutModal
          visible={showPostCheckoutModal}
          onClose={() => setShowPostCheckoutModal(false)}
          onLogout={onLogout}
        />
      </View>
    </View>
  );
}
