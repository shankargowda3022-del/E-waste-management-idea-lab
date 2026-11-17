export interface SendCredentialsPayload {
  to: string;
  shopName: string;
  name: string;
  type: 'Recycler' | 'Repairer';
  username: string;
  temporaryPassword: string;
  loginUrl?: string;
  phone?: string;
  address?: string;
}

export interface SendCredentialsResult {
  success: boolean;
  emailSent: boolean;
  simulated?: boolean;
  messageId?: string;
  recipient?: string;
  message?: string;
  error?: string;
  details?: string;
}

export interface SmtpStatusResult {
  configured: boolean;
  service: string;
  maskedUser: string | null;
  instructions: string;
}

/**
 * Sends login credentials to the approved partner via the backend Gmail SMTP endpoint.
 */
export async function sendPartnerCredentialsEmail(
  payload: SendCredentialsPayload
): Promise<SendCredentialsResult> {
  try {
    const response = await fetch('/api/send-partner-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        emailSent: false,
        error: data.error || `Server responded with error status ${response.status}`,
        details: data.details
      };
    }

    return {
      success: true,
      emailSent: data.emailSent ?? false,
      simulated: data.simulated ?? false,
      messageId: data.messageId,
      recipient: data.recipient || payload.to,
      message: data.message || 'Credentials email processed successfully.'
    };
  } catch (err: any) {
    console.error('[emailService] Network or unexpected error calling /api/send-partner-credentials:', err);
    return {
      success: false,
      emailSent: false,
      error: err?.message || 'Network error communicating with Gmail SMTP server'
    };
  }
}

/**
 * Queries the current Gmail SMTP configuration status from the backend.
 */
export async function checkSmtpStatus(): Promise<SmtpStatusResult> {
  try {
    const response = await fetch('/api/smtp-status');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    return {
      configured: false,
      service: 'Gmail SMTP',
      maskedUser: null,
      instructions: 'Could not contact server to verify Gmail SMTP configuration.'
    };
  }
}
