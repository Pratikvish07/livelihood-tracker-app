export const LANGUAGES = ["English", "Bengali", "Hindi"];
export const BLOCKS = ["All", "Block A", "Block B", "Block C"];
export const VILLAGES = ["All", "Village 1", "Village 2", "Village 3"];

export const ROLE_CARDS = {
  CRP: ["Assigned SHGs", "Total Visits", "Honorarium", "Pending Reports"],
  "Block Admin": ["CRP Coverage", "Pending Validations", "Loan Defaults", "Alerts"],
  "District Admin": ["Block Performance", "Training Status", "Fund Flow", "Risk Flags"],
  "State Admin": ["District Ranking", "Program KPI", "Escalations", "Compliance"]
};

export const MOCK_SHGS = [
  {
    id: "SHG-101",
    name: "Ujjwal Lakshmi SHG",
    members: 14,
    block: "Block A",
    village: "Village 1",
    lastVisit: "2026-02-18",
    status: "Active"
  },
  {
    id: "SHG-102",
    name: "Maa Tara SHG",
    members: 11,
    block: "Block B",
    village: "Village 2",
    lastVisit: "2026-02-16",
    status: "Needs Visit"
  },
  {
    id: "SHG-103",
    name: "Nava Jyoti SHG",
    members: 18,
    block: "Block A",
    village: "Village 3",
    lastVisit: "2026-02-14",
    status: "Active"
  }
];
