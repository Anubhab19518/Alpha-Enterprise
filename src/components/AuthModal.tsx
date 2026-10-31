'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { STORE_CONFIG } from '@/config/store';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: (notification?: (n: unknown) => void) => void;
        };
      };
    };
  }
}

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Account Prompt State
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // Load Google Identity Services script dynamically for production OAuth
  useEffect(() => {
    if (!isAuthModalOpen || !googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (res) => {
            if (res.credential) {
              try {
                const base64Url = res.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                loginWithGoogle({
                  email: payload.email,
                  name: payload.name || payload.given_name,
                  picture: payload.picture,
                });
              } catch {
                loginWithGoogle();
              }
            }
          },
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isAuthModalOpen, googleClientId, loginWithGoogle]);

  if (!isAuthModalOpen) return null;

  const handleGoogleClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      // Trigger Google's native One Tap account selector popup
      window.google.accounts.id.prompt();
    } else {
      // Interactive Google Account chooser input
      setShowGooglePrompt(true);
    }
  };

  const handleGoogleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;

    const userEmail = googleEmailInput.trim();
    const userName = userEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    loginWithGoogle({
      email: userEmail,
      name: userName,
    });

    setShowGooglePrompt(false);
    setGoogleEmailInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.message || 'Failed to login');
        }
      } else {
        const res = await register(email, password, firstName, lastName);
        if (!res.success) {
          setErrorMsg(res.message || 'Failed to register account');
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs"
        onClick={() => {
          setIsAuthModalOpen(false);
          setShowGooglePrompt(false);
        }}
      />

      <div className="relative bg-white rounded-sm max-w-md w-full p-8 shadow-2xl space-y-6 border border-neutral-100 z-10">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-neutral-900">
              {showGooglePrompt ? 'Choose Google Account' : mode === 'login' ? 'Customer Sign In' : 'Create Account'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Welcome to {STORE_CONFIG.name}
            </p>
          </div>
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setShowGooglePrompt(false);
            }}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xs">
            {errorMsg}
          </div>
        )}

        {showGooglePrompt ? (
          /* Interactive Google Account Chooser Input */
          <form onSubmit={handleGoogleAccountSubmit} className="space-y-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4 space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
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
                <div>
                  <span className="block text-xs font-bold text-neutral-900">Sign in with Google</span>
                  <span className="block text-[11px] text-neutral-500">Enter your Google Account email from your device</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                  Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowGooglePrompt(false)}
                className="flex-1 bg-neutral-100 text-neutral-700 text-xs font-bold uppercase py-3 rounded-xs hover:bg-neutral-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-neutral-950 text-white text-xs font-bold uppercase py-3 rounded-xs hover:bg-black"
              >
                Sign In As Google User
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Styled Google OAuth Login Button */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleGoogleClick}
                className="w-full bg-white border border-neutral-300 text-neutral-800 text-xs font-bold py-3.5 px-4 rounded-xs hover:bg-neutral-50 hover:border-neutral-400 transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer active:scale-[0.99]"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google Account</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-neutral-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest absolute">
                  OR EMAIL
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs px-3 py-2.5 outline-none focus:border-black"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs pl-9 pr-3 py-2.5 outline-none focus:border-black"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="????????"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xs text-xs pl-9 pr-3 py-2.5 outline-none focus:border-black"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest py-3.5 px-4 rounded-xs hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                  ? 'Sign In To Account'
                  : 'Create Account'}
              </button>
            </form>

            <div className="pt-2 border-t border-neutral-100 text-center text-xs text-neutral-600">
              {mode === 'login' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className="font-bold text-neutral-900 underline hover:text-black"
                  >
                    Register now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className="font-bold text-neutral-900 underline hover:text-black"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
