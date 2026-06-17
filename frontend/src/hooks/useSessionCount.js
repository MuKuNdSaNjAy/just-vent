const KEY = 'jv-session-count'

export function incrementSessionCount() {
  const current = parseInt(localStorage.getItem(KEY) ?? '0', 10)
  localStorage.setItem(KEY, String(current + 1))
}

export function getSessionCount() {
  return parseInt(localStorage.getItem(KEY) ?? '0', 10)
}
