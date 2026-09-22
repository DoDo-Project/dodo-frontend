import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useCurrentUser } from '@/features/auth';
import {
  BOARD_DETAIL_STATUS_MESSAGES,
  BOARD_MUTATION_STATUS_MESSAGES,
  BOARD_REACTION_STATUS_MESSAGES,
  BoardDetailContent,
  COMMENT_LIST_STATUS_MESSAGES,
  COMMENT_MUTATION_STATUS_MESSAGES,
  CommunityLayout,
  DeleteBoardDialog,
  clearStoredBoardReactionType,
  getBoardReactionType,
  getStoredBoardReactionType,
  setStoredBoardReactionType,
  useBoardDetail,
  useBoardReaction,
  useCommentList,
  useCreateComment,
  useDeleteBoard,
  useDeleteComment,
  useUpdateComment,
} from '@/features/community';
import { ReportDialog, type ReportTarget } from '@/features/report';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/api/errorMessage';
import { LoadingSpinner } from '@/shared/ui';

const DETAIL_PAGE_COPY = {
  invalidTitle: '올바르지 않은 게시글 경로예요.',
  invalidDescription: '게시글 주소를 다시 확인한 뒤 재시도해주세요.',
  loading: '게시글을 불러오는 중...',
  loadFailedTitle: '게시글을 불러오지 못했어요.',
  loadFailedFallback: '게시글 조회에 실패했어요. 잠시 후 다시 시도해주세요.',
  retry: '다시 시도',
  deleteFailedFallback: '게시글을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.',
  ownReactionNotice: '내가 작성한 게시물에는 반응을 남길 수 없어요.',
  likeConflictNotice: '이미 좋아요를 누른 게시물이에요.',
  dislikeConflictNotice: '이미 싫어요를 누른 게시물이에요.',
};

function getNextReactionType(currentReactionType: 'LIKE' | 'DISLIKE' | null, clickedReactionType: 'LIKE' | 'DISLIKE') {
  return currentReactionType === clickedReactionType ? null : clickedReactionType;
}

