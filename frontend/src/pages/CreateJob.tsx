
import React from "react";
import Layout from "../components/layout/Layout";
import CreateJobForm from "../components/home/CreateJobForm";
import { Toaster } from "sonner";

const CreateJob: React.FC = () => {
  return (
    <Layout>
      <Toaster position="top-center" />
      <div className="container mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl font-medium tracking-wider text-center mb-8 sm:mb-12 px-4">
          Create a New Job Posting
        </h1>
        <div className="max-w-2xl mx-auto">
          <CreateJobForm />
        </div>
      </div>
    </Layout>
  );
};

export default CreateJob;
