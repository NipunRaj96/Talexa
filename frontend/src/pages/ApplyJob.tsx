import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Toaster, toast } from "sonner";
import { useJob } from "@/hooks/useJobs";
import { useApplications } from "@/hooks/useApplications";

const ApplyJob: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();

  // Form state
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Fetch job details
  const { data: job, isLoading: loading, error: jobError } = useJob(jobId || "");
  const { submitApplication, isSubmitting } = useApplications();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or DOCX file');
        return;
      }

      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setResumeFile(file);
      toast.success('Resume uploaded successfully!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicantName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!applicantEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    if (!jobId) return;

    try {
      await submitApplication({
        jobId,
        applicantName,
        applicantEmail,
        resumeFile,
      });

      toast.success('Application submitted successfully! Our AI will analyze your resume.');
      // Reset form
      setApplicantName('');
      setApplicantEmail('');
      setCoverLetter('');
      setResumeFile(null);
      // Reset file input
      const fileInput = document.getElementById('resume-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const error = jobError ? "Job not found" : null;

  if (loading) {
    return (
      <div className="bg-white flex flex-col items-center min-h-screen">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 flex flex-col items-center">
          <Navbar />
          <div className="container mx-auto py-8 sm:py-12 lg:py-16 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading job details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col items-center min-h-screen">
      <Toaster position="top-center" />
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 flex flex-col items-center">
        <Navbar />
        <div className="container mx-auto py-8 sm:py-12 lg:py-16">
          {error ? (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">{error}</h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  {error.includes("not found")
                    ? "This job posting may have been removed or the link is incorrect."
                    : "Please try again or contact support if the problem persists."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Return to Home
                    </Button>
                  </Link>
                  <Button
                    variant="gradient"
                    className="w-full sm:w-auto"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          ) : job ? (
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-white">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{job.job_title}</h1>
                  <p className="opacity-90">Apply for this position</p>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Experience Required</h3>
                      <p className="mt-1 text-lg">{job.minimum_experience}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Number of Vacancies</h3>
                      <p className="mt-1 text-lg">{job.number_of_vacancies}</p>
                    </div>
                  </div>

                  {job.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Job Description</h3>
                      <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 sm:p-6 -mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8 mt-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4">Submit Your Application</h3>
                    <p className="text-gray-600 mb-6 text-sm sm:text-base">
                      Upload your resume and our AI will analyze your skills and experience to match you with this position.
                    </p>

                    {job.status === "active" ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              type="text"
                              value={applicantName}
                              onChange={(e) => setApplicantName(e.target.value)}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={applicantEmail}
                              onChange={(e) => setApplicantEmail(e.target.value)}
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="resume-file">Resume *</Label>
                          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative cursor-pointer">
                            {resumeFile ? (
                              <div className="text-green-600">
                                <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="font-medium">{resumeFile.name}</p>
                                <p className="text-sm text-gray-500 mt-1">File uploaded successfully</p>
                              </div>
                            ) : (
                              <div>
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="text-gray-500 mb-2">Click to upload your resume</p>
                                <p className="text-xs text-gray-400">PDF, DOCX, DOC, TXT (Max 5MB)</p>
                              </div>
                            )}
                            <input
                              id="resume-file"
                              type="file"
                              accept=".pdf,.docx,.doc,.txt"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="cover-letter">Cover Letter / Message (Optional)</Label>
                          <textarea
                            id="cover-letter"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Tell us about your motivation, relevant experience, or anything else you'd like to share..."
                            rows={6}
                            className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                          />
                          <p className="text-xs text-gray-400 mt-1">Share your motivation, relevant projects, or why you're interested in this position</p>
                        </div>

                        <Button
                          type="submit"
                          variant="gradient"
                          className="w-full"
                          size="lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      </form>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-yellow-700">
                          This job posting is no longer accepting applications.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ApplyJob;
