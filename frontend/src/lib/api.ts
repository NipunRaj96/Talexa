// API Service Layer for Backend Communication
import { API_ENDPOINTS } from './api-config';
import { supabase } from './supabase';

// Types
export interface Job {
  id: string;
  job_title: string;
  description?: string;
  minimum_experience: string;
  number_of_vacancies: number;
  skills: string[];
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  resume_url?: string;
  skills_extracted: string[];
  experience_years?: number;
  education_level?: string;
  match_score?: number;
  analysis_result?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateJobData {
  job_title: string;
  description?: string;
  minimum_experience: string;
  number_of_vacancies: number;
  skills: string[];
  status?: 'active' | 'closed';
}

// Helper to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
};

// Jobs API
export const jobsApi = {
  // Create a new job (Protected)
  create: async (data: CreateJobData): Promise<Job> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.jobs, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create job';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error:', error);
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  // Get all jobs (Public)
  getAll: async (status?: 'active' | 'closed'): Promise<{ jobs: Job[]; total: number }> => {
    const url = status 
      ? `${API_ENDPOINTS.jobs}?status_filter=${status}`
      : API_ENDPOINTS.jobs;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    
    return response.json();
  },

  // Get job by ID (Public)
  getById: async (id: string): Promise<Job> => {
    const response = await fetch(API_ENDPOINTS.jobById(id));
    
    if (!response.ok) {
      throw new Error('Job not found');
    }
    
    return response.json();
  },

  // Update job (Protected)
  update: async (id: string, data: Partial<CreateJobData>): Promise<Job> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.jobById(id), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update job');
    }
    
    return response.json();
  },

  // Update job status (Protected)
  updateStatus: async (id: string, status: 'active' | 'closed'): Promise<Job> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_ENDPOINTS.jobStatus(id)}?new_status=${status}`, {
      method: 'PATCH',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update job status');
    }
    
    return response.json();
  },

  // Delete job (Protected)
  delete: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.jobById(id), {
      method: 'DELETE',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete job');
    }
  },
};

// Applications API
export const applicationsApi = {
  // Submit application with resume (Public)
  submit: async (
    jobId: string,
    applicantName: string,
    applicantEmail: string,
    resumeFile: File
  ): Promise<Application> => {
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('applicant_name', applicantName);
    formData.append('applicant_email', applicantEmail);
    formData.append('resume', resumeFile);

    const response = await fetch(API_ENDPOINTS.applications, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit application');
    }

    return response.json();
  },

  // Get all applications (Protected)
  getAll: async (): Promise<{ applications: Application[]; total: number }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.applications, {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    
    return response.json();
  },

  // Get applications for a job (Protected)
  getByJob: async (jobId: string): Promise<{ applications: Application[]; total: number }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_ENDPOINTS.applications}?job_id=${jobId}`, {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    
    return response.json();
  },

  // Get top candidates for a job (Protected)
  getTopCandidates: async (jobId: string, limit: number = 10): Promise<{ applications: Application[]; total: number }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_ENDPOINTS.topCandidates(jobId)}?limit=${limit}`, {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch top candidates');
    }
    
    return response.json();
  },

  // Get application by ID (Protected)
  getById: async (id: string): Promise<Application> => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_ENDPOINTS.applicationById(id), {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error('Application not found');
    }
    
    return response.json();
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.health);
    return response.ok;
  } catch {
    return false;
  }
};
