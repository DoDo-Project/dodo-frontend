export const queryKeys = {
  main: {
    home: () => ['main', 'home'] as const,
  },
  boards: {
    list: (params?: { page?: number; size?: number }) =>
      ['boards', 'list', params?.page ?? 0, params?.size ?? 12] as const,
    listInfinite: () => ['boards', 'list-infinite'] as const,
    detail: (boardId: number) => ['boards', boardId, 'detail'] as const,
    comments: (boardId: number, params?: { page?: number; size?: number }) =>
      ['boards', boardId, 'comments', params?.page ?? 0, params?.size ?? 20] as const,
    mineAll: () => ['boards', 'mine'] as const,
    mine: (params?: { page?: number; size?: number }) =>
      ['boards', 'mine', params?.page ?? 0, params?.size ?? 10] as const,
    tempSaved: (sessionKey: string) => ['boards', 'temp-save', sessionKey] as const,
  },
  comments: {
    mine: (params?: { page?: number; size?: number }) =>
      ['comments', 'mine', params?.page ?? 0, params?.size ?? 10] as const,
  },
  pets: {
    list: (params?: { page?: number; size?: number; sort?: string }) =>
      ['pets', 'list', params?.page ?? 0, params?.size ?? 10, params?.sort ?? 'registrationCreatedAt,desc'] as const,
    detail: (petId: number) => ['pets', petId, 'detail'] as const,
    family: {
      invitationCode: (petId: number) => ['pets', petId, 'family', 'invitation-code'] as const,
      pendingUsers: (params?: { status?: string; page?: number; size?: number; sort?: string }) =>
        [
          'pets',
          'family',
          'pending-users',
          params?.status ?? '',
          params?.page ?? 0,
          params?.size ?? 10,
          params?.sort ?? '',
        ] as const,
      applications: (params?: { status?: string; page?: number; size?: number; sort?: string }) =>
        [
          'pets',
          'family',
          'applications',
          params?.status ?? '',
          params?.page ?? 0,
          params?.size ?? 10,
          params?.sort ?? '',
        ] as const,
      blockedUsers: (params?: { page?: number; size?: number; sort?: string }) =>
        ['pets', 'family', 'blocked-users', params?.page ?? 0, params?.size ?? 10, params?.sort ?? ''] as const,
    },
    significantList: (petId: number, params?: { page?: number; size?: number; sort?: string }) =>
      ['pets', petId, 'significant', 'list', params?.page ?? 0, params?.size ?? 10, params?.sort ?? ''] as const,
    weightHistory: (petId: number, params?: { page?: number; size?: number; sort?: string }) =>
      [
        'pets',
        petId,
        'weight',
        'history',
        params?.page ?? 0,
        params?.size ?? 10,
        params?.sort ?? 'petWeightsMeasuredAt,desc',
      ] as const,
    healthAnalysis: {
      list: (petId: number, params?: { page?: number; size?: number; period?: string }) =>
        [
          'pets',
          petId,
          'health-analysis',
          'list',
          params?.page ?? 0,
          params?.size ?? 10,
          params?.period ?? '',
        ] as const,
      detail: (analysisId: number) => ['pets', 'health-analysis', analysisId, 'detail'] as const,
    },
  },
  fence: {
    boundaries: () => ['fence', 'boundaries'] as const,
    boundary: (fenceId: number) => ['fence', fenceId, 'boundary'] as const,
    status: (petId: number) => ['fence', petId, 'status'] as const,
  },
  notifications: {
    list: (params?: { page?: number; size?: number; isRead?: boolean; type?: string }) =>
      [
        'notifications',
        'list',
        params?.page ?? 0,
        params?.size ?? 20,
        params?.isRead ?? null,
        params?.type ?? null,
      ] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },
  activities: {
    history: (params?: { page?: number; size?: number; sort?: string }) =>
      ['activities', 'history', params?.page ?? 0, params?.size ?? 10, params?.sort ?? ''] as const,
    historyDetail: (historyId: number) => ['activities', 'history', historyId, 'detail'] as const,
    historyRoute: (historyId: number) => ['activities', 'history', historyId, 'route'] as const,
    nearbyPopular: (params: { latitude: number; longitude: number; limit?: number }) =>
      [
        'activities',
        'history',
        'popular',
        params.latitude.toFixed(3),
        params.longitude.toFixed(3),
        params.limit ?? 10,
      ] as const,
  },
} as const;
