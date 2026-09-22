import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import type { BoardComment, BoardDetailResponse, CommentPageInfo, ReactionType } from '../model/types';

interface BoardDetailContentProps {
  board: BoardDetailResponse;
  comments: BoardComment[];
  pageInfo?: CommentPageInfo;
  canManage: boolean;
  currentUserId?: string | null;
  /** 댓글 작성자 UUID(currentUserId)가 내려오지 않는 백엔드 응답을 대비한 본인 확인용 보조 수단 */
  currentUserNickname?: string | null;
  isCommentsLoading: boolean;
  commentsErrorMessage?: string;
  isCreatingComment: boolean;
  isUpdatingComment: boolean;
  isDeletingComment: boolean;
  displayedLikeCount: number;
  displayedDislikeCount: number;
  currentReactionType: ReactionType | null;
  isReacting: boolean;
  reactionErrorMessage?: string;
  onDelete: () => void;
  onReact: (reactionType: ReactionType) => Promise<void>;
  onRetryComments: () => void;
  onCreateComment: (payload: { commentContent: string; parentCommentId?: number | null }) => Promise<void>;
  onUpdateComment: (payload: { commentId: number; commentContent: string }) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onChangeCommentPage: (page: number) => void;
  onReportBoard: () => void;
  onReportComment: (commentId: number) => void;
}

interface CommentThread extends BoardComment {
  children: BoardComment[];
}

const DETAIL_COPY = {
  authorFallback: '작성자',
  anonymousAuthor: '익명',
  report: '신고',
  reply: '답글',
  edit: '수정',
  delete: '삭제',
  cancel: '취소',
  commentsTitle: '댓글',
  commentPlaceholder: '댓글을 입력해주세요.',
  replyPlaceholder: '답글을 입력해주세요.',
  emptyComments: '아직 댓글이 없어요. 첫 댓글을 남겨보세요.',
  submit: '등록',
  save: '저장',
  submitAria: '댓글 등록 버튼',
  viewLabel: '조회',
  deletedComment: '삭제된 댓글입니다.',
  commentsFailedTitle: '댓글을 불러오지 못했어요.',
  loadingComments: '댓글을 불러오는 중이에요...',
  retry: '다시 시도',
  previousPage: '이전',
  nextPage: '다음',
  commentRequired: '댓글 내용을 입력해주세요.',
  replyRequired: '답글 내용을 입력해주세요.',
  editRequired: '수정할 댓글 내용을 입력해주세요.',
  commentCreateFailed: '댓글을 등록하지 못했어요.',
  replyCreateFailed: '답글을 등록하지 못했어요.',
  commentUpdateFailed: '댓글을 수정하지 못했어요.',
  commentDeleteConfirm: '댓글을 삭제할까요?',
  commentDeleteFailed: '댓글을 삭제하지 못했어요.',
};

function formatDateTime(value?: string) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getCommentAuthor(comment: BoardComment) {
  return {
    nickname: comment.author?.nickname?.trim() || comment.nickname?.trim() || DETAIL_COPY.anonymousAuthor,
  };
}

// 익명 처리 전 원본 닉네임 (본인 여부 비교용) — 빈 값이면 비교 대상에서 제외되도록 null
function getRawCommentAuthorNickname(comment: BoardComment): string | null {
  return comment.author?.nickname?.trim() || comment.nickname?.trim() || null;
}

function getCommentUserId(comment: BoardComment) {
  return comment.author?.userId ?? comment.userId ?? null;
}

function getCommentTimestamp(comment: BoardComment) {
  return formatDateTime(comment.modifiedAt ?? comment.createdAt);
}

function isDeletedComment(comment: BoardComment) {
  return Boolean(comment.deleted || comment.isDeleted);
}

function buildCommentThreads(comments: BoardComment[]) {
  const topLevelComments: CommentThread[] = [];
  const topLevelMap = new Map<number, CommentThread>();

  comments.forEach((comment) => {
    if (comment.parentCommentId !== null) {
      return;
    }

    const thread: CommentThread = {
      ...comment,
      children: [],
    };

    topLevelComments.push(thread);
    topLevelMap.set(comment.commentId, thread);
  });

  comments.forEach((comment) => {
    if (comment.parentCommentId === null) {
      return;
    }

    const parent = topLevelMap.get(comment.parentCommentId);

    if (parent) {
      parent.children.push(comment);
      return;
    }

    topLevelComments.push({
      ...comment,
      children: [],
    });
  });

  return topLevelComments;
}

