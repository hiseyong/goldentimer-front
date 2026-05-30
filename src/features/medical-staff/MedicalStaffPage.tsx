import { LoadingBlock } from '../../components/ui/LoadingBlock'
import { AiRecommendations } from './components/AiRecommendations'
import { IncomingPatientsTable } from './components/IncomingPatientsTable'
import { KtasSummary } from './components/KtasSummary'
import { ResourceStatus } from './components/ResourceStatus'
import { useMedicalStaffPage } from './useMedicalStaffPage'

export function MedicalStaffPage() {
  const page = useMedicalStaffPage()

  return (
    <div className="flex flex-col gap-5 px-4 py-4 pb-6">
        {page.loading && <LoadingBlock label="Loading dashboard…" />}

        {page.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {page.error}
          </p>
        )}

        {page.dashboard && (
          <>
            <KtasSummary items={page.dashboard.ktasSummary} />
            <IncomingPatientsTable patients={page.dashboard.incomingPatients} />
            <ResourceStatus
              resources={page.dashboard.resources}
              loadStatus={page.dashboard.loadStatus}
              loadPercent={page.dashboard.loadPercent}
            />
            <AiRecommendations items={page.dashboard.aiRecommendations} />
          </>
        )}
    </div>
  )
}
