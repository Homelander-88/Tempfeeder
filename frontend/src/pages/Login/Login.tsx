import { useEffect, useState, useRef } from "react";
import "./Login.css";

type Mode = "normal" | "email" | "password" | "error";

const dollsOrder = ["purple", "yellow", "pink", "orange"];

export default function Login() {
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<Mode>("normal");
  const [peekDoll, setPeekDoll] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [enter, setEnter] = useState(false);
  const [fade, setFade] = useState(false);

  const peekTimeout = useRef<number | null>(null);

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
    const len = e.target.value.length;

    if (peekTimeout.current) clearTimeout(peekTimeout.current);

    if (len > 0 && len % 2 === 0 && !showPwd) {
      const index = ((len / 2) - 1) % dollsOrder.length;
      const doll = dollsOrder[index];

      setPeekDoll(doll);

      peekTimeout.current = window.setTimeout(() => {
        setPeekDoll(null);
      }, 300);
    }
  };

  const toggleShowPwd = () => {
    setShowPwd(prev => {
      const next = !prev;

      if (!next) {
        setMode("password");
      } else {
        setMode("normal");
        setPeekDoll(null);
      }

      return next;
    });
  };

  return (
    <div className="login-page">
      <div className={`brand ${fade ? "fade-in" : ""}`}>
        <div className="brand-title">Spoonfeeder</div>
        <div className="brand-hero">
          Structured learning,<br />
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
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              onFocus={() => setMode("password")}
              onBlur={() => !showPwd && setMode("normal")}
              onChange={handlePwdChange}
            />
            <span className="show-pwd" onClick={toggleShowPwd}>
              {showPwd ? "Hide" : "Show"}
            </span>
          </div>

          <div className={`forgot fade-in`} style={{ animationDelay: "0.7s" }}>Forgot password?</div>

          <button className="fade-in" style={{ animationDelay: "0.8s" }} onClick={() => setMode("error")}>
            Sign in
          </button>

          <div className="signup fade-in" style={{ animationDelay: "0.9s" }}>
            New to Spoonfeeder? <span>Create account</span>
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
    >
      <div
        className="eyes"
        style={{
          transform:
            turnAway && !isPeek
              ? "none"
              : `translate(${eye.x}px, ${eye.y}px)`
        }}
      >
        <span />
        <span />
      </div>

      <div className={`mouth ${isError ? "error" : ""}`} />
    </div>
  );
}
