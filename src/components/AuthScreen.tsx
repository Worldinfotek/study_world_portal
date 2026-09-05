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
  ShieldCheck,
  User,
  Phone,
  Globe2,
  GraduationCap,
  Sparkles,
  BookOpen,
  Building2,
  Check,
  Zap,
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  users: UserAccount[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  users,
}) => {
  // Mode: 'signin' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up States (For Public User Role)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpCountry, setSignUpCountry] = useState('Pakistan');
  const [signUpDestination, setSignUpDestination] = useState('United Kingdom');
  const [signUpDegreeLevel, setSignUpDegreeLevel] = useState("Bachelor's / Undergraduate");
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Feedback & Loading States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Clear messages on mode switch
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, [authMode]);

  // ==========================================================
  // SIGN IN SUBMISSION HANDLER (Production Firebase Auth)
  // ==========================================================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedEmail = signInEmail.trim().toLowerCase();
    const enteredPassword = signInPassword.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!enteredPassword) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsProcessing(true);

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
            setIsProcessing(false);
            onLoginSuccess(updatedUser);
            return;
          }
        } else if (sqlLogin.status === 404) {
          setIsProcessing(false);
          setErrorMessage(`No account found registered with email "${trimmedEmail}".`);
          return;
        } else if (sqlLogin.status === 401) {
          setIsProcessing(false);
          setErrorMessage('Incorrect password. Please verify your credentials and try again.');
          return;
        } else if (sqlLogin.status === 403) {
          setIsProcessing(false);
          setErrorMessage('This account is currently marked Inactive. Please contact the portal administrator.');
          return;
        } else {
          const err = await sqlLogin.json().catch(() => ({} as { error?: string }));
          setIsProcessing(false);
          setErrorMessage(
            sqlLogin.status >= 500
              ? err.error || 'Could not reach SQL Server. Please try again.'
              : err.error || 'Sign-in failed. Please verify your email and password.'
          );
          return;
        }
      } catch (sqlErr) {
        setIsProcessing(false);
        setErrorMessage('Could not reach SQL Server. Please try again.');
        return;
      }

      setIsProcessing(false);
      setErrorMessage('Sign-in failed. Please verify your email and password.');
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'An error occurred during authentication. Please try again.');
    }
  };

  // ==========================================================
  // SIGN UP SUBMISSION HANDLER (Registers new "User" Role)
  // ==========================================================
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
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service & Privacy Policy to continue.');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameTrimmed,
          email: emailTrimmed,
          password: passTrimmed,
          phone: phoneTrimmed,
          department: `Public Student Portal (${signUpCountry} → ${signUpDestination})`,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setIsProcessing(false);
        setErrorMessage(payload.error || 'Failed to create your account.');
        return;
      }
      const { setSessionToken } = await import('../lib/apiAuth');
      if (payload.token) setSessionToken(payload.token);
      SqlStore.setSessionUser(payload.user);
      setSuccessMessage('Account registered successfully! Welcome to Study World Consultant.');
      setIsProcessing(false);
      setTimeout(() => onLoginSuccess(payload.user), 400);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to create your account. Please try again.');
    }
  };

  // ==========================================================
  // GOOGLE SIGN IN / UP HANDLER
  // ==========================================================
  const handleGoogleAuth = async () => {
    setErrorMessage('Feature not available yet');
  };

  // ==========================================================
  // FORGOT PASSWORD HANDLER
  // ==========================================================
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(false);
    setErrorMessage('Feature not available yet');
  };

  return (
    <div className="min-h-screen bg-[#FAF5EE] flex flex-col justify-between text-[#241512] font-sans selection:bg-[#C9A227] selection:text-stone-900">
      {/* Top Brand Bar */}
      <header className="px-6 py-4 border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CrestLogo size="md" subtitleText="Global Higher Education Portal" />
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className="text-stone-500 font-medium">Have questions?</span>
          <a
            href="mailto:info@studyworld.pk"
            className="font-bold text-[#7A2820] hover:text-[#A8382C] underline flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Admissions Helpdesk</span>
          </a>
        </div>
      </header>

      {/* Main Split Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Public Features & Credibility */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/70 border border-[#C9A227]/40 text-[#7A2820] font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Public University Search & Admission System</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#35100C] leading-tight">
                Your Gateway to Top Global Universities.
              </h1>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
                Sign in or create your free user account to browse over <strong>2,000+ verified degree courses</strong>, check real-time admission & visa eligibility, and submit direct applications with Study World Consultant.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-[#7A2820] font-bold text-xs">
                  <Building2 className="w-4 h-4 text-[#A8382C]" />
                  <span>500+ Partner Universities</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Comprehensive directory across the UK, Australia, Canada, USA, and Europe.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-[#7A2820] font-bold text-xs">
                  <BookOpen className="w-4 h-4 text-[#A8382C]" />
                  <span>Course & Fee Catalog</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Live tuition fees, application deadlines, scholarship details, and IELTS bands.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-[#7A2820] font-bold text-xs">
                  <Zap className="w-4 h-4 text-[#C9A227]" />
                  <span>Instant Match Checker</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Evaluate study gaps, MOI waivers, and minimum grades against official university criteria.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-[#7A2820] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Direct Counselor Support</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Submit inquiry dossiers directly to verified branch counselors for rapid filing.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login & Sign-Up Card */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden text-xs">
              
              {/* Top Card Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#7A2820] to-[#5E1B15] text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Sign In to Portal</h3>
                  <p className="text-[11px] text-amber-200/80">Authorized Staff & Client Portal Access</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white/10 text-amber-200 font-semibold text-[10px]">
                  Secure Access
                </div>
              </div>

              {/* 
              CREATE ACCOUNT SECTION HIDDEN / COMMENTED OUT AS REQUESTED:
              <div className="grid grid-cols-2 p-1.5 bg-stone-100/90 border-b border-stone-200">
                <button
                  id="tab-signin"
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`py-2.5 text-center font-bold text-xs rounded-2xl transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-[#7A2820] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Sign In to Account
                </button>
                <button
                  id="tab-signup"
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`py-2.5 text-center font-bold text-xs rounded-2xl transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-[#7A2820] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Create User Account
                </button>
              </div>
              */}

              {/* Alert Feedback Messages */}
              {errorMessage && (
                <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <span className="font-medium leading-relaxed">{successMessage}</span>
                </div>
              )}

              {/* ======================================================= */}
              {/* VIEW 1: SIGN IN FORM                                   */}
              {/* ======================================================= */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignIn} className="p-6 sm:p-8 space-y-4" autoComplete="off">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Account Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-signin-email"
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#7A2820] transition-colors"
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
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-signin-password"
                        type={showSignInPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#7A2820] transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                      >
                        {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="auth-signin-btn"
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-[#7A2820] hover:bg-[#5E1B15] disabled:opacity-60 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                  >
                    <span>{isProcessing ? 'Authenticating...' : 'Sign In & Enter Website'}</span>
                    <ArrowRight className="w-4 h-4 text-[#C9A227]" />
                  </button>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="border-t border-stone-200 w-full" />
                    <span className="bg-white px-3 text-[10px] text-stone-400 uppercase tracking-widest absolute">
                      or continue with
                    </span>
                  </div>

                  <button
                    id="auth-google-btn"
                    type="button"
                    disabled={isProcessing}
                    onClick={handleGoogleAuth}
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
                    <span>Google One-Tap Authentication</span>
                  </button>

                  {/* 
                  REGISTRATION LINK HIDDEN / COMMENTED OUT AS REQUESTED:
                  <div className="text-center pt-2 text-stone-500 text-[11px]">
                    Don&apos;t have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-[#7A2820] font-bold hover:underline cursor-pointer"
                    >
                      Register as User (Free)
                    </button>
                  </div>
                  */}
                </form>
              )}

              {/* ======================================================= */}
              {/* VIEW 2: SIGN UP FORM (PUBLIC "USER" REGISTRATION)       */}
              {/* HIDDEN / COMMENTED OUT AS REQUESTED                     */}
              {/* ======================================================= */}
              {/*
              {authMode === 'signup' && (
                <form onSubmit={handleSignUp} className="p-6 sm:p-8 space-y-3.5" autoComplete="off">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-signup-name"
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Ali Raza"
                        className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#7A2820]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Email Address *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="auth-signup-email"
                          type="email"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          placeholder="e.g. ali@gmail.com"
                          className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#7A2820]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Phone / WhatsApp</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="auth-signup-phone"
                          type="tel"
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          placeholder="e.g. +92 300 1234567"
                          className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#7A2820]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Country of Residence</label>
                      <select
                        value={signUpCountry}
                        onChange={(e) => setSignUpCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-semibold focus:outline-none focus:border-[#7A2820]"
                      >
                        <option value="Pakistan">Pakistan</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="India">India</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Other">Other Global</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Target Study Destination</label>
                      <select
                        value={signUpDestination}
                        onChange={(e) => setSignUpDestination(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-semibold focus:outline-none focus:border-[#7A2820]"
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Canada">Canada</option>
                        <option value="United States">United States</option>
                        <option value="Germany">Germany</option>
                        <option value="Ireland">Ireland</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="All Destinations">Open to Suggestions</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Password (Min 6 chars) *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="auth-signup-pass"
                          type={showSignUpPassword ? 'text' : 'password'}
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="Create password"
                          className="w-full pl-10 pr-10 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#7A2820]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                        >
                          {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="auth-signup-confirm-pass"
                          type={showSignUpPassword ? 'text' : 'password'}
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#7A2820]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="agree-terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-[#7A2820] rounded border-stone-300 focus:ring-[#7A2820] cursor-pointer"
                    />
                    <label htmlFor="agree-terms" className="text-[11px] text-stone-600 cursor-pointer">
                      I agree to the Study World Consultant User Terms & Admission Data Policy.
                    </label>
                  </div>

                  <button
                    id="auth-signup-submit-btn"
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-[#A8382C] hover:bg-[#7A2820] disabled:opacity-60 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                  >
                    <span>{isProcessing ? 'Creating Account...' : 'Complete Sign Up & Explore Courses'}</span>
                    <Check className="w-4 h-4 text-[#C9A227]" />
                  </button>

                  <div className="text-center pt-1 text-stone-500 text-[11px]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-[#7A2820] font-bold hover:underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </div>
                </form>
              )}
              */}

              {/* ======================================================= */}
              {/* VIEW 3: FORGOT PASSWORD FORM                            */}
              {/* ======================================================= */}
              {authMode === 'forgot' && (
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-[#7A2820]">Reset Account Password</h3>
                    <p className="text-xs text-stone-600">
                      Enter your registered email address and we will dispatch a secure reset link.
                    </p>
                  </div>

                  {forgotSuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <p className="font-bold">Password Reset Instructions Sent</p>
                      <p className="text-xs text-stone-600">
                        Please check your inbox (including spam folder) for instructions to reset your password.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setForgotSuccess(false);
                        }}
                        className="mt-2 text-xs font-bold text-[#A8382C] underline cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-700">Registered Email Address</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="e.g. student@gmail.com"
                            className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl bg-white font-medium focus:outline-none focus:border-[#7A2820]"
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
                          Cancel / Back to Sign In
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#7A2820] hover:bg-[#5E1B15] text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors text-xs"
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

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-stone-200/80 bg-white/60 text-center text-xs text-stone-500">
        <p>© 2026 Study World Consultant (Pvt) Ltd. All rights reserved. Global Education Admissions Portal.</p>
      </footer>
    </div>
  );
};
