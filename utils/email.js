const nodemailer = require('nodemailer');

/**
 * Create reusable transporter (Gmail SMTP).
 * Requires in .env:
 *   EMAIL_USER = your Gmail address (e.g. you@gmail.com)
 *   EMAIL_PASS = Gmail App Password (not your normal password).
 *                Create at: Google Account → Security → 2-Step Verification → App passwords
 */
function createTransporter() {
  const user = process.env.EMAIL_USER && process.env.EMAIL_USER.trim();
  const pass = process.env.EMAIL_PASS && process.env.EMAIL_PASS.trim();
  if (!user || !pass) {
    console.error('[Email] EMAIL_USER or EMAIL_PASS missing from .env');
    return null;
  }
  console.log('[Email] Creating transporter for:', user);
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Send an email. Does not throw; returns { success, error }.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 * @param {string} [text] - Plain text fallback
 */
async function sendEmail(to, subject, html, text = '') {
  const transporter = createTransporter();
  if (!transporter) {
    console.error('[Email] EMAIL_USER or EMAIL_PASS not set. Skipping send.');
    return { success: false, error: 'Email not configured' };
  }
  if (!to || !to.trim()) {
    console.error('[Email] No recipient address provided.');
    return { success: false, error: 'No recipient' };
  }
  try {
    const from = process.env.EMAIL_USER.trim();
    await transporter.sendMail({
      from: `"Rhyl Super Store" <${from}>`,
      to: to.trim(),
      subject,
      text: text || subject,
      html
    });
    return { success: true };
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Get subject and body for order status notification.
 * @param {string} status - 'confirmed' | 'delivered' | 'cancelled'
 * @param {string} [orderId] - Order ID for reference
 */
function getOrderStatusEmailContent(status, orderId = '') {
  const normalized = (status || '').toLowerCase();
  const idRef = orderId ? ` (Order #${orderId})` : '';
  const templates = {
    confirmed: {
      subject: 'Order Confirmed',
      message: 'Your order has been confirmed.',
      short: 'Order Confirmed'
    },
    delivered: {
      subject: 'Order Delivered',
      message: 'Your order has been delivered successfully.',
      short: 'Order Delivered'
    },
    cancelled: {
      subject: 'Order Cancelled',
      message: 'Your order has been cancelled.',
      short: 'Order Cancelled'
    }
  };
  const t = templates[normalized] || templates.confirmed;
  const html = getOrderStatusHtml(t.subject, t.message, orderId);
  const text = `${t.subject}${idRef}\n\n${t.message}`;
  return { subject: t.subject + idRef, html, text };
}

/**
 * Simple HTML email template for order status.
 */
function getOrderStatusHtml(subject, message, orderId) {
  const orderRef = orderId ? `<p style="margin: 12px 0 0 0; font-size: 14px; color: #64748b;">Order reference: #${orderId}</p>` : '';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <tr>
      <td style="padding: 32px 24px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Rhyl Super Store</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${subject}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 24px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #334155;">${message}</p>
        ${orderRef}
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">This is an automated message from Rhyl Super Store.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = {
  createTransporter,
  sendEmail,
  getOrderStatusEmailContent
};
