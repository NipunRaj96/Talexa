// React Query hooks for Jobs API
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobsApi, type Job, type CreateJobData } from '@/lib/api';
import { toast } from 'sonner';

export const useJobs = () => {
  const queryClient = useQueryClient();

  // Get all jobs
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.getAll(),
  });

  // Create job mutation
  const createJob = useMutation({
    mutationFn: (data: CreateJobData) => jobsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully!');
      return data; // Return the created job data
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create job');
    },
  });

  // Update job mutation
  const updateJob = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobData> }) =>
      jobsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update job');
    },
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'closed' }) =>
      jobsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job status updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  // Delete job mutation
  const deleteJob = useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete job');
    },
  });

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    isLoading,
    error,
    createJob: createJob.mutateAsync,
    updateJob: updateJob.mutateAsync,
    updateStatus: updateStatus.mutateAsync,
    deleteJob: deleteJob.mutateAsync,
  };
};

// Hook for single job
export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });
};
