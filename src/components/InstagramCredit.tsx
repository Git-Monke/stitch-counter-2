import React, { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { X, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const InstagramCredit: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisitedBefore = localStorage.getItem('loop-log-visited');
    
    if (hasVisitedBefore) {
      // They've visited before - don't show the badge
      setShouldShow(false);
      return;
    }
    
    // First time visitor - show the badge after 500ms delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // Mark that they've now seen the badge
    localStorage.setItem('loop-log-visited', 'true');
    
    setIsVisible(false);
    // After exit animation completes, remove from DOM
    setTimeout(() => setShouldShow(false), 300);
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.3,
            }}
          >
            <Badge
              variant="outline"
              className="flex items-center gap-2 pr-1 py-2 text-sm shadow-lg hover:shadow-xl transition-shadow duration-200 border bg-card text-foreground"
            >
              <span className="flex items-center gap-1">
                Hope you enjoy
                <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
              </span>
              <a
                href="https://instagram.com/TheCrochetGinger"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-foreground/80 font-medium underline decoration-dotted underline-offset-2"
              >
                @TheCrochetGinger
              </a>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-foreground/10 text-foreground/80 hover:text-foreground"
                onClick={handleClose}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
