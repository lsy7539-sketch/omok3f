import { useState } from "react";
import type { AuthError } from "@supabase/supabase-js";

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
}

export default function AuthScreen({ onSignIn, onSignUp }: AuthScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    const { error } = mode === "signin" ? await onSignIn(email, password) : await onSignUp(email, password);
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup") {
      setNotice("가입 확인 이메일을 보냈어요. 메일함을 확인해 주세요.");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">3층오목</h1>
        <p className="auth-tagline">계정으로 전적을 기록하며 플레이하세요</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "signin" ? "is-active" : ""}
            onClick={() => setMode("signin")}
          >
            로그인
          </button>
          <button
            type="button"
            className={mode === "signup" ? "is-active" : ""}
            onClick={() => setMode("signup")}
          >
            회원가입
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            이메일
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {notice && <p className="auth-notice">{notice}</p>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {mode === "signin" ? "로그인" : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}
