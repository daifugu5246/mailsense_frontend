// Google OAuth Configuration and Service

// Get Google Client ID from environment variable
// You need to set this in your .env file: VITE_GOOGLE_CLIENT_ID=your-client-id
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Google OAuth Service using Authorization Code Flow
export class GoogleAuthService {
  private clientId: string;
  private redirectUri: string;

  constructor(clientId: string, redirectUri: string) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  // Start Google OAuth flow (redirect to Google)
  // Backend will handle the callback, so redirect_uri should point to backend
  signIn(): void {
    if (!this.clientId) {
      throw new Error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
    }

    // Generate state for CSRF protection
    const state = this.generateState();
    sessionStorage.setItem('oauth_state', state);

    // Get backend URL for redirect (backend will handle the callback)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const backendCallbackUrl = backendUrl 
      ? `${backendUrl}/api/auth/google/callback`
      : this.redirectUri; // Fallback to frontend callback if no backend

    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: backendCallbackUrl,
      response_type: 'code',
      scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
      state: state,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    console.log('Redirecting to Google OAuth:', authUrl);
    console.log('Backend callback URL:', backendCallbackUrl);
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  }

  // Get current user from backend (backend stores token in HTTP-only cookie)
  async getCurrentUser(): Promise<any> {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    if (!backendUrl) {
      throw new Error('Backend URL is not configured');
    }

    console.log('Fetching user from backend:', `${backendUrl}/api/auth/me`);

    try {
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // Important: include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Backend response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          const errorText = await response.text();
          console.error('401 Unauthorized - Backend response:', errorText);
          return null; // Not authenticated
        }
        
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('User data received:', data);
      return data.user || data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to backend server. Please check if backend is running.');
      }
      throw error;
    }
  }

  // Logout - clear backend session
  async logout(): Promise<void> {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    if (backendUrl) {
      try {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  }

  // Generate random state for CSRF protection
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Create singleton instance
export const googleAuth = new GoogleAuthService(
  GOOGLE_CLIENT_ID,
  `${window.location.origin}/auth/callback`
);

