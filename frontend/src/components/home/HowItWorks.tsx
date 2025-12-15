import React from "react";
import { Button } from "../ui/button";

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ number, title, description }) => {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm h-full flex flex-col">
      <div className="bg-[#f2f2f2] w-10 h-10 rounded-full flex items-center justify-center mb-5">
        <span className="text-base font-medium">{number}</span>
      </div>
      <h3 className="text-xl sm:text-2xl font-medium mb-3">{title}</h3>
      <p className="text-gray-700 text-base leading-relaxed">{description}</p>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  return (
    <section className="bg-[#f2f2f2] w-full py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-normal mb-4 px-4 leading-relaxed sm:leading-normal">
            Talexa highlights talent beyond the numbers.
            <br className="hidden sm:block" />
            <span className="block sm:inline"> Smarter shortlisting, without the bias.</span>
          </h2>
          
          <div className="w-0.5 h-12 sm:h-16 bg-gray-300 mx-auto my-6"></div>
          
          <Button 
            className="bg-white text-black rounded-full px-8 sm:px-10 py-3 text-lg sm:text-xl font-medium hover:bg-white cursor-default"
          >
            HOW IT WORKS
          </Button>
        </div>
        
        <div className="flex flex-col relative">
          {/* Center connecting line - hidden on mobile */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 -translate-x-1/2 z-0 hidden md:block"></div>
          
          {/* Mobile layout */}
          <div className="md:hidden space-y-8">
            <Step 
              number={1}
              title="Create A Job Posting"
              description="Define your requirements and the skills you're looking for in candidates."
            />
            <Step 
              number={2}
              title="Candidates Apply"
              description="Share your unique job link and collect applications with resumes."
            />
            <Step 
              number={3}
              title="AI Magic !!"
              description="Our AI scores and ranks candidates based on their skills and experience match to your requirements."
            />
            <Step 
              number={4}
              title="Review Top Matches"
              description="Get instant access to the best-matched candidates and make data-driven hiring decisions."
            />
          </div>
          
          {/* Desktop layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* Left side */}
            <div className="space-y-32">
              <div className="relative z-10">
                <div className="flex justify-end">
                  <div className="w-full max-w-md">
                    <Step 
                      number={1}
                      title="Create A Job Posting"
                      description="Define your requirements and the skills you're looking for in candidates."
                    />
                  </div>
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-end">
                  <div className="w-full max-w-md">
                    <Step 
                      number={3}
                      title="AI Magic !!"
                      description="Our AI scores and ranks candidates based on their skills and experience match to your requirements."
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side */}
            <div className="space-y-32 md:mt-32">
              <div className="relative z-10">
                <div className="flex justify-start">
                  <div className="w-full max-w-md">
                    <Step 
                      number={2}
                      title="Candidates Apply"
                      description="Share your unique job link and collect applications with resumes."
                    />
                  </div>
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-start">
                  <div className="w-full max-w-md">
                    <Step 
                      number={4}
                      title="Review Top Matches"
                      description="Get instant access to the best-matched candidates and make data-driven hiring decisions."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;