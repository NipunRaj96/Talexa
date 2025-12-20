// API Configuration
// On Vercel, use relative URLs since frontend and backend are on the same domain
// For local development, use the backend URL
// IMPORTANT: VITE_API_URL should NOT include /api prefix - it's added in the endpoints
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Remove trailing /api if present (handles case where VITE_API_URL is set to "/api" in Vercel)
    return envUrl.replace(/\/api\/?$/, '');
  }
  // In production (Vercel), use empty string for relative URLs
  // In development, use localhost:8000
  return import.meta.env.PROD ? '' : 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

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
