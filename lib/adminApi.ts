import axios, { AxiosInstance } from 'axios';

const ADMIN_TOKEN_KEY = 'admin_jwt';

export const getAdminToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;

export const setAdminToken = (token: string) =>
  typeof window !== 'undefined' && localStorage.setItem(ADMIN_TOKEN_KEY, token);

export const clearAdminToken = () =>
  typeof window !== 'undefined' && localStorage.removeItem(ADMIN_TOKEN_KEY);

class AdminApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin`,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach stored token as Bearer header on every request
    this.client.interceptors.request.use((config) => {
      const token = getAdminToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ─── Auth ───────────────────────────────────────────────
  async login(email: string, password: string) {
    const res = await this.client.post('/auth/login', { email, password });
    // Store token so subsequent requests are authenticated cross-origin
    if (res.data?.token) {
      setAdminToken(res.data.token);
    }
    return res.data;
  }

  async logout() {
    const res = await this.client.post('/auth/logout');
    clearAdminToken();
    return res.data;
  }

  async getMe() {
    const res = await this.client.get('/auth/me');
    return res.data;
  }

  // ─── Stats ───────────────────────��──────────────────────
  async getStats() {
    const res = await this.client.get('/stats');
    return res.data;
  }

  // ─── Users ──────────────────────────────────────────────
  async getUsers(params?: { page?: number; limit?: number; search?: string; verified?: boolean; suspended?: boolean }) {
    const res = await this.client.get('/users', { params });
    return res.data;
  }

  async getUserDetail(id: string) {
    const res = await this.client.get(`/users/${id}`);
    return res.data;
  }

  async suspendUser(id: string) {
    const res = await this.client.patch(`/users/${id}/suspend`);
    return res.data;
  }

  async activateUser(id: string) {
    const res = await this.client.patch(`/users/${id}/activate`);
    return res.data;
  }

  async deleteUser(id: string) {
    const res = await this.client.delete(`/users/${id}`);
    return res.data;
  }

  // ─── Companies ───────────────────���──────────────────────
  async getCompanies(params?: { page?: number; limit?: number; search?: string; planType?: string; verified?: boolean; suspended?: boolean }) {
    const res = await this.client.get('/companies', { params });
    return res.data;
  }

  async getCompanyDetail(id: string) {
    const res = await this.client.get(`/companies/${id}`);
    return res.data;
  }

  async verifyCompany(id: string) {
    const res = await this.client.patch(`/companies/${id}/verify`);
    return res.data;
  }

  async suspendCompany(id: string) {
    const res = await this.client.patch(`/companies/${id}/suspend`);
    return res.data;
  }

  async activateCompany(id: string) {
    const res = await this.client.patch(`/companies/${id}/activate`);
    return res.data;
  }

  async deleteCompany(id: string) {
    const res = await this.client.delete(`/companies/${id}`);
    return res.data;
  }

  // ─── Jobs ─────────────────────────────��──────────────────
  async getJobs(params?: { page?: number; limit?: number; search?: string; status?: string; featured?: boolean; company?: string }) {
    const res = await this.client.get('/jobs', { params });
    return res.data;
  }

  async forceCloseJob(id: string) {
    const res = await this.client.patch(`/jobs/${id}/close`);
    return res.data;
  }

  async toggleFeatured(id: string, daysToFeature = 30) {
    const res = await this.client.patch(`/jobs/${id}/featured`, { daysToFeature });
    return res.data;
  }

  async deleteJob(id: string) {
    const res = await this.client.delete(`/jobs/${id}`);
    return res.data;
  }

  // ─── Pricing ─────────────────��───────────────────────────
  async getPlanConfigs() {
    const res = await this.client.get('/plans');
    return res.data;
  }

  async createPlanConfig(data: Record<string, any>) {
    const res = await this.client.post('/plans', data);
    return res.data;
  }

  async updatePlanConfig(id: string, data: Record<string, any>) {
    const res = await this.client.put(`/plans/${id}`, data);
    return res.data;
  }

  async deletePlanConfig(id: string) {
    const res = await this.client.delete(`/plans/${id}`);
    return res.data;
  }

  // ─── Email ──────────────────────��────────────────────────
  async sendBroadcast(data: { segment: string; subject: string; html: string }) {
    const res = await this.client.post('/email/broadcast', data);
    return res.data;
  }

  async sendDirectEmail(data: { recipientId: string; recipientType: 'user' | 'company'; subject: string; html: string }) {
    const res = await this.client.post('/email/direct', data);
    return res.data;
  }

}

export const adminApi = new AdminApiClient();
