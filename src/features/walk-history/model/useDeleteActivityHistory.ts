import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteActivityHistory } from '../api/activityHistory';

export function useDeleteActivityHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (historyId: number) => deleteActivityHistory(historyId),
    onSuccess: () => {
      // 페이지/필터 조합별로 캐시된 모든 산책 기록 목록을 무효화
      void queryClient.invalidateQueries({ queryKey: ['activities', 'history'] });
    },
  });
}
