import React from 'react';

/**
 * SuccessToast Component
 * A premium, SaaS-style success notification.
 * 
 * @param {string} title - The main success message
 * @param {string} subtitle - Optional secondary message
 * @param {function} closeToast - Function to close the toast (provided by react-toastify)
 */
const SuccessToast = ({ title, subtitle, closeToast }) => {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] min-w-[320px] pointer-events-auto group animate-toast-slide-in">
      {/* Success Icon: Green circle with white checkmark */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center shadow-sm">
        <svg 
          width="14" 
          height="10" 
          viewBox="0 0 14 10" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M1.5 5L5.5 9L12.5 1.5" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Message Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-medium text-[#0F172A] m-0 leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12px] text-[#64748B] m-0 mt-1 leading-normal font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {/* Minimal Close Button */}
      <button 
        onClick={closeToast}
        className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-all duration-200 opacity-60 hover:opacity-100 flex items-center justify-center"
        aria-label="Close notification"
      >
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#64748B" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default SuccessToast;
