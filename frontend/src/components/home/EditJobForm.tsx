
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useNavigate } from "react-router-dom";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

interface JobData {
  id: string;
  jobTitle: string;
  minimumExperience: string;
  description: string;
  numberOfVacancies: string;
  skills: string[];
  createdAt: string;
  status: "active" | "closed";
  applicants: number;
}

interface EditJobFormProps {
  jobId: string;
}

const EditJobForm: React.FC<EditJobFormProps> = ({ jobId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<JobData>({
    id: "",
    jobTitle: "",
    minimumExperience: "",
    description: "",
    numberOfVacancies: "",
    skills: [],
    createdAt: "",
    status: "active",
    applicants: 0,
  });
  
  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load job data on component mount
  useEffect(() => {
    const storedJobs = localStorage.getItem("jobPostings");
    if (storedJobs) {
      const jobs = JSON.parse(storedJobs);
      const job = jobs.find((j: JobData) => j.id === jobId);
      if (job) {
        setFormData(job);
        setIsLoading(false);
      } else {
        toast.error("Job not found");
        navigate("/dashboard");
      }
    } else {
      toast.error("No job postings found");
      navigate("/dashboard");
    }
  }, [jobId, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleExperienceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      minimumExperience: value
    }));
  };
  
  const handleAddSkill = () => {
    if (skillInput.trim() !== "" && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  const handleStatusChange = (value: "active" | "closed") => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get all jobs from localStorage
      const storedJobs = localStorage.getItem("jobPostings");
      if (storedJobs) {
        const jobs = JSON.parse(storedJobs);
        // Find the job index
        const jobIndex = jobs.findIndex((j: JobData) => j.id === jobId);
        if (jobIndex !== -1) {
          // Update job data
          jobs[jobIndex] = formData;
          // Save back to localStorage
          localStorage.setItem("jobPostings", JSON.stringify(jobs));
          
          toast("Job posting updated successfully!");
          
          // Navigate back to dashboard
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error updating job posting:", error);
      toast("Failed to update job posting", {
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <div className="flex justify-center items-center h-40">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="text-base">Job Title</Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="e.g. Frontend Developer"
            className="rounded-lg p-3 text-base"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minimumExperience" className="text-base">Minimum Experience Required</Label>
          <Select 
            value={formData.minimumExperience} 
            onValueChange={handleExperienceChange}
          >
            <SelectTrigger className="rounded-lg p-3 text-base">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No experience required">No experience required</SelectItem>
              <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
              <SelectItem value="1+ years">1+ years</SelectItem>
              <SelectItem value="2+ years">2+ years</SelectItem>
              <SelectItem value="3+ years">3+ years</SelectItem>
              <SelectItem value="5+ years">5+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="numberOfVacancies" className="text-base">Number of Vacancies</Label>
          <Input
            id="numberOfVacancies"
            name="numberOfVacancies"
            value={formData.numberOfVacancies}
            onChange={handleChange}
            placeholder="e.g. 3"
            className="rounded-lg p-3 text-base"
            required
            type="number"
            min="1"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status" className="text-base">Job Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={handleStatusChange as (value: string) => void}
          >
            <SelectTrigger className="rounded-lg p-3 text-base">
              <SelectValue placeholder="Select job status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">Job Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the role and responsibilities"
            className="rounded-lg p-3 text-base min-h-[120px]"
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="skills" className="text-base">Skills</Label>
          <div className="flex gap-2">
            <Input
              id="skills"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. React, TypeScript"
              className="rounded-lg p-3 text-base"
            />
            <Button 
              type="button" 
              onClick={handleAddSkill}
              variant="outline"
            >
              Add
            </Button>
          </div>
          
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="bg-[#f2f2f2] px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span>{skill}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-sm hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-between gap-4 mt-6">
          <Button 
            type="button"
            variant="outline"
            size="talexa"
            onClick={() => navigate("/dashboard")}
          >
            CANCEL
          </Button>
          <Button 
            type="submit" 
            variant="gradient"
            size="talexa"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "UPDATING..." : "UPDATE JOB POSTING"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditJobForm;
