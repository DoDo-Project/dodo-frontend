export interface PetSummary {
  id: number;
  name: string;
  age: number;
  profileImageUrl: string | null;
}

export interface ActivityHistorySummary {
  historyId: number;
  activityType: string;
  /** km. 진행 중/취소된 활동은 아직 계산되지 않아 null일 수 있음 */
  distance: number | null;
  activityHistoryStartAt: string;
  /** 진행 중인 활동은 아직 종료되지 않아 null일 수 있음 */
  activityHistoryEndAt: string | null;
  activityHistoryStatus: string;
  reactionCount: number;
  heartAverage: number | null;
  pet: PetSummary;
}

export interface GetActivityHistoryListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface ActivityHistoryPageResponse {
  histories: ActivityHistorySummary[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface GetNearbyPopularActivitiesParams {
  latitude: number;
  longitude: number;
  limit?: number;
  reactionType?: 'LIKE' | 'DISLIKE';
  cursor?: number;
}

export interface ActivityHistoryDetailResponse {
  historyId: number;
  petId: number;
  /** km. 진행 중/취소된 활동은 아직 계산되지 않아 null일 수 있음 */
  distance: number | null;
  activityHistoryStartAt: string;
  /** 진행 중인 활동은 아직 종료되지 않아 null일 수 있음 */
  activityHistoryEndAt: string | null;
  startLatitude: number;
  startLongitude: number;
  reactionCount: number;
  isLikedByMe: boolean;
}

export interface RoutePoint {
  routePointId: number;
  latitude: number;
  longitude: number;
  measuredAt: string;
}

export interface ActivityHistoryRouteResponse {
  historyId: number;
  activityType: string;
  /** km. 진행 중/취소된 활동은 아직 계산되지 않아 null일 수 있음 */
  distance: number | null;
  activityHistoryStartAt: string;
  /** 진행 중인 활동은 아직 종료되지 않아 null일 수 있음 */
  activityHistoryEndAt: string | null;
  startLatitude: number;
  startLongitude: number;
  activityHistoryStatus: string;
  routePoints: RoutePoint[];
}

export interface ActivitySimpleResponse {
  message: string;
}
