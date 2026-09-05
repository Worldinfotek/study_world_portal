import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import * as SqlStore from '../utils/sqlStore';
import { CrestLogo } from './CrestLogo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Phone,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  users: UserAccount[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In Fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Fields (Registers "User" Role)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Status & Feedback States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Password Recovery States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Reset inputs when opened
  useEffect(() => {
    if (isOpen) {
      setSignInEmail('');
      setSignInPassword('');
      setShowSignInPassword(false);
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPhone('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
      setShowSignUpPassword(false);
      setErrorMessage('');
      setSuccessMessage('');
      setAuthMode('signin');
      setForgotEmail('');
      setForgotSuccess(false);
      setIsAuthenticating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ==========================================
  // SIGN IN HANDLER (Production Firebase Auth)
  // ==========================================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedEmail = signInEmail.trim().toLowerCase();
    const enteredPassword = signInPassword.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your account email address.');
      return;
    }
    if (!enteredPassword) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsAuthenticating(true);

    try {
      try {
        const sqlLogin = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password: enteredPassword }),
        });
        if (sqlLogin.ok) {
          const payload = await sqlLogin.json();
          if (payload?.user) {
            const updatedUser: UserAccount = {
              ...payload.user,
              last_login: new Date().toISOString(),
            };
            const { setSessionToken } = await import('../lib/apiAuth');
            if (payload.token) setSessionToken(payload.token);
            SqlStore.setSessionUser(updatedUser);
            setIsAuthenticating(false);
            onLoginSuccess(updatedUser);
            onClose();
            return;
          }
        } else if (sqlLogin.status === 404) {
          setIsAuthenticating(false);
          setErrorMessage(`No account found registered with email "${trimmedEmail}".`);
          return;
        } else if (sqlLogin.status === 401) {
          setIsAuthenticating(false);
          setErrorMessage('Incorrect password. Please verify your credentials and try again.');
          return;
        } else if (sqlLogin.status === 403) {
          setIsAuthenticating(false);
          setErrorMessage('This account is currently marked Inactive. Please contact the administrator.');
          return;
        } else {
          const err = await sqlLogin.json().catch(() => ({} as { error?: string }));
          setIsAuthenticating(false);
          setErrorMessage(
            sqlLogin.status >= 500
              ? err.error || 'Could not reach SQL Server. Please try again.'
              : err.error || 'Sign-in failed. Please verify your email and password.'
          );
          return;
        }
      } catch (sqlErr) {
        setIsAuthenticating(false);
        setErrorMessage('Could not reach SQL Server. Please try again.');
        return;
      }

      setIsAuthenticating(false);
      setErrorMessage('Sign-in failed. Please verify your email and password.');
    } catch (err: any) {
      setIsAuthenticating(false);
      setErrorMessage(err.message || 'Authentication error. Please try again.');
    }
  };

  // ==========================================
  // SIGN UP HANDLER (Public User Role)
  // ==========================================
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const nameTrimmed = signUpName.trim();
    const emailTrimmed = signUpEmail.trim().toLowerCase();
    const phoneTrimmed = signUpPhone.trim();
    const passTrimmed = signUpPassword.trim();
    const confirmPassTrimmed = signUpConfirmPassword.trim();

    if (!nameTrimmed) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!emailTrimmed) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (passTrimmed.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (passTrimmed !== confirmPassTrimmed) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameTrimmed,
          email: emailTrimmed,
          password: passTrimmed,
          phone: phoneTrimmed,
          department: 'Public Student Portal',
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setIsAuthenticating(false);
        setErrorMessage(payload.error || 'Failed to create account.');
        return;
      }
      const { setSessionToken } = await import('../lib/apiAuth');
      if (payload.token) setSessionToken(payload.token);
      SqlStore.setSessionUser(payload.user);
      setIsAuthenticating(false);
      onLoginSuccess(payload.user);
      onClose();
    } catch (err: any) {
      setIsAuthenticating(false);
      setErrorMessage(err.message || 'Failed to create account.');
    }
  };

  // ==========================================
  // GOOGLE AUTH HANDLER
  // ==========================================
  const handleGoogleSignIn = async () => {
    setErrorMessage('Feature not available yet');
  };

  // ==========================================
  // FORGOT PASSWORD HANDLER
  // ==========================================
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(false);
    setErrorMessage('Feature not available yet');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-[#241512]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-5 bg-stone-50 border-b border-stone-200 text-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CrestLogo size="sm" variant="full" subtitleText="Authentication" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {/* 
        CREATE ACCOUNT TAB HIDDEN / COMMENTED OUT AS REQUESTED:
        <div className="grid grid-cols-2 p-1.5 bg-stone-100 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`py-2 text-center font-bold text-xs rounded-xl transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white text-[#7A2820] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`py-2 text-center font-bold text-xs rounded-xl transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-[#7A2820] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create User Account
          </button>
        </div>
        */}

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* ========================================== */}
        {/* SIGN IN FORM                               */}
        {/* ========================================== */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="p-6 space-y-4" autoComplete="off">
            <div className="space-y-1">
              <label className="font-bold text-stone-700">Account Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#A8382C]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-700">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-[11px] text-[#A8382C] hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-10 py-2.5 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#A8382C]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-[#A8382C] hover:bg-[#7A2820] disabled:opacity-60 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors mt-2 cursor-pointer"
            >
              <span>{isAuthenticating ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4 text-[#C9A227]" />
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[10px] text-stone-400 uppercase tracking-widest absolute">
                or continue with
              </span>
            </div>

            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Account</span>
            </button>
          </form>
        )}

        {/* ========================================== */}
        {/* SIGN UP FORM (HIDDEN / COMMENTED OUT)      */}
        {/* ========================================== */}
        {/*
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="p-6 space-y-3" autoComplete="off">
            <div className="space-y-1">
              <label className="font-bold text-stone-700">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Zain Ahmed"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#A8382C]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="e.g. zain@gmail.com"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#A8382C]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700">Phone / WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#A8382C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Password *</label>
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#A8382C]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Confirm *</label>
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="Repeat pass"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#A8382C]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-[#A8382C] hover:bg-[#7A2820] disabled:opacity-60 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors mt-2 cursor-pointer"
            >
              <span>{isAuthenticating ? 'Creating Account...' : 'Register Account'}</span>
              <Check className="w-4 h-4 text-[#C9A227]" />
            </button>
          </form>
        )}
        */}

        {/* ========================================== */}
        {/* FORGOT PASSWORD FORM                       */}
        {/* ========================================== */}
        {authMode === 'forgot' && (
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-stone-900 text-sm">Reset Account Password</h4>
              <p className="text-[11px] text-stone-500">
                Enter your registered email address below. We will send a secure password reset link.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="font-bold">Password Reset Instructions Dispatched</p>
                <p className="text-[11px] text-stone-600">
                  Please check your inbox (including spam folder) for instructions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setForgotSuccess(false);
                  }}
                  className="text-xs font-bold text-[#A8382C] underline cursor-pointer mt-2"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#A8382C]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-stone-600 hover:text-stone-900 font-semibold cursor-pointer text-xs"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#A8382C] hover:bg-[#7A2820] text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
