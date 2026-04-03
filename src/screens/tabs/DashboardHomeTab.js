import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text as RNText, TextInput as RNTextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslatedValue } from "../../i18n/I18nProvider";
import { getCurrentLocation, calculateDistance } from "../../utils/geofence";
import { fetchAllCrps, fetchGpsByBlock, fetchVillagesByGp } from "../../services/masterApi";

function stringifyChildren(children) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    const parts = children.map((child) => stringifyChildren(child));
    return parts.every((part) => typeof part === "string") ? parts.join("") : null;
  }

  return null;
}

function Text({ children, ...props }) {
  const rawText = stringifyChildren(children);
  const translated = useTranslatedValue(rawText ?? children);
  return <RNText {...props}>{translated}</RNText>;
}

function TextInput({ placeholder, ...props }) {
  const translatedPlaceholder = useTranslatedValue(placeholder);
  return <RNTextInput {...props} placeholder={translatedPlaceholder} />;
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
  return (
    <Pressable
      style={[flowStyles.ddBox, style]}
      disabled={options.length === 0}
      onPress={() => {
        if (options.length === 0) {
          return;
        }
        const currentIndex = options.indexOf(value);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
        onChange(options[nextIndex]);
      }}
    >
      <Text style={flowStyles.ddText}>{value || "No data"}</Text>
      <Text style={flowStyles.ddArrow}>v</Text>
    </Pressable>
  );
}

