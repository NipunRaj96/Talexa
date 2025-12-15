
import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#f2f2f2] flex w-full items-center overflow-hidden text-black font-medium justify-between px-4 sm:px-6 lg:px-8 py-0.5 sm:py-1 rounded-full shadow-sm">
      <Link to="/" className="text-base sm:text-lg lg:text-xl tracking-[1px] font-semibold hover:opacity-80 transition-opacity py-0.5">
        TALEXA
      </Link>
      <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 py-0.5 sm:py-1">
        <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 text-sm sm:text-base tracking-[0.8px]">
          <Link to="/" className="hover:text-gray-600 transition-colors hidden sm:block">
            HOME
          </Link>
          <Link to="/dashboard" className="hover:text-gray-600 transition-colors">
            DASHBOARD
          </Link>
          <Link 
            to="/create-job" 
            className="hover:text-gray-600 transition-colors text-sm sm:text-base tracking-[0.8px]"
          > 
            CREATE JOB
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
