import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import "./Auth.css";
import "../Login/Login.css";

export type AuthMode = "login" | "register";

interface AuthProps {
  onNavigateToContent: () => void;
}

type Mode = "normal" | "email" | "password" | "error";

interface DollProps {
  color: string;
  size: string;
  eye: { x: number; y: number };
  mode: Mode;
  peek?: boolean;
  back?: boolean;
  front?: boolean;
  side?: boolean;
}

// Advanced spring configurations
const SPRING_CONFIG = {
  smooth: {
    type: "spring" as const,
    stiffness: 200,
    damping: 28,
    mass: 0.75,
  },
  gentle: {
    type: "spring" as const,
    stiffness: 140,
    damping: 32,
    mass: 1.1,
  },
  fluid: {
    type: "spring" as const,
    stiffness: 110,
    damping: 24,
    mass: 0.95,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 180,
    damping: 20,
    mass: 0.8,
  },
};


function Doll({ color, size, eye, mode, peek, back, front, side }: DollProps) {
  const turnAway = mode === "password" && !peek;
  const isPeek = peek && mode === "password";
  const isError = mode === "error";
  const [isSwitching, setIsSwitching] = useState(false);


  return (
    <div
      className={`doll ${color} ${size}
          ${turnAway ? "sleep" : ""}
          ${isPeek ? "peek" : ""}
          ${back ? "back" : ""}
          ${front ? "front" : ""}
          ${side ? "side" : ""}`}
      style={{
        '--eye-x': `${eye.x}px`,
        '--eye-y': `${eye.y}px`
      } as React.CSSProperties}
    >
      <div className="eyes">
        <span />
        <span />
      </div>
      <div className={`mouth ${isError ? "error" : ""}`} />
    </div>
  );
}

