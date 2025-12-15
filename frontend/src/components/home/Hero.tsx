import React from "react";
import { Link } from "react-router-dom";

const Hero: React.FC = () => {
  return (
    <section className="flex flex-col items-center py-16 sm:py-20 lg:py-28 px-4 sm:px-8 lg:px-12 relative">
      <h1 className="text-black text-3xl sm:text-4xl lg:text-[48px] font-medium tracking-[1.2px] text-center max-w-[340px] sm:max-w-[600px] lg:max-w-[800px] leading-tight sm:leading-tight mb-2 sm:mb-4">
        Hiring the right talent is Hard.
        <br className="hidden sm:block" />
        Filtering resumes shouldn't be.
      </h1>
      
      <Link
        to="/create-job"
        className="mt-8 sm:mt-10 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-black font-medium tracking-[0.8px] bg-transparent border-2 border-black hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center text-base sm:text-lg shadow-sm hover:shadow-md"
      >
        CREATE A JOB POSTING
      </Link>
    </section>
  );
};

export default Hero;