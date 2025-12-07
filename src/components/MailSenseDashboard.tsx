import React, { useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import NavbarLandingPage from '../imports/NavbarLandingPage';
import { FilterBar } from './dashboard/FilterBar';
import { EmailsTable } from './dashboard/EmailsTable';
import { Pagination } from './dashboard/Pagination';
import { Email } from './dashboard/constants';
import { emailApi } from '../utils/emailApi';
import { googleAuth } from '../utils/googleAuth';

const MailSenseDashboard = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const PAGE_LIMIT = 50;

  // Check for authenticated user on mount
  useEffect(() => {
    const checkAuth = async () => {
      // First check sessionStorage
      const savedUser = sessionStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('isAuthenticated');
        }
      }

      // Also try to get user from backend (in case cookie exists but sessionStorage doesn't)
      try {
        const backendUser = await googleAuth.getCurrentUser();
        if (backendUser) {
          setUser(backendUser);
          sessionStorage.setItem('user', JSON.stringify(backendUser));
          sessionStorage.setItem('isAuthenticated', 'true');
        }
      } catch (error) {
        // Not authenticated - use sessionStorage only
        console.log('Backend auth check failed, using sessionStorage');
      }

      fetchEmails();
    };

    checkAuth();
  }, []);

  // Refetch emails when filter or page changes
  useEffect(() => {
    fetchEmails();
  }, [filter, currentPage]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      // Pass filter category and pagination
      const result = await emailApi.getEmails({
        page: currentPage,
        limit: PAGE_LIMIT,
        category: filter !== "all" ? filter : undefined,
      });
      setEmails(result.emails);
      
      // Update pagination state from API response
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages || 1);
        setTotalEmails(result.pagination.total || result.emails.length);
      }
    } catch (error: any) {
      console.error("Error loading emails:", error);
      const errorMessage = error.message || "Failed to load emails";
      toast.error(errorMessage);
      
      // If unauthorized, clear user session
      if (errorMessage.includes('Unauthorized')) {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAuthenticated');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMail = async () => {
    if (!user) {
      toast.error("Please login to fetch mail");
      return;
    }

    setLoading(true);
    let fetchedEmails: Email[] = [];
    let totalEmails = 0;
    let currentProgress = 0;

    try {
      // Use real API with streaming support
      const result = await emailApi.fetchMail((streamData) => {
          if (streamData.type === 'start') {
            totalEmails = streamData.total || 0;
            const skipped = streamData.skipped || 0;
            const message = skipped > 0 
              ? `Starting to fetch ${totalEmails} new emails (${skipped} already fetched)`
              : `Starting to fetch ${totalEmails} emails...`;
            toast.loading(message, { id: 'fetch-progress' });
          } else if (streamData.type === 'email' && streamData.data) {
            // Transform and add email to list immediately
            const transformedEmail = {
              id: streamData.data.google_message_id || streamData.data.id,
              sender: streamData.data.from_name || streamData.data.from_address || 'Unknown',
              subject: streamData.data.subject || '(No Subject)',
              preview: streamData.data.body_text?.substring(0, 100) || 'No preview available',
              category: streamData.data.category || 'Others',
              purpose: streamData.data.purpose || 'Other',
              date: streamData.data.received_at || streamData.data.fetched_at || new Date().toISOString(),
              link: `https://mail.google.com/mail/u/0/#inbox/${streamData.data.google_message_id}`,
              correctness: streamData.data.correctness === 'none' ? null : (streamData.data.correctness as 'correct' | 'wrong' | null),
            };
            
            fetchedEmails.push(transformedEmail);
            currentProgress = streamData.progress?.current || fetchedEmails.length;
            
            // Update UI in real-time
            setEmails(prev => {
              // Check if email already exists
              const exists = prev.some(e => e.id === transformedEmail.id);
              if (exists) {
                // Update existing email
                return prev.map(e => e.id === transformedEmail.id ? transformedEmail : e);
              } else {
                // Add new email at the beginning
                return [transformedEmail, ...prev].sort((a, b) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                );
              }
            });

            // Update progress toast
            if (streamData.progress) {
              toast.loading(
                `Fetching emails... ${streamData.progress.current}/${streamData.progress.total}`,
                { id: 'fetch-progress' }
              );
            }
          } else if (streamData.type === 'error' && streamData.email_id) {
            // Individual email error - log but continue
            console.error(`Error processing email ${streamData.email_id}:`, streamData.error);
          } else if (streamData.type === 'complete') {
            // Final result
            toast.dismiss('fetch-progress');
            const skipped = streamData.skipped || 0;
            const successCount = streamData.success_count || fetchedEmails.length;
            let message = streamData.message || `Fetched ${successCount} emails successfully`;
            
            // Add skipped info if there are skipped emails
            if (skipped > 0) {
              message += ` (${skipped} already fetched)`;
            }
            
            toast.success(message, { duration: 4000 });
          } else if (streamData.type === 'error' && !streamData.email_id) {
            // Global error
            toast.dismiss('fetch-progress');
            throw new Error(streamData.error || streamData.message || 'Failed to fetch emails');
          }
        });

      // Reload full list to ensure consistency
      await fetchEmails();
    } catch (error: any) {
      console.error("Error fetching new mail:", error);
      toast.dismiss('fetch-progress');
      const errorMessage = error.message || "Error fetching new mail";
      toast.error(errorMessage);
      
      // If unauthorized, clear user session
      if (errorMessage.includes('Unauthorized')) {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAuthenticated');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectnessChange = async (id: string, value: string) => {
    // Convert value to backend format ('none' instead of empty string)
    const correctnessValue = value === '' ? 'none' : value;
    
    // Optimistic update
    setEmails(prev => prev.map(e => 
      e.id === id 
        ? { ...e, correctness: correctnessValue === 'none' ? null : (correctnessValue as 'correct' | 'wrong' | null) } 
        : e
    ));

    try {
      // id is google_message_id from transformEmail
      await emailApi.updateCorrectness(id, correctnessValue as 'correct' | 'wrong' | 'none');
      toast.success("Status updated");
    } catch (error: any) {
      console.error("Error updating status:", error);
      const errorMessage = error.message || "Failed to update status";
      toast.error(errorMessage);
      // Revert on error - refetch emails
      fetchEmails(); 
    }
  };

  const handleLinkClick = async (id: string) => {
    try {
      // Record interaction when user clicks on email link
      await emailApi.updateInteraction(id);
      console.log("Interaction recorded for email:", id);
    } catch (error: any) {
      // Don't show error toast - just log it (interaction tracking is non-critical)
      console.error("Error recording interaction:", error);
    }
  };

  const handleLogin = async () => {
    try {
      // Check if Google Client ID is configured
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      console.log('Login attempt - Client ID:', clientId ? '✓ Configured' : '✗ Missing');
      console.log('Backend URL:', backendUrl || 'Not configured (will use frontend callback)');
      
      if (!clientId || clientId === 'your-google-client-id-here') {
        toast.error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
        console.error('❌ VITE_GOOGLE_CLIENT_ID is missing or not set correctly.');
        console.error('📝 Please create/update .env file with:');
        console.error('   VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id');
        console.error('   VITE_BACKEND_URL=http://localhost:8000');
        return;
      }

      // Start Google OAuth flow (will redirect to Google)
      console.log('🚀 Starting Google OAuth flow...');
      googleAuth.signIn();
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'Failed to start Google login');
    }
  };

  const handleLogout = async () => {
    try {
      // Logout from backend
      await googleAuth.logout();
    } catch (error) {
      console.error('Backend logout error:', error);
    }
    
    // Clear user data
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAuthenticated');
    setUser(null);
    toast.success("Logged out");
  };

  // Filtering
  const filteredEmails = filter === "all" 
    ? emails 
    : emails.filter(e => e.category === filter);

  return (
    <div className="min-h-screen w-full bg-[#F7F9FA] text-slate-900 font-sans">
      
      {/* Replaced Header with Figma Imported Navbar */}
      <NavbarLandingPage onLogin={handleLogin} user={user} onLogout={handleLogout} />

      {/* Main Grid Container - Max width ~1200px centered */}
      <div className="mx-auto max-w-[1200px] grid grid-cols-12 gap-6 p-6 pt-4">

        {/* Controls Row */}
        <FilterBar 
          filter={filter} 
          setFilter={setFilter} 
          onFetch={handleFetchMail} 
          loading={loading} 
          user={user} 
        />

        {/* Email Table Section */}
        <EmailsTable 
          loading={loading}
          emails={filteredEmails}
          user={user}
          onCorrectnessChange={handleCorrectnessChange}
          onLinkClick={handleLinkClick}
        />

        {/* Pagination Row */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalEmails}
          onPageChange={setCurrentPage}
        />

      </div>
    </div>
  );
};

export default MailSenseDashboard;
