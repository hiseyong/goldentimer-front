import { env } from '../../config/env'
import type {
  CreateAssignmentRequest,
  CreateAssignmentResponse,
} from './types'
import { createHttpAssignmentApi } from './httpAssignmentApi'
import { createMockAssignmentApi } from './mockAssignmentApi'

export interface AssignmentApi {
  createAssignment(
    request: CreateAssignmentRequest,
  ): Promise<CreateAssignmentResponse>
}

export function createAssignmentApi(): AssignmentApi {
  if (env.useMockApi) {
    return createMockAssignmentApi()
  }
  return createHttpAssignmentApi(env.apiBaseUrl)
}
