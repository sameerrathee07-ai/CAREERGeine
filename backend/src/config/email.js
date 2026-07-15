import nodemailer from 'nodemailer';
import 'dotenv/config';
import logger from '../services/logger.js';

let transporter = null;

export function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;

  if (!host || !user) {
    logger.warn('Email not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS to enable emails.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user, pass: process.env.EMAIL_PASS },
  });

  return transporter;
}

export async function verifyTransporter() {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.verify();
    logger.info('Email transporter verified successfully');
    return true;
  } catch (error) {
    logger.error(`Email transporter verification failed: ${error.message}`);
    return false;
  }
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'CareerGenie <noreply@careergenie.ai>';

export function buildEmailPayload({ to, subject, text, html }) {
  return { from: EMAIL_FROM, to, subject, text, html };
}

export const templates = {
  welcome: (name) => ({
    subject: 'Welcome to CareerGenie!',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #4f46e5); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <span style="color: white; font-size: 20px; font-weight: bold;">CG</span>
          </div>
          <h1 style="color: #171717; font-size: 24px; margin: 0;">Welcome, ${name}!</h1>
        </div>
        <p style="color: #525252; line-height: 1.6;">Thank you for joining CareerGenie. We're excited to help you on your career journey.</p>
        <p style="color: #525252; line-height: 1.6;">Next steps:</p>
        <ul style="color: #525252; line-height: 1.6;">
          <li>Upload your resume for AI analysis</li>
          <li>Complete your profile</li>
          <li>Discover jobs matched to your skills</li>
        </ul>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">Go to Dashboard</a>
        </div>
      </div>`,
    text: `Welcome to CareerGenie, ${name}! Upload your resume, complete your profile, and discover jobs matched to your skills.`,
  }),

  resumeAnalyzed: (name, score) => ({
    subject: `Your Resume Analysis is Ready — Score: ${score}%`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #171717; font-size: 22px;">Resume Analysis Complete</h1>
        <p style="color: #525252;">Hi ${name},</p>
        <p style="color: #525252;">Your resume has been analyzed. Here's your score:</p>
        <div style="background: #f5f5f5; border-radius: 16px; padding: 24px; text-align: center; margin: 16px 0;">
          <div style="font-size: 48px; font-weight: bold; color: #4f46e5;">${score}%</div>
          <p style="color: #737373; margin: 4px 0;">Overall Resume Score</p>
        </div>
        <p style="color: #525252;">Log in to see detailed feedback and suggestions for improvement.</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/resume" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">View Analysis</a>
        </div>
      </div>`,
    text: `Your resume analysis is ready! Score: ${score}%. Log in to view detailed feedback.`,
  }),

  applicationStatus: (name, jobTitle, status) => ({
    subject: `Application ${status} — ${jobTitle}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #171717; font-size: 22px;">Application Update</h1>
        <p style="color: #525252;">Hi ${name},</p>
        <p style="color: #525252;">Your application for <strong>${jobTitle}</strong> has been <strong>${status}</strong>.</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/applications" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">View Applications</a>
        </div>
      </div>`,
    text: `Your application for ${jobTitle} has been ${status}. Log in to view details.`,
  }),

  newApplication: (recruiterName, candidateName, jobTitle) => ({
    subject: `New Application — ${jobTitle} from ${candidateName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #171717; font-size: 22px;">New Application Received</h1>
        <p style="color: #525252;">Hi ${recruiterName},</p>
        <p style="color: #525252;"><strong>${candidateName}</strong> has applied for <strong>${jobTitle}</strong>.</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/recruiter/applications" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">Review Application</a>
        </div>
      </div>`,
    text: `${candidateName} has applied for ${jobTitle}. Log in to review.`,
  }),

  passwordChanged: (name) => ({
    subject: 'Password Changed Successfully',
    html: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;"><h1 style="color: #171717; font-size: 22px;">Password Changed</h1><p style="color: #525252;">Hi ${name},</p><p style="color: #525252;">Your CareerGenie password was successfully changed. If you did not request this, please contact support immediately.</p></div>`,
    text: `Your CareerGenie password was changed. If you did not request this, contact support.`,
  }),

  accountSuspended: (name) => ({
    subject: 'Account Suspended',
    html: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;"><h1 style="color: #171717; font-size: 22px;">Account Suspended</h1><p style="color: #525252;">Hi ${name},</p><p style="color: #525252;">Your CareerGenie account has been suspended. Please contact support for more information.</p></div>`,
    text: `Your CareerGenie account has been suspended. Contact support for details.`,
  }),

  recruiterApproved: (name) => ({
    subject: 'Recruiter Account Approved',
    html: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;"><h1 style="color: #171717; font-size: 22px;">Account Approved</h1><p style="color: #525252;">Hi ${name},</p><p style="color: #525252;">Your recruiter account has been approved. You can now post jobs and manage candidates.</p><div style="text-align: center; margin-top: 24px;"><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/recruiter" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 500;">Go to Dashboard</a></div></div>`,
    text: `Your recruiter account has been approved. Post jobs and manage candidates now.`,
  }),

  supportTicket: (subject, message, fromName) => ({
    subject: `Support Request: ${subject}`,
    html: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;"><h1 style="color: #171717; font-size: 22px;">New Support Request</h1><p style="color: #525252;">From: ${fromName}</p><p style="color: #525252;">Subject: ${subject}</p><p style="color: #525252;">${message}</p></div>`,
    text: `Support request from ${fromName}: ${subject}\n\n${message}`,
  }),
};

export default {
  getTransporter,
  verifyTransporter,
  buildEmailPayload,
  templates,
};
