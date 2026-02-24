import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
    onOpenLhCboActivity();
  };

  const handleLhCboSaveAndNext = async () => {
    const meters = await checkRadiusDistance(false);
    if (meters === null) {
      Alert.alert("Location Required", "Enable location before proceeding.");
      return;
    }
    if (meters > 50) {
      Alert.alert("Outside 50m Radius", `You are ${meters}m away. Move within 50m to continue.`);
      return;
    }
    onOpenUpdateData();
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

  if (homeView === "lhCboActivity") {
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
