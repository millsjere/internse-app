import axios, { AxiosInstance } from 'axios';

const ADMIN_TOKEN_KEY = 'admin_jwt';
// A non-httpOnly cookie the Next.js middleware can read (middleware can't access localStorage)
const ADMIN_AUTH_COOKIE = 'admin_auth';

const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; path=/; expires=${expires}; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

export const getAdminToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;

export const setAdminToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  setCookie(ADMIN_AUTH_COOKIE, '1');   // readable by Next.js middleware
};

export const clearAdminToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  deleteCookie(ADMIN_AUTH_COOKIE);
};

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

  async createUser(data: { firstname: string; lastname: string; email: string; password: string }) {
    const res = await this.client.post('/users', data);
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

  async createCompany(data: { companyName: string; email: string; password: string }) {
    const res = await this.client.post('/companies', data);
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

  async getJobDetail(id: string) {
    const res = await this.client.get(`/jobs/${id}`);
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

  // ─── Settings ────────────────────────────────────────────
  async updateProfile(data: { name?: string; email?: string }) {
    const res = await this.client.patch('/auth/profile', data);
    return res.data;
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await this.client.patch('/auth/password', data);
    return res.data;
  }

  // ─── Business Verifications ──────────────────────────────
  async getPendingVerifications() {
    const res = await this.client.get('/verifications/pending');
    return res.data;
  }

  async approveCompanyVerification(companyId: string, adminNotes?: string) {
    const res = await this.client.patch(`/verifications/${companyId}/approve`, { adminNotes });
    return res.data;
  }

  async rejectCompanyVerification(companyId: string, rejectionReason: string, adminNotes?: string) {
    const res = await this.client.patch(`/verifications/${companyId}/reject`, {
      rejectionReason,
      adminNotes,
    });
    return res.data;
  }

}

export const adminApi = new AdminApiClient();
