
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Button } from "../components/ui/button";
import { Eye, Share, Edit, Trash2, Users, TrendingUp } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useJobs } from "@/hooks/useJobs";
import { useApplications } from "@/hooks/useApplications";

const Dashboard: React.FC = () => {
  const { jobs, isLoading: loading, updateJob, deleteJob, updateStatus } = useJobs();
  const { applications } = useApplications();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [selectedJobApplications, setSelectedJobApplications] = useState<string | null>(null);

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      await deleteJob(jobId);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: "active" | "closed") => {
    await updateStatus({ id: jobId, status: newStatus });
  };

  const handleShareJob = (jobId: string) => {
    setShowShareModal(jobId);
  };

  const getShareableLink = (jobId: string) => {
    return `${window.location.origin}/apply/${jobId}`;
  };

  const handleCopyLink = (jobId: string) => {
    navigator.clipboard.writeText(getShareableLink(jobId));
    toast("Link copied to clipboard!");
  };

  const handleShare = async (jobId: string, jobTitle: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Job Application: ${jobTitle}`,
          text: `Apply for the ${jobTitle} position through this link:`,
          url: getShareableLink(jobId)
        });
        setShowShareModal(null);
        toast("Link shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      handleCopyLink(jobId);
    }
  };

  const getJobApplications = (jobId: string) => {
    return applications.filter(app => app.job_id === jobId);
  };

  const viewApplications = (jobId: string) => {
    setSelectedJobApplications(jobId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-16">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toaster position="top-center" />
      <div className="container mx-auto py-16">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-black text-[40px] font-medium tracking-[2px] max-md:text-[30px]">
            Dashboard
          </h1>
          <Link to="/create-job">
            <Button variant="gradient" size="talexa">
              CREATE NEW JOB
            </Button>
          </Link>
        </div>

        <div className="bg-[rgba(233,233,233,0.5)] rounded-[20px] p-8 shadow-sm">
          <h2 className="text-[28px] font-medium tracking-[1.4px] mb-6">Your Job Postings</h2>

          {jobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-[rgba(233,233,233,0.8)]">
                  <tr>
                    <th className="text-left p-4 font-medium">Job Title</th>
                    <th className="text-left p-4 font-medium">Experience</th>
                    <th className="text-left p-4 font-medium">Vacancies</th>
                    <th className="text-left p-4 font-medium">Applications</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const jobApplications = getJobApplications(job.id);
                    return (
                      <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{job.job_title}</div>
                          <div className="text-sm text-gray-500 flex flex-wrap gap-1">
                            {job.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="text-xs">+{job.skills.length - 3} more</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{job.minimum_experience}</td>
                        <td className="p-4">{job.number_of_vacancies}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{jobApplications.length}</span>
                            {jobApplications.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewApplications(job.id)}
                                className="text-xs"
                              >
                                View
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-sm ${job.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                              }`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                            <button
                              className="ml-2 text-xs text-blue-600 hover:underline"
                              onClick={() => handleStatusChange(
                                job.id,
                                job.status === 'active' ? 'closed' : 'active'
                              )}
                            >
                              {job.status === 'active' ? 'Close' : 'Reopen'}
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          {new Date(job.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              title="Share"
                              onClick={() => handleShareJob(job.id)}
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="View Applications"
                              onClick={() => viewApplications(job.id)}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Edit"
                              onClick={() => navigate(`/edit-job/${job.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Delete"
                              className="hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 mb-6">You haven't created any job postings yet.</p>
              <Link to="/create-job">
                <Button variant="gradient" size="talexa">
                  CREATE YOUR FIRST JOB
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Applications Modal */}
        {selectedJobApplications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Applications & AI Rankings</h3>
                  <button
                    onClick={() => setSelectedJobApplications(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {getJobApplications(selectedJobApplications).length > 0 ? (
                  <div className="space-y-4">
                    {getJobApplications(selectedJobApplications)
                      .sort((a, b) => b.match_score - a.match_score)
                      .map((application, index) => (
                        <div key={application.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                {application.applicant_name}
                                {index === 0 && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    Top Match
                                  </span>
                                )}
                              </h4>
                              <p className="text-gray-600">{application.applicant_email}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                <span className={`font-bold text-lg ${application.match_score >= 0.8 ? 'text-green-600' :
                                  application.match_score >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                  {Math.round(application.match_score * 100)}% Match
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {application.experience_years} years exp
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <h5 className="font-medium text-sm text-gray-700 mb-1">Skills Found:</h5>
                              <div className="flex flex-wrap gap-1">
                                {application.skills_extracted.map((skill, idx) => (
                                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium text-sm text-gray-700 mb-1">Education:</h5>
                              <p className="text-sm">{application.education_level}</p>
                            </div>
                          </div>

                          {application.analysis_result?.analysis_summary && (
                            <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                              <h5 className="font-medium text-sm text-gray-700 mb-1">AI Analysis:</h5>
                              <p className="text-sm text-gray-600">
                                {application.analysis_result.analysis_summary}
                              </p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mt-2">
                            Applied: {new Date(application.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No applications received yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Share Job Posting</h3>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 mb-6">
                <p className="text-sm text-gray-700 truncate">{getShareableLink(showShareModal)}</p>
                <button
                  onClick={() => handleCopyLink(showShareModal)}
                  className="ml-2 p-2 text-blue-600 hover:text-blue-800"
                  title="Copy link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => setShowShareModal(null)}
                  variant="outline"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const job = jobs.find(j => j.id === showShareModal);
                    if (job) handleShare(showShareModal, job.job_title);
                  }}
                  variant="gradient"
                  className="flex items-center gap-2"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
