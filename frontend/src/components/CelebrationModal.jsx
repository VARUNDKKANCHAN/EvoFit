import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Star, Crown, Sparkles, X } from 'lucide-react';

export default function CelebrationModal({ isOpen, onClose, type = 'level_up', data }) {
  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const configs = {
    level_up: {
      icon: <Star className="text-amber-400" size={48} />,
      title: "Level Up!",
      subtitle: `You reached Level ${data?.level || 1}`,
      color: "from-amber-500 to-yellow-300",
      bg: "bg-amber-500/10"
    },
    achievement: {
      icon: <Trophy className="text-evofit-purple-main" size={48} />,
      title: "Achievement Unlocked",
      subtitle: data?.badge_name || "New Milestone",
      color: "from-evofit-purple-main to-evofit-purple-light",
      bg: "bg-evofit-purple-main/10"
    }
  };

  const config = configs[type] || configs.level_up;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-evofit-bg-primary/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative w-full max-w-sm bg-evofit-bg-card border border-evofit-border rounded-3xl p-8 text-center shadow-2xl overflow-hidden"
          >
            {/* Glow Effect */}
            <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] opacity-20 bg-gradient-to-br ${config.color}`} />
            <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 bg-gradient-to-br ${config.color}`} />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-evofit-bg-secondary text-evofit-text-muted transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
              <motion.div 
                initial={{ rotate: -10, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-lg border border-white/10 bg-gradient-to-br ${config.color}`}
              >
                {React.cloneElement(config.icon, { className: "text-white", size: 48 })}
              </motion.div>

              <h2 className="text-3xl font-black text-evofit-text-primary mb-2 tracking-tight">
                {config.title}
              </h2>
              <p className="text-lg font-bold text-evofit-purple-main mb-6">
                {config.subtitle}
              </p>

              <div className="bg-evofit-bg-secondary rounded-2xl p-4 mb-8 border border-evofit-border">
                <p className="text-sm text-evofit-text-secondary leading-relaxed">
                  {type === 'level_up' 
                    ? "Your consistency is paying off. Keep pushing to unlock more features and rewards!"
                    : data?.description || "You've earned a new badge for your collection."}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-evofit-purple-main to-evofit-purple-light"
              >
                Awesome!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
