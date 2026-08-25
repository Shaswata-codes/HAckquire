import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function GoogleLoginButton({ text = 'Continue with Google', mode = 'signin' }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const tokenClientRef = useRef(null);

  // Use configured env variable with fallback to user's registered Google Client ID
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '105991203900-pm63hf6fm0pi6g18u882qei0bd9jrdcm.apps.googleusercontent.com';

  useEffect(() => {
    // Dynamically load Google Identity Services SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2 && clientId) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'openid email profile',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                console.error('Google sign-in error:', tokenResponse.error);
                if (tokenResponse.error !== 'popup_closed_by_user') {
                  toast.error(`Google sign-in error: ${tokenResponse.error}`);
                }
                setLoading(false);
                return;
              }
              if (tokenResponse.access_token) {
                setLoading(true);
                try {
                  // Fetch user profile from Google UserInfo endpoint using OAuth access_token
                  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                  });
                  const profile = await res.json();
                  
                  await googleLogin({ profile });
                  toast.success(mode === 'signup' ? 'Welcome to Hackquire! 🎉' : 'Signed in with Google! 👋');
                  navigate('/dashboard');
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Google authentication failed');
                } finally {
                  setLoading(false);
                }
              }
            },
          });
        } catch (e) {
          console.warn('Google Token Client init error:', e.message);
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [clientId, mode]);

  const handleButtonClick = () => {
    if (!clientId) {
      toast.error('Google Client ID is missing');
      return;
    }

    if (tokenClientRef.current) {
      setLoading(true);
      // Trigger native Google Account Chooser popup listing all Gmail accounts on the device
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
    } else if (window.google?.accounts?.oauth2) {
      try {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse.access_token) {
              setLoading(true);
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();
                await googleLogin({ profile });
                toast.success(mode === 'signup' ? 'Welcome to Hackquire! 🎉' : 'Signed in with Google! 👋');
                navigate('/dashboard');
              } catch (err) {
                toast.error(err.response?.data?.message || 'Google authentication failed');
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          },
        });
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        toast.error('Could not open Google popup: ' + err.message);
        setLoading(false);
      }
    } else {
      toast.error('Google service is initializing. Please try again in 1 second.');
    }
  };

  return (
    <button
      type="button"
      id="google-auth-btn"
      onClick={handleButtonClick}
      disabled={loading}
      className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer shadow-sm hover:shadow-md hover:shadow-indigo-500/5 group"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
            />
          </svg>
          <span className="group-hover:text-white transition-colors">{text}</span>
        </>
      )}
    </button>
  );
}
