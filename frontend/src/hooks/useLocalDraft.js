import { useEffect } from 'react'

const DRAFT_KEY = 'jv-vent-draft'

export function useLocalDraft(ventText, setVentText) {
  // Restore draft from localStorage on mount (only if the input is empty)
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) setVentText(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist draft on every change; clear when text is empty (after send)
  useEffect(() => {
    if (ventText) {
      localStorage.setItem(DRAFT_KEY, ventText)
    } else {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [ventText])
}
