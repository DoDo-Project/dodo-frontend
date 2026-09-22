import { useState } from 'react';

import {
  getApiErrorMessage,
  HEALTH_ANALYSIS_MUTATION_STATUS_MESSAGES,
  useCreateHealthAnalysis,
  type HealthAnalysisType,
} from '@/features/auth';
import { Toast } from '@/shared/ui';

import { HEALTH_ANALYSIS_TYPE_OPTIONS, formatAnalysisTypeLabel } from '../lib/formatters';

interface HealthAnalysisCreateFormProps {
  petId: number;
}

function parseSpecialNotes(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function HealthAnalysisCreateForm({ petId }: HealthAnalysisCreateFormProps) {
  const { mutateAsync: createAnalysis, isPending } = useCreateHealthAnalysis();
  const [analysisType, setAnalysisType] = useState<HealthAnalysisType>('MONTHLY');
  const [specialNotesInput, setSpecialNotesInput] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const handleSubmit = async () => {
    setError('');

    try {
      const result = await createAnalysis({
        petId,
        payload: { analysisType, specialNotes: parseSpecialNotes(specialNotesInput) },
      });
      setToastMessage(result.message || 'AI 건강 분석 생성을 요청했어요.');
      setSpecialNotesInput('');
    } catch (createError) {
      setError(
        getApiErrorMessage(
          createError,
          'AI 건강 분석 생성에 실패했어요. 잠시 후 다시 시도해주세요.',
          HEALTH_ANALYSIS_MUTATION_STATUS_MESSAGES,
        ),
      );
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      className="space-y-3 rounded-[18px] border border-neutral-200 bg-neutral-50/70 px-4 py-4"
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-brand">NEW REPORT</p>
        <h3 className="mt-1 text-[16px] font-medium text-neutral-950">AI 건강 분석 생성</h3>
      </div>

      <div className="space-y-3">
        <div>
          <span className="mb-1.5 block text-xs font-medium text-neutral-500">분석 주기</span>
          <div className="flex flex-wrap gap-2">
            {HEALTH_ANALYSIS_TYPE_OPTIONS.map((type) => {
              const active = type === analysisType;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAnalysisType(type)}
                  aria-pressed={active}
                  className={[
                    'inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors',
                    active
                      ? 'border-brand text-brand bg-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand/40 hover:text-brand',
                  ].join(' ')}
                >
                  {formatAnalysisTypeLabel(type)}
                </button>
              );
            })}
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-neutral-500">특이사항 (한 줄에 하나씩)</span>
          <textarea
            value={specialNotesInput}
            onChange={(event) => setSpecialNotesInput(event.target.value)}
            rows={3}
            placeholder={'예: 최근 식욕이 줄었습니다.\n운동량이 늘었습니다.'}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand"
          />
        </label>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex flex-col items-end gap-1.5">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 min-w-32 items-center justify-center rounded-xl bg-brand px-4 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? '생성 중...' : 'AI 분석 생성'}
        </button>
        {/* AI가 실제로 보고서를 작성하는 동안 응답이 오는 동기 요청이라 수십 초 걸릴 수 있음 — 멈춘 게 아니라는 안내 */}
        {isPending ? (
          <p className="text-xs text-neutral-400">AI가 보고서를 작성하고 있어요. 최대 1분 정도 걸릴 수 있어요.</p>
        ) : null}
      </div>

      <Toast open={Boolean(toastMessage)} message={toastMessage} onClose={() => setToastMessage('')} />
    </form>
  );
}
