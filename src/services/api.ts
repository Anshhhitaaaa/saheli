/**
 * API Service for Saheli Backend
 */

export interface ApiUser {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  focus?: string;
  pregnancyMode?: boolean;
  pregnancyWeek?: number;
  lastPeriodStart?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ApiNotification {
  id: string;
  category: string;
  title: string;
  message: string;
  discreetMessage: string;
  read: boolean;
  createdAt: string;
  [key: string]: any;
}

export interface ApiNotificationSettings {
  discreetMode: boolean;
  categories: Record<string, boolean>;
  [key: string]: any;
}

export interface ApiCycleLog {
  id?: number | string;
  email?: string;
  date?: string;
  flow?: string;
  note?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ApiSymptomLog {
  id?: number | string;
  email?: string;
  date?: string;
  symptoms?: string[];
  notes?: string;
  mood?: string;
  severity?: any;
  updatedAt?: string;
  [key: string]: any;
}

export interface ApiMedication {
  id: string;
  name: string;
  type?: string;
  dose?: string;
  schedule?: string;
  active?: boolean;
  notes?: string;
  takenDates?: string[];
  [key: string]: any;
}

export interface ApiCommunityPost {
  id: string;
  topic?: string;
  author?: string;
  title?: string;
  body?: string;
  replies?: any[];
  likes?: any[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ApiShareLink {
  id: string;
  email?: string;
  name?: string;
  relationship?: string;
  permissions?: any;
  active?: boolean;
  createdAt?: string;
  [key: string]: any;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth API
  auth: {
    signup: (data: { name: string; username: string; email: string; password?: string; focus?: string }) =>
      request<{ user: ApiUser; token: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (usernameOrEmail: string, password?: string) =>
      request<{ user: ApiUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, email: usernameOrEmail, username: usernameOrEmail, password }),
      }),
    update: (email: string, patch: Record<string, any>) =>
      request<{ user: ApiUser }>('/api/auth/update', {
        method: 'POST',
        body: JSON.stringify({ email, patch }),
      }),
    getProfile: (email: string) =>
      request<{ user: ApiUser }>(`/api/auth/me?email=${encodeURIComponent(email)}`),
  },

  // Cycle Logs API
  cycle: {
    get: (email: string) =>
      request<{ logs: ApiCycleLog[] }>(`/api/cycle?email=${encodeURIComponent(email)}`),
    save: (email: string, date: string, flow: string, note?: string) =>
      request<{ logs: ApiCycleLog[] }>('/api/cycle', {
        method: 'POST',
        body: JSON.stringify({ email, date, flow, note }),
      }),
    delete: (email: string, date: string) =>
      request<{ logs: ApiCycleLog[] }>(`/api/cycle?email=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}`, {
        method: 'DELETE',
      }),
  },

  // Symptoms API
  symptoms: {
    get: (email: string) =>
      request<{ logs: ApiSymptomLog[] }>(`/api/symptoms?email=${encodeURIComponent(email)}`),
    save: (email: string, date: string, symptoms: string[], notes?: string, mood?: string, severity?: number) =>
      request<{ logs: ApiSymptomLog[] }>('/api/symptoms', {
        method: 'POST',
        body: JSON.stringify({ email, date, symptoms, notes, mood, severity }),
      }),
    delete: (email: string, date: string) =>
      request<{ logs: ApiSymptomLog[] }>(`/api/symptoms?email=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}`, {
        method: 'DELETE',
      }),
  },

  // Medications API
  medications: {
    get: (email: string) =>
      request<{ meds: ApiMedication[] }>(`/api/medications?email=${encodeURIComponent(email)}`),
    create: (email: string, med: { name: string; type: string; dose?: string; schedule?: string; notes?: string }) =>
      request<{ meds: ApiMedication[] }>('/api/medications', {
        method: 'POST',
        body: JSON.stringify({ email, ...med }),
      }),
    update: (email: string, id: string, patch: Record<string, any>) =>
      request<{ meds: ApiMedication[] }>(`/api/medications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ email, patch }),
      }),
    delete: (email: string, id: string) =>
      request<{ meds: ApiMedication[] }>(`/api/medications/${id}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      }),
  },

