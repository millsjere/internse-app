import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

export interface ApplicationFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  // Applicant must match ALL pairs (AND) to be included
  questions?: { questionId: string; answer: string }[];
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for debugging and FormData handling
    this.client.interceptors.request.use((config) => {
      // For FormData requests, delete Content-Type header so axios/browser sets it with proper boundary
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && (window as any).__DEBUG_AUTH) {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, { withCredentials: config.withCredentials });
      }
      return config;
    });

    // Add response interceptor with token refresh logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Don't attempt token refresh on auth-related endpoints or /me endpoint
        const authEndpoints = [
          '/auth/login',
          '/auth/signup',
          '/auth/verify-email',
          '/auth/refresh-token',
          '/auth/company/login',
          '/auth/company/signup',
          '/auth/company/verify-email',
          '/auth/me', // Skip refresh on session check endpoint
        ];
        const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

        if (error.response?.status === 401 && !isAuthEndpoint) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              // Attempt to refresh token
              await this.client.post('/auth/refresh-token');
              this.isRefreshing = false;

              // Retry the original request
              return this.client(originalRequest);
            } catch (refreshError) {
              this.isRefreshing = false;
              this.failedQueue = [];

              // Refresh failed, redirect to login
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }

              return Promise.reject(refreshError);
            }
          } else {
            // Token refresh is already in progress, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                onSuccess: () => resolve(this.client(originalRequest)),
                onFailure: (err: any) => reject(err),
              });
            });
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async userSignUp(data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/signup', data);
    return response.data;
  }

  async userLogin(data: { email: string; password: string }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async verifyEmail(data: { email: string; token: string }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/verify-email', data);
    return response.data;
  }

  async companySignUp(data: {
    companyName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/company/signup', data);
    return response.data;
  }

  async companyLogin(data: { email: string; password: string }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/company/login', data);
    return response.data;
  }

  async verifyCompanyEmail(data: { email: string; token: string }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/company/verify-email', data);
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(data: {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    const response = await this.client.patch('/auth/reset-password', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse> {
    const response = await this.client.post('/auth/refresh-token');
    return response.data;
  }

  // Job endpoints
  async getJobs(page = 1, limit = 20, filters?: any): Promise<ApiResponse> {
    const response = await this.client.get('/jobs', { params: { page, limit, ...filters } });
    return response.data;
  }

  async getJobById(jobId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/jobs/${jobId}`);
    return response.data;
  }

  async trackJobView(jobId: string): Promise<void> {
    await this.client.post(`/jobs/${jobId}/view`);
  }

  async getCompanyJobs(): Promise<ApiResponse> {
    const response = await this.client.get('/jobs/company/jobs');
    return response.data;
  }

  async createJob(data: any): Promise<ApiResponse> {
    const response = await this.client.post('/jobs/company/create', data);
    return response.data;
  }

  async updateJob(jobId: string, data: any): Promise<ApiResponse> {
    const response = await this.client.put(`/jobs/${jobId}`, data);
    return response.data;
  }

  async publishJob(jobId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/jobs/${jobId}/publish`);
    return response.data;
  }

  async draftJob(jobId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/jobs/${jobId}/draft`);
    return response.data;
  }

  async closeJob(jobId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/jobs/${jobId}/close`);
    return response.data;
  }

  async archiveJob(jobId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/jobs/${jobId}/archive`);
    return response.data;
  }

  async deleteJob(jobId: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/jobs/${jobId}`);
    return response.data;
  }

  // Application endpoints
  async applyToJob(jobId: string, data: any): Promise<ApiResponse> {
    const response = await this.client.post(`/jobs/${jobId}/apply`, data);
    return response.data;
  }

  private serializeApplicationFilterParams(params?: ApplicationFilterParams): Record<string, unknown> {
    const { questions, ...rest } = params ?? {};
    return questions && questions.length > 0 ? { ...rest, questions: JSON.stringify(questions) } : rest;
  }

  async getJobApplications(jobId: string, params?: ApplicationFilterParams): Promise<ApiResponse> {
    const response = await this.client.get(`/jobs/${jobId}/applications`, { params: this.serializeApplicationFilterParams(params) });
    return response.data;
  }

  async getJobApplicationsExportBatch(jobId: string, params: ApplicationFilterParams): Promise<string> {
    const response = await this.client.get(`/jobs/${jobId}/applications/export`, { params: this.serializeApplicationFilterParams(params), responseType: 'text' });
    return response.data as string;
  }

  getApplicationResumeDownloadUrl(applicationId: string): string {
    const baseURL = this.client.defaults.baseURL;
    return `${baseURL}/jobs/company/applications/${applicationId}/resume`;
  }

  // User applications (jobs user has applied to)
  async getUserApplications(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/jobs/user/applications');
      return response.data;
    } catch {
      return { success: true, data: [], status: 200, message: 'No applications found' };
    }
  }

  // Favourite endpoints
  async toggleFavourite(jobId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/jobs/${jobId}/favourite/toggle`);
    return response.data;
  }

  async getUserFavourites(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/jobs/user/favourites');
      return response.data;
    } catch {
      return { success: true, data: [], status: 200, message: 'No favorites found' };
    }
  }

  // User profile endpoints
  async getUserProfile(): Promise<ApiResponse> {
    // This endpoint may not exist yet, try to get from current user
    try {
      const response = await this.client.get('/auth/me');
      return response.data;
    } catch {
      return { success: false, data: null, status: 400, message: 'Failed to fetch user profile' };
    }
  }

  async updateUserProfile(data: any): Promise<ApiResponse> {
    const response = await this.client.put('/user/profile', data);
    return response.data;
  }

  async uploadUserPhoto(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await this.client.patch('/u/account/photo', formData);
    return response.data;
  }

  async uploadUserCover(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await this.client.patch('/u/account/coverImg', formData);
    return response.data;
  }

  async uploadUserResume(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await this.client.patch('/user/profile/resume', formData);
    return response.data;
  }

  async deleteUserResume(): Promise<ApiResponse> {
    const response = await this.client.delete('/user/profile/resume');
    return response.data;
  }

  async updateUserSettings(data: any): Promise<ApiResponse> {
    const response = await this.client.post('/u/account/settings', data);
    return response.data;
  }

  async addExperience(data: any): Promise<ApiResponse> {
    const response = await this.client.post('/user/profile/experience', data);
    return response.data;
  }

  async updateExperience(experienceId: string, data: any): Promise<ApiResponse> {
    const response = await this.client.put(`/user/profile/experience/${experienceId}`, data);
    return response.data;
  }

  async deleteExperience(experienceId: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/user/profile/experience/${experienceId}`);
    return response.data;
  }

  async addEducation(data: any): Promise<ApiResponse> {
    const response = await this.client.post('/user/profile/education', data);
    return response.data;
  }

  async updateEducation(educationId: string, data: any): Promise<ApiResponse> {
    const response = await this.client.put(`/user/profile/education/${educationId}`, data);
    return response.data;
  }

  async deleteEducation(educationId: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/user/profile/education/${educationId}`);
    return response.data;
  }

  // Company profile endpoints
  async getCompanyProfile(): Promise<ApiResponse> {
    // Company info is in the current user when logged in as company
    try {
      const response = await this.client.get('/auth/me');
      return response.data;
    } catch {
      return { success: false, data: null, status: 400, message: 'Failed to fetch company profile' };
    }
  }

  async updateCompanyProfile(data: any): Promise<ApiResponse> {
    const response = await this.client.put('/user/company/profile', data);
    return response.data;
  }

  async saveOnboardingProfile(data: any): Promise<ApiResponse> {
    const response = await this.client.put('/user/company/onboarding/profile', data);
    return response.data;
  }

  async selectPlan(planType: string, billingCycle: string = 'monthly', callbackUrl?: string): Promise<ApiResponse> {
    const response = await this.client.post('/user/company/onboarding/plan', { planType, billingCycle, ...(callbackUrl && { callbackUrl }) });
    return response.data;
  }

  async verifyPaystackPayment(reference: string): Promise<ApiResponse> {
    const response = await this.client.get(`/user/company/onboarding/verify?reference=${reference}`);
    return response.data;
  }

  async updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected' | 'reviewing'): Promise<ApiResponse> {
    const response = await this.client.patch(`/jobs/company/applications/${applicationId}/status`, { status });
    return response.data;
  }

  async changeUserPassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse> {
    const response = await this.client.post('/user/profile/password', data);
    return response.data;
  }

  async changeCompanyPassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse> {
    const response = await this.client.post('/user/company/password', data);
    return response.data;
  }

  // Business verification endpoints
  async uploadBusinessDocument(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('document', file);
    const response = await this.client.post('/user/company/verification/upload', formData);
    return response.data;
  }

  async submitBusinessVerification(registrationNumber: string, registrationDocument: string): Promise<ApiResponse> {
    const response = await this.client.post('/user/company/verification/submit', {
      registrationNumber,
      registrationDocument,
    });
    return response.data;
  }

  async getVerificationStatus(): Promise<ApiResponse> {
    const response = await this.client.get('/user/company/verification/status');
    return response.data;
  }

  // Notification endpoints
  async getUserNotifications(): Promise<ApiResponse> {
    const response = await this.client.get('/notifications/user');
    return response.data;
  }

  async getCompanyNotifications(): Promise<ApiResponse> {
    const response = await this.client.get('/notifications/company');
    return response.data;
  }

  async markNotificationAsRead(notificationId: string, type: 'user' | 'company'): Promise<ApiResponse> {
    const response = await this.client.put(`/notifications/${type}/${notificationId}/read`);
    return response.data;
  }

  async deleteNotification(notificationId: string, type: 'user' | 'company'): Promise<ApiResponse> {
    const response = await this.client.delete(`/notifications/${type}/${notificationId}`);
    return response.data;
  }

  async getPlans(): Promise<ApiResponse> {
    const response = await this.client.get('/admin/plans/public');
    return response.data;
  }

  async getBillingHistory(): Promise<ApiResponse> {
    const response = await this.client.get('/user/company/billing');
    return response.data;
  }

  async sendTeamInvite(email: string, role: string): Promise<ApiResponse> {
    const response = await this.client.post('/user/company/invite-team-member', { email, role });
    return response.data;
  }

  async getTeamMembers(): Promise<ApiResponse> {
    const response = await this.client.get('/user/company/team-members');
    return response.data;
  }

  async acceptTeamInvite(token: string): Promise<ApiResponse> {
    const response = await this.client.get('/user/team-invite/accept', { params: { token } });
    return response.data;
  }

  async setPassword(newPassword: string, confirmPassword: string): Promise<ApiResponse> {
    const response = await this.client.post('/user/company/set-password', {
      newPassword,
      confirmPassword,
    });
    return response.data;
  }

  async removeTeamMember(memberId: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/user/company/team-members/${memberId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
