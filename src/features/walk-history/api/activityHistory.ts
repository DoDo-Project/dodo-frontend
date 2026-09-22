import { apiClient } from '@/shared/api/axios';

import type {
  ActivityHistoryDetailResponse,
  ActivityHistoryPageResponse,
  ActivityHistoryRouteResponse,
  ActivitySimpleResponse,
  GetActivityHistoryListParams,
  GetNearbyPopularActivitiesParams,
} from '../model/types';

/** 내 활동(산책) 기록 목록 조회 (GET /activities/history) */
export async function getActivityHistoryList(
  params?: GetActivityHistoryListParams,
): Promise<ActivityHistoryPageResponse> {
  const response = await apiClient.get<ActivityHistoryPageResponse>('/activities/history', { params });
  return response.data;
}

/** 활동 기록 상세 조회 (GET /activities/history/{historyId}) */
export async function getActivityHistoryDetail(historyId: number): Promise<ActivityHistoryDetailResponse> {
  const response = await apiClient.get<ActivityHistoryDetailResponse>(`/activities/history/${historyId}`);
  return response.data;
}

/** 활동 기록 상세 경로(이동 좌표 리스트) 조회 (GET /activities/history/{historyId}/route) */
export async function getActivityHistoryRoute(historyId: number): Promise<ActivityHistoryRouteResponse> {
  const response = await apiClient.get<ActivityHistoryRouteResponse>(`/activities/history/${historyId}/route`);
  return response.data;
}

/** 활동 기록 삭제 (DELETE /activities/history/{historyId}) */
export async function deleteActivityHistory(historyId: number): Promise<ActivitySimpleResponse> {
  const response = await apiClient.delete<ActivitySimpleResponse>(`/activities/history/${historyId}`);
  return response.data;
}

/**
 * 주변 인기 활동 조회 (GET /activities/history/popular)
 * - reactionType 기본값 LIKE로 고정 ("인기" = 좋아요 기준, 서버 스펙엔 필수값인데 유효값 목록 설명 없음 —
 *   게시글 반응(BoardReactionCreateRequest)의 LIKE/DISLIKE 패턴을 참고해 가정)
 */
export async function getNearbyPopularActivities(
  params: GetNearbyPopularActivitiesParams,
): Promise<ActivityHistoryPageResponse> {
  const response = await apiClient.get<ActivityHistoryPageResponse>('/activities/history/popular', {
    params: { reactionType: 'LIKE', ...params },
  });
  return response.data;
}