function parseBoardId(value: string | undefined): number | null {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function BoardDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const boardId = useMemo(() => parseBoardId(params.boardId), [params.boardId]);
  const { data: board, isLoading, isError, error, refetch } = useBoardDetail(boardId);
  const { user, nickname } = useCurrentUser();
  const { mutateAsync: deleteBoard, isPending: isDeleting } = useDeleteBoard();
  const [commentPagination, setCommentPagination] = useState<{ boardId: number | null; page: number }>({
    boardId,
    page: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const activeCommentPage = commentPagination.boardId === boardId ? commentPagination.page : 0;
  const commentsQuery = useCommentList(boardId, { page: activeCommentPage, size: 20 });
  const { mutateAsync: createComment, isPending: isCreatingComment } = useCreateComment();
  const { mutateAsync: updateComment, isPending: isUpdatingComment } = useUpdateComment();
  const { mutateAsync: deleteComment, isPending: isDeletingComment } = useDeleteComment();
  const { mutateAsync: reactToBoard, isPending: isReacting } = useBoardReaction();
  const [reactionError, setReactionError] = useState('');
  const [reactionNotice, setReactionNotice] = useState('');

  const canManage = Boolean(board && nickname && board.nickname.trim() === nickname.trim());
  const serverReactionType = getBoardReactionType(board);
  const currentReactionType =
    boardId !== null ? (serverReactionType ?? getStoredBoardReactionType(boardId)) : serverReactionType;

  useEffect(() => {
    const timer =
      reactionNotice.length > 0
        ? window.setTimeout(() => {
            setReactionNotice('');
          }, 5000)
        : null;

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [reactionNotice]);

  useEffect(() => {
    if (boardId === null || serverReactionType === null) {
      return;
    }

    setStoredBoardReactionType(boardId, serverReactionType);
  }, [boardId, serverReactionType]);

  const handleDelete = async () => {
    if (boardId === null) return;

    setDeleteError('');

    try {
      await deleteBoard({ boardId });
      void navigate('/community');
    } catch (deleteActionError) {
      setDeleteError(
        getApiErrorMessage(deleteActionError, DETAIL_PAGE_COPY.deleteFailedFallback, BOARD_MUTATION_STATUS_MESSAGES),
      );
    }
  };

  if (boardId === null) {
    return (
      <PageShell>
        <InvalidBoardState />
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    );
  }

  if (isError || !board) {
    return (
      <PageShell>
        <ErrorState
          description={getApiErrorMessage(error, DETAIL_PAGE_COPY.loadFailedFallback, BOARD_DETAIL_STATUS_MESSAGES)}
          onRetry={() => void refetch()}
        />
      </PageShell>
    );
  }

  const handleCreateComment = async ({
    commentContent,
    parentCommentId,
  }: {
    commentContent: string;
    parentCommentId?: number | null;
  }) => {
    try {
      setCommentPagination({ boardId, page: 0 });
      await createComment({
        boardId,
        commentContent,
        parentCommentId,
      });
    } catch (commentError) {
      throw new Error(
        getApiErrorMessage(
          commentError,
          '댓글을 등록하지 못했어요. 잠시 후 다시 시도해주세요.',
          COMMENT_MUTATION_STATUS_MESSAGES,
        ),
      );
    }
  };

  const handleUpdateComment = async ({ commentId, commentContent }: { commentId: number; commentContent: string }) => {
    try {
      await updateComment({
        boardId,
        commentId,
        payload: {
          commentContent,
        },
      });
    } catch (commentError) {
      throw new Error(
        getApiErrorMessage(
          commentError,
          '댓글을 수정하지 못했어요. 잠시 후 다시 시도해주세요.',
          COMMENT_MUTATION_STATUS_MESSAGES,
        ),
      );
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment({ boardId, commentId });
    } catch (commentError) {
      throw new Error(
        getApiErrorMessage(
          commentError,
          '댓글을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.',
          COMMENT_MUTATION_STATUS_MESSAGES,
        ),
      );
    }
  };

  const handleBoardReaction = async (reactionType: 'LIKE' | 'DISLIKE') => {
    if (canManage) {
      setReactionError('');
      setReactionNotice(DETAIL_PAGE_COPY.ownReactionNotice);
      return;
    }

    const nextReactionType = getNextReactionType(currentReactionType, reactionType);

    try {
      setReactionError('');
      setReactionNotice('');
      await reactToBoard({
        boardId,
        nextReactionType: reactionType,
        currentReactionType,
      });
      if (nextReactionType === null) {
        clearStoredBoardReactionType(boardId);
      } else {
        setStoredBoardReactionType(boardId, nextReactionType);
      }
    } catch (reactionActionError) {
      const status = getApiErrorStatus(reactionActionError);

      if (status === 409) {
        setReactionError('');
        setReactionNotice(
          reactionType === 'LIKE' ? DETAIL_PAGE_COPY.likeConflictNotice : DETAIL_PAGE_COPY.dislikeConflictNotice,
        );
        void refetch();
        return;
      }

      setReactionError(
        getApiErrorMessage(
          reactionActionError,
          '반응을 처리하지 못했어요. 잠시 후 다시 시도해주세요.',
          BOARD_REACTION_STATUS_MESSAGES,
        ),
      );
    }
  };

  return (
    <PageShell>
      {reactionNotice ? <ToastMessage message={reactionNotice} /> : null}
      <CommunityLayout
        content={
          <BoardDetailContent
            board={board}
            comments={commentsQuery.data?.data ?? []}
            pageInfo={commentsQuery.data?.pageInfo}
            canManage={canManage}
            currentUserId={user?.userId ?? null}
            currentUserNickname={nickname}
            isCommentsLoading={commentsQuery.isLoading}
            commentsErrorMessage={
              commentsQuery.isError
                ? getApiErrorMessage(
                    commentsQuery.error,
                    '댓글을 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
                    COMMENT_LIST_STATUS_MESSAGES,
                  )
                : undefined
            }
            isCreatingComment={isCreatingComment}
            isUpdatingComment={isUpdatingComment}
            isDeletingComment={isDeletingComment}
            displayedLikeCount={board.likeCount ?? 0}
            displayedDislikeCount={board.dislikeCount ?? 0}
            currentReactionType={currentReactionType}
            isReacting={isReacting}
            reactionErrorMessage={reactionError}
            onDelete={() => setDeleteDialogOpen(true)}
            onReact={handleBoardReaction}
            onRetryComments={() => void commentsQuery.refetch()}
            onCreateComment={handleCreateComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onChangeCommentPage={(page) => setCommentPagination({ boardId, page })}
            onReportBoard={() => setReportTarget({ type: 'BOARD', id: boardId })}
            onReportComment={(commentId) => setReportTarget({ type: 'COMMENT', id: commentId })}
          />
        }
      />

      <DeleteBoardDialog
        open={deleteDialogOpen}
        isPending={isDeleting}
        errorMessage={deleteError}
        onClose={() => {
          if (isDeleting) return;
          setDeleteDialogOpen(false);
          setDeleteError('');
        }}
        onConfirm={() => void handleDelete()}
      />

      <ReportDialog target={reportTarget} onClose={() => setReportTarget(null)} />
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function ToastMessage({ message }: { message: string }) {
  return (
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 px-4">
      <div className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
        {message}
      </div>
    </div>
  );
}

function InvalidBoardState() {
  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white px-6 py-10 shadow-sm sm:px-8">
      <h1 className="text-[20px] font-medium text-neutral-950">{DETAIL_PAGE_COPY.invalidTitle}</h1>
      <p className="mt-3 text-sm leading-7 text-neutral-600">{DETAIL_PAGE_COPY.invalidDescription}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-neutral-500">{DETAIL_PAGE_COPY.loading}</p>
    </div>
  );
}

function ErrorState({ description, onRetry }: { description: string; onRetry: () => void }) {
  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white px-6 py-10 shadow-sm sm:px-8">
      <h1 className="text-[20px] font-medium text-neutral-950">{DETAIL_PAGE_COPY.loadFailedTitle}</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-600">{description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
        >
          {DETAIL_PAGE_COPY.retry}
        </button>
      </div>
    </div>
  );
}
