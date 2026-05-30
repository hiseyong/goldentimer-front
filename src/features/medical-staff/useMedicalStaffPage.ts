import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../api/client'
import { createMedicalStaffApi } from '../../api/medical-staff/medicalStaffApi'
import type { MedicalStaffDashboard } from '../../api/medical-staff/types'

type MedicalStaffPageState = {
  loading: boolean
  dashboard: MedicalStaffDashboard | null
  error: string | null
}

const initialState: MedicalStaffPageState = {
  loading: true,
  dashboard: null,
  error: null,
}

export function useMedicalStaffPage() {
  const api = useMemo(() => createMedicalStaffApi(), [])
  const [state, setState] = useState<MedicalStaffPageState>(initialState)

  const loadDashboard = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setState((prev) => ({ ...prev, loading: true, error: null }))
      }
      try {
        const dashboard = await api.getDashboard()
        setState({ loading: false, dashboard, error: null })
      } catch (error) {
        const message = getApiErrorMessage(error, 'Failed to load dashboard.')
        setState((prev) => ({ ...prev, loading: false, error: message }))
      }
    },
    [api],
  )

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const dashboard = await api.getDashboard()
        if (cancelled) return
        setState({ loading: false, dashboard, error: null })
      } catch (error) {
        if (cancelled) return
        const message = getApiErrorMessage(error, 'Failed to load dashboard.')
        setState((prev) => ({ ...prev, loading: false, error: message }))
      }
    })()

    const intervalId = window.setInterval(() => {
      void loadDashboard()
    }, 45_000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [api, loadDashboard])

  return {
    ...state,
    reload: () => loadDashboard(true),
  }
}