  // Community API
  community: {
    getPosts: () => request<{ posts: ApiCommunityPost[] }>('/api/community'),
    createPost: (data: { topic: string; author: string; title: string; body: string }) =>
      request<{ posts: ApiCommunityPost[] }>('/api/community', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addReply: (postId: string, author: string, body: string) =>
      request<{ posts: ApiCommunityPost[] }>('/api/community/reply', {
        method: 'POST',
        body: JSON.stringify({ postId, author, body }),
      }),
    likePost: (postId: string, userHandle: string) =>
      request<{ posts: ApiCommunityPost[] }>('/api/community/like', {
        method: 'POST',
        body: JSON.stringify({ postId, userHandle }),
      }),
    editPost: (id: string, author: string, title: string, body: string, topic?: string) =>
      request<{ posts: ApiCommunityPost[] }>('/api/community/edit', {
        method: 'POST',
        body: JSON.stringify({ id, author, title, body, topic }),
      }),
    deletePost: (id: string, author: string) =>
      request<{ posts: ApiCommunityPost[] }>(`/api/community?id=${encodeURIComponent(id)}&author=${encodeURIComponent(author)}`, {
        method: 'DELETE',
      }),
  },

  // Sharing API
  sharing: {
    get: (email: string) =>
      request<{ shares: ApiShareLink[] }>(`/api/sharing?email=${encodeURIComponent(email)}`),
    create: (email: string, name: string, relationship: string, permissions: Record<string, boolean>) =>
      request<{ shares: ApiShareLink[] }>('/api/sharing', {
        method: 'POST',
        body: JSON.stringify({ email, name, relationship, permissions }),
      }),
    update: (email: string, id: string, patch: { permissions?: Record<string, boolean>; active?: boolean }) =>
      request<{ shares: ApiShareLink[] }>('/api/sharing/update', {
        method: 'POST',
        body: JSON.stringify({ email, id, ...patch }),
      }),
    getPublicView: (shareId: string) =>
      request<{ active: boolean; share?: ApiShareLink; userName?: string; cycleData?: any; symptomData?: any; pregnancyData?: any; insightsData?: any; message?: string }>(`/api/sharing/view?id=${encodeURIComponent(shareId)}`),
  },

  // Assistant RAG AI Chat API
  assistant: {
    chat: (email: string, message: string, conversationId?: string) =>
      request<{ answer: string; sources: any[]; safetyFlag?: boolean }>('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ email, message, conversationId }),
      }),
    getHistory: (email: string) =>
      request<{ conversations: any[] }>(`/api/assistant/history?email=${encodeURIComponent(email)}`),
    getMessages: (email: string, conversationId: string) =>
      request<{ messages: any[] }>(`/api/assistant/chat?email=${encodeURIComponent(email)}&conversationId=${encodeURIComponent(conversationId)}`),
    deleteChat: (email: string, conversationId: string) =>
      request<{ success: boolean }>(`/api/assistant/chat?email=${encodeURIComponent(email)}&conversationId=${encodeURIComponent(conversationId)}`, {
        method: 'DELETE',
      }),
  },

  // Notifications API
  notifications: {
    get: (email: string) =>
      request<{ notifications: ApiNotification[] }>(`/api/notifications?email=${encodeURIComponent(email)}`),
    markRead: (email: string, notificationId?: string, markAll?: boolean) =>
      request<{ notifications: ApiNotification[] }>('/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ email, notificationId, markAll }),
      }),
    getSettings: (email: string) =>
      request<{ settings: ApiNotificationSettings | null }>(`/api/notifications/settings?email=${encodeURIComponent(email)}`),
    updateSettings: (email: string, discreetMode: boolean, categories: Record<string, boolean> | any) =>
      request<{ settings: ApiNotificationSettings }>('/api/notifications/settings', {
        method: 'POST',
        body: JSON.stringify({ email, discreetMode, categories }),
      }),
  },
};
