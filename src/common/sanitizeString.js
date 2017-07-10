export default function sanitizeString(str) {
  let safeStr = str;
  safeStr = safeStr.replace(/&/g, '&amp;');
  safeStr = safeStr.replace(/>/g, '&gt;');
  safeStr = safeStr.replace(/</g, '&lt;');
  safeStr = safeStr.replace(/"/g, '&quot;');
  safeStr = safeStr.replace(/'/g, '&#039;');
  return safeStr;
}