export default function Auth({ onNavigateToContent }: AuthProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const [dollMode, setDollMode] = useState<Mode>("normal");
  const [showPwd, setShowPwd] = useState(false);
  const [sceneEnter, setSceneEnter] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setSceneEnter(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Eye tracking
  useEffect(() => {
    const moveEyes = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      let dx = (e.clientX - centerX) / 80;
      let dy = (e.clientY - centerY) / 80;

      dx = Math.max(-8, Math.min(8, dx));
      dy = Math.max(-6, Math.min(6, dy));

      setEye({ x: dx, y: dy });
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };

    window.addEventListener("mousemove", moveEyes);
    return () => window.removeEventListener("mousemove", moveEyes);
  }, []);

  const toggleShowPwd = () => {
    setShowPwd((prev) => !prev);
    setTimeout(() => {
      if (loginPasswordRef.current) {
        loginPasswordRef.current.focus();
      }
    }, 0);
  };

  const validateRegister = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateRegister()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      window.history.pushState({}, "", "/");
      window.location.reload();
    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  // Background orbital drift
  const backgroundVariants = {
    login: {
      scale: 1,
      rotate: 0,
      opacity: 0.6,
    },
    register: {
      scale: 1.08,
      rotate: 5,
      opacity: 0.75,
    },
  } as const;

  // Card floating animation
  const cardFloatVariants: Variants = {
    float: {
      y: [0, -6, 0],
      rotateX: [0, 1, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Form field stagger variants
  const fieldVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ...SPRING_CONFIG.smooth,
        delay: i * 0.08,
      },
    }),
  } as Variants;

  // Parallax offset based on mouse position
  const parallaxX = (mousePos.x - 0.5) * 15;
  const parallaxY = (mousePos.y - 0.5) * 15;

  return (
    <div className={`auth-page ${authMode === "login" ? "mode-login" : "mode-register"}`}>
      {/* Multi-layer background with orbital drift */}
      <div className="brand-title">SpoonFeeder</div>
      <div className="brand-hero">
        Structured learning<br />
        Zero Distraction
      <span className="brand-subtitle">Learn what matters. Nothing else.</span>
        </div>
      <motion.div
        className="auth-background-layer"
        animate={backgroundVariants[authMode]}
        transition={SPRING_CONFIG.fluid}
      />

      {/* Secondary background layer for depth */}
      <motion.div
        className="auth-background-layer-secondary"
        animate={{
          scale: authMode === "register" ? 1.05 : 1,
          rotate: authMode === "register" ? -3 : 0,
        }}
        transition={SPRING_CONFIG.gentle}
      />

      {/* Enhanced center blend zone */}
      <motion.div
        className="auth-center-blend"
        animate={{
          opacity: authMode === "register" ? 0.7 : 0.6,
          scaleX: authMode === "register" ? 1.1 : 1,
        }}
        transition={SPRING_CONFIG.gentle}
      />

      {/* Visual Hero Panel - Moves right on register */}
      <motion.div
        className={`auth-visual-panel ${authMode === "login" ? "visual-left" : "visual-right"}`}
        animate={{
          x: parallaxX * 0.3,
          y: parallaxY * 0.3,
        }}
        transition={SPRING_CONFIG.fluid}
      >
        {/* Multi-layer parallax backgrounds */}
        <motion.div
          className="visual-layer visual-layer-1"
          animate={{
            x: authMode === "register" ? [0, 20, 0] : [0, -15, 0],
            y: authMode === "register" ? [0, 18, 0] : [0, -12, 0],
            scale: authMode === "register" ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="visual-layer visual-layer-2"
          animate={{
            x: authMode === "register" ? [0, -25, 0] : [0, 20, 0],
            y: authMode === "register" ? [0, -22, 0] : [0, 18, 0],
            scale: authMode === "register" ? [1, 1.08, 1] : 1,
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="visual-layer visual-layer-3"
          animate={{
            x: authMode === "register" ? [0, 15, 0] : [0, -18, 0],
            y: authMode === "register" ? [0, 25, 0] : [0, -20, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Ambient glow pulses */}
        <motion.div
          className="visual-glow-pulse"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="auth-visual-content">
          <motion.div
            className={`scene ${dollMode} ${sceneEnter ? "enter" : ""}`}
            animate={{
              y: authMode === "register" ? [0, -8, 0] : 0,
              rotateY: parallaxX * 0.5,
              rotateX: parallaxY * 0.3,
            }}
            transition={{
              y: {
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotateY: SPRING_CONFIG.gentle,
              rotateX: SPRING_CONFIG.gentle,
            }}
          >
            <Doll
              color="purple"
              size="tall"
              eye={eye}
              mode={dollMode}
              back
            />
            <Doll
              color="pink"
              size="medium"
              eye={eye}
              mode={dollMode}
            />
            <Doll
              color="orange"
              size="round"
              eye={eye}
              mode={dollMode}
              front
            />
            <Doll
              color="yellow"
              size="pill"
              eye={eye}
              mode={dollMode}
              side
            />
          </motion.div>

          {/* Enhanced orbs with independent motion */}
          <motion.div
            className="visual-orb orb-blue"
            animate={{
              y: authMode === "register" ? [-30, 30, -30] : [-18, 18, -18],
              x: authMode === "register" ? [0, 20, 0] : [0, -12, 0],
              scale: authMode === "register" ? [1, 1.2, 1] : [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="visual-orb orb-purple"
            animate={{
              y: authMode === "register" ? [30, -30, 30] : [18, -18, 18],
              x: authMode === "register" ? [0, 40, 0] : [0, -25, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="visual-orb orb-cyan"
            animate={{
              scale: authMode === "register" ? [1, 1.3, 1] : [1, 1.15, 1],
              opacity: authMode === "register" ? [0.7, 0.9, 0.7] : [0.6, 0.8, 0.6],
              rotate: [0, 180, 360],
            }}
            transition={{
              scale: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              },
              opacity: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />
        </div>
      </motion.div>

      {/* Auth Forms Panel - Moves left on register */}
      <motion.div
        className={`auth-forms-panel ${authMode === "login" ? "forms-right" : "forms-left"}`}
        animate={{
          x: parallaxX * -0.2,
          y: parallaxY * -0.2,
        }}
        transition={SPRING_CONFIG.smooth}
      >
        <div className="auth-forms-container">
          <AnimatePresence mode="wait" initial={false}>
            {authMode === "login" ? (
              <motion.div
                key="login"
                className="auth-form-wrapper"
                initial={{ opacity: 0, x: 60, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.96 }}
                transition={SPRING_CONFIG.smooth}
              >
                <motion.div
                  className="auth-card"
                  variants={cardFloatVariants}
                  animate="float"
                >
                  <div className="auth-header">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={SPRING_CONFIG.smooth}
                    >
                      Welcome back
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...SPRING_CONFIG.smooth, delay: 0.1 }}
                    >
                      Sign in to continue your learning journey
                    </motion.p>
                  </div>

                  <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onNavigateToContent(); }}>
                    <motion.div
                      className="form-group"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={0}
                    >
                      <label htmlFor="login-email">Email</label>
                      <input
                        type="email"
                        id="login-email"
                        placeholder="Enter your email"
                        onFocus={() => setDollMode("email")}
                        onBlur={() => setDollMode("normal")}
                        required
                      />
                    </motion.div>

                    <motion.div
                      className="form-group"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={1}
                    >
                      <label htmlFor="login-password">Password</label>
                      <div className="password-wrapper">
                        <input
                          ref={loginPasswordRef}
                          type={showPwd ? "text" : "password"}
                          id="login-password"
                          placeholder="Enter your password"
                          onFocus={() => setDollMode("password")}
                          onBlur={() => setDollMode("normal")}
                          required
                        />
                        <span
                          className="show-pwd"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleShowPwd();
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {showPwd ? "Hide" : "Show"}
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      className="forgot-password"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={2}
                    >
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        Forgot password?
                      </a>
                    </motion.div>

                    <motion.button
                      type="submit"
                      className="auth-button primary"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={3}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98, y: 0 }}
                    >
                      Sign in
                    </motion.button>

                    <motion.div
                      className="auth-switch"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={4}
                    >
                      <span>New to Spoonfeeder? </span>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => {
                          setAuthMode("register");
                          setShowPwd(false);
                          setError("");
                        }}
                      >
                        Create account
                      </button>
                    </motion.div>
                  </form>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                className="auth-form-wrapper"
                initial={{ opacity: 0, x: -60, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.96 }}
                transition={SPRING_CONFIG.smooth}
              >
                <motion.div
                  className="auth-card"
                  variants={cardFloatVariants}
                  animate="float"
                >
                  <div className="auth-header">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={SPRING_CONFIG.smooth}
                    >
                      Create Account
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...SPRING_CONFIG.smooth, delay: 0.1 }}
                    >
                      Sign up to get started with SpoonFeeder
                    </motion.p>
                  </div>

                  <form className="auth-form" onSubmit={handleRegisterSubmit}>
                    <motion.div
                      className="form-group"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={0}
                    >
                      <label htmlFor="register-email">Email</label>
                      <input
                        type="email"
                        id="register-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        autoComplete="email"
                      />
                    </motion.div>

                    <motion.div
                      className="form-group"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={1}
                    >
                      <label htmlFor="register-password">Password</label>
                      <input
                        type="password"
                        id="register-password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        autoComplete="new-password"
                      />
                    </motion.div>

                    <motion.div
                      className="form-group"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={2}
                    >
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input
                        ref={passwordInputRef}
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        autoComplete="new-password"
                      />
                    </motion.div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          className="error-message"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={SPRING_CONFIG.bouncy}
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      className="auth-button primary"
                      disabled={isLoading}
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={3}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98, y: 0 }}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </motion.button>

                    <motion.div
                      className="auth-switch"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      custom={4}
                    >
                      <span>Already have an account? </span>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => {
                          setAuthMode("login");
                          setError("");
                        }}
                      >
                        Sign in
                      </button>
                    </motion.div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
