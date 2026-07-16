export interface IUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  country?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  bio?: string;
  skills: string[];
  experience: IExperience[];
  education: IEducation[];
  resume?: string;
  profileCompletion: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IExperience {
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  description?: string;
}

export interface IEducation {
  _id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface ICompany {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  description?: string;
  logo?: string;
  coverPhoto?: string;
  verified: boolean;
  mustSetPassword?: boolean;
  teamRole?: 'admin' | 'recruiter' | 'viewer';
  onboardingStep: 'profile' | 'subscription' | 'complete';
  paymentPlan: {
    planType: 'starter' | 'growth' | 'enterprise';
    credits: number;
    used: number;
    billingCycle: 'monthly' | 'annual';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    paystackCustomerId?: string;
    paystackSubscriptionId?: string;
  };
  businessVerification: {
    status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
    registrationDocument?: string;
    registrationNumber?: string;
    verifiedAt?: string;
    rejectionReason?: string;
    submittedAt?: string;
    adminNotes?: string;
  };
  canPostJobs: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IJob {
  _id: string;
  company: ICompany;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  tags: string[];
  industry: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  category: 'internship' | 'volunteer' | 'fellowship';
  level: 'entry' | 'mid' | 'senior';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  location?: string;
  remote: boolean;
  status: 'drafted' | 'published' | 'closed' | 'archived';
  slug: string;
  views: number;
  applicationCount: number;
  featured: boolean;
  featuredUntil?: string;
  questions: Array<{
    _id: string;
    question: string;
    required: boolean;
    type?: 'text' | 'paragraph' | 'single_choice' | 'multi_choice' | 'dropdown' | 'date';
    options?: string[];
    maxLength?: number;
    maxLengthUnit?: 'words' | 'characters';
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface IAdmin {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin';
  createdAt: string;
  updatedAt: string;
}

export interface IPlanConfig {
  _id: string;
  planType: 'starter' | 'growth' | 'enterprise';
  displayName: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: number;
  resetsMonthly: boolean;
  teamSeats: number;
  featuredListings: number;
  features: string[];
  updatedAt: string;
}

export interface IApplication {
  _id: string;
  job: IJob;
  applicant: IUser;
  resume?: string;
  coverLetter?: string;
  status: 'pending' | 'reviewing' | 'rejected' | 'accepted';
  answers: Array<{
    questionId: string;
    question: string;
    type?: 'text' | 'paragraph' | 'single_choice' | 'multi_choice' | 'dropdown' | 'date';
    options?: string[];
    answer: string | string[];
  }>;
  appliedAt: string;
  updatedAt: string;
}

export interface IFavourite {
  _id: string;
  user: string;
  job: IJob;
  createdAt: string;
}

export interface INotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  counts?: Record<string, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
