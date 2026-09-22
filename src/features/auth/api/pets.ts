import { apiClient } from '@/shared/api/axios';

import type {
  CreateHealthAnalysisRequest,
  CreateHealthAnalysisResponse,
  CreatePetInvitationCodeResponse,
  CreatePetRequest,
  CreatePetResponse,
  CreatePetSpecialNoteRequest,
  CreatePetSpecialNoteResponse,
  CreatePetWeightRequest,
  CreatePetWeightResponse,
  DeleteHealthAnalysisResponse,
  DeletePetWeightResponse,
  DeletePetSpecialNoteResponse,
  FamilyApplicationsResponse,
  FamilyBlockedUsersResponse,
  FamilyPendingUsersResponse,
  HealthAnalysisDetail,
  HealthAnalysisListResponse,
  LeavePetFamilyResponse,
  PetDetailResponse,
  PetFamilyApprovalRequest,
  PetFamilyApprovalResponse,
  PetFamilyJoinResponse,
  PetListResponse,
  PetSpecialNoteListResponse,
  PetWeightHistoryResponse,
  ReleaseFamilyBlockedUserRequest,
  ReleaseFamilyBlockedUserResponse,
  UpdateHealthAnalysisRequest,
  UpdateHealthAnalysisResponse,
  UpdatePetRequest,
  UpdatePetResponse,
  UpdatePetSpecialNoteRequest,
  UpdatePetSpecialNoteResponse,
  UpdatePetWeightRequest,
  UpdatePetWeightResponse,
} from '../model/types';

interface RequestFamilyJoinOptions {
  authToken?: string;
}

export interface GetPetListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface GetPetSpecialNoteListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface GetPetWeightHistoryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface GetHealthAnalysisListParams {
  page?: number;
  size?: number;
  sort?: string[];
  period?: string;
}

export interface GetFamilyPendingUsersParams {
  status?: 'PENDING' | 'REJECTED';
  page?: number;
  size?: number;
  sort?: string;
}

export interface GetFamilyBlockedUsersParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface GetFamilyApplicationsParams {
  status?: 'PENDING' | 'REJECTED';
  page?: number;
  size?: number;
  sort?: string;
}

export async function createPet(payload: CreatePetRequest): Promise<CreatePetResponse> {
  const response = await apiClient.post<CreatePetResponse>('/pets', payload);
  return response.data;
}

export async function requestFamilyJoin(
  code: string,
  options?: RequestFamilyJoinOptions,
): Promise<PetFamilyJoinResponse> {
  const response = await apiClient.post<PetFamilyJoinResponse>(
    '/pets/family',
    { code },
    {
      headers: options?.authToken
        ? {
            Authorization: `Bearer ${options.authToken}`,
          }
        : undefined,
    },
  );

  return response.data;
}

export async function createPetInvitationCode(petId: number): Promise<CreatePetInvitationCodeResponse> {
  const response = await apiClient.post<CreatePetInvitationCodeResponse>(`/pets/${petId}/invitation-code`);
  return response.data;
}

export async function getFamilyPendingUsers(params?: GetFamilyPendingUsersParams): Promise<FamilyPendingUsersResponse> {
  const response = await apiClient.get<FamilyPendingUsersResponse>('/pets/family/pending-users', {
    params: {
      status: params?.status,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort,
    },
  });

  return response.data;
}

export async function getFamilyApplications(params?: GetFamilyApplicationsParams): Promise<FamilyApplicationsResponse> {
  const response = await apiClient.get<FamilyApplicationsResponse>('/pets/family/applications', {
    params: {
      status: params?.status,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort,
    },
  });

  return response.data;
}

export async function getFamilyBlockedUsers(params?: GetFamilyBlockedUsersParams): Promise<FamilyBlockedUsersResponse> {
  const response = await apiClient.get<FamilyBlockedUsersResponse>('/pets/family/blocked-users', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort,
    },
  });

  return response.data;
}

export async function approvePetFamilyRequest(payload: PetFamilyApprovalRequest): Promise<PetFamilyApprovalResponse> {
  const response = await apiClient.post<PetFamilyApprovalResponse>('/pets/family/approval', payload);
  return response.data;
}

export async function leavePetFamily(petId: number): Promise<LeavePetFamilyResponse> {
  const response = await apiClient.delete<LeavePetFamilyResponse>(`/pets/${petId}`);
  return response.data;
}

export async function releaseFamilyBlockedUser(
  payload: ReleaseFamilyBlockedUserRequest,
): Promise<ReleaseFamilyBlockedUserResponse> {
  const response = await apiClient.delete<ReleaseFamilyBlockedUserResponse>('/pets/family/block', {
    data: payload,
  });

  return response.data;
}

