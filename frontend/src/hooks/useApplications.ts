// React Query hooks for Applications API
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, type Application } from '@/lib/api';
import { toast } from 'sonner';

export const useApplications = (jobId?: string) => {
  const queryClient = useQueryClient();

  // Get applications for a job or all applications
  const { data, isLoading, error } = useQuery({
    queryKey: jobId ? ['applications', jobId] : ['applications'],
    queryFn: async () => {
      if (!jobId || jobId.trim() === '') {
        // Fetch ALL applications without job_id filter
        return applicationsApi.getAll();
      }
      return applicationsApi.getByJob(jobId);
    },
  });

  // Submit application mutation
  const submitApplication = useMutation({
    mutationFn: ({
      jobId,
      applicantName,
      applicantEmail,
      resumeFile,
    }: {
      jobId: string;
      applicantName: string;
      applicantEmail: string;
      resumeFile: File;
    }) => applicationsApi.submit(jobId, applicantName, applicantEmail, resumeFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application submitted successfully! Our AI is analyzing your resume...');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });

  return {
    applications: data?.applications || [],
    total: data?.total || 0,
    isLoading,
    error,
    submitApplication: submitApplication.mutateAsync,
    isSubmitting: submitApplication.isPending,
  };
};

// Hook for top candidates
export const useTopCandidates = (jobId: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['topCandidates', jobId, limit],
    queryFn: () => applicationsApi.getTopCandidates(jobId, limit),
    enabled: !!jobId,
  });
};

// Hook for single application
export const useApplication = (id: string) => {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getById(id),
    enabled: !!id,
  });
};
