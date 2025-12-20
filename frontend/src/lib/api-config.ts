// API Configuration
// On Vercel, use relative URLs since frontend and backend are on the same domain
// For local development, use the backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

export const API_ENDPOINTS = {
  // Jobs
  jobs: `${API_BASE_URL}/api/jobs`,
  jobById: (id: string) => `${API_BASE_URL}/api/jobs/${id}`,
  jobStatus: (id: string) => `${API_BASE_URL}/api/jobs/${id}/status`,
  
  // Applications
  applications: `${API_BASE_URL}/api/applications`,
  applicationById: (id: string) => `${API_BASE_URL}/api/applications/${id}`,
  topCandidates: (jobId: string) => `${API_BASE_URL}/api/applications/job/${jobId}/top`,
  
  // Health
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