export async function getPetList(params?: GetPetListParams): Promise<PetListResponse> {
  const response = await apiClient.get<PetListResponse>('/pets/list', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? 'registrationCreatedAt,desc',
    },
  });

  return response.data;
}

export async function getPetDetail(petId: number): Promise<PetDetailResponse> {
  const response = await apiClient.get<PetDetailResponse>(`/pets/${petId}`);
  return response.data;
}

export async function updatePet(petId: number, payload: UpdatePetRequest): Promise<UpdatePetResponse> {
  const response = await apiClient.patch<UpdatePetResponse>(`/pets/${petId}`, payload);
  return response.data;
}

export async function getPetSpecialNoteList(
  petId: number,
  params?: GetPetSpecialNoteListParams,
): Promise<PetSpecialNoteListResponse> {
  const response = await apiClient.get<PetSpecialNoteListResponse>(`/pets/${petId}/significant`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort,
    },
  });

  return response.data;
}

export async function createPetSpecialNote(
  payload: CreatePetSpecialNoteRequest,
): Promise<CreatePetSpecialNoteResponse> {
  const response = await apiClient.post<CreatePetSpecialNoteResponse>('/pets/significant', payload);
  return response.data;
}

export async function updatePetSpecialNote(
  noteId: number,
  payload: UpdatePetSpecialNoteRequest,
): Promise<UpdatePetSpecialNoteResponse> {
  const response = await apiClient.patch<UpdatePetSpecialNoteResponse>(`/pets/significant/${noteId}`, payload);
  return response.data;
}

export async function deletePetSpecialNote(noteId: number): Promise<DeletePetSpecialNoteResponse> {
  const response = await apiClient.delete<DeletePetSpecialNoteResponse>(`/pets/significant/${noteId}`);
  return response.data;
}

export async function getPetWeightHistory(
  petId: number,
  params?: GetPetWeightHistoryParams,
): Promise<PetWeightHistoryResponse> {
  const response = await apiClient.get<PetWeightHistoryResponse>(`/pet/${petId}/weight/history`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? 'petWeightsMeasuredAt,desc',
    },
  });

  return response.data;
}

export async function createPetWeight(
  petId: number,
  payload: CreatePetWeightRequest,
): Promise<CreatePetWeightResponse> {
  const response = await apiClient.post<CreatePetWeightResponse>(`/pet/${petId}/weight`, payload);
  return response.data;
}

export async function updatePetWeight(
  petId: number,
  weightId: number,
  payload: UpdatePetWeightRequest,
): Promise<UpdatePetWeightResponse> {
  const response = await apiClient.patch<UpdatePetWeightResponse>(`/pet/${petId}/weight/${weightId}`, payload);
  return response.data;
}

export async function deletePetWeight(petId: number, weightId: number): Promise<DeletePetWeightResponse> {
  const response = await apiClient.delete<DeletePetWeightResponse>(`/pet/${petId}/weight/${weightId}`);
  return response.data;
}

export async function getHealthAnalysisList(
  petId: number,
  params?: GetHealthAnalysisListParams,
): Promise<HealthAnalysisListResponse> {
  const response = await apiClient.get<HealthAnalysisListResponse>(`/health/analysis/${petId}`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort,
      period: params?.period,
    },
  });

  return response.data;
}

export async function getHealthAnalysisDetail(analysisId: number): Promise<HealthAnalysisDetail> {
  const response = await apiClient.get<HealthAnalysisDetail>(`/health/analysis/detail/${analysisId}`);
  return response.data;
}

export async function createHealthAnalysis(
  petId: number,
  payload: CreateHealthAnalysisRequest,
): Promise<CreateHealthAnalysisResponse> {
  // AI가 보고서를 직접 생성해서 응답하는 동기 호출이라 전역 10초 타임아웃보다 오래 걸릴 수 있음 (넉넉하게 연장)
  const response = await apiClient.post<CreateHealthAnalysisResponse>(`/health/analysis/ai-report/${petId}`, payload, {
    timeout: 60_000,
  });
  return response.data;
}

export async function updateHealthAnalysis(
  analysisId: number,
  payload: UpdateHealthAnalysisRequest,
): Promise<UpdateHealthAnalysisResponse> {
  const response = await apiClient.patch<UpdateHealthAnalysisResponse>(`/health/analysis/${analysisId}`, payload);
  return response.data;
}

export async function deleteHealthAnalysis(analysisId: number): Promise<DeleteHealthAnalysisResponse> {
  const response = await apiClient.delete<DeleteHealthAnalysisResponse>(`/health/analysis/${analysisId}`);
  return response.data;
}
