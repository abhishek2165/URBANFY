import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SplashScreen.css";

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1); // 1=logo, 2=text, 3=loading, 4=exit

  useEffect(() => {
    // Phase timings
    const phase2Timer = setTimeout(() => setPhase(2), 600);
    const phase3Timer = setTimeout(() => setPhase(3), 1200);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    // Finish splash screen
    const finishTimer = setTimeout(() => {
      setPhase(4);
      setTimeout(() => {
        onFinish();
      }, 500);
    }, 3500);

    return () => {
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
      clearTimeout(finishTimer);
      clearInterval(progressInterval);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase !== 4 ? (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Particles */}
          <div className="splash-particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          {/* Glow Effect */}
          <div className="splash-glow"></div>

          {/* Main Content */}
          <div className="splash-content">
            {/* Perfume Bottle Icon */}
            <motion.div
              className="splash-icon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <div className="perfume-bottle">
                <div className="bottle-cap"></div>
                <div className="bottle-neck"></div>
                <div className="bottle-body">
                  <div className="bottle-liquid"></div>
                  <div className="bottle-shine"></div>
                </div>
              </div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              className="splash-brand"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="splash-title">
                {"URBANFY".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    className="splash-letter"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.08 }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                className="splash-tagline"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 2 ? 1 : 0 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                Premium Fragrance Store
              </motion.p>
            </motion.div>

            {/* Loading Bar */}
            <motion.div
              className="splash-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="loader-track">
                <motion.div
                  className="loader-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="loader-text">
                <span className="loader-status">
                  {progress < 30
                    ? "Loading fragrances..."
                    : progress < 60
                      ? "Preparing your experience..."
                      : progress < 90
                        ? "Almost ready..."
                        : "Welcome!"}
                </span>
                <span className="loader-percent">{progress}%</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Decorative Line */}
          <motion.div
            className="splash-bottom-line"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
