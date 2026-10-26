import { useState } from 'react';
import dubai from '../assets/img/dubai2.jpg';
import { Button, Checkbox, Icon } from '../components/ui';
import { useAuth } from '../data/auth';
import { LogoMark } from '../layout/Shell';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const emailErr = tried && !email.trim() ? 'Enter your work email' : '';
  const pwErr = tried && !password ? 'Enter your password' : '';
  return (
    <div className="login">
      <aside className="login-art">
        <img src={dubai} alt="" />
        <div className="row" style={{ gap: 12 }}>
          <LogoMark />
          <span style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 18 }}>919 Admin</span>
        </div>
        <div>
          <h2>Moderation and data for 919</h2>
          <p>Check new employers and vacancies, handle reports and keep an eye on how the platform grows.</p>
        </div>
      </aside>
      <main className="login-side">
        <form
          className="login-form"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            setTried(true);
            if (!email.trim() || !password) return;
            setBusy(true);
            await signIn(email.trim(), password, remember);
          }}
        >
          <div className="hide-d" style={{ marginBottom: 8 }}>
            <LogoMark size={56} />
          </div>
          <div>
            <h1>Sign in to 919 Admin</h1>
            <div className="sub" style={{ fontSize: 15 }}>For the 919 team. Use your work email.</div>
          </div>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className={`input ${emailErr ? 'invalid' : ''}`}
              type="email"
              autoComplete="username"
              placeholder="name@919.ae"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!emailErr}
            />
            {emailErr && <span className="field-error">{emailErr}</span>}
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="pw">
              <input
                id="login-password"
                className={`input ${pwErr ? 'invalid' : ''}`}
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!pwErr}
              />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
                <Icon name={show ? 'eye-off' : 'view'} />
              </button>
            </div>
            {pwErr && <span className="field-error">{pwErr}</span>}
          </div>
          <label className="row" style={{ gap: 10, fontSize: 14, cursor: 'pointer' }}>
            <Checkbox on={remember} onChange={() => setRemember(!remember)} label="Keep me signed in" />
            Keep me signed in
          </label>
          <Button kind="primary" size="L" full type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
          <div className="small muted" style={{ textAlign: 'center' }}>
            Forgot the password? Ask the workspace owner to reset it.
          </div>
        </form>
      </main>
    </div>
  );
}
