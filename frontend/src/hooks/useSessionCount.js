const KEY = 'jv-session-count' // per-browser, not per-account — resets if localStorage is cleared

function readCount() {
  const parsed = parseInt(localStorage.getItem(KEY) ?? '0', 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function incrementSessionCount() {
  localStorage.setItem(KEY, String(readCount() + 1))
}

export function getSessionCount() {
  return readCount()
}
