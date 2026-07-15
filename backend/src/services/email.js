import { db, Timestamp } from '../config/firebase.js';
import { getTransporter, buildEmailPayload, templates, verifyTransporter } from '../config/email.js';
import logger from './logger.js';

let transporterReady = false;

export async function initEmail() {
  transporterReady = await verifyTransporter();
}

export async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    logger.warn(`Email not sent (unconfigured): ${subject} -> ${to}`);
    return false;
  }

  try {
    const payload = buildEmailPayload({ to, subject, text, html });
    await transporter.sendMail(payload);
    logger.info(`Email sent: ${subject} -> ${to}`);
    return true;
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
    return false;
  }
}

export async function sendNotification({ userId, type, title, message, data = {} }) {
  // Always save to Firestore notifications collection
  const notifRef = db.collection('notifications').doc();
  await notifRef.set({
    userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: Timestamp.now(),
  });

  // Send email if user has email notifications enabled
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const user = userDoc.data();
      if (user.preferences?.notifications?.email !== false && user.email) {
        await sendEmail({
          to: user.email,
          subject: title,
          text: message,
        });
      }
    }
  } catch (error) {
    logger.error(`Failed to send notification email to ${userId}: ${error.message}`);
  }

  return notifRef.id;
}

export async function notifyUser(userId, type, title, message, data = {}) {
  return sendNotification({ userId, type, title, message, data });
}

export async function sendWelcomeEmail(email, name) {
  const tpl = templates.welcome(name);
  return sendEmail({ to: email, ...tpl });
}

export async function sendResumeAnalyzedEmail(email, name, score) {
  const tpl = templates.resumeAnalyzed(name, score);
  return sendEmail({ to: email, ...tpl });
}

export async function sendApplicationStatusEmail(email, name, jobTitle, status) {
  const tpl = templates.applicationStatus(name, jobTitle, status);
  return sendEmail({ to: email, ...tpl });
}

export async function sendNewApplicationEmail(email, recruiterName, candidateName, jobTitle) {
  const tpl = templates.newApplication(recruiterName, candidateName, jobTitle);
  return sendEmail({ to: email, ...tpl });
}

export async function sendPasswordChangedEmail(email, name) {
  const tpl = templates.passwordChanged(name);
  return sendEmail({ to: email, ...tpl });
}

export async function sendAccountSuspendedEmail(email, name) {
  const tpl = templates.accountSuspended(name);
  return sendEmail({ to: email, ...tpl });
}

export async function sendRecruiterApprovedEmail(email, name) {
  const tpl = templates.recruiterApproved(name);
  return sendEmail({ to: email, ...tpl });
}

export default {
  initEmail,
  sendEmail,
  sendNotification,
  notifyUser,
  sendWelcomeEmail,
  sendResumeAnalyzedEmail,
  sendApplicationStatusEmail,
  sendNewApplicationEmail,
  sendPasswordChangedEmail,
  sendAccountSuspendedEmail,
  sendRecruiterApprovedEmail,
};
