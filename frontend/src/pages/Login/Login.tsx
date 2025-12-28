import { useEffect, useState, useRef } from "react";
import "./Login.css";

// Custom SVG Icons
const InstagramIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      fill="currentColor"
    />
  </svg>
);

const EmailIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      fill="currentColor"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      fill="currentColor"
    />
  </svg>
);

type Mode = "normal" | "email" | "password" | "error";

const dollsOrder = ["purple", "yellow", "pink", "orange"];

interface LoginProps {
  onNavigateToRegister: () => void;
}

export default function Login({ onNavigateToRegister }: LoginProps) {
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<Mode>("normal");
  const [peekDoll, setPeekDoll] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [enter, setEnter] = useState(false);
  const [fade, setFade] = useState(false);

  const peekTimeout = useRef<number | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setEnter(true), 100);
    const t2 = setTimeout(() => setFade(true), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const moveEyes = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      let dx = (e.clientX - centerX) / 80;
      let dy = (e.clientY - centerY) / 80;

      dx = Math.max(-8, Math.min(8, dx));
      dy = Math.max(-6, Math.min(6, dy));

      setEye({ x: dx, y: dy });
    };

    window.addEventListener("mousemove", moveEyes);
    return () => window.removeEventListener("mousemove", moveEyes);
  }, []);

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Eyes stay closed while password field is focused, regardless of typing
    setMode("password");
    setPeekDoll(null); // Clear any peek state when password field is focused
  };

  const toggleShowPwd = () => {
    setShowPwd(prev => {
      const next = !prev;
      if (!next) {
        // If hiding password, make sure eyes stay closed
        setMode("password");
        setPeekDoll(null);
      }

      // Refocus the password input after toggling to maintain focus
      setTimeout(() => {
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
      }, 0);

      return next;
    });
  };

  return (
    <div className="login-page">
      <div className={`brand ${fade ? "fade-in" : ""}`}>
        <div className="brand-title">Spoonfeeder</div>
        <div className="brand-hero">
          Structured learning<br />
          Zero Distraction
          <span className="brand-subtitle">Learn what matters. Nothing else.</span>
        </div>
      </div>

      <div className="left-panel">
        <div className={`scene ${mode} ${enter ? "enter" : ""}`}>
          <Doll color="purple" size="tall" eye={eye} mode={mode} peek={peekDoll === "purple"} back />
          <Doll color="pink" size="medium" eye={eye} mode={mode} peek={peekDoll === "pink"} />
          <Doll color="orange" size="round" eye={eye} mode={mode} peek={peekDoll === "orange"} front />
          <Doll color="yellow" size="pill" eye={eye} mode={mode} peek={peekDoll === "yellow"} side />
        </div>
      </div>

      <div className={`right-panel ${fade ? "fade-in" : ""}`}>
        <div className="login-card">
          <h2 className={fade ? "fade-in" : ""} style={{ animationDelay: "0.3s" }}>Welcome back</h2>
          <p className="subtitle" style={{ animationDelay: "0.4s" }}>Sign in to continue your learning journey</p>

          <input
            type="email"
            placeholder="Email"
            onFocus={() => setMode("email")}
            onBlur={() => setMode("normal")}
            className={fade ? "fade-in" : ""}
            style={{ animationDelay: "0.5s" }}
          />

          <div className="password-wrapper fade-in" style={{ animationDelay: "0.6s" }}>
            <input
              ref={passwordInputRef}
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              onFocus={() => {
                setMode("password");
                setPeekDoll(null);
              }}
              onBlur={() => setMode("normal")}
              onChange={handlePwdChange}
            />
            <span
              className="show-pwd"
              onClick={(e) => {
                e.preventDefault(); // Prevent any default focus behavior
                toggleShowPwd();
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent focus loss on mousedown
            >
              {showPwd ? "Hide" : "Show"}
            </span>
          </div>

          <div className={`forgot fade-in`} style={{ animationDelay: "0.7s" }}>Forgot password?</div>

          <button className="fade-in" style={{ animationDelay: "0.8s" }} onClick={() => setMode("error")}>
            Sign in
          </button>

          <div className="signup fade-in" style={{ animationDelay: "0.9s" }}>
            New to Spoonfeeder? <span onClick={onNavigateToRegister}>Create account</span>
          </div>

          <div className="contact-section fade-in" style={{ animationDelay: "1s" }}>
            <div className="contact-label">Contact us</div>
            <div className="contact-icons">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-icon"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="mailto:support@spoonfeeder.com"
                className="contact-icon"
                aria-label="Email"
              >
                <EmailIcon />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-icon"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

function Doll({ color, size, eye, mode, peek, back, front, side }: DollProps) {
  const turnAway = mode === "password" && !peek;
  const isPeek = peek && mode === "password";
  const isError = mode === "error";

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
