import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/lib/api/errorMessage';

import {
  formatActivityStatusLabel,
  formatActivityTypeLabel,
  formatDateTimeLabel,
  formatDistanceLabel,
  formatDurationLabel,
  formatTimeRangeLabel,
} from '../lib/formatters';
import { useActivityHistoryDetail } from '../model/useActivityHistoryDetail';
import { useActivityHistoryList } from '../model/useActivityHistoryList';
import { useActivityHistoryRoute } from '../model/useActivityHistoryRoute';
import { useDeleteActivityHistory } from '../model/useDeleteActivityHistory';
import { ActivityRouteMap } from './ActivityRouteMap';

const PAGE_SIZE = 10;

const DELETE_CONFIRM_MESSAGE = '이 산책 기록을 삭제할까요? 삭제 후에는 복구할 수 없어요.';

function ActivityDetailPanel({ historyId }: { historyId: number }) {
  const { data, isLoading, isError } = useActivityHistoryDetail(historyId);
  const routeQuery = useActivityHistoryRoute(historyId);

  if (isLoading) {
    return <p className="px-4 py-3 text-sm text-neutral-500">상세 정보를 불러오는 중이에요...</p>;
  }

  if (isError || !data) {
    return <p className="px-4 py-3 text-sm text-red-500">상세 정보를 불러오지 못했어요.</p>;
  }

  const routePoints = routeQuery.data?.routePoints ?? [];

  return (
    <div className="border-t border-neutral-100">
      <div className="h-56 w-full overflow-hidden bg-neutral-100">
        {routeQuery.isLoading ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            경로를 불러오는 중이에요...
          </div>
        ) : routeQuery.isError ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-red-500">
            경로 정보를 불러오지 못했어요.
          </div>
        ) : routePoints.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            기록된 이동 경로가 없어요.
          </div>
        ) : (
          <ActivityRouteMap
            routePoints={routePoints}
            fallbackCenter={{ lat: data.startLatitude, lng: data.startLongitude }}
          />
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3.5 text-sm">
        <div>
          <dt className="text-xs text-neutral-400">시간</dt>
          <dd className="mt-0.5 text-neutral-800">
            {formatTimeRangeLabel(data.activityHistoryStartAt, data.activityHistoryEndAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400">반응</dt>
          <dd className="mt-0.5 text-neutral-800">
            {data.reactionCount}개{data.isLikedByMe ? ' · 내가 좋아요 누름' : ''}
          </dd>
        </div>
      </dl>
    </div>
  );
}

interface ActivityHistoryListProps {
  /** 'all'이면 전체, 숫자면 해당 반려동물의 기록만 (클라이언트에서 필터 — 목록 API가 petId 필터를 지원하지 않음) */
  petId: number | 'all';
  emptyMessage?: string;
}

export function ActivityHistoryList({
  petId,
  emptyMessage = '아직 기록된 산책이 없습니다.',
}: ActivityHistoryListProps) {
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  // 펫 필터를 바꿨는데 이전 페이지 번호가 남아 있으면 빈 목록으로 보일 수 있어 0페이지로 되돌림
  // (렌더 중 state 조정 — https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  const [prevPetId, setPrevPetId] = useState(petId);
  if (petId !== prevPetId) {
    setPrevPetId(petId);
    setPage(0);
  }

  const { data, isLoading, isError, error, refetch } = useActivityHistoryList({
    page,
    size: PAGE_SIZE,
    sort: 'activityHistoryStartAt,desc',
  });
  const { mutateAsync: removeActivityHistory, isPending: isDeleting } = useDeleteActivityHistory();

  const allHistories = data?.histories ?? [];
  const histories = petId === 'all' ? allHistories : allHistories.filter((item) => item.pet.id === petId);
  const totalPages = data?.totalPages ?? 0;

  const handleDelete = async (historyId: number) => {
    if (!window.confirm(DELETE_CONFIRM_MESSAGE)) return;

    setDeleteError('');
    try {
      await removeActivityHistory(historyId);
      if (expandedId === historyId) setExpandedId(null);
    } catch (deleteActivityError) {
      setDeleteError(getApiErrorMessage(deleteActivityError, '산책 기록을 삭제하지 못했어요.'));
    }
  };

  if (isLoading) {
    return <p className="text-sm text-neutral-500">산책 기록을 불러오는 중이에요...</p>;
  }

  if (isError) {
    return (
      <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-4">
        <p className="text-sm text-red-600">{getApiErrorMessage(error, '산책 기록을 불러오지 못했어요.')}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (histories.length === 0) {
    return (
      <article className="rounded-[16px] border border-neutral-200 bg-neutral-50/70 px-4 py-3">
        <p className="text-sm leading-6 text-neutral-600">{emptyMessage}</p>
      </article>
    );
  }

  return (
    <div className="space-y-2.5">
      {deleteError ? <p className="text-sm text-red-500">{deleteError}</p> : null}

      <div className="space-y-2.5">
        {histories.map((item) => (
          <article key={item.historyId} className="overflow-hidden rounded-[16px] border border-neutral-200 bg-white">
            <div className="flex w-full flex-col gap-3 px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
              <button
                type="button"
                onClick={() => setExpandedId((prev) => (prev === item.historyId ? null : item.historyId))}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                {item.pet.profileImageUrl ? (
                  <img src={item.pet.profileImageUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-100" aria-hidden />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-neutral-900">
                    {item.pet.name}와(과) {formatDistanceLabel(item.distance)}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {formatDurationLabel(item.activityHistoryStartAt, item.activityHistoryEndAt)} · 반응{' '}
                    {item.reactionCount}개{item.heartAverage ? ` · 평균 심박수 ${item.heartAverage}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">{formatDateTimeLabel(item.activityHistoryStartAt)}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                      {formatActivityTypeLabel(item.activityType)}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
                      {formatActivityStatusLabel(item.activityHistoryStatus)}
                    </span>
                  </div>
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-4 self-end lg:self-auto">
                <button
                  type="button"
                  onClick={() => setExpandedId((prev) => (prev === item.historyId ? null : item.historyId))}
                  className="text-sm text-neutral-400 transition-colors hover:text-neutral-700"
                >
                  {expandedId === item.historyId ? '접기' : '상세보기'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.historyId)}
                  disabled={isDeleting}
                  className="text-sm text-neutral-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
            </div>

            {expandedId === item.historyId && <ActivityDetailPanel historyId={item.historyId} />}
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>
          <span className="text-sm text-neutral-500">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
