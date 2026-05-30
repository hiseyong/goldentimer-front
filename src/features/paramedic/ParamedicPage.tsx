import { isSecureGeolocationContext } from '../../utils/geolocation'
import { AssignmentMessageCard } from './components/AssignmentMessageCard'
import { AssignmentWaitTimeCard } from './components/AssignmentWaitTimeCard'
import { ErStatusList } from './components/ErStatusList'
import { HospitalNavigationPanel } from './components/HospitalNavigationPanel'
import { LocationAccessBanner } from './components/LocationAccessBanner'
import { RecommendationModal } from './components/RecommendationModal'
import { VoiceInputCard } from './components/VoiceInputCard'
import { useParamedicPage } from './useParamedicPage'

export function ParamedicPage() {
  const page = useParamedicPage()
  const isListening = page.status === 'listening'

  return (
    <div className="relative flex flex-col gap-4 px-4 py-4 pb-6">
      <LocationAccessBanner
        permission={page.locationPermission}
        onRetry={() => void page.refreshLocationPermission()}
      />

      <VoiceInputCard
        active={isListening}
        transcript={page.displayTranscript}
        speechSupported={page.speechSupported}
        onStart={page.startListening}
        onStop={page.stopListening}
        onTranscriptChange={page.setTranscript}
      />

      {page.errorMessage && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          <p>{page.errorMessage}</p>
          <button
            type="button"
            onClick={page.dismissError}
            className="mt-1 text-xs font-medium underline"
          >
            OK
          </button>
        </div>
      )}

        {page.transportMessage && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {page.transportMessage}
          </p>
        )}

        {page.assignment?.wait_time && !page.showRecommendationModal && (
          <AssignmentWaitTimeCard waitTime={page.assignment.wait_time} />
        )}

        {page.assignment?.message && !page.showRecommendationModal && (
          <AssignmentMessageCard message={page.assignment.message} />
        )}

        {page.assignment && page.clientLocation && !page.showRecommendationModal && (
          <HospitalNavigationPanel
            origin={page.clientLocation}
            hospital={page.assignment.hospital}
          />
        )}

      <button
        type="button"
        onClick={() => {
          void page.requestRecommendations()
        }}
        disabled={
          page.status === 'submitting' ||
          !isSecureGeolocationContext() ||
          page.locationPermission === 'unsupported'
        }
        className="min-h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {page.status === 'submitting'
          ? 'Allow location if prompted…'
          : 'Get AI Hospital Recommendation'}
      </button>

      {page.assignment && !page.showRecommendationModal && (
        <button
          type="button"
          onClick={page.openRecommendationModal}
          className="min-h-11 w-full rounded-xl border border-emerald-400 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          View recommendation again
        </button>
      )}

      <div className={page.showRecommendationModal ? 'opacity-40' : ''}>
        <ErStatusList items={page.erStatus} loading={page.erLoading} />
      </div>

      <RecommendationModal
        open={page.showRecommendationModal}
        assignment={page.assignment}
        clientLocation={page.clientLocation}
        onClose={page.closeRecommendationModal}
        onTransport={page.transportToFirst}
        onViewListAgain={page.openRecommendationModal}
      />
    </div>
  )
}
