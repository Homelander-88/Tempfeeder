/* ResetPasswordView component: used when frontend path is /reset-password?token=... */
import {useState} from "react";
import { motion} from "framer-motion";

export function ResetPasswordView({ token, onComplete }: { token: string; onComplete: () => void; }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const API_BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:4000/api";
    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setErr(null);
        setMsg(null);
        if (!password || password.length < 8) {
            setErr("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setErr("Passwords do not match.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/auth/reset-password/${encodeURIComponent(token)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });
            const j = await res.json();
            if (!res.ok) throw new Error(j?.error || "Failed to reset password");
            setMsg("Password reset successful. Redirecting to sign in...");
            setTimeout(() => onComplete(), 1200);
        } catch (e: any) {
            setErr(e?.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div className="login-card reset-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h2>Reset Password</h2>
            <p className="subtitle">Set a new secure password for your account</p>

            <input aria-label="New password" type="password" name="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input aria-label="Confirm new password" type="password" name="confirm" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

            <button onClick={submit} disabled={loading}>{loading ? "Saving..." : "Set new password"}</button>

            {err && <div className="error-message" role="alert">{err}</div>}
            {msg && <div className="success-message" role="status">{msg}</div>}
        </motion.div>
    );
}