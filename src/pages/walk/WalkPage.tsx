import { useMemo, useState } from 'react';

import { usePetList } from '@/features/auth';
import {
  FenceControlPanel,
  WalkMap,
  useCreateFence,
  useFenceBoundaries,
  useLiveLocation,
  useToggleFence,
  useUpdateFenceRange,
} from '@/features/walk-fence';

import { WalkHistoryPanel } from './ui/WalkHistoryPanel';
import { WalkSideRail } from './ui/WalkSideRail';

interface DraftCenter {
  lat: number;
  lng: number;
}

type WalkPanelView = 'fence' | 'history';

const EMPTY_BOUNDARIES: never[] = [];

export function WalkPage() {
  const { data: boundariesData } = useFenceBoundaries();
  const { data: petListData } = usePetList();
  const createFence = useCreateFence();
  const toggleFence = useToggleFence();
  const updateFenceRange = useUpdateFenceRange();

  const boundaries = boundariesData?.boundaries ?? EMPTY_BOUNDARIES;
  const pets = petListData?.pets ?? [];

  const [panelView, setPanelView] = useState<WalkPanelView>('fence');
  // 모바일 하단 시트 펼침 상태 (지도를 가릴 수 있어 접을 수 있게) — lg 이상에서는 항상 펼쳐진 상태로 표시
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [draftCenter, setDraftCenter] = useState<DraftCenter | null>(null);
  const [radius, setRadius] = useState(500);
  const [fenceName, setFenceName] = useState('');

  // 선택한 펫의 기존 울타리 (있으면 수정 모드, 없으면 생성 모드)
  const existingFence = useMemo(
    () => (selectedPetId != null ? (boundaries.find((fence) => fence.petId === selectedPetId) ?? null) : null),
    [boundaries, selectedPetId],
  );

  // 펫/울타리가 바뀌면 입력값 동기화 (effect 대신 렌더 중 조정 — React 권장 패턴)
  const formKey = `${selectedPetId ?? ''}:${existingFence?.fenceId ?? ''}`;
  const [syncedKey, setSyncedKey] = useState(formKey);
  if (formKey !== syncedKey) {
    setSyncedKey(formKey);
    setRadius(existingFence ? existingFence.radius : 500);
    setFenceName(existingFence ? existingFence.fenceName : '');
    setDraftCenter(null);
  }

  const isSubmitting = createFence.isPending || toggleFence.isPending || updateFenceRange.isPending;

  const handleCreate = () => {
    if (selectedPetId == null || !draftCenter) return;
    createFence.mutate(
      {
        petId: selectedPetId,
        centerLatitude: draftCenter.lat,
        centerLongitude: draftCenter.lng,
        radius,
        fenceName: fenceName.trim(),
      },
      {
        onSuccess: () => setDraftCenter(null), // 저장 후 미리보기 원 제거
      },
    );
  };

  const handleUpdate = () => {
    if (!existingFence) return;
    updateFenceRange.mutate(
      {
        fenceId: existingFence.fenceId,
        payload: {
          centerLatitude: draftCenter?.lat ?? existingFence.center.latitude,
          centerLongitude: draftCenter?.lng ?? existingFence.center.longitude,
          radius,
          fenceName: fenceName.trim() || existingFence.fenceName,
        },
      },
      {
        onSuccess: () => setDraftCenter(null), // 저장 후 미리보기 원 제거
      },
    );
  };

  const handleToggle = () => {
    if (!existingFence) return;
    toggleFence.mutate({
      fenceId: existingFence.fenceId,
      payload: { fenceIsActive: !existingFence.isActive },
    });
  };

  // 선택한 펫의 실시간 위치 구독
  const { location: liveLocation } = useLiveLocation(selectedPetId);
  const selectedPetName = pets.find((pet) => pet.petId === selectedPetId)?.petName ?? '반려동물';

  // 울타리가 켜져 있고 + 실제로 벗어났을 때만 이탈로 간주
  const fenceActive = existingFence?.isActive ?? false;
  const isOutsideFence = !!liveLocation && fenceActive && !liveLocation.insideFence;

  return (
    // 네이버 지도 스타일: 지도가 화면 전체, 그 위에 둥근 레일 + 패널이 떠 있음
    // 모바일: 레일은 하단 탭바, 패널은 하단 시트로 전환 (WalkSideRail 자체 반응형 처리)
    <div className="relative h-dvh overflow-hidden bg-neutral-100">
      {/* 배경 전체를 채우는 지도 */}
      <div className="absolute inset-0">
        <WalkMap
          boundaries={boundaries}
          draftCenter={draftCenter}
          draftRadius={radius}
          onMapClick={(lat, lng) => setDraftCenter({ lat, lng })}
          livePosition={
            liveLocation
              ? { lat: liveLocation.latitude, lng: liveLocation.longitude, insideFence: !isOutsideFence }
              : null
          }
        />
      </div>

      {/* 울타리 이탈 알림 배너 (울타리 켜진 경우에만) */}
      {liveLocation && isOutsideFence && (
        <div className="absolute left-1/2 top-4 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-red-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg">
          ⚠️ {selectedPetName}이(가) 울타리를 벗어났어요! (약 {Math.round(liveLocation.distanceMeter)}m)
        </div>
      )}

      <WalkSideRail />

      {/* 울타리/산책기록 패널 — 모바일: 하단 탭바 위로 뜨는 시트(접기 가능) / lg 이상: 좌측 플로팅 패널 */}
      <aside
        className={[
          'fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex flex-col overflow-hidden',
          'rounded-t-2xl bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.1)]',
          'lg:inset-auto lg:top-3 lg:bottom-3 lg:left-[6.5rem] lg:w-[360px] lg:rounded-2xl lg:shadow-md',
        ].join(' ')}
      >
        {/* 모바일 전용 드래그 핸들 — 탭하면 패널을 슥 접었다 펼 수 있음 (지도가 가려질 때 거슬리지 않게) */}
        <button
          type="button"
          onClick={() => setIsSheetOpen((prev) => !prev)}
          aria-expanded={isSheetOpen}
          aria-label={isSheetOpen ? '패널 접기' : '패널 펼치기'}
          className="flex shrink-0 items-center justify-center py-2.5 lg:hidden"
        >
          <span className="h-1.5 w-10 rounded-full bg-neutral-300" aria-hidden />
        </button>

        <div
          className={[
            'flex min-h-0 flex-col overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
            isSheetOpen ? 'max-h-[55dvh] opacity-100' : 'max-h-0 opacity-0',
            'lg:max-h-none lg:flex-1 lg:opacity-100',
          ].join(' ')}
        >
          <div className="shrink-0 border-b border-neutral-200 px-5 py-4 lg:pt-4">
            <h1 className="text-lg font-bold text-neutral-900">산책</h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              {panelView === 'fence' ? '반려동물 안전 울타리를 설정하세요.' : '산책 기록을 확인해보세요.'}
            </p>

            <div className="mt-3 flex gap-1 rounded-xl bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => setPanelView('fence')}
                className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                  panelView === 'fence' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                }`}
              >
                울타리 설정
              </button>
              <button
                type="button"
                onClick={() => setPanelView('history')}
                className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                  panelView === 'history' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                }`}
              >
                산책기록 보기
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {panelView === 'fence' ? (
              <FenceControlPanel
                pets={pets}
                selectedPetId={selectedPetId}
                onSelectPet={setSelectedPetId}
                existingFence={existingFence}
                draftCenter={draftCenter}
                radius={radius}
                onRadiusChange={setRadius}
                fenceName={fenceName}
                onFenceNameChange={setFenceName}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onToggle={handleToggle}
                isSubmitting={isSubmitting}
              />
            ) : (
              <WalkHistoryPanel />
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
