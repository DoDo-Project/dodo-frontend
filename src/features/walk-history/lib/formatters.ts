const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  WALKING: '산책',
  RUNNING: '달리기',
};

const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  COMPLETED: '완료',
  CANCELED: '취소됨',
  IN_PROGRESS: '진행 중',
};

export function formatActivityTypeLabel(activityType: string): string {
  return ACTIVITY_TYPE_LABELS[activityType] ?? activityType;
}

export function formatActivityStatusLabel(status: string): string {
  return ACTIVITY_STATUS_LABELS[status] ?? status;
}

export function formatDistanceLabel(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || Number.isNaN(distanceKm)) return '기록 중';
  return `${distanceKm.toFixed(2)}km`;
}

export function formatDateTimeLabel(value: string | null | undefined): string {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** 시작~종료 시각을 "YYYY.MM.DD HH:mm ~ HH:mm" 형태로 합쳐서 표시 (종료 전이면 '~ 진행 중', 날짜가 다르면 종료 쪽도 날짜 포함) */
export function formatTimeRangeLabel(startAt: string, endAt: string | null | undefined): string {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return startAt;

  const dateFormatter = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeFormatter = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const startLabel = `${dateFormatter.format(start)} ${timeFormatter.format(start)}`;

  if (!endAt) return `${startLabel} ~ 진행 중`;

  const end = new Date(endAt);
  if (Number.isNaN(end.getTime())) return `${startLabel} ~ ${endAt}`;

  const sameDay = start.toDateString() === end.toDateString();
  const endLabel = sameDay ? timeFormatter.format(end) : `${dateFormatter.format(end)} ${timeFormatter.format(end)}`;

  return `${startLabel} ~ ${endLabel}`;
}

/** 시작~종료 시각으로 활동 소요 시간을 "N시간 M분" 형태로 계산 (종료 전이면 '-') */
export function formatDurationLabel(startAt: string, endAt: string | null | undefined): string {
  if (!endAt) return '-';

  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return '-';

  const totalMinutes = Math.round((end - start) / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}
