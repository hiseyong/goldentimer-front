import type { CreateAssignmentResponse } from '../../../api/assignment/types'
import type { StatusTag as StatusTagType } from '../../../api/hospital/types'
import { StatusTag } from '../../../components/ui/StatusTag'
import type { GeoLocation } from '../../../utils/geolocation'
import { AssignmentMessageCard } from './AssignmentMessageCard'
import { AssignmentWaitTimeCard } from './AssignmentWaitTimeCard'
import { HospitalNavigationPanel } from './HospitalNavigationPanel'

type RecommendationModalProps = {
  open: boolean
  assignment: CreateAssignmentResponse | null
  clientLocation: GeoLocation | null
  onClose: () => void
  onTransport: () => void
  onViewListAgain: () => void
  onSpeakMessage?: () => void
  speaking?: boolean
  ttsSupported?: boolean
}

function buildHospitalTags(hospital: CreateAssignmentResponse['hospital']): StatusTagType[] {
  const tags: StatusTagType[] = [
    {
      label: `${hospital.total_er_beds} ER beds available`,
      variant: 'normal',
    },
  ]
  if (hospital.trauma_center) {
    tags.push({ label: 'Trauma Center', variant: 'positive' })
  }
  if (hospital.stroke_center) {
    tags.push({ label: 'Stroke Center', variant: 'positive' })
  }
  if (hospital.cardiac_center) {
    tags.push({ label: 'Cardiac Center', variant: 'positive' })
  }
  return tags
}

export function RecommendationModal({
  open,
  assignment,
  clientLocation,
  onClose,
  onTransport,
  onViewListAgain,
  onSpeakMessage,
  speaking = false,
  ttsSupported = false,
}: RecommendationModalProps) {
  if (!open || !assignment) return null

  const { hospital, emergency_case, message, wait_time } = assignment
  const tags = buildHospitalTags(hospital)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="recommendation-title"
    >
      <div className="flex max-h-[85svh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex shrink-0 items-start gap-3 border-b border-slate-100 bg-white px-4 py-3">
          <h2
            id="recommendation-title"
            className="min-w-0 flex-1 pt-0.5 text-base font-bold leading-snug text-slate-900"
          >
            AI Optimal Hospital Recommendation
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recommendation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
        <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3">
          <div className="mb-1 flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              1
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {hospital.hospital_name}
              </p>
              <p className="text-xs text-slate-500">{hospital.address}</p>
            </div>
          </div>
          <div className="ml-8 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <StatusTag key={tag.label} {...tag} />
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p>
            <span className="font-medium text-slate-700">KTAS Level:</span>{' '}
            {emergency_case.ktas_level}
          </p>
          <p className="mt-1">
            <span className="font-medium text-slate-700">Case ID:</span>{' '}
            {emergency_case.case_id}
          </p>
        </div>

        {wait_time && (
          <div className="mb-4">
            <AssignmentWaitTimeCard waitTime={wait_time} />
          </div>
        )}

        {message && (
          <div className="mb-4">
            <AssignmentMessageCard
              message={message}
              compact
              onSpeak={onSpeakMessage}
              speaking={speaking}
              ttsSupported={ttsSupported}
            />
          </div>
        )}

        {clientLocation && (
          <div className="mb-4">
            <HospitalNavigationPanel
              origin={clientLocation}
              hospital={hospital}
              compact
            />
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={onTransport}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            <AmbulanceIcon />
            Transport to Recommended Hospital
          </button>
          <button
            type="button"
            onClick={onViewListAgain}
            className="min-h-11 w-full rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View Recommendation Again
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function AmbulanceIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 8h-3V5H7v3H4c-1.1 0-2 .9-2 2v7h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4ZM7 7h10v1H7V7Zm13 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Zm-11 0c-.83 0-1.5-.67-1.5-1.5S8.17 14 9 14s1.5.67 1.5 1.5S9.83 17 9 17Z" />
    </svg>
  )
}
