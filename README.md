# SRSApp Mobile Prototype (Expo)

This prototype is aligned to:
`d:\download\Livelihood Tracker .pptx`

Tech stack:
- Expo
- `expo-location` for 50m GPS validation
- Redux Toolkit for app state

## Run

```bash
npm install
npm run start
```

## Slide-to-Module Mapping

- Context / Objectives / Stakeholders / Architecture: represented in app summary and role-aware modules
- Core Modules: user-role logic, onboarding, activity, loan, CRP reports, CBO, grievance, security
- Authentication Workflow: login with LokOS ID + role
- CRP Journey: login, dashboard modules, field reporting, GPS/image-ready flow hooks
- CRP Field Workflow: assigned SHG + GPS capture + 50m validation + timestamp
- SHG Activity Workflow: Farm/Livestock/Fishery/Non-Farm entries with income/production
- Loan Tracking Workflow: loan creation, EMI auto-calc, repayment entry, default alerts
- Training Workflow: training record + certificate reference
- CRP Reporting Workflow: auto visits + honorarium + monthly submission
- CBO Monitoring: PG/NFC/IFC/CHC/FPC update capture
- Admin Verification Workflow: approve/reject submitted reports
- Grievance & Feedback: complaint queue module
- Alerts & Notification Workflow: loan default, missing updates, push logs
- Security & Compliance: in-app checklist view (AES-256/JWT/RBAC/audit/2FA)
- System Data Flow: mobile -> API -> database summary
- Offline Sync Workflow: local queue + manual sync + conflict strategy note
- End-to-End Summary: full business flow summary

## Main Files

- `App.js`
- `src/store/authSlice.js`
- `src/store/workflowSlice.js`
- `src/store/uiSlice.js`
- `src/utils/location.js`
