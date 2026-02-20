import { createSlice, nanoid } from "@reduxjs/toolkit";

function calculateEmi(principal, annualRate, months) {
  const p = Number(principal) || 0;
  const n = Number(months) || 1;
  const monthlyRate = (Number(annualRate) || 0) / 12 / 100;
  if (monthlyRate === 0) return p / n;
  const numerator = p * monthlyRate * Math.pow(1 + monthlyRate, n);
  const denominator = Math.pow(1 + monthlyRate, n) - 1;
  return numerator / denominator;
}

const initialState = {
  shgs: [
    { id: "shg-1", name: "Maa Laxmi SHG", lat: 23.8315, lon: 91.2868 },
    { id: "shg-2", name: "Ujjwala SHG", lat: 23.7492, lon: 91.3574 },
    { id: "shg-3", name: "Sampurna SHG", lat: 23.9408, lon: 91.9882 }
  ],
  selectedShgId: "shg-1",
  visits: [],
  activities: [],
  loans: [],
  trainings: [],
  reports: [],
  alerts: [],
  syncQueue: [],
  lastSyncAt: ""
};

const workflowSlice = createSlice({
  name: "workflow",
  initialState,
  reducers: {
    selectShg: (state, action) => {
      state.selectedShgId = action.payload;
    },
    captureVisit: (state, action) => {
      const event = {
        id: nanoid(),
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.visits.push(event);
      if (!event.withinRange) {
        state.alerts.push({
          id: nanoid(),
          type: "gps",
          message: "GPS validation failed for field visit."
        });
      }
      state.syncQueue.push({ id: nanoid(), kind: "visit", payload: event });
    },
    addActivity: (state, action) => {
      const entry = {
        id: nanoid(),
        type: action.payload.type,
        income: Number(action.payload.income) || 0,
        production: action.payload.production || "0",
        timestamp: new Date().toISOString()
      };
      state.activities.push(entry);
      state.syncQueue.push({ id: nanoid(), kind: "activity", payload: entry });
    },
    addLoan: (state, action) => {
      const principal = Number(action.payload.principal) || 0;
      const annualRate = Number(action.payload.annualRate) || 0;
      const months = Number(action.payload.months) || 1;
      const emi = calculateEmi(principal, annualRate, months);
      const loan = {
        id: nanoid(),
        principal,
        annualRate,
        months,
        emi,
        paid: 0,
        pending: principal
      };
      state.loans.push(loan);
      state.syncQueue.push({ id: nanoid(), kind: "loan", payload: loan });
    },
    addRepayment: (state, action) => {
      const loan = state.loans.find((x) => x.id === action.payload.loanId);
      if (!loan) return;
      const amount = Number(action.payload.amount) || 0;
      loan.paid += amount;
      loan.pending = Math.max(loan.principal - loan.paid, 0);
      state.syncQueue.push({
        id: nanoid(),
        kind: "repayment",
        payload: {
          loanId: loan.id,
          amount,
          slipRef: action.payload.slipRef || ""
        }
      });
      if (loan.pending > loan.emi * 2) {
        state.alerts.push({
          id: nanoid(),
          type: "loan-default",
          message: `Loan ${loan.id.slice(-4)} has high pending amount.`
        });
      }
    },
    addTraining: (state, action) => {
      const record = {
        id: nanoid(),
        topic: action.payload.topic || "General",
        certificateRef: action.payload.certificateRef || "certificate.jpg",
        timestamp: new Date().toISOString()
      };
      state.trainings.push(record);
      state.syncQueue.push({ id: nanoid(), kind: "training", payload: record });
    },
    submitReport: (state, action) => {
      const visitCount = state.visits.length;
      const honorarium = visitCount * 150;
      const gpsValid = state.visits.every((v) => v.withinRange);
      const report = {
        id: nanoid(),
        month: action.payload.month,
        visitCount,
        honorarium,
        gpsValid,
        status: "submitted"
      };
      state.reports.push(report);
      state.syncQueue.push({ id: nanoid(), kind: "report", payload: report });

      if (state.activities.length === 0) {
        state.alerts.push({
          id: nanoid(),
          type: "missing-updates",
          message: "Report submitted without activity updates."
        });
      }
    },
    approveReport: (state, action) => {
      const report = state.reports.find((x) => x.id === action.payload);
      if (!report) return;
      report.status = "approved";
      state.alerts.push({
        id: nanoid(),
        type: "push",
        message: `Report ${report.month} approved by admin.`
      });
    },
    rejectReport: (state, action) => {
      const report = state.reports.find((x) => x.id === action.payload);
      if (!report) return;
      report.status = "rejected";
      state.alerts.push({
        id: nanoid(),
        type: "push",
        message: `Report ${report.month} rejected by admin.`
      });
    },
    queueOfflineUpdate: (state, action) => {
      state.syncQueue.push({
        id: nanoid(),
        kind: "local-change",
        payload: action.payload,
        conflict: "server-wins"
      });
    },
    syncQueue: (state) => {
      state.syncQueue = [];
      state.lastSyncAt = new Date().toISOString();
    }
  }
});

export const {
  selectShg,
  captureVisit,
  addActivity,
  addLoan,
  addRepayment,
  addTraining,
  submitReport,
  approveReport,
  rejectReport,
  queueOfflineUpdate,
  syncQueue
} = workflowSlice.actions;

export default workflowSlice.reducer;
