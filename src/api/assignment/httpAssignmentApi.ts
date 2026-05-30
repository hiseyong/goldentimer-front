import { apiRequest } from '../client'
import { ASSIGNMENT_API_PATHS } from './endpoints'
import type { AssignmentApi } from './assignmentApi'
import type {
  CreateAssignmentRequest,
  CreateAssignmentResponse,
} from './types'

export function createHttpAssignmentApi(baseUrl: string): AssignmentApi {
  const normalizedBase = baseUrl.replace(/\/$/, '')

  return {
    createAssignment(request: CreateAssignmentRequest) {
      return apiRequest<CreateAssignmentResponse>(
        `${normalizedBase}${ASSIGNMENT_API_PATHS.create}`,
        {
          method: 'POST',
          body: request,
        },
      )
    },
  }
}
