import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  buildBaseEmailLayout,
  renderGreeting,
  renderProcessSection,
  renderPlanSection,
  renderAssurancesSection,
  renderCallToAction
} from '@/lib/emailTemplates';

/**
 * Generates a luxury, high-converting HTML email template for the Kickstarter Publishing plan.
 */
function generateExecutiveProposalHtml(clientName: string, refId?: string): string {
  const year = new Date().getFullYear();
  const name = clientName && clientName.trim() ? clientName.trim() : 'Author';
  const refCode = refId || ('MPH-' + Date.now().toString(36).toUpperCase());

  const steps = [
    { num: '1', title: 'Select Plan & Order', desc: 'Select your preferred publishing plan & place your order.' },
    { num: '2', title: 'Submit Manuscript', desc: 'Submit your manuscript to our project team.' },
    { num: '3', title: 'Editing & Typesetting', desc: 'Professional editing, formatting, and typesetting.' },
    { num: '4', title: 'Cover Design', desc: 'Creating custom, eye-catching book cover design.' },
    { num: '5', title: 'Proofreading & Revision', desc: 'Final proofreading and revision for quality assurance.' },
    { num: '6', title: 'Global Publishing', desc: 'Official launch and distribution across worldwide platforms.' },
  ];

  const kickstarterFeatures = [
    "Professional Editing",
    "Professional Formatting according to International Publishing Standards",
    "Typesetting: e-book, Paperback & Hardcover",
    "Proofreading & Final Revision",
    "Experts' Feedback on the Manuscript",
    "Print-on-demand services - No limit on purchases",
    "Unlimited Revisions - Making endless changes",
    "Publication on 5 platforms (Amazon Kindle, IngramSpark, Barnes & Noble, Kobo, and Walmart)",
    "Customized Cover Design (front, spine and back)",
    "Author's Profile Creation and Book Profile",
    "Multiple Book Formats - e-book, Paperback & Hardcover",
    "ISBN and Barcode",
    "Dedicated Project Manager"
  ];

  const content = `
    ${renderGreeting(name)}
    ${renderProcessSection(steps)}
    ${renderPlanSection('Kickstarter Publishing Plan', '$699', kickstarterFeatures, 'kickstarter')}
    ${renderAssurancesSection()}
    ${renderCallToAction()}
  `;

  return buildBaseEmailLayout(content, year, refCode);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, from, subject, message, name } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, message: 'Recipient email ("to") is required.' },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.APP_PASSWORD || process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('SMTP Error: Missing SMTP environment variables.');
      return NextResponse.json(
        { success: false, message: 'SMTP server settings are missing in environment configuration.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const clientName = name || (typeof message === 'string' && message.match(/Dear\s+([^,]+)/i)?.[1]) || '';
    const refId = 'MPH-' + Date.now().toString(36).toUpperCase();

    const htmlTemplate = generateExecutiveProposalHtml(clientName, refId);

    const mailOptions = {
      from: `"Marketing & Publishing House" <${smtpUser}>`,
      to: to,
      replyTo: from || undefined,
      subject: subject || `Your Book Publishing Proposal - ${clientName || 'Author'} [${refId}]`,
      text: `Dear ${clientName || 'Author'},\n\nThank you for speaking with us. Please view your official publishing proposal (Ref: ${refId}) in HTML view.`,
      html: htmlTemplate,
      headers: {
        'X-Entity-Ref-ID': refId,
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Kickstarter executive proposal email sent successfully!'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email', error: String(error) },
      { status: 500 }
    );
  }
}
