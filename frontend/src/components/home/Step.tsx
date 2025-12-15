
import React from "react";

interface StepProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

const Step: React.FC<StepProps> = ({ icon, title, description, className = "" }) => {
  return (
    <div className={`bg-white flex flex-col overflow-hidden text-black pt-8 pb-[75px] px-[30px] rounded-[30px] shadow-sm hover:shadow-md transition-all ${className}`}>
      <img
        src={icon}
        alt={`${title} icon`}
        className="aspect-[1] object-contain w-[55px]"
      />
      <h3 className="text-[24px] font-medium tracking-[1.2px] mt-[25px] max-md:ml-0">
        {title}
      </h3>
      <p className="text-lg font-normal tracking-[0.9px] text-gray-700 mt-3 max-md:ml-0">
        {description}
      </p>
    </div>
  );
};

export default Step;
