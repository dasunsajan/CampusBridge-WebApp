import {
  Event,
  Sponsor,
  Sponsorship,
  DashboardData,
  AnalyticsData,
  ApiResponse,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      const errorMsg =
        result?.message ||
        (result?.errors ? result.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ') : 'Request failed');
      throw new Error(errorMsg);
    }

    return result.data as T;
  } catch (error: any) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
}

// 1. Events API
export const eventApi = {
  getAll: (params?: { search?: string; category?: string; status?: string; sortBy?: string; sortOrder?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category && params.category !== 'ALL') searchParams.append('category', params.category);
    if (params?.status && params.status !== 'ALL') searchParams.append('status', params.status);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    const query = searchParams.toString();
    return request<Event[]>(`/events${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request<Event>(`/events/${id}`),

  create: (data: Partial<Event>) =>
    request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Event>) =>
    request<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    }),
};

// 2. Sponsors API
export const sponsorApi = {
  getAll: (params?: { search?: string; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category && params.category !== 'ALL') searchParams.append('category', params.category);
    const query = searchParams.toString();
    return request<Sponsor[]>(`/sponsors${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request<Sponsor>(`/sponsors/${id}`),

  create: (data: Partial<Sponsor>) =>
    request<Sponsor>('/sponsors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Sponsor>) =>
    request<Sponsor>(`/sponsors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/sponsors/${id}`, {
      method: 'DELETE',
    }),
};

// 3. Sponsorships API
export const sponsorshipApi = {
  getAll: (params?: { eventId?: string; sponsorId?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.eventId) searchParams.append('eventId', params.eventId);
    if (params?.sponsorId) searchParams.append('sponsorId', params.sponsorId);
    if (params?.status && params.status !== 'ALL') searchParams.append('status', params.status);
    const query = searchParams.toString();
    return request<Sponsorship[]>(`/sponsorships${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request<Sponsorship>(`/sponsorships/${id}`),

  create: (data: { eventId: string; sponsorId: string; amount: number; message?: string; status?: string }) =>
    request<Sponsorship>('/sponsorships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED') =>
    request<Sponsorship>(`/sponsorships/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/sponsorships/${id}`, {
      method: 'DELETE',
    }),
};

// 4. Dashboard & Analytics API
export const dashboardApi = {
  getStats: () => request<DashboardData>('/dashboard/stats'),
  getAnalytics: () => request<AnalyticsData>('/dashboard/analytics'),
};
