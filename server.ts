import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing (supports compressed base64 device image uploads)
app.use(express.json({ limit: '10mb' }));

// Supabase backend client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fttrvueobakkskoccvvm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rBLUw3GHuQ5iZk9TdrctLw_q2E3ir-O';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to instantiate Gmail SMTP transporter
const getGmailTransporter = () => {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

// 1. Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1b. Supabase Database Status Route (All 7 required tables)
app.get('/api/database/status', async (_req: Request, res: Response) => {
  const tables = [
    'profiles',
    'recycle_requests',
    'tracking_events',
    'eco_transactions',
    'collection_centres',
    'marketplace_listings',
    'impact_metrics'
  ];

  const results: Record<string, any> = {};
  let allReady = true;

  for (const name of tables) {
    try {
      const { data, error } = await supabase
        .from(name)
        .select('*')
        .limit(1);

      if (!error) {
        // Query count
        const countRes = await supabase.from(name).select('*', { count: 'exact', head: true });
        results[name] = { exists: true, count: countRes.count ?? (data ? data.length : 0) };
      } else {
        allReady = false;
        results[name] = { exists: false, count: 0, error: error.message };
      }
    } catch (e: any) {
      allReady = false;
      results[name] = { exists: false, count: 0, error: e?.message };
    }
  }

  res.json({
    connected: true,
    supabaseUrl: SUPABASE_URL,
    projectId: 'fttrvueobakkskoccvvm',
    allTablesReady: allReady,
    tables: results,
    sqlEditorUrl: 'https://supabase.com/dashboard/project/fttrvueobakkskoccvvm/sql'
  });
});

// 1c. Serve the Complete Supabase SQL Schema
app.get('/api/database/schema-sql', (_req: Request, res: Response) => {
  try {
    const sqlPath = path.resolve(__dirname, 'supabase_schema.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(sqlContent);
      return;
    }
    res.status(404).json({ error: 'supabase_schema.sql not found on server' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error reading schema' });
  }
});

// 2. Gmail SMTP status endpoint
app.get('/api/smtp-status', (_req: Request, res: Response) => {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  const isConfigured = Boolean(user && pass);

  let maskedUser: string | null = null;
  if (user) {
    const parts = user.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      maskedUser = `${name.slice(0, 3)}***@${parts[1]}`;
    } else {
      maskedUser = 'configured';
    }
  }

  res.json({
    configured: isConfigured,
    service: 'Gmail SMTP',
    maskedUser,
    instructions: !isConfigured
      ? 'To enable live email dispatch through Gmail, set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.'
      : 'Gmail SMTP is configured and ready for live email dispatch.'
  });
});

// 3. Send Partner Credentials endpoint
interface SendCredentialsRequest {
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

app.post('/api/send-partner-credentials', async (req: Request, res: Response) => {
  try {
    const {
      to,
      shopName,
      name,
      type,
      username,
      temporaryPassword,
      loginUrl = `${process.env.APP_URL || 'http://localhost:3000'}`,
      phone,
      address
    } = req.body as SendCredentialsRequest;

    if (!to || !to.includes('@')) {
      res.status(400).json({
        success: false,
        error: 'A valid recipient email address is required.'
      });
      return;
    }

    if (!username || !temporaryPassword) {
      res.status(400).json({
        success: false,
        error: 'Username and temporary password are required.'
      });
      return;
    }

    const roleTitle = type === 'Repairer' ? 'Certified Repairer' : 'Certified Recycler';
    const portalLabel = type === 'Repairer' ? 'Repair & Refurbish Hub' : 'Recycler Operations Portal';
    const subject = `🎉 Approved: Your ${roleTitle} Login Credentials — E-Cycle AI Platform`;

    // Rich HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f4f6f5;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8e5;
    }
    .header {
      background: linear-gradient(135deg, #090d0b 0%, #111e17 100%);
      padding: 32px 28px;
      text-align: left;
      border-bottom: 3px solid #10b981;
    }
    .badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.18);
      color: #34d399;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid #10b981;
      margin-bottom: 12px;
    }
    .header h1 {
      color: #ffffff;
      font-size: 22px;
      margin: 0 0 6px 0;
      font-weight: 700;
    }
    .header p {
      color: #9ca3af;
      font-size: 13px;
      margin: 0;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      color: #111827;
      margin-bottom: 16px;
    }
    .credentials-box {
      background: #090d0b;
      color: #ffffff;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      border: 1px solid #1f2923;
    }
    .credentials-box h3 {
      color: #10b981;
      margin: 0 0 14px 0;
      font-size: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .cred-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #1c2720;
      font-size: 13px;
    }
    .cred-row:last-child {
      border-bottom: none;
    }
    .cred-label {
      color: #9ca3af;
    }
    .cred-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      color: #34d399;
      background: #111a14;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #1b3829;
    }
    .steps {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 18px 20px;
      margin: 20px 0;
    }
    .steps h4 {
      margin: 0 0 10px 0;
      color: #166534;
      font-size: 14px;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
      color: #15803d;
      font-size: 13px;
    }
    .steps li {
      margin-bottom: 6px;
    }
    .cta-btn {
      display: inline-block;
      background: #10b981;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 8px;
      margin: 16px 0;
      text-align: center;
    }
    .warning {
      font-size: 12px;
      color: #b45309;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 16px;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 28px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">UN SDG 12 · Verified Partner Program</div>
      <h1>Registration Approved!</h1>
      <p>Official Access Credentials for ${shopName}</p>
    </div>

    <div class="content">
      <div class="greeting">
        Hello <strong>${name}</strong>,
      </div>
      <p style="font-size: 14px; color: #374151; margin-bottom: 18px;">
        Congratulations! Your registration request for <strong>${shopName}</strong> has been officially approved by the Platform Administrator as a certified <strong>${type}</strong> on the E-Cycle AI Smart E-Waste Management Network.
      </p>

      <div class="credentials-box">
        <h3>🔐 Your Login Credentials</h3>
        <div class="cred-row">
          <span class="cred-label">Authorized Role</span>
          <span class="cred-val">${roleTitle}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Username / Login ID</span>
          <span class="cred-val">${username}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Temporary Password</span>
          <span class="cred-val">${temporaryPassword}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Portal Destination</span>
          <span class="cred-val">${portalLabel}</span>
        </div>
      </div>

      <div class="steps">
        <h4>📋 Next Steps to Get Started:</h4>
        <ol>
          <li>Click the button below to open the E-Cycle AI Portal.</li>
          <li>Select the <strong>${type === 'Repairer' ? 'Repair' : 'Recycler'}</strong> tab or open the Partner Login dialog.</li>
          <li>Enter your <strong>Username</strong> (<code>${username}</code>) and your <strong>Temporary Password</strong>.</li>
          <li><strong>Important Security Instruction:</strong> For account security and institutional compliance, please change your temporary password immediately upon your first sign-in.</li>
          <li>Once logged in, you can start receiving, reviewing, and accepting live pickup requests submitted by citizens.</li>
        </ol>
      </div>

      <div style="text-align: center;">
        <a href="${loginUrl}" class="cta-btn" target="_blank">Access Partner Portal →</a>
      </div>

      <div class="warning">
        ⚠️ <strong>Security Notice:</strong> Do not share these credentials with unauthorized personnel. Only authorized staff at ${shopName} are licensed under the UN SDG 12 responsible e-waste chain of custody.
      </div>
    </div>

    <div class="footer">
      <p>E-Cycle AI Smart E-Waste Management & Resource Recovery Platform</p>
      <p>In partnership with the UN Sustainable Development Goal 12 Directorate</p>
      <p>This automated message was sent from platform admin to ${to}.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Plain text alternative
    const textContent = `
Hello ${name},

Congratulations! Your registration request for ${shopName} has been officially approved by the Platform Administrator as a certified ${type} on the E-Cycle AI Smart E-Waste Management Network.

YOUR LOGIN CREDENTIALS:
- Role: ${roleTitle}
- Username: ${username}
- Temporary Password: ${temporaryPassword}
- Portal URL: ${loginUrl}

INSTRUCTIONS:
1. Open the E-Cycle AI Portal: ${loginUrl}
2. Select the ${type} role or open Partner Login.
3. Sign in using the credentials above.
4. IMPORTANT: Please change your temporary password immediately upon first sign-in for security compliance.
5. Once authenticated, you will be able to review and accept incoming citizen pickup requests.

UN SDG 12 Responsible E-Waste Platform
Admin Directorate
    `.trim();

    const transporter = getGmailTransporter();

    if (transporter) {
      // Send real email via Gmail SMTP
      const info = await transporter.sendMail({
        from: `"E-Cycle AI Admin" <${process.env.GMAIL_USER?.trim()}>`,
        to: to.trim(),
        subject,
        text: textContent,
        html: htmlContent
      });

      console.log(`[Gmail SMTP] Email successfully sent to ${to}. MessageId: ${info.messageId}`);

      res.json({
        success: true,
        emailSent: true,
        messageId: info.messageId,
        recipient: to,
        provider: 'Gmail SMTP',
        message: `Login credentials successfully delivered to ${to} via Gmail SMTP.`
      });
      return;
    }

    // Fallback: If GMAIL_USER/GMAIL_APP_PASSWORD not set in environment yet,
    // simulate delivery cleanly and return preview details so testing works immediately.
    console.log(`[Gmail SMTP Dev] GMAIL_USER / GMAIL_APP_PASSWORD not set in .env. Simulating email send to ${to}`);
    res.json({
      success: true,
      emailSent: false,
      simulated: true,
      recipient: to,
      credentials: {
        username,
        temporaryPassword
      },
      message: `Credentials generated! Simulated email prepared for ${to}. To send via live Gmail SMTP, set GMAIL_USER and GMAIL_APP_PASSWORD in .env.`
    });
  } catch (error: any) {
    console.error('[Gmail SMTP Error] Failed to send credentials email:', error);
    res.status(500).json({
      success: false,
      emailSent: false,
      error: error?.message || 'Failed to send email via Gmail SMTP.',
      details: 'Please check your GMAIL_USER and GMAIL_APP_PASSWORD settings.'
    });
  }
});

/* ============================================================================
   E-WASTE PICKUP REQUESTS FULL-STACK REST API
   (Guaranteed backend persistence & multi-role sync between Citizen, Recycler, Admin)
   ============================================================================ */

const REQUESTS_FILE = path.resolve(__dirname, 'data', 'recycle_requests.json');

const loadServerRequests = (): any[] => {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const content = fs.readFileSync(REQUESTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('[Server] Error reading server requests file:', err);
  }
  return [];
};

const saveServerRequests = (requests: any[]): void => {
  try {
    const dir = path.dirname(REQUESTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Error saving server requests file:', err);
  }
};

const formatRequest = (item: any) => {
  const aiDiagnosis = item.ai_diagnosis || item.aiDiagnosis || undefined;
  const deviceImage =
    item.device_image ||
    item.deviceImage ||
    aiDiagnosis?.uploadedImage ||
    aiDiagnosis?.imageUrl ||
    undefined;
  const deviceImageName =
    item.device_image_name ||
    item.deviceImageName ||
    aiDiagnosis?.uploadedImageName ||
    undefined;
  const submittedAt = item.submittedAt || item.created_at || item.createdAt || new Date().toISOString();

  return {
    id: item.id,
    userId: item.user_id || item.userId || 'usr_citizen_01',
    userName: item.user_name || item.userName || 'Anonymous',
    userEmail: item.user_email || item.userEmail || '',
    userPhone: item.user_phone || item.userPhone || '',
    deviceCategory: item.device_category || item.deviceCategory || 'Laptops',
    brand: item.brand || '',
    model: item.model || '',
    quantity: Number(item.quantity || 1),
    condition: item.condition || 'working',
    pickupType: item.pickup_type || item.pickupType || 'home_pickup',
    address: item.address || '',
    centreId: item.centre_id || item.centreId || undefined,
    centreName: item.centre_name || item.centreName || undefined,
    preferredDate: item.preferred_date || item.preferredDate || '',
    timeSlot: item.time_slot || item.timeSlot || '',
    disposalPreference: item.disposal_preference || item.disposalPreference || 'recycle',
    notes: item.notes || undefined,
    serialNumber: item.serial_number || item.serialNumber || undefined,
    status: item.status || 'submitted',
    trackingUpdates: Array.isArray(item.tracking_updates)
      ? item.tracking_updates
      : Array.isArray(item.trackingUpdates)
      ? item.trackingUpdates
      : [],
    ecoPointsAwarded: Number(item.eco_points_awarded || item.ecoPointsAwarded || 100),
    estimatedWeightKg: Number(item.estimated_weight_kg || item.estimatedWeightKg || 1.5),
    verifiedWeightKg: item.verified_weight_kg !== undefined && item.verified_weight_kg !== null
      ? Number(item.verified_weight_kg)
      : (item.verifiedWeightKg !== undefined && item.verifiedWeightKg !== null ? Number(item.verifiedWeightKg) : undefined),
    recoveredGoldGrams: Number(item.recovered_gold_grams || item.recoveredGoldGrams || 0),
    recoveredCopperKg: Number(item.recovered_copper_kg || item.recoveredCopperKg || 0),
    assignedPartnerId: item.assigned_partner_id || item.assignedPartnerId || undefined,
    assignedPartnerName: item.assigned_partner_name || item.assignedPartnerName || undefined,
    aiDiagnosis,
    deviceImage,
    deviceImageName,
    submittedAt,
    dataPrivacyAcknowledged: Boolean(item.data_privacy_acknowledged ?? item.dataPrivacyAcknowledged ?? true),
    batterySafeHandlingAcknowledged: Boolean(item.battery_safe_handling_acknowledged ?? item.batterySafeHandlingAcknowledged ?? true),
    qrCodeToken: item.qr_code_token || item.qrCodeToken || `ECY-QR-${item.id}`,
    createdAt: item.createdAt || item.created_at || submittedAt
  };
};

// 4a. POST /api/requests - Create and register new citizen pickup request
app.post('/api/requests', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = body.id || `ECY-2026-${randomNum}`;
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const initialTracking = [
      {
        stage: 'submitted',
        title: 'Request Registered & Queued',
        description: `Pickup request filed for ${body.quantity || 1}x ${body.brand || 'Device'} ${body.model || ''}. Handover initialized.`,
        timestamp: timeStr,
        location: body.pickupType === 'centre_dropoff' ? (body.centreName || 'Campus Depot') : 'Citizen Address'
      }
    ];

    const submittedIso = body.submittedAt || now.toISOString();

    const newRequest = formatRequest({
      ...body,
      id: newId,
      status: body.status || 'submitted',
      trackingUpdates: Array.isArray(body.trackingUpdates) && body.trackingUpdates.length > 0 ? body.trackingUpdates : initialTracking,
      qrCodeToken: body.qrCodeToken || `ECY-QR-${randomNum}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: body.createdAt || timeStr,
      submittedAt: submittedIso,
      deviceImage: body.deviceImage,
      deviceImageName: body.deviceImageName
    });

    // 1. Save to local server file cache immediately
    const serverRequests = loadServerRequests();
    const existingIndex = serverRequests.findIndex(r => r.id === newRequest.id);
    if (existingIndex >= 0) {
      serverRequests[existingIndex] = newRequest;
    } else {
      serverRequests.unshift(newRequest);
    }
    saveServerRequests(serverRequests);

    // 2. Upsert into Supabase recycle_requests table
    let syncedWithSupabase = false;
    let supabaseError: string | null = null;
    try {
      const aiDiagnosisPayload =
        newRequest.aiDiagnosis || newRequest.deviceImage || newRequest.deviceImageName
          ? {
              ...(newRequest.aiDiagnosis || {}),
              ...(newRequest.deviceImage ? { uploadedImage: newRequest.deviceImage } : {}),
              ...(newRequest.deviceImageName ? { uploadedImageName: newRequest.deviceImageName } : {})
            }
          : null;

      const dbRow = {
        id: newRequest.id,
        user_id: newRequest.userId,
        user_name: newRequest.userName,
        user_email: newRequest.userEmail,
        user_phone: newRequest.userPhone,
        device_category: newRequest.deviceCategory,
        brand: newRequest.brand,
        model: newRequest.model,
        quantity: newRequest.quantity,
        condition: newRequest.condition,
        pickup_type: newRequest.pickupType,
        address: newRequest.address,
        centre_id: newRequest.centreId || null,
        centre_name: newRequest.centreName || null,
        preferred_date: newRequest.preferredDate,
        time_slot: newRequest.timeSlot,
        disposal_preference: newRequest.disposalPreference,
        notes: newRequest.notes || null,
        serial_number: newRequest.serialNumber || null,
        status: newRequest.status,
        eco_points_awarded: newRequest.ecoPointsAwarded,
        estimated_weight_kg: newRequest.estimatedWeightKg,
        verified_weight_kg: newRequest.verifiedWeightKg || null,
        tracking_updates: newRequest.trackingUpdates || [],
        ai_diagnosis: aiDiagnosisPayload,
        data_privacy_acknowledged: Boolean(newRequest.dataPrivacyAcknowledged ?? true),
        battery_safe_handling_acknowledged: Boolean(newRequest.batterySafeHandlingAcknowledged ?? true),
        qr_code_token: newRequest.qrCodeToken || `ECY-QR-${newRequest.id}`,
        created_at: submittedIso,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('recycle_requests').upsert([dbRow], { onConflict: 'id' });
      if (!error) {
        syncedWithSupabase = true;
      } else {
        supabaseError = error.message;
        console.warn('[Server] Supabase insert warning:', error.message);
      }
    } catch (dbErr: any) {
      supabaseError = dbErr?.message;
      console.warn('[Server] Supabase connection error:', dbErr?.message);
    }

    console.log(`[Server] Request ${newRequest.id} received and stored. Synced to Supabase: ${syncedWithSupabase}`);

    res.status(201).json({
      success: true,
      request: newRequest,
      syncedWithSupabase,
      supabaseError
    });
  } catch (err: any) {
    console.error('[Server] Failed to handle POST /api/requests:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error saving request' });
  }
});

// 4b. GET /api/requests - Get all requests (merged Supabase + Server Cache)
app.get('/api/requests', async (req: Request, res: Response) => {
  try {
    const { userId, disposalPreference, status } = req.query;

    const fileRequests = loadServerRequests().map(formatRequest);
    const requestsMap = new Map<string, any>();
    fileRequests.forEach(r => requestsMap.set(r.id, r));

    // Preserve locally stored image/timestamp if Supabase row came back without uploadedImage
    try {
      const { data, error } = await supabase.from('recycle_requests').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        data.forEach(row => {
          const formatted = formatRequest(row);
          const existing = requestsMap.get(formatted.id);
          requestsMap.set(formatted.id, existing ? {
            ...existing,
            ...formatted,
            deviceImage: formatted.deviceImage || existing.deviceImage,
            deviceImageName: formatted.deviceImageName || existing.deviceImageName,
            submittedAt: formatted.submittedAt || existing.submittedAt
          } : formatted);
        });
      }
    } catch (dbErr) {
      console.warn('[Server] Could not query Supabase in GET /api/requests:', dbErr);
    }

    let all = Array.from(requestsMap.values());

    // Apply optional filters
    if (userId && typeof userId === 'string') {
      all = all.filter(r => r.userId === userId);
    }
    if (disposalPreference && typeof disposalPreference === 'string') {
      all = all.filter(r => r.disposalPreference === disposalPreference);
    }
    if (status && typeof status === 'string') {
      all = all.filter(r => r.status === status);
    }

    // Sort descending by date
    all.sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime());

    res.json({
      success: true,
      count: all.length,
      requests: all
    });
  } catch (err: any) {
    console.error('[Server] Failed to handle GET /api/requests:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error loading requests' });
  }
});

// 4c. PATCH /api/requests/:id - Advance stage / update status / assign partner
app.patch('/api/requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    const serverRequests = loadServerRequests();
    const index = serverRequests.findIndex(r => r.id === id);

    let current = index >= 0 ? serverRequests[index] : null;

    if (!current) {
      const { data } = await supabase.from('recycle_requests').select('*').eq('id', id).maybeSingle();
      if (data) {
        current = formatRequest(data);
      }
    }

    if (!current) {
      return res.status(404).json({ success: false, error: `Request ${id} not found` });
    }

    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const stageTitles: Record<string, string> = {
      submitted: 'Your Request Has Been Submitted',
      verified: 'Your Request Has Been Verified',
      assigned: 'Your Request Has Been Accepted',
      scheduled: 'Your Request Has Been Assigned to Crew',
      collected: 'Your Device Has Been Collected',
      processing: 'Your Device Is Being Processed',
      completed: 'Your Recycling Has Been Certified',
      cancelled: 'Your Request Has Been Cancelled'
    };

    const newStage = updates.status || current.status;
    const existingTracking = Array.isArray(current.trackingUpdates) ? current.trackingUpdates : [];

    let updatedTracking = [...existingTracking];
    if (updates.status && updates.status !== current.status) {
      updatedTracking.unshift({
        stage: updates.status,
        title: stageTitles[updates.status] || `Stage updated to ${updates.status}`,
        description: updates.notes || `Pipeline stage advanced by ${updates.assignedPartnerName || updates.updatedBy || 'Operations Team'}.`,
        timestamp: timeStr,
        location: updates.assignedPartnerName || current.centreName || 'Operations Processing Facility'
      });
    }

    const updatedRequest = formatRequest({
      ...current,
      ...updates,
      status: newStage,
      trackingUpdates: updatedTracking,
      verifiedWeightKg: updates.verifiedWeightKg !== undefined ? updates.verifiedWeightKg : current.verifiedWeightKg,
      assignedPartnerId: updates.assignedPartnerId !== undefined ? updates.assignedPartnerId : current.assignedPartnerId,
      assignedPartnerName: updates.assignedPartnerName !== undefined ? updates.assignedPartnerName : current.assignedPartnerName
    });

    if (index >= 0) {
      serverRequests[index] = updatedRequest;
    } else {
      serverRequests.unshift(updatedRequest);
    }
    saveServerRequests(serverRequests);

    // Sync update to Supabase
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.verifiedWeightKg !== undefined) dbUpdates.verified_weight_kg = updates.verifiedWeightKg;
      if (updates.assignedPartnerId) dbUpdates.assigned_partner_id = updates.assignedPartnerId;
      if (updates.assignedPartnerName) dbUpdates.assigned_partner_name = updates.assignedPartnerName;
      dbUpdates.tracking_updates = updatedTracking;

      await supabase.from('recycle_requests').update(dbUpdates).eq('id', id);
    } catch (dbErr) {
      console.warn('[Server] Supabase update warning in PATCH:', dbErr);
    }

    res.json({
      success: true,
      request: updatedRequest
    });
  } catch (err: any) {
    console.error('[Server] Failed to handle PATCH /api/requests/:id:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error updating request' });
  }
});

// 4d. GET /api/requests/:id - Single request lookup
app.get('/api/requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const serverRequests = loadServerRequests();
    let found = serverRequests.find(r => r.id === id);

    if (!found) {
      const { data } = await supabase.from('recycle_requests').select('*').eq('id', id).maybeSingle();
      if (data) {
        found = formatRequest(data);
      }
    }

    if (!found) {
      return res.status(404).json({ success: false, error: `Request ${id} not found` });
    }

    res.json({ success: true, request: formatRequest(found) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// Setup dev server with Vite middleware or static production build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 E-Cycle AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
