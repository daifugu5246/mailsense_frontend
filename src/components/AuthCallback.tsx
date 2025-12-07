import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleAuth } from '../utils/googleAuth';
import { toast } from 'sonner@2.0.3';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Backend handles the OAuth callback and redirects here
        const success = searchParams.get('success');
        const errorParam = searchParams.get('error');

        console.log('Auth callback - success:', success, 'error:', errorParam);

        // Check for OAuth error from backend
        if (errorParam) {
          // Decode error message if it's URL encoded
          const decodedError = decodeURIComponent(errorParam);
          console.error('Backend returned error:', decodedError);
          
          // Parse error message
          let errorMessage = decodedError;
          if (decodedError.includes('401')) {
            errorMessage = 'Authentication failed: Unauthorized. Please check your Google OAuth credentials.';
          } else if (decodedError.includes('400')) {
            errorMessage = 'Invalid request. Please try again.';
          } else if (decodedError.includes('403')) {
            errorMessage = 'Access denied. Your email domain may not be allowed.';
          }
          
          setError(errorMessage);
          toast.error(errorMessage);
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          setLoading(false);
          return;
        }

        if (success === 'true') {
          // Backend has processed the callback, get user info
          console.log('Fetching user info from backend...');
          const user = await googleAuth.getCurrentUser();
          
          if (user) {
            // Store user data in sessionStorage for frontend state
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('isAuthenticated', 'true');
            toast.success(`Welcome, ${user.display_name || user.name || user.email}!`);
            console.log('User authenticated:', user);
          } else {
            throw new Error('Failed to get user information from backend');
          }
        } else {
          // No success parameter - might be direct callback from Google (shouldn't happen)
          console.warn('No success parameter found, checking if this is direct Google callback...');
          const code = searchParams.get('code');
          if (code) {
            throw new Error('Direct Google callback detected. Backend should handle this.');
          } else {
            throw new Error('Authentication was not successful');
          }
        }
        
        // Redirect to dashboard
        navigate('/', { replace: true });
      } catch (err: any) {
        console.error('Auth callback error:', err);
        const errorMessage = err.message || 'Authentication failed';
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0767B0] mx-auto mb-4"></div>
          <p className="text-slate-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-slate-700 mb-4">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-yellow-800 font-medium mb-2">Possible causes:</p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li>Google OAuth credentials are incorrect</li>
              <li>Backend server is not running</li>
              <li>Email domain is not allowed</li>
              <li>Token exchange failed</li>
            </ul>
          </div>
          <p className="text-sm text-slate-500">Redirecting to home in a few seconds...</p>
        </div>
      </div>
    );
  }

  return null;
}