export function BoardDetailContent({
  board,
  comments,
  pageInfo,
  canManage,
  currentUserId,
  currentUserNickname,
  isCommentsLoading,
  commentsErrorMessage,
  isCreatingComment,
  isUpdatingComment,
  isDeletingComment,
  displayedLikeCount,
  displayedDislikeCount,
  currentReactionType,
  isReacting,
  reactionErrorMessage,
  onDelete,
  onReact,
  onRetryComments,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onChangeCommentPage,
  onReportBoard,
  onReportComment,
}: BoardDetailContentProps) {
  const [draftComment, setDraftComment] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [commentError, setCommentError] = useState('');
  const [replyError, setReplyError] = useState<{ commentId: number; message: string } | null>(null);
  const [editError, setEditError] = useState<{ commentId: number; message: string } | null>(null);
  const [deleteError, setDeleteError] = useState<{ commentId: number; message: string } | null>(null);

  const commentCount = board.commentCount ?? pageInfo?.totalElements ?? comments.length;
  const authorName = board.nickname.trim() || DETAIL_COPY.authorFallback;
  const imageUrls = board.imageFileUrls.filter((imageUrl) => imageUrl.trim().length > 0);
  const commentThreads = buildCommentThreads(comments);

  const clearCommentScopedErrors = (commentId?: number) => {
    if (commentId === undefined) {
      setReplyError(null);
      setEditError(null);
      setDeleteError(null);
      return;
    }

    setReplyError((current) => (current?.commentId === commentId ? null : current));
    setEditError((current) => (current?.commentId === commentId ? null : current));
    setDeleteError((current) => (current?.commentId === commentId ? null : current));
  };

  const submitComment = async () => {
    const trimmed = draftComment.trim();

    if (!trimmed) {
      setCommentError(DETAIL_COPY.commentRequired);
      return;
    }

    setCommentError('');

    try {
      await onCreateComment({ commentContent: trimmed });
      setDraftComment('');
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : DETAIL_COPY.commentCreateFailed);
    }
  };

  const submitReply = async (parentCommentId: number) => {
    const trimmed = replyDraft.trim();

    if (!trimmed) {
      setReplyError({ commentId: parentCommentId, message: DETAIL_COPY.replyRequired });
      return;
    }

    setReplyError(null);

    try {
      await onCreateComment({ commentContent: trimmed, parentCommentId });
      setReplyDraft('');
      setReplyTargetId(null);
    } catch (error) {
      setReplyError({
        commentId: parentCommentId,
        message: error instanceof Error ? error.message : DETAIL_COPY.replyCreateFailed,
      });
    }
  };

  const submitEdit = async (commentId: number) => {
    const trimmed = editDraft.trim();

    if (!trimmed) {
      setEditError({ commentId, message: DETAIL_COPY.editRequired });
      return;
    }

    setEditError(null);

    try {
      await onUpdateComment({ commentId, commentContent: trimmed });
      setEditingCommentId(null);
      setEditDraft('');
    } catch (error) {
      setEditError({
        commentId,
        message: error instanceof Error ? error.message : DETAIL_COPY.commentUpdateFailed,
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const confirmed = window.confirm(DETAIL_COPY.commentDeleteConfirm);

    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      await onDeleteComment(commentId);
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditDraft('');
      }
    } catch (error) {
      setDeleteError({
        commentId,
        message: error instanceof Error ? error.message : DETAIL_COPY.commentDeleteFailed,
      });
    }
  };

  return (
    <article className="space-y-6 pb-28">
      <section className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-sm">
        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <AuthorBadge name={authorName} size="lg" profileUrl={board.profileUrl} />
              <div className="min-w-0">
                <p className="text-[22px] font-semibold tracking-[-0.03em] text-neutral-950">{authorName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-400">
                  <span>{formatDateTime(board.boardCreatedAt)}</span>
                  <MetaDivider />
                  <span className="inline-flex items-center gap-1.5">
                    <EyeIcon className="h-4 w-4" />
                    <span>
                      {DETAIL_COPY.viewLabel} {board.viewCount}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-neutral-400">
              {!canManage ? (
                <button type="button" onClick={onReportBoard} className="transition-colors hover:text-neutral-700">
                  {DETAIL_COPY.report}
                </button>
              ) : null}
              {canManage ? (
                <>
                  <Link to={`/community/${board.boardId}/edit`} className="transition-colors hover:text-neutral-700">
                    {DETAIL_COPY.edit}
                  </Link>
                  <button type="button" onClick={onDelete} className="transition-colors hover:text-red-500">
                    {DETAIL_COPY.delete}
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="pt-7">
            <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[28px]">
              {board.boardTitle}
            </h1>

            <div className="mt-6 space-y-6">
              {imageUrls.length > 0 ? <BoardImageGallery title={board.boardTitle} imageUrls={imageUrls} /> : null}

              <p className="whitespace-pre-wrap break-words text-[17px] leading-8 text-neutral-700 sm:text-[18px]">
                {board.boardContent}
              </p>

              <div className="flex flex-col gap-4 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <ReactionButton
                    reactionType="LIKE"
                    label="좋아요"
                    count={displayedLikeCount}
                    active={currentReactionType === 'LIKE'}
                    disabled={isReacting}
                    onClick={() => void onReact('LIKE')}
                  />
                  <ReactionButton
                    reactionType="DISLIKE"
                    label="싫어요"
                    count={displayedDislikeCount}
                    active={currentReactionType === 'DISLIKE'}
                    disabled={isReacting}
                    onClick={() => void onReact('DISLIKE')}
                  />
                </div>

                <div className="flex items-center gap-5">
                  <SocialStat kind="comment" value={commentCount} />
                </div>
              </div>

              {reactionErrorMessage ? <p className="text-sm text-red-500">{reactionErrorMessage}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white px-6 py-4 shadow-sm sm:px-8">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <h2 className="text-[18px] font-semibold text-neutral-950">
            {DETAIL_COPY.commentsTitle} {commentCount}
          </h2>
        </div>

        {commentsErrorMessage ? (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-neutral-900">{DETAIL_COPY.commentsFailedTitle}</p>
            <p className="mt-2 text-sm text-neutral-500">{commentsErrorMessage}</p>
            <button
              type="button"
              onClick={onRetryComments}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              {DETAIL_COPY.retry}
            </button>
          </div>
        ) : isCommentsLoading ? (
          <div className="py-8 text-center text-sm text-neutral-500">{DETAIL_COPY.loadingComments}</div>
        ) : commentThreads.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-500">{DETAIL_COPY.emptyComments}</div>
        ) : (
          <div>
            {commentThreads.map((comment) => (
              <div key={comment.commentId}>
                <CommentRow
                  comment={comment}
                  currentUserId={currentUserId}
                  currentUserNickname={currentUserNickname}
                  isEditing={editingCommentId === comment.commentId}
                  editDraft={editingCommentId === comment.commentId ? editDraft : comment.commentContent}
                  isMutating={isUpdatingComment || isDeletingComment}
                  errorMessage={
                    editError?.commentId === comment.commentId
                      ? editError.message
                      : deleteError?.commentId === comment.commentId
                        ? deleteError.message
                        : undefined
                  }
                  onEditStart={() => {
                    clearCommentScopedErrors(comment.commentId);
                    setReplyTargetId(null);
                    setReplyDraft('');
                    setEditingCommentId(comment.commentId);
                    setEditDraft(comment.commentContent);
                  }}
                  onEditCancel={() => {
                    setEditingCommentId(null);
                    setEditDraft('');
                    clearCommentScopedErrors(comment.commentId);
                  }}
                  onEditDraftChange={(value) => {
                    setEditDraft(value);
                    setEditError((current) => (current?.commentId === comment.commentId ? null : current));
                  }}
                  onEditSubmit={() => void submitEdit(comment.commentId)}
                  onDelete={() => void handleDeleteComment(comment.commentId)}
                  onReport={() => onReportComment(comment.commentId)}
                  onReplyStart={() => {
                    clearCommentScopedErrors(comment.commentId);
                    setEditingCommentId(null);
                    setEditDraft('');
                    setReplyTargetId((current) => (current === comment.commentId ? null : comment.commentId));
                    setReplyDraft('');
                  }}
                />

                {replyTargetId === comment.commentId ? (
                  <ReplyComposer
                    value={replyDraft}
                    isPending={isCreatingComment}
                    placeholder={DETAIL_COPY.replyPlaceholder}
                    errorMessage={replyError?.commentId === comment.commentId ? replyError.message : undefined}
                    onChange={(value) => {
                      setReplyDraft(value);
                      setReplyError((current) => (current?.commentId === comment.commentId ? null : current));
                    }}
                    onCancel={() => {
                      setReplyTargetId(null);
                      setReplyDraft('');
                      clearCommentScopedErrors(comment.commentId);
                    }}
                    onSubmit={() => void submitReply(comment.commentId)}
                  />
                ) : null}

                {comment.children.map((reply) => (
                  <CommentRow
                    key={reply.commentId}
                    comment={reply}
                    currentUserId={currentUserId}
                    currentUserNickname={currentUserNickname}
                    indent
                    isEditing={editingCommentId === reply.commentId}
                    editDraft={editingCommentId === reply.commentId ? editDraft : reply.commentContent}
                    isMutating={isUpdatingComment || isDeletingComment}
                    errorMessage={
                      editError?.commentId === reply.commentId
                        ? editError.message
                        : deleteError?.commentId === reply.commentId
                          ? deleteError.message
                          : undefined
                    }
                    onEditStart={() => {
                      clearCommentScopedErrors(reply.commentId);
                      setReplyTargetId(null);
                      setReplyDraft('');
                      setEditingCommentId(reply.commentId);
                      setEditDraft(reply.commentContent);
                    }}
                    onEditCancel={() => {
                      setEditingCommentId(null);
                      setEditDraft('');
                      clearCommentScopedErrors(reply.commentId);
                    }}
                    onEditDraftChange={(value) => {
                      setEditDraft(value);
                      setEditError((current) => (current?.commentId === reply.commentId ? null : current));
                    }}
                    onEditSubmit={() => void submitEdit(reply.commentId)}
                    onDelete={() => void handleDeleteComment(reply.commentId)}
                    onReport={() => onReportComment(reply.commentId)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {pageInfo && pageInfo.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3 border-t border-neutral-200 pt-5">
            <button
              type="button"
              disabled={pageInfo.page <= 0}
              onClick={() => onChangeCommentPage(pageInfo.page - 1)}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {DETAIL_COPY.previousPage}
            </button>
            <span className="text-sm text-neutral-500">
              {pageInfo.page + 1} / {pageInfo.totalPages}
            </span>
            <button
              type="button"
              disabled={pageInfo.page >= pageInfo.totalPages - 1}
              onClick={() => onChangeCommentPage(pageInfo.page + 1)}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {DETAIL_COPY.nextPage}
            </button>
          </div>
        ) : null}
      </section>

      <section className="sticky bottom-4 z-10">
        <div className="rounded-[24px] border border-neutral-200 bg-white/96 shadow-[0_18px_42px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="px-4 py-3 sm:px-5">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <AutoSizeTextarea
                  value={draftComment}
                  onChange={(value) => {
                    setDraftComment(value);
                    if (commentError) {
                      setCommentError('');
                    }
                  }}
                  placeholder={DETAIL_COPY.commentPlaceholder}
                  className="w-full rounded-[20px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-800 outline-none transition focus:border-neutral-300"
                />
                {commentError ? <p className="mt-2 text-sm text-red-500">{commentError}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => void submitComment()}
                disabled={isCreatingComment}
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={DETAIL_COPY.submitAria}
              >
                {DETAIL_COPY.submit}
              </button>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function BoardImageGallery({ title, imageUrls }: { title: string; imageUrls: string[] }) {
  if (imageUrls.length === 1) {
    return (
      <div className="max-w-[220px] overflow-hidden rounded-[18px] border border-neutral-100 bg-neutral-50">
        <img src={imageUrls[0]} alt={title} className="aspect-square w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="grid max-w-[720px] grid-cols-2 gap-3 sm:grid-cols-3">
      {imageUrls.map((imageUrl, index) => (
        <div
          key={`${imageUrl}-${index}`}
          className="overflow-hidden rounded-[18px] border border-neutral-100 bg-neutral-50"
        >
          <img src={imageUrl} alt={`${title} 이미지 ${index + 1}`} className="aspect-square w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function AuthorBadge({ name, size, profileUrl }: { name: string; size: 'sm' | 'lg'; profileUrl?: string | null }) {
  const wrapperSizeClass = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  const textSizeClass = size === 'lg' ? 'text-lg' : 'text-sm';
  const normalizedProfileUrl = profileUrl?.trim();

  return (
    <div className={['shrink-0 overflow-hidden rounded-full bg-[#f7e5bf]', wrapperSizeClass].join(' ')}>
      {normalizedProfileUrl ? (
        <img src={normalizedProfileUrl} alt={name} className="block h-full w-full object-cover" />
      ) : (
        <div
          className={[
            'flex h-full w-full items-center justify-center font-semibold text-neutral-700',
            textSizeClass,
          ].join(' ')}
        >
          {name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}

function SocialStat({ kind, value }: { kind: 'like' | 'comment'; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-base font-medium text-neutral-700">
      {kind === 'like' ? (
        <ThumbsUpIcon className="h-6 w-6 text-[#ef3c32]" />
      ) : (
        <CommentIcon className="h-5.5 w-5.5 text-[#1ab7c4]" />
      )}
      <span>{value}</span>
    </span>
  );
}

interface ReactionButtonProps {
  reactionType: ReactionType;
  label: string;
  count: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}

function ReactionButton({ reactionType, label, count, active, disabled, onClick }: ReactionButtonProps) {
  const activeClass =
    reactionType === 'LIKE'
      ? 'border-[#ef3c32]/30 bg-[#ef3c32]/8 text-[#d93025]'
      : 'border-[#4b5563]/30 bg-neutral-100 text-neutral-700';
  const idleClass = 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        active ? activeClass : idleClass,
      ].join(' ')}
      aria-pressed={active}
    >
      {reactionType === 'LIKE' ? <ThumbsUpIcon className="h-5 w-5" /> : <ThumbsDownIcon className="h-5 w-5" />}
      <span>{label}</span>
      <span>{count}</span>
    </button>
  );
}

interface CommentRowProps {
  comment: BoardComment;
  currentUserId?: string | null;
  currentUserNickname?: string | null;
  indent?: boolean;
  isEditing: boolean;
  editDraft: string;
  isMutating: boolean;
  errorMessage?: string;
  onEditStart?: () => void;
  onEditCancel: () => void;
  onEditDraftChange: (value: string) => void;
  onEditSubmit: () => void;
  onDelete: () => void;
  onReplyStart?: () => void;
  onReport: () => void;
}

function CommentRow({
  comment,
  currentUserId,
  currentUserNickname,
  indent = false,
  isEditing,
  editDraft,
  isMutating,
  errorMessage,
  onEditStart,
  onEditCancel,
  onEditDraftChange,
  onEditSubmit,
  onDelete,
  onReplyStart,
  onReport,
}: CommentRowProps) {
  const { nickname } = getCommentAuthor(comment);
  const commentUserId = getCommentUserId(comment);
  const commentAuthorNickname = getRawCommentAuthorNickname(comment);
  // 작성자 UUID(userId)가 응답에 없는 경우를 대비해 닉네임 일치도 본인 확인 수단으로 함께 사용
  // (게시글 본인 확인도 같은 방식 — 위 canManage prop 계산부 참고)
  const isOwnComment =
    (Boolean(currentUserId) && Boolean(commentUserId) && currentUserId === commentUserId) ||
    (Boolean(currentUserNickname) && Boolean(commentAuthorNickname) && currentUserNickname === commentAuthorNickname);
  const canManage = Boolean(isOwnComment && !isDeletedComment(comment));
  const content = isDeletedComment(comment) ? DETAIL_COPY.deletedComment : comment.commentContent;
  const dateTime = getCommentTimestamp(comment);

  return (
    <div
      className={[
        'border-b border-neutral-200 py-6 first:pt-5 last:border-b-0 last:pb-2',
        indent ? 'ml-8 border-l border-l-neutral-100 pl-5' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{nickname}</p>
          {dateTime ? <p className="mt-0.5 text-xs text-neutral-400">{dateTime}</p> : null}
        </div>

        {!isDeletedComment(comment) ? (
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            {!canManage ? (
              <button type="button" onClick={onReport} className="transition-colors hover:text-neutral-700">
                {DETAIL_COPY.report}
              </button>
            ) : null}
            {!indent && onReplyStart ? (
              <button type="button" onClick={onReplyStart} className="transition-colors hover:text-neutral-700">
                {DETAIL_COPY.reply}
              </button>
            ) : null}
            {canManage ? (
              <>
                <button type="button" onClick={onEditStart} className="transition-colors hover:text-neutral-700">
                  {DETAIL_COPY.edit}
                </button>
                <button type="button" onClick={onDelete} className="transition-colors hover:text-red-500">
                  {DETAIL_COPY.delete}
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {isEditing ? (
        <div className="mt-4">
          <AutoSizeTextarea
            value={editDraft}
            onChange={onEditDraftChange}
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-800 outline-none transition focus:border-neutral-300"
          />
          {errorMessage ? <p className="mt-2 text-sm text-red-500">{errorMessage}</p> : null}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onEditCancel}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              {DETAIL_COPY.cancel}
            </button>
            <button
              type="button"
              onClick={onEditSubmit}
              disabled={isMutating}
              className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {DETAIL_COPY.save}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p
            className={[
              'mt-4 text-sm leading-7',
              isDeletedComment(comment) ? 'text-neutral-400' : 'text-neutral-700',
            ].join(' ')}
          >
            {content}
          </p>
          {errorMessage ? <p className="mt-2 text-sm text-red-500">{errorMessage}</p> : null}
        </>
      )}
    </div>
  );
}

interface ReplyComposerProps {
  value: string;
  placeholder: string;
  isPending: boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

function ReplyComposer({
  value,
  placeholder,
  isPending,
  errorMessage,
  onChange,
  onCancel,
  onSubmit,
}: ReplyComposerProps) {
  return (
    <div className="ml-8 rounded-2xl bg-neutral-50 px-4 py-4">
      <AutoSizeTextarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-800 outline-none transition focus:border-neutral-300"
      />
      {errorMessage ? <p className="mt-2 text-sm text-red-500">{errorMessage}</p> : null}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
        >
          {DETAIL_COPY.cancel}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {DETAIL_COPY.submit}
        </button>
      </div>
    </div>
  );
}

interface AutoSizeTextareaProps {
  value: string;
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
}

function AutoSizeTextarea({ value, placeholder, className, onChange }: AutoSizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      rows={1}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={['min-h-[48px] resize-none overflow-hidden', className ?? ''].join(' ')}
    />
  );
}

function MetaDivider() {
  return <span className="text-neutral-300">|</span>;
}

function ThumbsUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className={className}>
      <path
        d="M9.5 10.5 12.5 4a2 2 0 0 1 3.8.8V9h2.2a2 2 0 0 1 2 2.4l-1 5A2 2 0 0 1 17.5 18H9.5m0-7.5V18m0-7.5H6a1.5 1.5 0 0 0-1.5 1.5v4A1.5 1.5 0 0 0 6 17.5h3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThumbsDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className={className}>
      <path
        d="M14.5 13.5 11.5 20a2 2 0 0 1-3.8-.8V15H5.5a2 2 0 0 1-2-2.4l1-5A2 2 0 0 1 6.5 6h8m0 7.5V6m0 7.5H18A1.5 1.5 0 0 0 19.5 12v-4A1.5 1.5 0 0 0 18 6.5h-3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className={className}>
      <path d="M7.5 19.5H4.5L5.6 16A7.5 7.5 0 1 1 12 19.5H7.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className={className}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
