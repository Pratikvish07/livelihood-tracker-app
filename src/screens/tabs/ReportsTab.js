import React, { useEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import LabelInput from "../../components/LabelInput";
import Pill from "../../components/Pill";
import PrimaryButton from "../../components/PrimaryButton";
import styles from "../../styles/appStyles";

const SHG_NAMES = ["Ujjwal Lakshmi SHG", "Maa Tara SHG", "Nava Jyoti SHG"];
const SHG_MEMBERS = ["Anita", "Rekha", "Puja", "Mina"];
const MEMBER_ACTIVITIES = ["Goat Rearing", "Poultry", "Vegetable Farming", "Tailoring"];
const SUBCATEGORIES = ["Farm", "Livestock", "Fishery", "Non-Farm"];

const CBO_TYPES = ["NFC", "PG", "FPC", "CHC"];
const LIVELIHOOD_CBO_NAMES = ["PG-Sonamukhi", "FPC-Small Growers", "CHC-Tools Hub"];

const SHG_IMAGES = ["shg_member_01.jpg", "shg_member_02.jpg", "shg_member_03.jpg"];
const CBO_IMAGES = ["cbo_01.jpg", "cbo_02.jpg", "cbo_03.jpg"];

const PROFILE_TABS = ["Activity Profile", "Investment Profile", "Income Profile"];

function SectionHeader({ title }) {
  return <Text style={styles.cardTitle}>{title}</Text>;
}

function ReadOnlyCrpBlock({ user }) {
  return (
    <View style={styles.diagramTopInfo}>
      <View style={styles.crpImageBox}>
        <Text style={styles.crpImageIcon}>CRP</Text>
      </View>
      <View style={styles.crpInfoBox}>
        <Text style={styles.crpInfoText}>CRP ID: {user.identity || "CRP001"}</Text>
        <Text style={styles.crpInfoText}>Name: {user.name || "Pratik User"}</Text>
      </View>
    </View>
  );
}

function MemberHeader({ memberName, shgName }) {
  return (
    <View style={styles.memberHeaderBox}>
      <Text style={styles.memberHeaderText}>SHG Member Name: {memberName}</Text>
      <Text style={styles.memberHeaderText}>SHG Name: {shgName}</Text>
    </View>
  );
}

export default function ReportsTab({ user, flowPreset }) {
  const [flowType, setFlowType] = useState("Update Data");
  const [page, setPage] = useState(1);

  const [shgForm, setShgForm] = useState({
    shgName: SHG_NAMES[0],
    memberName: SHG_MEMBERS[0],
    latestActivity: MEMBER_ACTIVITIES[0],
    subCategory: SUBCATEGORIES[0],
    lat: "23.512901",
    lon: "87.321441",
    latestImageDate: "2026-02-20"
  });

  const [cboForm, setCboForm] = useState({
    cboType: CBO_TYPES[0],
    cboName: LIVELIHOOD_CBO_NAMES[0],
    livelihoodType: "Livestock",
    lat: "23.512901",
    lon: "87.321441",
    latestImageDate: "2026-02-20"
  });

  const [memberLivelihood, setMemberLivelihood] = useState({
    activity: "Farm-based",
    subCategory: "Cultivation",
    notes: ""
  });

  const [activityStatus, setActivityStatus] = useState({
    profileTab: "Activity Profile",
    activityName: "Vegetable Cultivation",
    quantum: "40",
    unit: "Kg",
    type: "Rabi",
    seasonal: "Winter",
    perennial: "No",
    landType: "Plain",
    productionName: "Tomato",
    productionQty: "20",
    productionUnit: "Kg"
  });
  const [nonFarmStatus, setNonFarmStatus] = useState({
    profileTab: "Activity Profile",
    enterpriseName: "Tailoring Unit",
    setupType: "Home-based",
    primarySector: "Services",
    signboardMounted: "Yes",
    totalEmployment: "3",
    marketLinked: "Block Market",
    gst: "NA",
    gstRenewalDate: "",
    pan: "ABCDE1234F",
    panRenewalDate: "",
    udyam: "UDYAM-WB-22-0000001",
    udyamRenewalDate: "",
    fssai: "",
    fssaiRenewalDate: "",
    tin: "",
    tinRenewalDate: "",
    totalInvestment: "50000",
    loanFromShg: "10000",
    loanFromBank: "15000",
    individualFinancing: "10000",
    ownContribution: "10000",
    csr: "2000",
    governmentGrant: "3000",
    otherSource: "0",
    totalIncomeLastYear: "120000",
    presentMonthIncome: "12000",
    futureProjectionNext6Month: "90000",
    month1Actual: "10000",
    month2Actual: "11000",
    month3Actual: "12000",
    month4Actual: "13000",
    month5Actual: "14000",
    month6Actual: "15000"
  });
  const [livestockStatus, setLivestockStatus] = useState({
    profileTab: "Activity Profile",
    activityName: "Dairy",
    totalLivestock: "4",
    productionName: "Milk",
    productionQty: "18",
    productionUnit: "Ltr"
  });
  const [fisheryStatus, setFisheryStatus] = useState({
    profileTab: "Activity Profile",
    activityName: "Pond Fishery",
    totalWaterbodyArea: "1",
    unitOfArea: "Bigha",
    activityType: "Rohu",
    waterbodyType: "Seasonal",
    productionName: "Fish",
    productionQty: "120",
    productionUnit: "Kg"
  });
  const [supportStatus, setSupportStatus] = useState({
    trainingTrade: "Tailoring",
    trainingDate: "2026-02-20",
    trainingThrough: "NGO Partner",
    epdTrade: "Food Processing",
    epdDate: "2026-02-22",
    epdThrough: "Block Mission",
    trainingRequired: "No",
    requiredTrade: "",
    supportStage: "Present",
    financialSupportRequired: "Yes",
    loanCycleSupported: "Yes",
    activityLoanLinked: "Yes",
    amountLoanTaken: "50000",
    shgBankLoanType: "SHG Loan",
    loanProviderType: "Bank Loan",
    rateOfInterest: "12",
    repaymentCompleted: "No",
    balanceAmount: "30000",
    transactionStatus: "Pending"
  });
  const [transactionDetails, setTransactionDetails] = useState({
    presentMonthLoanRepaymentStatus: "Pending",
    paymentDetailsPerCycle: "",
    uploadedSlip: "payment_slip.jpg",
    principalPerCycle: "4000",
    interestPerCycle: "600",
    totalPerCycle: "4600",
    principalPaid: "2000",
    interestPaid: "300",
    totalPaid: "2300",
    monthlyRepaymentStatus: "Partially Paid"
  });
  const [lhCboUpdate, setLhCboUpdate] = useState({
    lhCboName: "PG-Sonamukhi",
    gpVcName: user.gpVcName || "GP-A",
    livelihoodActivity: "Producers Group",
    subCategory: "Farm Collective"
  });
  const [cboBranchStatus, setCboBranchStatus] = useState({
    profileTab: "Activity Profile",
    activityFieldA: "",
    activityFieldB: "",
    incomeSinceLastYear: "",
    incomeLastMonth: "",
    expLastMonth: "",
    netProfitLastMonth: "",
    loanFieldA: "",
    loanFieldB: "",
    loanFieldC: "",
    loanBalance: ""
  });
  const [lhTechnicalSupport, setLhTechnicalSupport] = useState({
    skillTraining: "No",
    skillTrade: "",
    skillDate: "",
    skillThrough: "",
    skillMembersParticipated: "",
    epdTraining: "No",
    epdTrade: "",
    epdDate: "",
    epdThrough: "",
    epdMembersParticipated: "",
    trainingRequired: "No",
    requiredTrade: ""
  });

  const [shgImgIdx, setShgImgIdx] = useState(0);
  const [cboImgIdx, setCboImgIdx] = useState(0);

  useEffect(() => {
    if (!flowPreset) return;
    setFlowType(flowPreset);
  }, [flowPreset]);

  const shgImageName = useMemo(() => SHG_IMAGES[shgImgIdx], [shgImgIdx]);
  const cboImageName = useMemo(() => CBO_IMAGES[cboImgIdx], [cboImgIdx]);

  const onSaveShg = () => {
    Alert.alert("Saved", `${flowType} saved for SHG Member portion.`);
    setPage(2);
  };

  const onSaveCbo = () => {
    Alert.alert("Saved", `${flowType} saved for Livelihood CBO portion.`);
    setPage(3);
  };

  const onSaveMemberLivelihood = () => {
    Alert.alert("Saved", "Member-specific livelihood updation saved.");
    if (memberLivelihood.activity === "Non-Farm-based") {
      setPage(5);
      return;
    }
    if (memberLivelihood.activity === "Livestock-based") {
      setPage(6);
      return;
    }
    if (memberLivelihood.activity === "Fish-based") {
      setPage(7);
      return;
    }
    setPage(4);
  };

  const onSaveActivityStatus = () => {
    Alert.alert("Saved", "Farm-based activity status saved.");
    setPage(8);
  };
  const onSaveNonFarmStatus = () => {
    Alert.alert("Saved", "Non-farm-based activity status saved.");
    setPage(8);
  };
  const onSaveLivestockStatus = () => {
    Alert.alert("Saved", "Livestock-based activity status saved.");
    setPage(8);
  };
  const onSaveFisheryStatus = () => {
    Alert.alert("Saved", "Fishery-based activity status saved.");
    setPage(8);
  };
  const onSaveDraft = () => {
    Alert.alert("Saved", "Draft saved.");
  };
  const onEditDraft = () => {
    Alert.alert("Edit", "Edit mode enabled.");
  };
  const onSaveSupportStatus = () => {
    Alert.alert("Saved", "Financial & Technical Support status saved.");
    setPage(9);
  };
  const onSaveTransactionDetails = () => {
    Alert.alert("Saved", "Transaction details saved.");
    setPage(10);
  };
  const onSaveLhCboUpdate = () => {
    const activity = lhCboUpdate.livelihoodActivity;
    if (activity === "Producers Group") {
      setPage(11);
      return;
    }
    if (activity === "Non-Farm Collective") {
      setPage(12);
      return;
    }
    if (activity === "Integrated Farming Cluster") {
      setPage(13);
      return;
    }
    if (activity === "Custom Hiring Center") {
      setPage(14);
      return;
    }
    if (activity === "Farmer Producer Company") {
      setPage(15);
      return;
    }
    setPage(11);
  };
  const onSaveCboBranch = () => {
    Alert.alert("Saved", "LH CBO branch status saved.");
    setPage(16);
  };
  const onSaveLhTechnicalSupport = () => {
    Alert.alert("Saved", "Livelihood CBO technical support status saved.");
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <SectionHeader title="Update Data / New Existing Updation Portion" />
        <View style={styles.rowWrap}>
          {["Update Data", "New Enrolment"].map((item) => (
            <Pill
              key={item}
              label={item}
              active={flowType === item}
              onPress={() => {
                setFlowType(item);
                setPage(1);
              }}
            />
          ))}
        </View>
      </View>

      {page === 1 ? (
        <View style={styles.card}>
          <SectionHeader title="18.4 SHG Members Data Portion" />
          <ReadOnlyCrpBlock user={user} />

          <Text style={styles.label}>SHG Name</Text>
          <View style={styles.rowWrap}>
            {SHG_NAMES.map((item) => (
              <Pill
                key={item}
                label={item}
                active={shgForm.shgName === item}
                onPress={() => setShgForm((prev) => ({ ...prev, shgName: item }))}
              />
            ))}
          </View>

          <Text style={styles.label}>SHG Members Name</Text>
          <View style={styles.rowWrap}>
            {SHG_MEMBERS.map((item) => (
              <Pill
                key={item}
                label={item}
                active={shgForm.memberName === item}
                onPress={() => setShgForm((prev) => ({ ...prev, memberName: item }))}
              />
            ))}
          </View>

          <Text style={styles.label}>Latest Livelihood Activity</Text>
          <View style={styles.rowWrap}>
            {MEMBER_ACTIVITIES.map((item) => (
              <Pill
                key={item}
                label={item}
                active={shgForm.latestActivity === item}
                onPress={() =>
                  setShgForm((prev) => ({ ...prev, latestActivity: item }))
                }
              />
            ))}
          </View>

          <Text style={styles.label}>Sub-Category of Livelihood</Text>
          <View style={styles.rowWrap}>
            {SUBCATEGORIES.map((item) => (
              <Pill
                key={item}
                label={item}
                active={shgForm.subCategory === item}
                onPress={() => setShgForm((prev) => ({ ...prev, subCategory: item }))}
              />
            ))}
          </View>

          <LabelInput
            label="Longitude (Auto Generated)"
            value={shgForm.lon}
            editable={false}
          />
          <LabelInput
            label="Latitude (Auto Generated)"
            value={shgForm.lat}
            editable={false}
          />
          <LabelInput
            label="Latest Image Upload Date"
            value={shgForm.latestImageDate}
            editable={false}
          />

          <View style={styles.imageActivityBox}>
            <Text style={styles.imageActivityText}>Images of Activities of the SHG Member</Text>
            <Text style={styles.infoLine}>Current: {shgImageName}</Text>
            <View style={styles.rowWrap}>
              <Pill
                label="Previous Picture"
                onPress={() => setShgImgIdx((prev) => Math.max(prev - 1, 0))}
              />
              <Pill
                label="Next Picture"
                onPress={() =>
                  setShgImgIdx((prev) => Math.min(prev + 1, SHG_IMAGES.length - 1))
                }
              />
            </View>
          </View>

          <View style={styles.geoPinRow}>
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save & Next" onPress={onSaveShg} />
          </View>
        </View>
      ) : null}

      {page === 2 ? (
        <View style={styles.card}>
          <SectionHeader title="18.5 Livelihood CBO Data Portion" />
          <ReadOnlyCrpBlock user={user} />

          <Text style={styles.label}>Type of Livelihood CBO</Text>
          <View style={styles.rowWrap}>
            {CBO_TYPES.map((item) => (
              <Pill
                key={item}
                label={item}
                active={cboForm.cboType === item}
                onPress={() => setCboForm((prev) => ({ ...prev, cboType: item }))}
              />
            ))}
          </View>

          <Text style={styles.label}>Name of the Livelihood CBO</Text>
          <View style={styles.rowWrap}>
            {LIVELIHOOD_CBO_NAMES.map((item) => (
              <Pill
                key={item}
                label={item}
                active={cboForm.cboName === item}
                onPress={() => setCboForm((prev) => ({ ...prev, cboName: item }))}
              />
            ))}
          </View>

          <LabelInput
            label="Activity of the LH-CBO"
            value={cboForm.livelihoodType}
            onChangeText={(text) =>
              setCboForm((prev) => ({ ...prev, livelihoodType: text }))
            }
            placeholder="Enter livelihood activity"
          />
          <LabelInput
            label="Longitude (Auto Generated)"
            value={cboForm.lon}
            editable={false}
          />
          <LabelInput
            label="Latitude (Auto Generated)"
            value={cboForm.lat}
            editable={false}
          />
          <LabelInput
            label="Latest Image Upload Date"
            value={cboForm.latestImageDate}
            editable={false}
          />

          <View style={styles.imageActivityBox}>
            <Text style={styles.imageActivityText}>Images of Activities of the SHG Member</Text>
            <Text style={styles.infoLine}>Current: {cboImageName}</Text>
            <View style={styles.rowWrap}>
              <Pill
                label="Previous Picture"
                onPress={() => setCboImgIdx((prev) => Math.max(prev - 1, 0))}
              />
              <Pill
                label="Next Picture"
                onPress={() =>
                  setCboImgIdx((prev) => Math.min(prev + 1, CBO_IMAGES.length - 1))
                }
              />
            </View>
          </View>

          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(1)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save & Next" onPress={onSaveCbo} />
          </View>
        </View>
      ) : null}

      {page === 3 ? (
        <View style={styles.card}>
          <SectionHeader title="18.6 SHG Member Specific Livelihood Data Updation" />
          <MemberHeader memberName={shgForm.memberName} shgName={shgForm.shgName} />

          <Text style={styles.label}>Livelihood Activity</Text>
          <View style={styles.rowWrap}>
            {["Farm-based", "Non-Farm-based", "Fish-based", "Livestock-based"].map(
              (item) => (
                <Pill
                  key={item}
                  label={item}
                  active={memberLivelihood.activity === item}
                  onPress={() =>
                    setMemberLivelihood((prev) => ({ ...prev, activity: item }))
                  }
                />
              )
            )}
          </View>

          <Text style={styles.label}>Sub-category</Text>
          <View style={styles.rowWrap}>
            {SUBCATEGORIES.map((item) => (
              <Pill
                key={item}
                label={item}
                active={memberLivelihood.subCategory === item}
                onPress={() =>
                  setMemberLivelihood((prev) => ({ ...prev, subCategory: item }))
                }
              />
            ))}
          </View>

          <View style={styles.processNoteBox}>
            <Text style={styles.processNoteText}>If Farm-based Activity is selected, next page: 18.6A.</Text>
            <Text style={styles.processNoteText}>If Non-Farm-based Activity is selected, follow 18.6B.</Text>
            <Text style={styles.processNoteText}>If Fish-based Activity is selected, follow 18.6C.</Text>
            <Text style={styles.processNoteText}>If Livestock-based Activity is selected, follow 18.6D.</Text>
          </View>

          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(2)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save & Next" onPress={onSaveMemberLivelihood} />
          </View>
        </View>
      ) : null}

      {page === 4 ? (
        <View style={styles.card}>
          <SectionHeader title="18.6A SHG Member Farm-based Activity Status" />
          <MemberHeader memberName={shgForm.memberName} shgName={shgForm.shgName} />

          <View style={styles.profileBtnStack}>
            {PROFILE_TABS.map((item) => (
              <Pill
                key={item}
                label={item}
                active={activityStatus.profileTab === item}
                onPress={() =>
                  setActivityStatus((prev) => ({ ...prev, profileTab: item }))
                }
              />
            ))}
          </View>

          <LabelInput
            label="Name of the Activity"
            value={activityStatus.activityName}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, activityName: text }))
            }
          />
          <LabelInput
            label="Quantum of Activity"
            value={activityStatus.quantum}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, quantum: text }))
            }
            keyboardType="numeric"
          />
          <LabelInput
            label="Unit of Area"
            value={activityStatus.unit}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, unit: text }))
            }
          />
          <LabelInput
            label="Type of Activity"
            value={activityStatus.type}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, type: text }))
            }
          />
          <LabelInput
            label="If Seasonal"
            value={activityStatus.seasonal}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, seasonal: text }))
            }
          />
          <LabelInput
            label="If Perennial"
            value={activityStatus.perennial}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, perennial: text }))
            }
          />
          <LabelInput
            label="Type of Land"
            value={activityStatus.landType}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, landType: text }))
            }
          />
          <LabelInput
            label="Name of the Production"
            value={activityStatus.productionName}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, productionName: text }))
            }
          />
          <LabelInput
            label="Production Quantity"
            value={activityStatus.productionQty}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, productionQty: text }))
            }
            keyboardType="numeric"
          />
          <LabelInput
            label="Production Unit"
            value={activityStatus.productionUnit}
            onChangeText={(text) =>
              setActivityStatus((prev) => ({ ...prev, productionUnit: text }))
            }
          />

          <View style={styles.rowWrap}>
            <PrimaryButton label="Save" onPress={onSaveActivityStatus} />
            <PrimaryButton label="Edit" onPress={() => Alert.alert("Edit", "You can edit this activity profile.")} />
          </View>

          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(3)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save" onPress={onSaveActivityStatus} />
          </View>
        </View>
      ) : null}

      {page === 5 ? (
        <View style={styles.card}>
          <SectionHeader title="18.6B SHG Member Non-Farm-based Activity Status" />
          <MemberHeader memberName={shgForm.memberName} shgName={shgForm.shgName} />

          <View style={styles.profileBtnStack}>
            {PROFILE_TABS.map((item) => (
              <Pill
                key={item}
                label={item}
                active={nonFarmStatus.profileTab === item}
                onPress={() =>
                  setNonFarmStatus((prev) => ({ ...prev, profileTab: item }))
                }
              />
            ))}
          </View>

          {nonFarmStatus.profileTab === "Activity Profile" ? (
            <View style={styles.innerPanel}>
              <LabelInput
                label="Enterprise Name"
                value={nonFarmStatus.enterpriseName}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, enterpriseName: text }))
                }
              />
              <LabelInput
                label="Set-up Type"
                value={nonFarmStatus.setupType}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, setupType: text }))
                }
              />
              <LabelInput
                label="Primary Sector"
                value={nonFarmStatus.primarySector}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, primarySector: text }))
                }
              />
              <LabelInput
                label="Signboard Mounted on Enterprise"
                value={nonFarmStatus.signboardMounted}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, signboardMounted: text }))
                }
              />
              <LabelInput
                label="Total Employment Associated"
                value={nonFarmStatus.totalEmployment}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, totalEmployment: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Market Linked"
                value={nonFarmStatus.marketLinked}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, marketLinked: text }))
                }
              />
              <Text style={styles.label}>Legal Compliances</Text>
              <LabelInput
                label="GST"
                value={nonFarmStatus.gst}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, gst: text }))
                }
              />
              <LabelInput
                label="Renewal Date"
                value={nonFarmStatus.gstRenewalDate}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, gstRenewalDate: text }))
                }
                placeholder="DD-MM-YYYY"
              />
              <LabelInput
                label="PAN"
                value={nonFarmStatus.pan}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, pan: text }))
                }
              />
              <LabelInput
                label="Renewal Date"
                value={nonFarmStatus.panRenewalDate}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, panRenewalDate: text }))
                }
                placeholder="DD-MM-YYYY"
              />
              <LabelInput
                label="Udyam"
                value={nonFarmStatus.udyam}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, udyam: text }))
                }
              />
              <LabelInput
                label="Renewal Date"
                value={nonFarmStatus.udyamRenewalDate}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, udyamRenewalDate: text }))
                }
                placeholder="DD-MM-YYYY"
              />
              <LabelInput
                label="FSSAI"
                value={nonFarmStatus.fssai}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, fssai: text }))
                }
              />
              <LabelInput
                label="Renewal Date"
                value={nonFarmStatus.fssaiRenewalDate}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, fssaiRenewalDate: text }))
                }
                placeholder="DD-MM-YYYY"
              />
              <LabelInput
                label="TIN"
                value={nonFarmStatus.tin}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, tin: text }))
                }
              />
              <LabelInput
                label="Renewal Date"
                value={nonFarmStatus.tinRenewalDate}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, tinRenewalDate: text }))
                }
                placeholder="DD-MM-YYYY"
              />
            </View>
          ) : null}

          {nonFarmStatus.profileTab === "Investment Profile" ? (
            <View style={styles.innerPanel}>
              <LabelInput
                label="Total Investment"
                value={nonFarmStatus.totalInvestment}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, totalInvestment: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Loan from SHG"
                value={nonFarmStatus.loanFromShg}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, loanFromShg: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Loan from Bank"
                value={nonFarmStatus.loanFromBank}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, loanFromBank: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Individual Financing"
                value={nonFarmStatus.individualFinancing}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, individualFinancing: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Own Contribution"
                value={nonFarmStatus.ownContribution}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, ownContribution: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="CSR"
                value={nonFarmStatus.csr}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, csr: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Government Grant"
                value={nonFarmStatus.governmentGrant}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, governmentGrant: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Other Source"
                value={nonFarmStatus.otherSource}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, otherSource: text }))
                }
                keyboardType="numeric"
              />
            </View>
          ) : null}

          {nonFarmStatus.profileTab === "Income Profile" ? (
            <View style={styles.innerPanel}>
              <LabelInput
                label="Total Income Since Last Year"
                value={nonFarmStatus.totalIncomeLastYear}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, totalIncomeLastYear: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Present Month Income"
                value={nonFarmStatus.presentMonthIncome}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, presentMonthIncome: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Future Projection (Next 6 Months)"
                value={nonFarmStatus.futureProjectionNext6Month}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({
                    ...prev,
                    futureProjectionNext6Month: text
                  }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Month 1 Actual Income"
                value={nonFarmStatus.month1Actual}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, month1Actual: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Month 2 Actual Income"
                value={nonFarmStatus.month2Actual}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, month2Actual: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Month 3 Actual Income"
                value={nonFarmStatus.month3Actual}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, month3Actual: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Month 4 Actual Income"
                value={nonFarmStatus.month4Actual}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, month4Actual: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Month 5 Actual Income"
                value={nonFarmStatus.month5Actual}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, month5Actual: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Month 6 Actual Income"
                value={nonFarmStatus.month6Actual}
                onChangeText={(text) =>
                  setNonFarmStatus((prev) => ({ ...prev, month6Actual: text }))
                }
                keyboardType="numeric"
              />
            </View>
          ) : null}

          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(3)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save" onPress={onSaveNonFarmStatus} />
          </View>
        </View>
      ) : null}

      {page === 6 ? (
        <View style={styles.card}>
          <SectionHeader title="18.6C SHG Member Livestock-based Activity Status" />
          <MemberHeader memberName={shgForm.memberName} shgName={shgForm.shgName} />

          <View style={styles.profileBtnStack}>
            {PROFILE_TABS.map((item) => (
              <Pill
                key={item}
                label={item}
                active={livestockStatus.profileTab === item}
                onPress={() =>
                  setLivestockStatus((prev) => ({ ...prev, profileTab: item }))
                }
              />
            ))}
          </View>

          <View style={styles.innerPanel}>
            <LabelInput
              label="Name of the Activity"
              value={livestockStatus.activityName}
              onChangeText={(text) =>
                setLivestockStatus((prev) => ({ ...prev, activityName: text }))
              }
            />
            <LabelInput
              label="Total Number of Livestock"
              value={livestockStatus.totalLivestock}
              onChangeText={(text) =>
                setLivestockStatus((prev) => ({ ...prev, totalLivestock: text }))
              }
              keyboardType="numeric"
            />
            <View style={styles.rowWrap}>
              <PrimaryButton label="Save" onPress={onSaveDraft} />
              <PrimaryButton label="Edit" onPress={onEditDraft} />
            </View>
            <LabelInput
              label="Name of the Production"
              value={livestockStatus.productionName}
              onChangeText={(text) =>
                setLivestockStatus((prev) => ({ ...prev, productionName: text }))
              }
            />
            <LabelInput
              label="Production Quantity"
              value={livestockStatus.productionQty}
              onChangeText={(text) =>
                setLivestockStatus((prev) => ({ ...prev, productionQty: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Production Unit"
              value={livestockStatus.productionUnit}
              onChangeText={(text) =>
                setLivestockStatus((prev) => ({ ...prev, productionUnit: text }))
              }
            />
          </View>

          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(3)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save" onPress={onSaveLivestockStatus} />
          </View>
        </View>
      ) : null}

      {page === 7 ? (
        <View style={styles.card}>
          <SectionHeader title="18.6D SHG Member Fishery-based Activity Status" />
          <MemberHeader memberName={shgForm.memberName} shgName={shgForm.shgName} />

          <View style={styles.profileBtnStack}>
            {PROFILE_TABS.map((item) => (
              <Pill
                key={item}
                label={item}
                active={fisheryStatus.profileTab === item}
                onPress={() =>
                  setFisheryStatus((prev) => ({ ...prev, profileTab: item }))
                }
              />
            ))}
          </View>

          <View style={styles.innerPanel}>
            <LabelInput
              label="Name of the Activity"
              value={fisheryStatus.activityName}
              onChangeText={(text) =>
                setFisheryStatus((prev) => ({ ...prev, activityName: text }))
              }
            />
            <LabelInput
              label="Total Waterbody Area"
              value={fisheryStatus.totalWaterbodyArea}
              onChangeText={(text) =>
                setFisheryStatus((prev) => ({ ...prev, totalWaterbodyArea: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Unit of Area"
              value={fisheryStatus.unitOfArea}
              onChangeText={(text) =>
                setFisheryStatus((prev) => ({ ...prev, unitOfArea: text }))
              }
            />
            <LabelInput
              label="Type of Activity"
              value={fisheryStatus.activityType}
              onChangeText={(text) =>
                setFisheryStatus((prev) => ({ ...prev, activityType: text }))
              }
            />
            <LabelInput
              label="Type of Waterbody"
              value={fisheryStatus.waterbodyType}
              onChangeText={(text) =>
                setFisheryStatus((prev) => ({ ...prev, waterbodyType: text }))
              }
            />
            <View style={styles.rowWrap}>
              <PrimaryButton label="Save" onPress={onSaveDraft} />
              <PrimaryButton label="Edit" onPress={onEditDraft} />
            </View>
            <LabelInput
              label="Name of the Production"
              value={fisheryStatus.productionName}
              onChangeText={(text) =>
                setFisheryStatus((prev) => ({ ...prev, productionName: text }))
              }
            />
            <LabelInput
              label="Production Quantity"
              value={fisheryStatus.productionQty}
              onChangeText={(text) =>
                setFisheryStatus((prev) => ({ ...prev, productionQty: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Production Unit"
              value={fisheryStatus.productionUnit}
              onChangeText={(text) =>
                setFisheryStatus((prev) => ({ ...prev, productionUnit: text }))
              }
            />
          </View>

          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(3)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save" onPress={onSaveFisheryStatus} />
          </View>
        </View>
      ) : null}

      {page === 8 ? (
        <View style={styles.card}>
          <SectionHeader title="18.7 SHG Member Specific Financial & Technical Support Status" />
          <MemberHeader memberName={shgForm.memberName} shgName={shgForm.shgName} />

          <View style={styles.profileBtnStack}>
            <Pill label="Technical Support Details" active />
            <Pill label="Financial Support Details" active />
          </View>

          <View style={styles.rowWrap}>
            {["Past Supports", "Present Supports", "Support Required"].map((item) => (
              <Pill
                key={item}
                label={item}
                active={supportStatus.supportStage === item.replace(" Supports", "")}
                onPress={() =>
                  setSupportStatus((prev) => ({
                    ...prev,
                    supportStage: item.replace(" Supports", "")
                  }))
                }
              />
            ))}
          </View>

          <View style={styles.innerPanel}>
            <LabelInput
              label="Having Skill Training (Trade)"
              value={supportStatus.trainingTrade}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, trainingTrade: text }))
              }
            />
            <LabelInput
              label="Date of Training"
              value={supportStatus.trainingDate}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, trainingDate: text }))
              }
              placeholder="DD-MM-YYYY"
            />
            <LabelInput
              label="Training Executed Through"
              value={supportStatus.trainingThrough}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, trainingThrough: text }))
              }
            />
            <LabelInput
              label="Having EDP Training (Trade)"
              value={supportStatus.epdTrade}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, epdTrade: text }))
              }
            />
            <LabelInput
              label="Date of Training"
              value={supportStatus.epdDate}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, epdDate: text }))
              }
              placeholder="DD-MM-YYYY"
            />
            <LabelInput
              label="Training Executed Through"
              value={supportStatus.epdThrough}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, epdThrough: text }))
              }
            />
            <LabelInput
              label="Training Requirement (Yes/No)"
              value={supportStatus.trainingRequired}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, trainingRequired: text }))
              }
            />
            <LabelInput
              label="Required Trade"
              value={supportStatus.requiredTrade}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, requiredTrade: text }))
              }
            />
          </View>

          <View style={styles.innerPanel}>
            <LabelInput
              label="Financial Support Required on LH Activity"
              value={supportStatus.financialSupportRequired}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({
                  ...prev,
                  financialSupportRequired: text
                }))
              }
            />
            <LabelInput
              label="Loan Cycle of Support Preferred"
              value={supportStatus.loanCycleSupported}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, loanCycleSupported: text }))
              }
            />
            <View style={styles.rowWrap}>
              <Pill label="Pop-Up" onPress={() => Alert.alert("Pop-Up", "Support details pop-up.")} />
              <Pill
                label="Loan Details"
                onPress={() => Alert.alert("Loan Details", "Open loan details panel.")}
              />
            </View>
            <LabelInput
              label="Amount of Loan Taken"
              value={supportStatus.amountLoanTaken}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, amountLoanTaken: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="SHG Loan / Bank Loan Type"
              value={supportStatus.shgBankLoanType}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, shgBankLoanType: text }))
              }
            />
          </View>

          <View style={styles.innerPanel}>
            <LabelInput
              label="Financial Support Taken on LH Activity"
              value={supportStatus.activityLoanLinked}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, activityLoanLinked: text }))
              }
            />
            <LabelInput
              label="Amount of Loan Taken"
              value={supportStatus.amountLoanTaken}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, amountLoanTaken: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Loan Provider Type"
              value={supportStatus.loanProviderType}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, loanProviderType: text }))
              }
            />
            <LabelInput
              label="Rate of Interest"
              value={supportStatus.rateOfInterest}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, rateOfInterest: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Repayment Completed"
              value={supportStatus.repaymentCompleted}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, repaymentCompleted: text }))
              }
            />
            <LabelInput
              label="Balance Amount"
              value={supportStatus.balanceAmount}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, balanceAmount: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Transaction Status"
              value={supportStatus.transactionStatus}
              onChangeText={(text) =>
                setSupportStatus((prev) => ({ ...prev, transactionStatus: text }))
              }
            />
          </View>

          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(3)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save" onPress={onSaveSupportStatus} />
          </View>
        </View>
      ) : null}

      {page === 9 ? (
        <View style={styles.card}>
          <SectionHeader title="18.7.1 Transaction Details" />
          <View style={styles.innerPanel}>
            <LabelInput
              label="Present Month Loan Repayment Status"
              value={transactionDetails.presentMonthLoanRepaymentStatus}
              onChangeText={(text) =>
                setTransactionDetails((prev) => ({
                  ...prev,
                  presentMonthLoanRepaymentStatus: text
                }))
              }
            />
            <LabelInput
              label="Payment Details of Loan Taken by Cycle"
              value={transactionDetails.paymentDetailsPerCycle}
              onChangeText={(text) =>
                setTransactionDetails((prev) => ({ ...prev, paymentDetailsPerCycle: text }))
              }
            />
            <LabelInput
              label="Uploaded Payment Slip"
              value={transactionDetails.uploadedSlip}
              onChangeText={(text) =>
                setTransactionDetails((prev) => ({ ...prev, uploadedSlip: text }))
              }
            />
            <LabelInput
              label="Principal (To be paid per loan cycle)"
              value={transactionDetails.principalPerCycle}
              onChangeText={(text) =>
                setTransactionDetails((prev) => ({ ...prev, principalPerCycle: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Interest (To be paid per loan cycle)"
              value={transactionDetails.interestPerCycle}
              onChangeText={(text) =>
                setTransactionDetails((prev) => ({ ...prev, interestPerCycle: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Total (To be paid per loan cycle)"
              value={transactionDetails.totalPerCycle}
              editable={false}
            />
            <LabelInput
              label="Principal (Amount Paid)"
              value={transactionDetails.principalPaid}
              onChangeText={(text) =>
                setTransactionDetails((prev) => ({ ...prev, principalPaid: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Interest (Amount Paid)"
              value={transactionDetails.interestPaid}
              onChangeText={(text) =>
                setTransactionDetails((prev) => ({ ...prev, interestPaid: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Total (Amount Paid)"
              value={transactionDetails.totalPaid}
              onChangeText={(text) =>
                setTransactionDetails((prev) => ({ ...prev, totalPaid: text }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Month-wise Repayment Status"
              value={transactionDetails.monthlyRepaymentStatus}
              onChangeText={(text) =>
                setTransactionDetails((prev) => ({
                  ...prev,
                  monthlyRepaymentStatus: text
                }))
              }
            />
          </View>
          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(8)} />
            <PrimaryButton label="Save & Next" onPress={onSaveTransactionDetails} />
          </View>
        </View>
      ) : null}

      {page === 10 ? (
        <View style={styles.card}>
          <SectionHeader title="18.8 Livelihood CBO Data Updation Process" />
          <View style={styles.memberHeaderBox}>
            <Text style={styles.memberHeaderText}>LH CBO Name: {lhCboUpdate.lhCboName}</Text>
            <Text style={styles.memberHeaderText}>GP/VC Name: {lhCboUpdate.gpVcName}</Text>
          </View>
          <LabelInput
            label="Livelihood Activity"
            value={lhCboUpdate.livelihoodActivity}
            onChangeText={(text) =>
              setLhCboUpdate((prev) => ({ ...prev, livelihoodActivity: text }))
            }
          />
          <LabelInput
            label="Sub-category"
            value={lhCboUpdate.subCategory}
            onChangeText={(text) =>
              setLhCboUpdate((prev) => ({ ...prev, subCategory: text }))
            }
          />
          <Text style={styles.processNoteText}>Producers Group -> 18.8A</Text>
          <Text style={styles.processNoteText}>Non-Farm Collective -> 18.8B</Text>
          <Text style={styles.processNoteText}>Integrated Farming Cluster -> 18.8C</Text>
          <Text style={styles.processNoteText}>Custom Hiring Center -> 18.8D</Text>
          <Text style={styles.processNoteText}>Farmer Producer Company -> 18.8F</Text>
          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(9)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save & Next" onPress={onSaveLhCboUpdate} />
          </View>
        </View>
      ) : null}

      {[11, 12, 13, 14, 15].includes(page) ? (
        <View style={styles.card}>
          <SectionHeader
            title={
              page === 11
                ? "18.8A Producers Group Activity Status"
                : page === 12
                  ? "18.8B Non-Farm Collective Activity Status"
                  : page === 13
                    ? "18.8C Integrated Farming Cluster Activity Status"
                    : page === 14
                      ? "18.8D Custom Hiring Center Activity Status"
                      : "18.8F Farmer Producer Company Activity Status"
            }
          />
          <View style={styles.memberHeaderBox}>
            <Text style={styles.memberHeaderText}>
              CBO Name: {lhCboUpdate.lhCboName}
            </Text>
            <Text style={styles.memberHeaderText}>
              GP/VC Name: {lhCboUpdate.gpVcName}
            </Text>
          </View>
          <View style={styles.profileBtnStack}>
            {["Activity Profile", "Financial Status", "Income Status"].map((item) => (
              <Pill
                key={item}
                label={item}
                active={cboBranchStatus.profileTab === item}
                onPress={() =>
                  setCboBranchStatus((prev) => ({ ...prev, profileTab: item }))
                }
              />
            ))}
          </View>
          {cboBranchStatus.profileTab === "Activity Profile" ? (
            <View style={styles.innerPanel}>
              <LabelInput
                label="Activity Field 1"
                value={cboBranchStatus.activityFieldA}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, activityFieldA: text }))
                }
              />
              <LabelInput
                label="Activity Field 2"
                value={cboBranchStatus.activityFieldB}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, activityFieldB: text }))
                }
              />
            </View>
          ) : null}
          {cboBranchStatus.profileTab === "Income Status" ? (
            <View style={styles.innerPanel}>
              <LabelInput
                label="Total Income Since Last Year"
                value={cboBranchStatus.incomeSinceLastYear}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, incomeSinceLastYear: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Total Income in Last Month"
                value={cboBranchStatus.incomeLastMonth}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, incomeLastMonth: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Recurring Expenditure in Last Month"
                value={cboBranchStatus.expLastMonth}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, expLastMonth: text }))
                }
                keyboardType="numeric"
              />
              <LabelInput
                label="Net Profit in Last Month"
                value={cboBranchStatus.netProfitLastMonth}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, netProfitLastMonth: text }))
                }
                keyboardType="numeric"
              />
            </View>
          ) : null}
          {cboBranchStatus.profileTab === "Financial Status" ? (
            <View style={styles.innerPanel}>
              <LabelInput
                label="Loan/Finance Field 1"
                value={cboBranchStatus.loanFieldA}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, loanFieldA: text }))
                }
              />
              <LabelInput
                label="Loan/Finance Field 2"
                value={cboBranchStatus.loanFieldB}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, loanFieldB: text }))
                }
              />
              <LabelInput
                label="Loan/Finance Field 3"
                value={cboBranchStatus.loanFieldC}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, loanFieldC: text }))
                }
              />
              <LabelInput
                label="Balance Fund/Amount"
                value={cboBranchStatus.loanBalance}
                onChangeText={(text) =>
                  setCboBranchStatus((prev) => ({ ...prev, loanBalance: text }))
                }
                keyboardType="numeric"
              />
            </View>
          ) : null}
          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(10)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save" onPress={onSaveCboBranch} />
          </View>
        </View>
      ) : null}

      {page === 16 ? (
        <View style={styles.card}>
          <SectionHeader title="18.9 Livelihood CBO Specific Technical Support Status" />
          <View style={styles.memberHeaderBox}>
            <Text style={styles.memberHeaderText}>LH CBO Name: {lhCboUpdate.lhCboName}</Text>
            <Text style={styles.memberHeaderText}>GP/VC Name: {lhCboUpdate.gpVcName}</Text>
          </View>
          <View style={styles.innerPanel}>
            <LabelInput
              label="Having Skill Training (Yes/No)"
              value={lhTechnicalSupport.skillTraining}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, skillTraining: text }))
              }
            />
            <LabelInput
              label="If Yes, Name of Trade"
              value={lhTechnicalSupport.skillTrade}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, skillTrade: text }))
              }
            />
            <LabelInput
              label="Date of Training"
              value={lhTechnicalSupport.skillDate}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, skillDate: text }))
              }
              placeholder="DD-MM-YYYY"
            />
            <LabelInput
              label="Training Executed Through"
              value={lhTechnicalSupport.skillThrough}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, skillThrough: text }))
              }
            />
            <LabelInput
              label="No. of Members Participated"
              value={lhTechnicalSupport.skillMembersParticipated}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({
                  ...prev,
                  skillMembersParticipated: text
                }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Having EDP Training (Yes/No)"
              value={lhTechnicalSupport.epdTraining}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, epdTraining: text }))
              }
            />
            <LabelInput
              label="If Yes, Name of Trade"
              value={lhTechnicalSupport.epdTrade}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, epdTrade: text }))
              }
            />
            <LabelInput
              label="Date of Training"
              value={lhTechnicalSupport.epdDate}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, epdDate: text }))
              }
              placeholder="DD-MM-YYYY"
            />
            <LabelInput
              label="Training Executed Through"
              value={lhTechnicalSupport.epdThrough}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, epdThrough: text }))
              }
            />
            <LabelInput
              label="No. of Members Participated"
              value={lhTechnicalSupport.epdMembersParticipated}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({
                  ...prev,
                  epdMembersParticipated: text
                }))
              }
              keyboardType="numeric"
            />
            <LabelInput
              label="Training Requirement (Yes/No)"
              value={lhTechnicalSupport.trainingRequired}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, trainingRequired: text }))
              }
            />
            <LabelInput
              label="Training Required Trade"
              value={lhTechnicalSupport.requiredTrade}
              onChangeText={(text) =>
                setLhTechnicalSupport((prev) => ({ ...prev, requiredTrade: text }))
              }
            />
          </View>
          <View style={styles.geoPinRow}>
            <Pill label="Back" onPress={() => setPage(10)} />
            <Text style={styles.geoPin}>GPS</Text>
            <PrimaryButton label="Save" onPress={onSaveLhTechnicalSupport} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
