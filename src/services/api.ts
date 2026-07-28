/**
 * API Service for Saheli Full-Stack MongoDB Backend
 */

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
    signup: (data: { name: string; email: string; password?: string; focus?: string }) =>
      request<{ user: any; token: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (email: string, password?: string) =>
      request<{ user: any; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    update: (email: string, patch: Record<string, any>) =>
      request<{ user: any }>('/api/auth/update', {
        method: 'POST',
        body: JSON.stringify({ email, patch }),
      }),
  },

  // Cycle Logs API
  cycle: {
    get: (email: string) =>
      request<{ logs: any[] }>(`/api/cycle?email=${encodeURIComponent(email)}`),
    save: (email: string, date: string, flow: string, note?: string) =>
      request<{ logs: any[] }>('/api/cycle', {
        method: 'POST',
        body: JSON.stringify({ email, date, flow, note }),
      }),
  },

  // Symptoms API
  symptoms: {
    get: (email: string) =>
      request<{ logs: any[] }>(`/api/symptoms?email=${encodeURIComponent(email)}`),
    save: (email: string, date: string, symptoms: string[], notes?: string) =>
      request<{ logs: any[] }>('/api/symptoms', {
        method: 'POST',
        body: JSON.stringify({ email, date, symptoms, notes }),
      }),
  },

  // Medications API
  medications: {
    get: (email: string) =>
      request<{ meds: any[] }>(`/api/medications?email=${encodeURIComponent(email)}`),
    create: (email: string, med: { name: string; type: string; dose?: string; schedule?: string; notes?: string }) =>
      request<{ meds: any[] }>('/api/medications', {
        method: 'POST',
        body: JSON.stringify({ email, ...med }),
      }),
    update: (email: string, id: string, patch: Record<string, any>) =>
      request<{ meds: any[] }>(`/api/medications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ email, patch }),
      }),
    delete: (email: string, id: string) =>
      request<{ meds: any[] }>(`/api/medications/${id}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      }),
  },

  // Community API
  community: {
    getPosts: () => request<{ posts: any[] }>('/api/community'),
    createPost: (data: { topic: string; author: string; title: string; body: string }) =>
      request<{ posts: any[] }>('/api/community', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addReply: (postId: string, author: string, body: string) =>
      request<{ posts: any[] }>('/api/community/reply', {
        method: 'POST',
        body: JSON.stringify({ postId, author, body }),
      }),
  },

  // Sharing API
  sharing: {
    get: (email: string) =>
      request<{ shares: any[] }>(`/api/sharing?email=${encodeURIComponent(email)}`),
    create: (email: string, name: string, relationship: string, permissions: any) =>
      request<{ shares: any[] }>('/api/sharing', {
        method: 'POST',
        body: JSON.stringify({ email, name, relationship, permissions }),
      }),
  },

  // Assistant RAG AI Chat API
  assistant: {
    chat: (email: string, message: string, conversationId?: string) =>
      request<{ answer: string; sources: any[]; safetyFlag?: boolean }>('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ email, message, conversationId }),
      }),
  },

  // Notifications API
  notifications: {
    get: (email: string) =>
      request<{ notifications: any[] }>(`/api/notifications?email=${encodeURIComponent(email)}`),
    markRead: (email: string, notificationId?: string, markAll?: boolean) =>
      request<{ notifications: any[] }>('/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ email, notificationId, markAll }),
      }),
    getSettings: (email: string) =>
      request<{ settings: any }>(`/api/notifications/settings?email=${encodeURIComponent(email)}`),
    updateSettings: (email: string, discreetMode: boolean, categories: Record<string, boolean>) =>
      request<{ settings: any }>('/api/notifications/settings', {
        method: 'POST',
        body: JSON.stringify({ email, discreetMode, categories }),
      }),
  },
};
