import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MetricTooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative flex items-center group cursor-help inline-flex" 
         onMouseEnter={() => setIsVisible(true)} 
         onMouseLeave={() => setIsVisible(false)}>
      {children}
      <div className="ml-1.5 opacity-40 group-hover:opacity-100 transition-opacity text-evofit-text-muted">
        <Info size={13} />
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-[#0F172A] dark:bg-[#1E293B] text-white text-[11px] font-medium leading-relaxed rounded-xl shadow-2xl pointer-events-none text-center border border-white/10"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0F172A] dark:border-t-[#1E293B]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetricTooltip;
