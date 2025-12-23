import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(name, pincode);
      } else {
        await register(name, pincode);
      }
    } catch (err: unknown) {
      const e = err as { message?: string; errors?: Record<string, string[]> };
      setError(e.errors ? Object.values(e.errors)[0]?.[0] || "Er ging iets mis" : e.message || "Er ging iets mis");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h1>StudiePlanner</h1>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isLogin ? "Inloggen" : "Registreren"}</h2>
          <div className="form-group">
            <label>Naam</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Je naam" required autoFocus />
          </div>
          <div className="form-group">
            <label>Pincode (4 cijfers)</label>
            <input type="password" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ""))} placeholder="0000" required />
            {!isLogin && <small>Onthoud je pincode goed!</small>}
          </div>
          <button type="submit" disabled={isSubmitting || pincode.length !== 4} className="btn-primary">
            {isSubmitting ? "Bezig..." : isLogin ? "Inloggen" : "Registreren"}
          </button>
          <div className="auth-links">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
              {isLogin ? "Nog geen account? Registreer" : "Al een account? Inloggen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
