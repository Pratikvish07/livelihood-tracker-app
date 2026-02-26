import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getCurrentLocation, calculateDistance } from "../../utils/geofence";

function DropdownField({
  label,
  value,
  options,
  open,
  onToggle,
  onSelect
}) {
  return (
    <View style={smStyles.fieldRow}>
      <Text style={smStyles.fieldLabel}>{label}</Text>
      <Pressable style={smStyles.dropdownTrigger} onPress={onToggle}>
        <Text style={smStyles.dropdownTriggerText}>{value}</Text>
        <Text style={smStyles.dropdownArrow}>{open ? "^" : "v"}</Text>
      </Pressable>
      {open ? (
        <View style={smStyles.dropdownMenu}>
          {options.map((item) => (
            <Pressable
              key={item}
              style={[smStyles.dropdownItem, value === item && smStyles.dropdownItemActive]}
              onPress={() => onSelect(item)}
            >
              <Text
                style={[
                  smStyles.dropdownItemText,
                  value === item && smStyles.dropdownItemTextActive
                ]}
              >
                {item}
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
      onPress={() => {
        const currentIndex = options.indexOf(value);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
        onChange(options[nextIndex]);
      }}
    >
      <Text style={flowStyles.ddText}>{value}</Text>
      <Text style={flowStyles.ddArrow}>v</Text>
    </Pressable>
  );
}

export default function DashboardHomeTab({
  user,
  dashboardMetrics,
  workingReport,
  setWorkingReport,
  onSubmitWorkingReport,
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
  const [showCrpTypeMenu, setShowCrpTypeMenu] = useState(false);
  const [selectedCrpType, setSelectedCrpType] = useState(user.idType || "CRP ID");
  const crpTypeOptions = ["CRP ID", "Master ID", "High Level CRP"];
  const shgNames = ["Ujjwal Lakshmi SHG", "Maa Tara SHG", "Nava Jyoti SHG"];
  const shgMembers = ["Anita", "Rekha", "Puja", "Mina"];
  const activityTypes = ["Goat Rearing", "Poultry", "Vegetable Farming", "Tailoring"];
  const subCategories = ["Farm", "Livestock", "Fishery", "Non-Farm"];
  const [shgName, setShgName] = useState(shgNames[0]);
  const [memberName, setMemberName] = useState(shgMembers[0]);
  const [activityType, setActivityType] = useState(activityTypes[0]);
  const [subCategory, setSubCategory] = useState(subCategories[0]);
  const [openShgDropdown, setOpenShgDropdown] = useState(false);
  const [openMemberDropdown, setOpenMemberDropdown] = useState(false);
  const [openActivityDropdown, setOpenActivityDropdown] = useState(false);
  const [openSubCategoryDropdown, setOpenSubCategoryDropdown] = useState(false);
  const [memberBelongsToLhCbo, setMemberBelongsToLhCbo] = useState(false);
  const [lhCboName, setLhCboName] = useState("");
  const [distanceToMember, setDistanceToMember] = useState(null);
  const [isDistanceLoading, setIsDistanceLoading] = useState(false);
  const [locationPromptRequired, setLocationPromptRequired] = useState(false);
  const [currentCrpLocation, setCurrentCrpLocation] = useState(null);
  const [activityCoordinates, setActivityCoordinates] = useState({
    latitude: 23.9045,
    longitude: 87.5245
  });
  const [uploadedImageName, setUploadedImageName] = useState("");
  const [uploadedImageDate, setUploadedImageDate] = useState("");
  const [uploadedImageUri, setUploadedImageUri] = useState("");
  const [supportStage, setSupportStage] = useState("Present Support");
  const [activityProfile, setActivityProfile] = useState({
    activityName: "Farm Activity",
    areaQuantity: "",
    areaUnit: "Bigha",
    activityMode: "Kharif",
    seasonality: "Seasonal",
    period: "3",
    landType: "Plain",
    productionName: "Crop",
    productionQty: "",
    productionUnit: "KG",
    totalLivestock: "",
    waterbodyArea: "",
    waterbodyType: "Canal"
  });
  const [nonFarmEnterprise, setNonFarmEnterprise] = useState({
    enterpriseName: "",
    setupType: "Homebased",
    enterpriseLevel: "Primary",
    signboardMounted: "Yes",
    totalEmployment: "",
    marketLinked: "Local",
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
    havingSkillTraining: "Yes",
    skillTrade: "Goat Rearing",
    skillDate: "",
    skillThrough: "NGO",
    havingEdpTraining: "No",
    edpTrade: "Tailoring",
    edpDate: "",
    edpThrough: "Block Team",
    trainingRequirement: "Yes",
    trainingRequiredTrade: "Food Processing"
  });
  const [financialSupportForm, setFinancialSupportForm] = useState({
    activityOfMember: "Goat Rearing",
    financialSupportRequired: true,
    loanCyclePreferred: "Cycle 1"
  });
  const [pastSupportForm, setPastSupportForm] = useState({
    topActivity: "Goat Rearing",
    topAmount: "",
    topLoanThrough: "CIF",
    bottomActivity: "Poultry",
    bottomAmount: "",
    bottomLoanThrough: "Bank Loan",
    interestRate: "12",
    repaymentCompleted: "",
    transactionStatus: "Pending"
  });
  const [transactionDetailsForm, setTransactionDetailsForm] = useState({
    presentMonthLoanRepaymentStatus: "",
    paymentDetailsBy: "CIF",
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

  const shgMemberRecordedLocation = useMemo(() => {
    const mapping = {
      Anita: { latitude: 23.9045, longitude: 87.5245 },
      Rekha: { latitude: 23.9049, longitude: 87.5242 },
      Puja: { latitude: 23.9051, longitude: 87.5248 },
      Mina: { latitude: 23.9038, longitude: 87.5251 }
    };
    return mapping[memberName] || mapping.Anita;
  }, [memberName]);

  const isWithin50Meters = distanceToMember !== null && distanceToMember <= 50;
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
          Alert.alert(
            "Enable Location",
            "Please enable location permission for SHG onboarding geofencing."
          );
        }
        return null;
      }
      setCurrentCrpLocation(current);
      const autoActivityLocation = {
        latitude: current.latitude,
        longitude: current.longitude
      };
      setActivityCoordinates(autoActivityLocation);
      const meters = calculateDistance(
        current.latitude,
        current.longitude,
        autoActivityLocation.latitude,
        autoActivityLocation.longitude
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
    if (homeView === "shgMember") {
      checkRadiusDistance(true);
    }
  }, [homeView, memberName]);

  useEffect(() => {
    setActivityCoordinates(shgMemberRecordedLocation);
  }, [memberName, shgMemberRecordedLocation]);

  useEffect(() => {
    if (homeView !== "shgMember") {
      return undefined;
    }
    const timer = setInterval(() => {
      checkRadiusDistance(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [homeView, memberName]);

  const handleUploadImage = () => {
    if (Platform.OS !== "web") {
      Alert.alert("Upload Not Available", "Image upload picker is currently enabled for web.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = event?.target?.files?.[0];
      if (!file) return;
      const now = new Date();
      const imageDate = now.toISOString().slice(0, 10);
      const imageUri = URL.createObjectURL(file);

      setUploadedImageName(file.name);
      setUploadedImageDate(imageDate);
      setUploadedImageUri(imageUri);
      Alert.alert("Image Uploaded", `Selected: ${file.name}`);
    };
    input.click();
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
              <Text style={pageStyles.infoLine}>CRP ID: {user.identity || "CRP-XXX"}</Text>
              <Text style={pageStyles.infoLine}>Name: {user.name || "CRP User"}</Text>
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
            <Text style={wrStyles.metricLabel}>Honorarium to be Claimed</Text>
            <View style={wrStyles.metricValueBox}>
              <Text style={wrStyles.metricValueText}>
                {dashboardMetrics.honorariumToBeClaimed}
              </Text>
            </View>
          </View>

          <View style={wrStyles.metricBox}>
            <Text style={wrStyles.metricLabel}>Last Honorarium Received</Text>
            <TextInput
              value={workingReport.amountReceived}
              onChangeText={(text) =>
                setWorkingReport((prev) => ({
                  ...prev,
                  amountReceived: text.replace(/\D/g, "")
                }))
              }
              placeholder="Type amount"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              style={wrStyles.metricInput}
            />
          </View>

          <View style={wrStyles.submitRow}>
            <Pressable style={wrStyles.graphBtn}>
              <Text style={wrStyles.graphBtnText}>Graph</Text>
            </Pressable>
            <Pressable style={wrStyles.submitBtn} onPress={onSubmitWorkingReport}>
              <Text style={wrStyles.submitBtnText}>Submit</Text>
            </Pressable>
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
            {activities.slice(0, 3).map((item) => (
              <Text key={item.id} style={wrStyles.activityLine}>
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

  if (homeView === "newEnrolment") {
    return (
      <View style={pageStyles.screen}>
        <View style={pageStyles.frame}>
          <View style={pageStyles.topRow}>
            <View style={pageStyles.imageCard}>
              <Text style={pageStyles.imageText}>CRP{"\n"}Image</Text>
            </View>
            <View style={pageStyles.infoCard}>
              <Text style={pageStyles.infoLine}>CRP ID: {user.identity || "CRP-XXX"}</Text>
              <Text style={pageStyles.infoLine}>Name: {user.name || "CRP User"}</Text>
            </View>
          </View>

          <View style={neStyles.fieldBox}>
            <Text style={neStyles.fieldLabel}>GP/VC Name:</Text>
            <Text style={neStyles.fieldValue}>{user.gpVcName || "GP-A"}</Text>
          </View>
          <View style={neStyles.fieldBox}>
            <Text style={neStyles.fieldLabel}>Village Name:</Text>
            <Text style={neStyles.fieldValue}>{user.villageName || "Village 1"}</Text>
          </View>

          <View style={neStyles.selectStrip}>
            <Text style={neStyles.selectText}>Select from below</Text>
          </View>

          <View style={neStyles.portionRow}>
            <Pressable style={neStyles.portionBtn} onPress={onOpenShgMember}>
              <Text style={neStyles.portionBtnText}>SHG{"\n"}Member</Text>
            </Pressable>
            <Pressable style={neStyles.portionBtn} onPress={onOpenUpdateData}>
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
              <Text style={pageStyles.infoLine}>CRP ID: {user.identity || "CRP-XXX"}</Text>
              <Text style={pageStyles.infoLine}>Name: {user.name || "CRP User"}</Text>
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
              {activityCoordinates.longitude.toFixed(6)}
            </Text>
          </View>
          <View style={smStyles.readonlyRow}>
            <Text style={smStyles.readonlyLabel}>Latitude of the Activity*:</Text>
            <Text style={smStyles.readonlyValue}>
              {activityCoordinates.latitude.toFixed(6)}
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
    const activityNameOptions = ["Farm Activity", "Vegetable Farming", "Integrated Farming"];
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
    const setupTypeOptions = ["Homebased", "Commercial"];
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
    const activityNameOptions = ["Goat Rearing", "Poultry", "Dairy"];
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

  if (false && homeView === "lhCboActivity") {
    const isProducer = activityType === "Goat Rearing";
    const isNonFarm = activityType === "Tailoring";
    const isIntegrated = activityType === "Vegetable Farming";
    const isCustomHiring = activityType === "Poultry";

    return (
      <View style={pageStyles.screen}>
        <View style={pageStyles.frame}>
          <View style={lhStyles.headerCard}>
            <Text style={lhStyles.headerLine}>LH CBO Name: {lhCboName || "xxxxxxxxx xxxx"}</Text>
            <Text style={lhStyles.headerLine}>GP/VC Name: {user.gpVcName || "xxxxxxxxxx"}</Text>
          </View>

          <View style={lhStyles.dropdownRow}>
            <Text style={lhStyles.dropdownLabel}>Livelihood Activity:</Text>
            <View style={lhStyles.dropdownValueBox}>
              <Text style={lhStyles.dropdownValue}>{activityType}</Text>
              <Text style={lhStyles.dropdownArrow}>v</Text>
            </View>
          </View>

          <View style={lhStyles.dropdownRow}>
            <Text style={lhStyles.dropdownLabel}>Category:</Text>
            <View style={lhStyles.dropdownValueBox}>
              <Text style={lhStyles.dropdownValue}>{subCategory}</Text>
              <Text style={lhStyles.dropdownArrow}>v</Text>
            </View>
          </View>

          <View style={lhStyles.notesCard}>
            <Text style={lhStyles.noteLine}>
              • If <Text style={isProducer ? lhStyles.noteHighlight : lhStyles.notePlain}>Producers Group Activity</Text> is selected, then further details will be shown on Page 18.8A
            </Text>
            <Text style={lhStyles.noteDivider}>-------------------------------</Text>
            <Text style={lhStyles.noteLine}>
              • If <Text style={isNonFarm ? lhStyles.noteHighlight : lhStyles.notePlain}>Non-Farm Collective Activity</Text> is selected, then further details will be shown on Page 18.8B
            </Text>
            <Text style={lhStyles.noteDivider}>-------------------------------</Text>
            <Text style={lhStyles.noteLine}>
              • If <Text style={isIntegrated ? lhStyles.noteHighlight : lhStyles.notePlain}>Integrated Farming Cluster Activity</Text> is selected, then further details will be shown on Page 18.8C
            </Text>
            <Text style={lhStyles.noteDivider}>-------------------------------</Text>
            <Text style={lhStyles.noteLine}>
              • If <Text style={isCustomHiring ? lhStyles.noteHighlight : lhStyles.notePlain}>Custom Hiring Center Activity</Text> is selected, then further details will be shown on Page 18.8D
            </Text>
            <Text style={lhStyles.noteDivider}>-------------------------------</Text>
          </View>

          <View style={lhStyles.footerRow}>
            <View
              style={[
                lhStyles.geoDot,
                distanceToMember !== null && distanceToMember <= 50
                  ? lhStyles.geoDotGreen
                  : lhStyles.geoDotRed
              ]}
            />
            <Pressable style={lhStyles.saveBtn} onPress={handleLhCboSaveAndNext}>
              <Text style={lhStyles.saveBtnText}>Save & Next</Text>
            </Pressable>
          </View>

          <Pressable style={wrStyles.backBtn} onPress={() => onOpenShgMember()}>
            <Text style={wrStyles.backBtnText}>Back to SHG Member</Text>
          </Pressable>
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
    const tradeOptions = ["Goat Rearing", "Poultry", "Tailoring", "Food Processing"];
    const throughOptions = ["NGO", "Block Team", "District Team", "CRP Team"];

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
    const activityOptions = ["Goat Rearing", "Poultry", "Tailoring", "Fishery"];
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
    const activityOptions = ["Goat Rearing", "Poultry", "Tailoring", "Fishery"];
    const sourceOptions = ["CIF", "RF", "Bank Loan", "PMFME"];
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
    const paymentByOptions = ["CIF", "RF", "Bank Loan", "PMFME"];
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
            <Text style={pageStyles.infoLine}>CRP ID: {user.identity || "CRP-XXX"}</Text>
            <Text style={pageStyles.infoLine}>Name: {user.name || "CRP User"}</Text>
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

        <View style={pageStyles.dashboardCard}>
          <Text style={pageStyles.dashboardTitle}>Dashboard</Text>

          <View style={pageStyles.metricCompactCard}>
            <View style={pageStyles.metricCompactLeft}>
              <Text style={pageStyles.metricCompactLabel}>SHG Member Assigned</Text>
              <Pressable style={pageStyles.graphPill}>
                <Text style={pageStyles.graphText}>Graph</Text>
              </Pressable>
            </View>
            <Text style={pageStyles.metricCompactValue}>.....nos</Text>
          </View>

          <View style={pageStyles.metricCompactCard}>
            <View style={pageStyles.metricCompactLeft}>
              <Text style={pageStyles.metricCompactLabel}>Total Visit Placed in the Last 30 days</Text>
              <Pressable style={pageStyles.graphPill}>
                <Text style={pageStyles.graphText}>Graph</Text>
              </Pressable>
            </View>
            <Text style={pageStyles.metricCompactValue}>{dashboardMetrics.totalVisits30}</Text>
          </View>

          <View style={pageStyles.metricCompactCard}>
            <View style={pageStyles.metricCompactLeft}>
              <Text style={pageStyles.metricCompactLabel}>Honorarium Received</Text>
              <Pressable style={pageStyles.graphPill}>
                <Text style={pageStyles.graphText}>Graph</Text>
              </Pressable>
            </View>
            <Text style={pageStyles.metricCompactValue}>
              {dashboardMetrics.honorariumReceived || "............."}
            </Text>
          </View>
        </View>

        <View style={pageStyles.quickActionsCard}>
          <Text style={pageStyles.quickActionsTitle}>Quick Actions</Text>
          <View style={pageStyles.actionsRow}>
            <Pressable style={pageStyles.actionBtnMuted} onPress={onOpenWorkingReport}>
              <Text style={pageStyles.actionTextMuted}>Working{"\n"}Report</Text>
            </Pressable>
            <Pressable style={pageStyles.actionBtnPrimary} onPress={onOpenNewEnrolment}>
              <Text style={pageStyles.actionTextPrimary}>New{"\n"}Enrolment</Text>
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
  screen: { paddingVertical: 6, position: "relative" },
  bgGlowTop: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(59,130,246,0.12)",
    top: -50,
    right: -40
  },
  bgGlowBottom: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(20,184,166,0.1)",
    bottom: -60,
    left: -50
  },
  frame: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#94a3b8",
    backgroundColor: "#eef2f7",
    padding: 12,
    gap: 10,
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5
  },
  topRow: { flexDirection: "row", gap: 10 },
  imageCard: {
    width: 62,
    height: 62,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2
  },
  imageText: { color: "#334155", fontSize: 9, fontWeight: "800", textAlign: "center" },
  infoCard: {
    flex: 1,
    backgroundColor: "#64748b",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
    gap: 2
  },
  infoLine: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
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
    backgroundColor: "#facc15",
    borderWidth: 1,
    borderColor: "#d39b00",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
    shadowColor: "#a16207",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2
  },
  dashboardTitle: {
    fontSize: 38,
    textAlign: "center",
    color: "#111827",
    fontWeight: "800",
    fontStyle: "italic"
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
  quickActionsCard: {
    borderWidth: 1,
    borderColor: "#d0dae8",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1
  },
  quickActionsTitle: { color: "#111827", fontSize: 18, fontWeight: "800" },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 8 },
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
    borderColor: "#6b7280",
    backgroundColor: "#f3f4f6"
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
    width: 56,
    backgroundColor: "#3b67b8",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8
  },
  metricValueText: { color: "#ffffff", fontWeight: "800", fontSize: 13 },
  metricInput: {
    width: 74,
    backgroundColor: "#3b67b8",
    color: "#ffffff",
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 8
  },
  submitRow: { flexDirection: "row", gap: 8 },
  graphBtn: {
    flex: 1,
    backgroundColor: "#3b67b8",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 4
  },
  graphBtnText: { color: "#dbeafe", fontWeight: "700" },
  submitBtn: {
    width: 84,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4
  },
  submitBtnText: { color: "#ffffff", fontWeight: "800" },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6b7280",
    backgroundColor: "#f8fafc"
  },
  alertDot: { width: 12, height: 12, borderRadius: 6, marginHorizontal: 8, backgroundColor: "#f97316" },
  alertText: { flex: 1, fontSize: 12, color: "#1f2937", paddingVertical: 8, paddingRight: 8 },
  activityCard: {
    borderWidth: 1,
    borderColor: "#6b7280",
    backgroundColor: "#3b67b8",
    padding: 12,
    minHeight: 128
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
    backgroundColor: "#1f2937",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  backBtnText: { color: "#ffffff", fontSize: 11, fontWeight: "700" }
});

const neStyles = StyleSheet.create({
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6b7280",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 6,
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
    backgroundColor: "#3b67b8",
    borderWidth: 1,
    borderColor: "#3159a5",
    alignItems: "center",
    paddingVertical: 8
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
    backgroundColor: "#3b67b8",
    borderWidth: 1,
    borderColor: "#3159a5",
    borderRadius: 6,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
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
    borderColor: "#6b7280",
    backgroundColor: "#f8fafc"
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
    borderColor: "#b45309",
    backgroundColor: "#ea7b2d",
    padding: 12,
    minHeight: 152
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
    borderColor: "#9ca3af",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6
  },
  fieldLabel: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700"
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    borderColor: "#94a3b8",
    borderRadius: 6,
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
    borderColor: "#9ca3af",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 6,
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
    borderColor: "#9ca3af",
    backgroundColor: "#f8fafc",
    padding: 8,
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
    borderColor: "#9ca3af",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 8,
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
