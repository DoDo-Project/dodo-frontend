import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/lib/react-query/queryKey';

import { getActivityHistoryRoute } from '../api/activityHistory';

export function useActivityHistoryRoute(historyId: number | null) {
  return useQuery({
    queryKey: queryKeys.activities.historyRoute(historyId ?? -1),
    queryFn: () => getActivityHistoryRoute(historyId as number),
    enabled: historyId !== null,
  });
}
