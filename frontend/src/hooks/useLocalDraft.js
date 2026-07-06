import { useEffect } from 'react'

const DRAFT_KEY_PREFIX = 'jv-vent-draft'

export function useLocalDraft(ventText, setVentText, uid) {
  const draftKey = uid ? `${DRAFT_KEY_PREFIX}-${uid}` : DRAFT_KEY_PREFIX

  // Restore draft from localStorage on mount (only if the input is empty)
  useEffect(() => {
    const saved = localStorage.getItem(draftKey)
    if (saved) setVentText(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey])

  // Persist draft on every change; clear when text is empty (after send)
  useEffect(() => {
    if (ventText) {
      localStorage.setItem(draftKey, ventText)
    } else {
      localStorage.removeItem(draftKey)
    }
  }, [ventText, draftKey])
}