function firstOption(options) {
  return options[0] || "";
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
  onBackToDashboard
}) {
  const reportGeofenceRadius = 150;
  const [showCrpTypeMenu, setShowCrpTypeMenu] = useState(false);
  const [selectedCrpType, setSelectedCrpType] = useState(user.idType || "");
  const crpTypeOptions = [];
  const shgNames = Array.from(
    new Set(assignedShgMembers.map((item) => item.shgName).filter(Boolean))
  );
  const activityTypes = [];
  const subCategories = [];
  const livelihoodCboTypeOptions = [];
  const livelihoodCboNameOptions = [];
  const livelihoodCboActivityOptions = [];
  const [shgName, setShgName] = useState(firstOption(shgNames));
  const shgMembers = assignedShgMembers
    .filter((item) => !shgName || item.shgName === shgName)
    .map((item) => item.memberName);
  const [memberName, setMemberName] = useState(firstOption(shgMembers));
  const [activityType, setActivityType] = useState(firstOption(activityTypes));
  const [subCategory, setSubCategory] = useState(firstOption(subCategories));
  const [openShgDropdown, setOpenShgDropdown] = useState(false);
  const [openMemberDropdown, setOpenMemberDropdown] = useState(false);
  const [openActivityDropdown, setOpenActivityDropdown] = useState(false);
  const [openSubCategoryDropdown, setOpenSubCategoryDropdown] = useState(false);
  const [lhCboType, setLhCboType] = useState(firstOption(livelihoodCboTypeOptions));
  const [selectedLhCboName, setSelectedLhCboName] = useState(firstOption(livelihoodCboNameOptions));
  const [selectedLhCboActivity, setSelectedLhCboActivity] = useState(
    firstOption(livelihoodCboActivityOptions)
  );
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
  const selectedAssignedMember =
    assignedShgMembers.find((item) => item.memberName === memberName) ||
    assignedShgMembers[0] ||
    null;

  // Sample graph data
  const graphData = {
    visits: {
      title: "visits",
      values: [0, 0, 0, 0, 0, 0, 0],
      color: "#3b67b8"
    },
    members: {
      title: "members",
      values: [0, 0, 0, 0, 0, 0, 0],
      color: "#0f766e"
    },
    honorarium: {
      title: "honorarium",
      values: [0, 0, 0, 0, 0, 0, 0],
      color: "#f97316"
    }
  };

  const handleGraphPress = (type) => {
    setGraphType(type);
    setGraphImageFailed(false);
  };

  const closeGraphView = () => {
    setGraphType(null);
  };

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
    [dashboardMetrics.honorariumReceived, dashboardMetrics.honorariumToBeClaimed, dashboardMetrics.totalMembersVisited]
  );

  const selectedPieMeta = graphType ? pieMetaByType[graphType] : null;
  const selectedPieTotal = selectedPieMeta
    ? selectedPieMeta.values.reduce((sum, current) => sum + Math.max(0, Number(current) || 0), 0)
    : 0;

  const pieChartUrl = useMemo(() => {
    if (!selectedPieMeta) return "";
    const quickChartConfig = {
      type: "pie",
      data: {
        labels: selectedPieMeta.labels.map(
          (label, index) => `${label}: ${selectedPieMeta.values[index]}`
        ),
        datasets: [
          {
            data: selectedPieMeta.values,
            backgroundColor: selectedPieMeta.colors
          }
        ]
      },
      options: {
        plugins: {
          legend: { display: false }
        }
      }
    };
    return `https://quickchart.io/chart?width=460&height=320&c=${encodeURIComponent(
      JSON.stringify(quickChartConfig)
    )}`;
  }, [selectedPieMeta]);

  const isWithin50Meters = distanceToMember !== null && distanceToMember <= 50;
  const selectedGp =
    gpOptions.find((item) => String(item.id) === String(selectedGpId)) || null;
  const selectedVillage =
    villageOptions.find((item) => String(item.id) === String(selectedVillageId)) || null;
  const selectedCrpRecord =
    crpOptions.find((item) => String(item.id) === String(selectedCrpRegistrationId)) || null;
  const headerCrpId = selectedCrpRecord?.crpId || user.identity || "CRP-XXX";
  const headerCrpName = selectedCrpRecord?.fullName || user.name || "CRP User";
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
  const lhCboStatusViewByType = {
    "Producers Group (PG)": "lhCboStatusPg",
    "Non-Farm Collective (NFC)": "lhCboStatusNfc",
    "Integrated Farming Cluster Collective (IFC)": "lhCboStatusIfc",
    "Custom Hiring Center Collective (CHC)": "lhCboStatusChc"
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
    if (normalizedSubCategory === "Farm") {
      onOpenUpdateData("lhActivityFarm");
      return;
    }
    onOpenLhCboActivity(currentStatusView);
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
    Alert.alert("Saved", "LH-CBO activity details saved.");
    onOpenUpdateData("lhCboStatusGuide");
  };

  const handleLhCboGuideSaveAndNext = () => {
    onOpenUpdateData(selectedLhCboStatusView);
  };

  const handleProfileSave = (title) => {
    Alert.alert("Saved", `${title} saved successfully.`);
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
    if (!shgName && shgNames.length > 0) {
      setShgName(shgNames[0]);
    }
  }, [shgName, shgNames]);

  useEffect(() => {
    if (!memberName && shgMembers.length > 0) {
      setMemberName(shgMembers[0]);
    }
  }, [memberName, shgMembers]);

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
    if (homeView !== "newEnrolment" || !effectiveBlockId) {
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
    if (homeView !== "newEnrolment" || !selectedGpId) {
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

  const handleUploadImage = () => {
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
        const now = new Date();
        const imageDate = now.toISOString().slice(0, 10);

        setUploadedImageName(asset.fileName || "selected-image");
        setUploadedImageDate(imageDate);
        setUploadedImageUri(asset.uri || "");
        Alert.alert("Image Uploaded", `Selected: ${asset.fileName || "image"}`);
      })
      .catch((error) => {
        Alert.alert("Upload Failed", error.message || "Unable to select image.");
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
        Alert.alert("Video Uploaded", `Selected: ${asset.fileName || "video"}`);
      })
      .catch((error) => {
        Alert.alert("Upload Failed", error.message || "Unable to select video.");
      });
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

          <View style={wrStyles.alertRow}>
            <View style={wrStyles.alertDot} />
            <Text style={wrStyles.alertText}>
              Alerts of Pending & Upcoming Works-
              {alerts.length > 0 ? ` ${alerts[0].message}` : " No pending alerts"}
            </Text>
          </View>

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

          <View style={neStyles.alertRow}>
            <View style={neStyles.alertDot} />
            <Text style={neStyles.alertText}>
              Alerts of Pending & Upcoming Works-
              {alerts.length > 0 ? ` ${alerts[0].message}` : " No pending alerts"}
            </Text>
          </View>

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
              setActivityType(item);
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
              setSubCategory(item);
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
              <Text style={pageStyles.imageText}>CRP{"\n"}Image</Text>
            </View>
            <View style={pageStyles.infoCard}>
              <Text style={pageStyles.infoLine}>CRP ID: {headerCrpId}</Text>
              <Text style={pageStyles.infoLine}>Name: {headerCrpName}</Text>
            </View>
          </View>

          <View style={pageStyles.graphPageCard}>
            <Text style={pageStyles.graphPageTitle}>{selectedPieMeta.title}</Text>

            <View style={pageStyles.piePreviewWrap}>
              {graphImageFailed ? (
                <View style={pageStyles.pieFallbackWrap}>
                  <Text style={pageStyles.pieFallbackText}>Pie preview unavailable</Text>
                  <Text style={pageStyles.pieFallbackSubText}>
                    Showing value distribution below
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: pieChartUrl }}
                  style={pageStyles.piePreviewImage}
                  resizeMode="contain"
                  onError={() => setGraphImageFailed(true)}
                />
              )}
            </View>

            <View style={pageStyles.legendWrap}>
              {selectedPieMeta.labels.map((label, index) => {
                const value = selectedPieMeta.values[index];
                const share =
                  selectedPieTotal > 0 ? Math.round((Number(value) / selectedPieTotal) * 100) : 0;
                return (
                  <View key={`${graphType}-${label}`} style={pageStyles.legendRow}>
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
          <View style={flowStyles.headerCard}>
            <Text style={flowStyles.headerLine}>SHG Member Name: {memberName}</Text>
            <Text style={flowStyles.headerLine}>SHG Name: {shgName}</Text>
          </View>

          <Text style={flowStyles.statusTitle}>{statusTitleMap[homeView]}</Text>

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

          <View style={flowStyles.footerRow}>
            <View
              style={[
                flowStyles.geoDot,
                isWithin50Meters ? flowStyles.geoDotGreen : flowStyles.geoDotRed
              ]}
            />
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

  if (homeView === "lhActivityFarm") {
    const activityNameOptions = [];
    const unitAreaOptions = ["Bigha", "Acre", "Hectare"];
    const typeOptions = ["Kharif", "Rabi", "Perennial"];
    const seasonOptions = ["Seasonal", "Summer", "Winter", "Rainy"];
    const landOptions = ["Plain", "Low Land", "Tila"];
    const productionOptions = ["Crop", "Milk", "Craft", "Processed Food"];
    const productionUnitOptions = ["KG", "Quintal", "Litre", "Unit"];

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, apStyles.frame]}>
            <View style={apStyles.titleWrap}>
              <Text style={apStyles.title}>Activity Profile</Text>
            </View>
            <Text style={apStyles.sectionType}>Farm</Text>

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>Name of the Activity:</Text>
                <CycleDropdown
                  value={activityProfile.activityName}
                  options={activityNameOptions}
                  style={apStyles.dropdown}
                  onChange={(value) =>
                    setActivityProfile((prev) => ({ ...prev, activityName: value }))
                  }
                />
              </View>
            </View>

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>Quantum of Area:</Text>
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
                  placeholder="Type"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>Unit of Area:</Text>
                <CycleDropdown
                  value={activityProfile.areaUnit}
                  options={unitAreaOptions}
                  style={apStyles.dropdown}
                  onChange={(value) => setActivityProfile((prev) => ({ ...prev, areaUnit: value }))}
                />
              </View>
            </View>

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>Type of Activity:</Text>
                <CycleDropdown
                  value={activityProfile.activityMode}
                  options={typeOptions}
                  style={apStyles.dropdown}
                  onChange={(value) =>
                    setActivityProfile((prev) => ({ ...prev, activityMode: value }))
                  }
                />
              </View>
            </View>

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>Type of Seasonal:</Text>
                <CycleDropdown
                  value={activityProfile.seasonality}
                  options={seasonOptions}
                  style={apStyles.dropdown}
                  onChange={(value) =>
                    setActivityProfile((prev) => ({ ...prev, seasonality: value }))
                  }
                />
              </View>
            </View>

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>If Perennial:</Text>
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
                  placeholder="Type years"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>Type of Land:</Text>
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
                  handleProfileSave("Activity profile");
                  onOpenUpdateData("lhStatusFarm");
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

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>Name of the production:</Text>
                <CycleDropdown
                  value={activityProfile.productionName}
                  options={productionOptions}
                  style={apStyles.dropdown}
                  onChange={(value) =>
                    setActivityProfile((prev) => ({ ...prev, productionName: value }))
                  }
                />
              </View>
            </View>

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>Production Quantity:</Text>
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
                  placeholder="Type"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={apStyles.row}>
              <View style={apStyles.leftRow}>
                <Text style={apStyles.label}>Production Unit:</Text>
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
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.gstRenewalDate}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, gstRenewalDate: text }))
                }
                placeholder="DD-MM-YY"
                placeholderTextColor="#64748b"
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
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.panRenewalDate}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, panRenewalDate: text }))
                }
                placeholder="DD-MM-YY"
                placeholderTextColor="#64748b"
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
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.udhyamRenewalDate}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, udhyamRenewalDate: text }))
                }
                placeholder="DD-MM-YY"
                placeholderTextColor="#64748b"
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
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.fssaiRenewalDate}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, fssaiRenewalDate: text }))
                }
                placeholder="DD-MM-YY"
                placeholderTextColor="#64748b"
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
              <TextInput
                style={nfStyles.input}
                value={nonFarmEnterprise.tinRenewalDate}
                onChangeText={(text) =>
                  setNonFarmEnterprise((prev) => ({ ...prev, tinRenewalDate: text }))
                }
                placeholder="DD-MM-YY"
                placeholderTextColor="#64748b"
              />
            </View>

            <Pressable
              style={nfStyles.saveBtn}
              onPress={() => {
                handleProfileSave("Non-Farm enterprise profile");
                onOpenUpdateData(currentStatusView);
              }}
            >
              <Text style={nfStyles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        </ScrollView>
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
          <Pressable style={flowStyles.primarySaveBtn} onPress={() => handleProfileSave("Livestock activity profile")}>
            <Text style={flowStyles.primarySaveText}>Save</Text>
          </Pressable>
          <Pressable style={wrStyles.backBtn} onPress={() => onOpenUpdateData("lhStatusLivestock")}>
            <Text style={wrStyles.backBtnText}>Back to Status</Text>
          </Pressable>
        </View>
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
          <Pressable style={flowStyles.primarySaveBtn} onPress={() => handleProfileSave("Fishery activity profile")}>
            <Text style={flowStyles.primarySaveText}>Save</Text>
          </Pressable>
          <Pressable style={wrStyles.backBtn} onPress={() => onOpenUpdateData("lhStatusFishery")}>
            <Text style={wrStyles.backBtnText}>Back to Status</Text>
          </Pressable>
        </View>
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
        <View style={pageStyles.frame}>
          <Text style={flowStyles.formTitle}>Investment Profile</Text>
          {numericFields.map((item) => (
            <View style={flowStyles.formRow} key={item.key}>
              <Text style={flowStyles.formLabel}>{item.label}:</Text>
              <TextInput
                style={flowStyles.input}
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
          <Pressable style={flowStyles.primarySaveBtn} onPress={() => handleProfileSave("Investment profile")}>
            <Text style={flowStyles.primarySaveText}>Save</Text>
          </Pressable>
          <Pressable style={wrStyles.backBtn} onPress={() => onOpenUpdateData(currentStatusView)}>
            <Text style={wrStyles.backBtnText}>Back to Status</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (homeView === "lhIncome") {
    const monthRows = ["month1", "month2", "month3", "month4", "month5", "month6"];

    return (
      <View style={pageStyles.screen}>
        <View style={pageStyles.frame}>
          <Text style={flowStyles.formTitle}>Income Profile</Text>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Total Income Since last year:</Text>
            <TextInput
              style={flowStyles.input}
              value={incomeProfile.totalIncomeLastYear}
              onChangeText={(text) =>
                setIncomeProfile((prev) => ({
                  ...prev,
                  totalIncomeLastYear: text.replace(/[^\d.]/g, "")
                }))
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Present Month Income:</Text>
            <TextInput
              style={flowStyles.input}
              value={incomeProfile.presentMonthIncome}
              onChangeText={(text) =>
                setIncomeProfile((prev) => ({
                  ...prev,
                  presentMonthIncome: text.replace(/[^\d.]/g, "")
                }))
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={flowStyles.formRow}>
            <Text style={flowStyles.formLabel}>Future Projection (Next Six Month):</Text>
            <TextInput
              style={flowStyles.input}
              value={incomeProfile.futureProjection}
              onChangeText={(text) =>
                setIncomeProfile((prev) => ({
                  ...prev,
                  futureProjection: text.replace(/[^\d.]/g, "")
                }))
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#64748b"
            />
          </View>
          {monthRows.map((monthKey, index) => (
            <View style={flowStyles.formRow} key={monthKey}>
              <Text style={flowStyles.formLabel}>Month {index + 1} Actual Income:</Text>
              <TextInput
                style={flowStyles.input}
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
          <Pressable style={flowStyles.primarySaveBtn} onPress={() => handleProfileSave("Income profile")}>
            <Text style={flowStyles.primarySaveText}>Save</Text>
          </Pressable>
          <Pressable style={wrStyles.backBtn} onPress={() => onOpenUpdateData(currentStatusView)}>
            <Text style={wrStyles.backBtnText}>Back to Status</Text>
          </Pressable>
        </View>
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
      "Producers Group (PG)":
        "- If Producers Group Activity is selected, further details will be shown on Page 1B.8A",
      "Non-Farm Collective (NFC)":
        "- If Non-Farm Collective Activity is selected, further details will be shown on Page 1B.8B",
      "Integrated Farming Cluster Collective (IFC)":
        "- If Integrated Farming Cluster Activity is selected, further details will be shown on Page 1B.8C",
      "Custom Hiring Center Collective (CHC)":
        "- If Custom Hiring Center Activity is selected, further details will be shown on Page 1B.8D"
    };
    const selectedRuleText =
      selectedRuleTextByType[lhCboType] || selectedRuleTextByType["Producers Group (PG)"];

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
              <View style={[lhGuideStyles.geoDot, lhGuideStyles.geoDotRed]} />
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
    homeView === "lhCboStatusChc"
  ) {
    const isChcView = homeView === "lhCboStatusChc";
    const titleMetaMap = {
      lhCboStatusPg: { page: "Page:1B.8A", red: "Producers Group", tail: " Activity Status" },
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
      }
    };
    const headerNameMap = {
      lhCboStatusPg: "PG Name",
      lhCboStatusNfc: "NFC Name",
      lhCboStatusIfc: "IFC Name",
      lhCboStatusChc: "CHC Name"
    };
    const buttonLabelMap = {
      lhCboStatusPg: ["Activity Profile", "Financial Status", "Income\nStatus"],
      lhCboStatusNfc: ["Activity Profile", "Financial Status", "Income\nStatus"],
      lhCboStatusIfc: ["Activity Profile", "Financial Status", "Income\nStatus"]
    };
    const activityRouteMap = {
      lhCboStatusPg: "lhActivityFarm",
      lhCboStatusNfc: "lhActivityNonFarm",
      lhCboStatusIfc: "lhActivityFarm"
    };

    return (
      <View style={pageStyles.screen}>
        <View style={[pageStyles.frame, lhcboStatusStyles.frame]}>
          <Text style={lhcboStatusStyles.titleText}>
            <Text style={lhcboStatusStyles.titlePage}>{titleMetaMap[homeView].page} </Text>
            <Text style={lhcboStatusStyles.titleRed}>{titleMetaMap[homeView].red}</Text>
            <Text style={lhcboStatusStyles.titlePage}>{titleMetaMap[homeView].tail}</Text>
          </Text>
          <View style={lhcboStatusStyles.headerCard}>
            <Text style={lhcboStatusStyles.headerLine}>
              {headerNameMap[homeView]}: {selectedLhCboName}
            </Text>
            <Text style={lhcboStatusStyles.headerLine}>GP/VC Name: {user.gpVcName || "-"}</Text>
          </View>

          <View style={lhcboStatusStyles.contentCard}>
            {isChcView ? (
              <View style={lhcboStatusStyles.chcPlaceholder} />
            ) : (
              <View style={lhcboStatusStyles.buttonStack}>
                <Pressable
                  style={lhcboStatusStyles.blockBtn}
                  onPress={() => onOpenUpdateData(activityRouteMap[homeView])}
                >
                  <Text style={lhcboStatusStyles.blockBtnText}>{buttonLabelMap[homeView][0]}</Text>
                </Pressable>
                <Pressable
                  style={lhcboStatusStyles.blockBtn}
                  onPress={() => onOpenUpdateData("technicalSupportFinancial")}
                >
                  <Text style={lhcboStatusStyles.blockBtnText}>{buttonLabelMap[homeView][1]}</Text>
                </Pressable>
                <Pressable
                  style={lhcboStatusStyles.blockBtn}
                  onPress={() => onOpenUpdateData("lhIncome")}
                >
                  <Text style={lhcboStatusStyles.blockBtnText}>{buttonLabelMap[homeView][2]}</Text>
                </Pressable>
              </View>
            )}

            <View style={lhcboStatusStyles.footerRow}>
              <View
                style={[
                  lhcboStatusStyles.geoDot,
                  isWithin50Meters ? lhcboStatusStyles.geoDotGreen : lhcboStatusStyles.geoDotRed
                ]}
              />
              <Pressable style={lhcboStatusStyles.saveBtn} onPress={() => onOpenUpdateData("technicalSupport")}>
                <Text style={lhcboStatusStyles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (homeView === "technicalSupport") {
    return (
      <View style={pageStyles.screen}>
        <View style={[pageStyles.frame, tsCardStyles.frame]}>
          <View style={tsCardStyles.headerCard}>
            <Text style={tsCardStyles.headerLine}>SHG Member Name: {memberName || "xxxxxxxxxx xxxx"}</Text>
            <Text style={tsCardStyles.headerLine}>SHG Name: {shgName || "xxxxxxxxxx SHG"}</Text>
          </View>

          <Pressable
            style={tsCardStyles.mainButton}
            onPress={() => onOpenUpdateData("technicalSupportTech")}
          >
            <Text style={tsCardStyles.mainButtonText}>Technical Support{"\n"}Details</Text>
          </Pressable>
          <Pressable
            style={tsCardStyles.mainButton}
            onPress={() => onOpenUpdateData("technicalSupportFinancial")}
          >
            <Text style={tsCardStyles.mainButtonText}>Financial Support{"\n"}Details</Text>
          </Pressable>

          <View style={tsCardStyles.segmentRow}>
            {["Past Supports", "Present Support", "Support Required"].map((item) => (
              <Pressable
                key={item}
                style={[
                  tsCardStyles.segmentBtn,
                  supportStage === item && tsCardStyles.segmentBtnActive
                ]}
                onPress={() => {
                  setSupportStage(item);
                  if (item === "Past Supports") {
                    onOpenUpdateData("technicalSupportPast");
                    return;
                  }
                  onOpenUpdateData("technicalSupportFinancial");
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

          <View style={tsCardStyles.footerRow}>
            <View
              style={[
                tsCardStyles.geoDot,
                isWithin50Meters ? tsCardStyles.geoDotGreen : tsCardStyles.geoDotRed
              ]}
            />
            <Pressable
              style={tsCardStyles.saveBtn}
              onPress={() => {
                Alert.alert("Saved", "Technical support details saved.");
                onOpenShgMember();
              }}
            >
              <Text style={tsCardStyles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (homeView === "technicalSupportTech") {
    const yesNoOptions = ["Yes", "No"];
    const tradeOptions = [];
    const throughOptions = [];

    return (
      <View style={pageStyles.screen}>
        <View style={[pageStyles.frame, tsDetailStyles.frame]}>
          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>Having Skill Training:</Text>
            <CycleDropdown
              value={technicalSupportForm.havingSkillTraining}
              options={yesNoOptions}
              style={tsDetailStyles.dropdown}
              onChange={(value) =>
                setTechnicalSupportForm((prev) => ({ ...prev, havingSkillTraining: value }))
              }
            />
          </View>
          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>If Yes, Name of the Trade:</Text>
            <CycleDropdown
              value={technicalSupportForm.skillTrade}
              options={tradeOptions}
              style={tsDetailStyles.dropdown}
              onChange={(value) =>
                setTechnicalSupportForm((prev) => ({ ...prev, skillTrade: value }))
              }
            />
          </View>
          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>Date of Training:</Text>
            <TextInput
              style={tsDetailStyles.input}
              value={technicalSupportForm.skillDate}
              onChangeText={(text) =>
                setTechnicalSupportForm((prev) => ({ ...prev, skillDate: text }))
              }
              placeholder="DD-MM-YY"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>Training Executed Through:</Text>
            <CycleDropdown
              value={technicalSupportForm.skillThrough}
              options={throughOptions}
              style={tsDetailStyles.dropdown}
              onChange={(value) =>
                setTechnicalSupportForm((prev) => ({ ...prev, skillThrough: value }))
              }
            />
          </View>

          <View style={tsDetailStyles.divider} />

          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>Having EDP Training:</Text>
            <CycleDropdown
              value={technicalSupportForm.havingEdpTraining}
              options={yesNoOptions}
              style={tsDetailStyles.dropdown}
              onChange={(value) =>
                setTechnicalSupportForm((prev) => ({ ...prev, havingEdpTraining: value }))
              }
            />
          </View>
          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>If Yes, Name of the Trade:</Text>
            <CycleDropdown
              value={technicalSupportForm.edpTrade}
              options={tradeOptions}
              style={tsDetailStyles.dropdown}
              onChange={(value) =>
                setTechnicalSupportForm((prev) => ({ ...prev, edpTrade: value }))
              }
            />
          </View>
          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>Date of Training:</Text>
            <TextInput
              style={tsDetailStyles.input}
              value={technicalSupportForm.edpDate}
              onChangeText={(text) =>
                setTechnicalSupportForm((prev) => ({ ...prev, edpDate: text }))
              }
              placeholder="DD-MM-YY"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>Training Executed Through:</Text>
            <CycleDropdown
              value={technicalSupportForm.edpThrough}
              options={throughOptions}
              style={tsDetailStyles.dropdown}
              onChange={(value) =>
                setTechnicalSupportForm((prev) => ({ ...prev, edpThrough: value }))
              }
            />
          </View>

          <View style={tsDetailStyles.divider} />

          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>Training Requirement:</Text>
            <CycleDropdown
              value={technicalSupportForm.trainingRequirement}
              options={yesNoOptions}
              style={tsDetailStyles.dropdown}
              onChange={(value) =>
                setTechnicalSupportForm((prev) => ({ ...prev, trainingRequirement: value }))
              }
            />
          </View>
          <View style={tsDetailStyles.row}>
            <Text style={tsDetailStyles.label}>Training Required Trade:</Text>
            <CycleDropdown
              value={technicalSupportForm.trainingRequiredTrade}
              options={tradeOptions}
              style={tsDetailStyles.dropdown}
              onChange={(value) =>
                setTechnicalSupportForm((prev) => ({ ...prev, trainingRequiredTrade: value }))
              }
            />
          </View>

          <Pressable
            style={tsDetailStyles.saveBtn}
            onPress={() => {
              Alert.alert("Saved", "Technical support details saved.");
              onOpenUpdateData("technicalSupport");
            }}
          >
            <Text style={tsDetailStyles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (homeView === "technicalSupportFinancial") {
    const activityOptions = [];
    const loanCycleOptions = ["Cycle 1", "Cycle 2", "Cycle 3"];

    return (
      <View style={pageStyles.screen}>
        <View style={[pageStyles.frame, fsStyles.frame]}>
          <View style={fsStyles.row}>
            <Text style={fsStyles.label}>Activity of the Member:</Text>
            <CycleDropdown
              value={financialSupportForm.activityOfMember}
              options={activityOptions}
              style={fsStyles.dropdown}
              onChange={(value) =>
                setFinancialSupportForm((prev) => ({ ...prev, activityOfMember: value }))
              }
            />
          </View>

          <View style={fsStyles.row}>
            <Text style={fsStyles.label}>Financial Support Required:</Text>
            <Pressable
              style={fsStyles.toggleWrap}
              onPress={() =>
                setFinancialSupportForm((prev) => ({
                  ...prev,
                  financialSupportRequired: !prev.financialSupportRequired
                }))
              }
            >
              <View
                style={[
                  fsStyles.toggleDot,
                  financialSupportForm.financialSupportRequired
                    ? fsStyles.toggleDotOn
                    : fsStyles.toggleDotOff
                ]}
              />
              <Text style={fsStyles.toggleText}>
                {financialSupportForm.financialSupportRequired ? "Yes" : "No"}
              </Text>
            </Pressable>
          </View>

          <View style={fsStyles.row}>
            <Text style={fsStyles.label}>Loan Cycle of Support Preferred:</Text>
            <CycleDropdown
              value={financialSupportForm.loanCyclePreferred}
              options={loanCycleOptions}
              style={fsStyles.dropdown}
              onChange={(value) =>
                setFinancialSupportForm((prev) => ({ ...prev, loanCyclePreferred: value }))
              }
            />
          </View>

          <View style={fsStyles.bottomRow}>
            <Pressable
              style={fsStyles.popupBtn}
              onPress={() =>
                Alert.alert(
                  "Pop-Up Loan Cycle",
                  `${financialSupportForm.loanCyclePreferred} for ${financialSupportForm.activityOfMember}`
                )
              }
            >
              <Text style={fsStyles.popupBtnText}>Pop-Up{"\n"}Loan{"\n"}Cycle</Text>
            </Pressable>
            <Pressable
              style={fsStyles.saveBtn}
              onPress={() => {
                Alert.alert("Saved", "Financial support details saved.");
                onOpenUpdateData("technicalSupport");
              }}
            >
              <Text style={fsStyles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (homeView === "technicalSupportPast") {
    const activityOptions = [];
    const sourceOptions = [];
    const rateOptions = ["8", "10", "12", "14"];
    const statusOptions = ["Pending", "Completed"];
    const topBalance = Math.max(
      (Number(pastSupportForm.topAmount) || 0) - (Number(pastSupportForm.repaymentCompleted) || 0),
      0
    );

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, pastStyles.frame]}>
            <View style={pastStyles.section}>
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>Financial Support Taken on LH Activity:</Text>
                <CycleDropdown
                  value={pastSupportForm.topActivity}
                  options={activityOptions}
                  style={pastStyles.dropdown}
                  onChange={(value) => setPastSupportForm((prev) => ({ ...prev, topActivity: value }))}
                />
              </View>
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>Amount of Loan Taken:</Text>
                <TextInput
                  style={pastStyles.input}
                  value={pastSupportForm.topAmount}
                  onChangeText={(text) =>
                    setPastSupportForm((prev) => ({ ...prev, topAmount: text.replace(/[^\d.]/g, "") }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>SHG Loan taken through:</Text>
                <CycleDropdown
                  value={pastSupportForm.topLoanThrough}
                  options={sourceOptions}
                  style={pastStyles.dropdown}
                  onChange={(value) =>
                    setPastSupportForm((prev) => ({ ...prev, topLoanThrough: value }))
                  }
                />
              </View>
              <Pressable style={pastStyles.saveBtn}>
                <Text style={pastStyles.saveBtnText}>Save</Text>
              </Pressable>
            </View>

            <View style={pastStyles.section}>
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>Financial Support Taken on LH Activity:</Text>
                <CycleDropdown
                  value={pastSupportForm.bottomActivity}
                  options={activityOptions}
                  style={pastStyles.dropdown}
                  onChange={(value) =>
                    setPastSupportForm((prev) => ({ ...prev, bottomActivity: value }))
                  }
                />
              </View>
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>Amount of Loan Taken:</Text>
                <TextInput
                  style={pastStyles.input}
                  value={pastSupportForm.bottomAmount}
                  onChangeText={(text) =>
                    setPastSupportForm((prev) => ({ ...prev, bottomAmount: text.replace(/[^\d.]/g, "") }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>SHG Loan taken through:</Text>
                <CycleDropdown
                  value={pastSupportForm.bottomLoanThrough}
                  options={sourceOptions}
                  style={pastStyles.dropdown}
                  onChange={(value) =>
                    setPastSupportForm((prev) => ({ ...prev, bottomLoanThrough: value }))
                  }
                />
              </View>
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>Rate of Interest:</Text>
                <CycleDropdown
                  value={pastSupportForm.interestRate}
                  options={rateOptions}
                  style={pastStyles.dropdown}
                  onChange={(value) => setPastSupportForm((prev) => ({ ...prev, interestRate: value }))}
                />
              </View>
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>Repayment Completed:</Text>
                <TextInput
                  style={pastStyles.input}
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
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>Balance Amount:</Text>
                <TextInput style={pastStyles.inputReadOnly} value={`${topBalance}`} editable={false} />
              </View>
              <View style={pastStyles.row}>
                <Text style={pastStyles.label}>Transaction Status:</Text>
                <CycleDropdown
                  value={pastSupportForm.transactionStatus}
                  options={statusOptions}
                  style={pastStyles.dropdown}
                  onChange={(value) =>
                    setPastSupportForm((prev) => ({ ...prev, transactionStatus: value }))
                  }
                />
              </View>
              <Pressable
                style={pastStyles.linkBtn}
                onPress={() => onOpenUpdateData("technicalSupportTransaction")}
              >
                <Text style={pastStyles.linkBtnText}>Transaction Details</Text>
              </Pressable>
              <Pressable
                style={pastStyles.saveBtn}
                onPress={() => {
                  Alert.alert("Saved", "Past support details saved.");
                  onOpenUpdateData("technicalSupport");
                }}
              >
                <Text style={pastStyles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (homeView === "technicalSupportTransaction") {
    const paymentByOptions = [];
    const principalDue = Number(pastSupportForm.bottomAmount) || 0;
    const interestDue = Number(((principalDue * (Number(pastSupportForm.interestRate) || 0)) / 100).toFixed(2));
    const totalDue = Number((principalDue + interestDue).toFixed(2));
    const monthName = new Date().toLocaleString("en-US", { month: "short" });

    return (
      <View style={pageStyles.screen}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[pageStyles.frame, txnStyles.frame]}>
            <View style={txnStyles.row}>
              <Text style={txnStyles.label}>Present Month Loan Repayment Status:</Text>
              <TextInput
                style={txnStyles.input}
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

            <View style={txnStyles.row}>
              <Text style={txnStyles.label}>Payment Details of Loan Taken By:</Text>
              <CycleDropdown
                value={transactionDetailsForm.paymentDetailsBy}
                options={paymentByOptions}
                style={txnStyles.dropdown}
                onChange={(value) =>
                  setTransactionDetailsForm((prev) => ({ ...prev, paymentDetailsBy: value }))
                }
              />
            </View>

            <View style={txnStyles.row}>
              <Text style={txnStyles.label}>Upload the Payment Slip:</Text>
              <TextInput
                style={txnStyles.input}
                value={transactionDetailsForm.paymentSlipName}
                onChangeText={(text) =>
                  setTransactionDetailsForm((prev) => ({ ...prev, paymentSlipName: text }))
                }
                placeholder="JPEG Slip Name"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={txnStyles.row}>
              <Text style={txnStyles.label}>Principal (To be pay as per Loan Cycle):</Text>
              <TextInput style={txnStyles.inputReadOnly} value={`${principalDue}`} editable={false} />
            </View>
            <View style={txnStyles.row}>
              <Text style={txnStyles.label}>Interest (To be pay as per Loan Cycle):</Text>
              <TextInput style={txnStyles.inputReadOnly} value={`${interestDue}`} editable={false} />
            </View>
            <View style={txnStyles.row}>
              <Text style={txnStyles.label}>Total (To be pay as per Loan Cycle):</Text>
              <TextInput style={txnStyles.inputReadOnly} value={`${totalDue}`} editable={false} />
            </View>

            <View style={txnStyles.row}>
              <Text style={txnStyles.label}>Principal (Amount Paid):</Text>
              <TextInput
                style={txnStyles.input}
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
            <View style={txnStyles.row}>
              <Text style={txnStyles.label}>Interest (Amount Paid):</Text>
              <TextInput
                style={txnStyles.input}
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
            <View style={txnStyles.row}>
              <Text style={txnStyles.label}>Total (Amount Paid):</Text>
              <TextInput
                style={txnStyles.input}
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

            <Text style={txnStyles.tableTitle}>Month-wise Repayment Status:</Text>
            <View style={txnStyles.table}>
              <View style={txnStyles.tableHead}>
                <Text style={txnStyles.thMonth}>Month</Text>
                <Text style={txnStyles.th}>Principal to be Pay</Text>
                <Text style={txnStyles.th}>Interest to be Pay</Text>
                <Text style={txnStyles.th}>Principal Paid</Text>
                <Text style={txnStyles.th}>Interest Paid</Text>
                <Text style={txnStyles.th}>Outstanding</Text>
              </View>
              <View style={txnStyles.tableRow}>
                <Text style={txnStyles.tdMonth}>{monthName}</Text>
                <Text style={txnStyles.td}>{principalDue}</Text>
                <Text style={txnStyles.td}>{interestDue}</Text>
                <Text style={txnStyles.td}>{transactionDetailsForm.principalPaid || "0"}</Text>
                <Text style={txnStyles.td}>{transactionDetailsForm.interestPaid || "0"}</Text>
                <Text style={txnStyles.td}>
                  {Math.max(
                    totalDue - ((Number(transactionDetailsForm.principalPaid) || 0) + (Number(transactionDetailsForm.interestPaid) || 0)),
                    0
                  ).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={txnStyles.buttonRow}>
              <Pressable
                style={txnStyles.actionBtn}
                onPress={() => {
                  Alert.alert("Saved", "Transaction details saved.");
                  onOpenUpdateData("technicalSupportPast");
                }}
              >
                <Text style={txnStyles.actionBtnText}>Save</Text>
              </Pressable>
              <Pressable
                style={txnStyles.backBtn}
                onPress={() => onOpenUpdateData("technicalSupportPast")}
              >
                <Text style={txnStyles.backBtnText}>Back</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
            <Text style={pageStyles.imageText}>CRP{"\n"}Image</Text>
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

        <Modal
          visible={showDashboardAlerts}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDashboardAlerts(false)}
        >
          <View pointerEvents="box-none" style={pageStyles.alertPopupOverlay}>
            <Pressable
              style={pageStyles.alertPopupCard}
              onPress={() => setShowDashboardAlerts(false)}
            >
              <View style={pageStyles.dashboardAlertHeader}>
                <View style={pageStyles.dashboardAlertIconWrap}>
                  <Text style={pageStyles.dashboardAlertIcon}>!</Text>
                </View>
                <View style={pageStyles.dashboardAlertCopy}>
                  <Text style={pageStyles.dashboardAlertTitle}>Notifications</Text>
                  <Text style={pageStyles.dashboardAlertHint}>{firstDashboardNotification}</Text>
                </View>
                <View style={pageStyles.dashboardAlertBadge}>
                  <Text style={pageStyles.dashboardAlertBadgeText}>{dashboardAlertCount}</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </Modal>

        <View style={pageStyles.dashboardCard}>
          <Text style={pageStyles.dashboardTitle}>Dashboard</Text>

          <View style={pageStyles.metricCompactCard}>
            <View style={pageStyles.metricCompactLeft}>
              <Text style={pageStyles.metricCompactLabel}>Total Field Visit in last 30 days</Text>
              <Pressable style={pageStyles.graphPill} onPress={() => handleGraphPress("visits")}>
                <Text style={pageStyles.graphText}>Graph</Text>
              </Pressable>
            </View>
            <Text style={pageStyles.metricCompactValue}>{dashboardMetrics.totalVisits30}</Text>
          </View>

          <View style={pageStyles.metricCompactCard}>
            <View style={pageStyles.metricCompactLeft}>
              <Text style={pageStyles.metricCompactLabel}>Total SHG Members Visited</Text>
              <Pressable style={pageStyles.graphPill} onPress={() => handleGraphPress("members")}>
                <Text style={pageStyles.graphText}>Graph</Text>
              </Pressable>
            </View>
            <Text style={pageStyles.metricCompactValue}>{dashboardMetrics.totalMembersVisited}</Text>
          </View>

          <View style={pageStyles.metricCompactCard}>
            <View style={pageStyles.metricCompactLeft}>
              <Text style={pageStyles.metricCompactLabel}>Honorarium to be Claimed</Text>
              <Pressable style={pageStyles.graphPill} onPress={() => handleGraphPress("honorarium")}>
                <Text style={pageStyles.graphText}>Graph</Text>
              </Pressable>
            </View>
            <Text style={pageStyles.metricCompactValue}>{dashboardMetrics.honorariumToBeClaimed}</Text>
          </View>

          <View style={pageStyles.metricCompactCard}>
            <View style={pageStyles.metricCompactLeft}>
              <Text style={pageStyles.metricCompactLabel}>Last Honorarium Received</Text>
            </View>
            <Text style={pageStyles.metricCompactValue}>
              {dashboardMetrics.honorariumReceived || "0"}
            </Text>
          </View>

          <View style={pageStyles.submitActionRow}>
            <Pressable style={pageStyles.graphActionBtn} onPress={() => handleGraphPress("visits")}>
              <Text style={pageStyles.graphActionBtnText}>Graph</Text>
            </Pressable>
            <Pressable style={pageStyles.submitActionBtn} onPress={onOpenWorkingReport}>
              <Text style={pageStyles.submitActionBtnText}>Submit</Text>
            </Pressable>
          </View>

          <View style={pageStyles.dashboardInlineAlert}>
            <View style={pageStyles.dashboardAlertDot} />
            <Text style={pageStyles.dashboardInlineAlertText}>
              Alerts of Pending & Upcoming Works-
              {alerts.length > 0 ? ` ${alerts[0].message}` : " No pending alerts"}
            </Text>
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
            <Pressable style={pageStyles.actionBtnMuted} onPress={onOpenNewEnrolment}>
              <Text style={pageStyles.actionTextMuted}>New{"\n"}Enrolment</Text>
            </Pressable>
            <Pressable style={pageStyles.actionBtnPrimary} onPress={onOpenShgMember}>
              <Text style={pageStyles.actionTextPrimary}>SHG{"\n"}Member</Text>
            </Pressable>
            <Pressable style={pageStyles.actionBtnMuted} onPress={onOpenUpdateData}>
              <Text style={pageStyles.actionTextMuted}>Update Data</Text>
            </Pressable>
          </View>
        </View>

      </View>
    </View>
  );
}

const pageStyles = StyleSheet.create({
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
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 92,
    paddingHorizontal: 12
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

const wrStyles = StyleSheet.create({
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

const neStyles = StyleSheet.create({
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

const smStyles = StyleSheet.create({
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

const flowStyles = StyleSheet.create({
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
  statusTitle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800"
  },
  profileButton: {
    backgroundColor: "#3b67b8",
    borderWidth: 1,
    borderColor: "#3159a5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 6
  },
  profileButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800"
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8
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
  primarySaveBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    borderWidth: 1,
    borderColor: "#c2410c",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9
  },
  primarySaveText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  },
  statusBackBtn: {
    marginTop: 2,
    backgroundColor: "#1e40af",
    borderWidth: 1,
    borderColor: "#1e3a8a",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9
  },
  statusBackBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
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
  ddBox: {
    width: 128,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 4,
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  ddText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
    marginRight: 6
  },
  ddArrow: {
    color: "#f97316",
    fontSize: 12,
    fontWeight: "900"
  }
});

const apStyles = StyleSheet.create({
  frame: {
    borderRadius: 2,
    borderColor: "#8c8c8c",
    backgroundColor: "#d7d7d7",
    padding: 8
  },
  titleWrap: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#555555",
    backgroundColor: "#e6e6e6",
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  title: {
    color: "#1f1f1f",
    fontSize: 24,
    fontWeight: "700"
  },
  sectionType: {
    alignSelf: "flex-end",
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  leftRow: {
    width: "66%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  label: {
    flex: 1,
    color: "#111827",
    fontSize: 12,
    fontWeight: "600"
  },
  input: {
    width: 110,
    borderWidth: 1,
    borderColor: "#5f5f5f",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 4
  },
  dropdown: {
    width: 110,
    borderRadius: 0,
    borderColor: "#5f5f5f",
    paddingVertical: 4
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 4
  },
  actionBtn: {
    minWidth: 86,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4d7dc9",
    borderWidth: 1,
    borderColor: "#3159a5",
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  actionBtnText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700"
  }
});

const nfStyles = StyleSheet.create({
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

const tsCardStyles = StyleSheet.create({
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

const tsDetailStyles = StyleSheet.create({
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

const fsStyles = StyleSheet.create({
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

const pastStyles = StyleSheet.create({
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

const txnStyles = StyleSheet.create({
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

const lhcboStyles = StyleSheet.create({
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

const lhGuideStyles = StyleSheet.create({
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

const lhcboStatusStyles = StyleSheet.create({
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

const lhStyles = StyleSheet.create({
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





