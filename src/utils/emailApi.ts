// Email API Service - Calls backend API
import { Email } from '../components/dashboard/constants';

const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || '';
};

// Transform backend email format to frontend Email format
const transformEmail = (backendEmail: any): Email => {
  return {
    id: backendEmail.google_message_id || backendEmail.id,
    sender: backendEmail.from_name || backendEmail.from_address || 'Unknown',
    subject: backendEmail.subject || '(No Subject)',
    preview: backendEmail.body_text?.substring(0, 100) || 'No preview available',
    category: backendEmail.category || 'Others',
    purpose: backendEmail.purpose || 'Other',
    date: backendEmail.received_at || backendEmail.fetched_at || new Date().toISOString(),
    link: `https://mail.google.com/mail/u/0/#inbox/${backendEmail.google_message_id}`,
    correctness: backendEmail.correctness === 'none' ? null : (backendEmail.correctness as 'correct' | 'wrong' | null),
  };
};

// Email API functions
export const emailApi = {
  // Fetch emails from Gmail API via backend (Streaming)
  fetchMail: async (
    onProgress?: (data: {
      type: 'start' | 'email' | 'error' | 'complete';
      data?: any;
      progress?: { current: number; total: number };
      message?: string;
      error?: string;
      success?: boolean;
      count?: number;
      total_processed?: number;
      success_count?: number;
      fail_count?: number;
      skipped?: number;
      total?: number;
      email_id?: string;
    }) => void
  ): Promise<{ success: boolean; message: string; count: number; skipped?: number }> => {
    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      throw new Error('Backend URL is not configured');
    }

    const response = await fetch(`${backendUrl}/api/mails/fetch`, {
      method: 'POST',
      credentials: 'include', // Important: include cookies for access_token
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch emails' }));
      throw new Error(errorData.error || errorData.message || 'Failed to fetch emails');
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult: any = null;

    if (!reader) {
      throw new Error('Streaming not supported');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines (each JSON object is on a separate line)
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              
              // Call progress callback if provided
              if (onProgress) {
                onProgress(data);
              }

              // Store final result
              if (data.type === 'complete') {
                finalResult = data;
              } else if (data.type === 'error' && !data.email_id) {
                // Global error
                throw new Error(data.error || data.message || 'Unknown error');
              }
            } catch (parseError) {
              console.error('Error parsing JSON chunk:', parseError, 'Line:', line);
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (onProgress) {
            onProgress(data);
          }
          if (data.type === 'complete') {
            finalResult = data;
          }
        } catch (parseError) {
          console.error('Error parsing final buffer:', parseError);
        }
      }

      if (!finalResult) {
        throw new Error('No completion message received from server');
      }

      return {
        success: finalResult.success || false,
        message: finalResult.message || 'Emails fetched successfully',
        count: finalResult.success_count || finalResult.count || 0,
        skipped: finalResult.skipped || 0,
      };
    } catch (error: any) {
      console.error('Streaming error:', error);
      throw error;
    }
  },

  // Get all emails from backend
  getEmails: async (options?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ emails: Email[]; pagination?: any }> => {
    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      throw new Error('Backend URL is not configured');
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('search', options.search);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

    const queryString = params.toString();
    const url = `${backendUrl}/api/mails${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login');
      }
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch emails' }));
      throw new Error(errorData.error || errorData.message || 'Failed to fetch emails');
    }

    const result = await response.json();
    
    // Backend returns: { success: true, data: [...], pagination: {...} }
    const emails = result.data || result.emails || [];
    
    // Transform backend emails to frontend format
    const transformedEmails = emails.map(transformEmail).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      emails: transformedEmails,
      pagination: result.pagination
    };
  },

  // Update email correctness
  updateCorrectness: async (messageId: string, correctness: 'correct' | 'wrong' | 'none'): Promise<Email> => {
    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      throw new Error('Backend URL is not configured');
    }

    console.log('Updating correctness:', { messageId, correctness });

    const response = await fetch(`${backendUrl}/api/mails/correctness`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message_id: messageId,
        correctness: correctness 
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login');
      }
      if (response.status === 404) {
        throw new Error('Email not found or you do not have permission to update it');
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({ error: 'Invalid request' }));
        throw new Error(errorData.error || 'Invalid request');
      }
      const errorData = await response.json().catch(() => ({ error: 'Failed to update email' }));
      throw new Error(errorData.error || errorData.message || 'Failed to update email');
    }

    const result = await response.json();
    console.log('Update correctness result:', result);
    // Backend returns: { success: true, message: '...', data: {...} }
    return transformEmail(result.data || result);
  },

  // Update interaction when user clicks on email link
  updateInteraction: async (messageId: string): Promise<void> => {
    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      throw new Error('Backend URL is not configured');
    }

    console.log('Updating interaction:', { messageId });

    const response = await fetch(`${backendUrl}/api/mails/interaction`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message_id: messageId
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login');
      }
      if (response.status === 404) {
        throw new Error('Email not found');
      }
      const errorData = await response.json().catch(() => ({ error: 'Failed to update interaction' }));
      throw new Error(errorData.error || errorData.message || 'Failed to update interaction');
    }

    const result = await response.json();
    console.log('Update interaction result:', result);
  },
};

