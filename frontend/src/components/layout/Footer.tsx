import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-7xl pb-6 pt-10 sm:pt-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-6 sm:gap-8">
        <div className="text-center sm:text-left">
          <div className="text-xl sm:text-2xl font-medium tracking-wider mb-2">
            TALEXA
          </div>
          <div className="text-sm sm:text-base text-gray-600">
            Because CGPA Isn't Everything.
          </div>
        </div>
        
        <div className="flex gap-6 sm:gap-8 items-center justify-center">
          <a 
            href="https://www.linkedin.com/in/nipunkumar01/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-70 transition-opacity p-2"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12.51 8.796v1.697a3.738 3.738 0 0 1 3.288-1.684c3.455 0 4.202 2.16 4.202 4.97V19.5h-3.2v-5.072c0-1.21-.244-2.766-2.128-2.766-1.827 0-2.139 1.317-2.139 2.676V19.5h-3.19V8.796h3.168ZM7.2 6.106a1.61 1.61 0 0 1-.988 1.483 1.595 1.595 0 0 1-1.743-.348A1.607 1.607 0 0 1 5.6 4.5a1.601 1.601 0 0 1 1.6 1.606Z" clipRule="evenodd"/>
              <path d="M7.2 8.809H4V19.5h3.2V8.809Z"/>
            </svg>
          </a>
          <a 
            href="https://github.com/NipunRaj96" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-70 transition-opacity p-2"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clipRule="evenodd"/>
            </svg>
          </a>
          <a 
            href="https://nipun.framer.website/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-70 transition-opacity p-2"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z" clipRule="evenodd"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-center text-gray-500">
        © 2025 Talexa. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;