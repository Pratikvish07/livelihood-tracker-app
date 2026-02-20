export function detectRole(input) {
  const value = (input || "").toUpperCase();
  if (value.startsWith("MASTER") || value.startsWith("STA")) return "State Admin";
  if (value.startsWith("CRP")) return "CRP";
  if (value.startsWith("BLK")) return "Block Admin";
  if (value.startsWith("DST")) return "District Admin";
  return "CRP";
}

export function calculateEmi(principal, annualRate, months) {
  const p = Number(principal) || 0;
  const n = Number(months) || 0;
  const r = (Number(annualRate) || 0) / 12 / 100;
  if (!p || !n) return 0;
  if (r === 0) return p / n;
  const top = p * r * Math.pow(1 + r, n);
  const bottom = Math.pow(1 + r, n) - 1;
  return top / bottom;
}

export function isAadhaarValid(value) {
  return /^\d{12}$/.test(value || "");
}

export function isLokosValid(value) {
  return /^\d{12}$/.test(value || "");
}

export function isContactValid(value) {
  return /^\d{10}$/.test(value || "");
}

export function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

export function isPasswordStrong(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{4,}$/.test(
    value || ""
  );
}

export function isJpegFile(value) {
  return /\.(jpe?g)$/i.test((value || "").trim());
}

export function generateCrpId({ district, block, name }) {
  const districtCode = (district || "NA")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase();
  const blockCode = (block || "NA")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase();
  const nameCode = (name || "CRP")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase();
  return `CRP-${districtCode}${blockCode}-${nameCode}`;
}
