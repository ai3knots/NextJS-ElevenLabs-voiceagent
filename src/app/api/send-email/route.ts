import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Generates a luxury, high-converting HTML email template for book publishing proposals.
 */
function generateExecutiveProposalHtml(clientName: string, refId?: string, priceVisible: boolean = true): string {
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

  const nationwideFeatures = [
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
    "Premium ISBN and Barcode",
    "Dedicated Project Manager"
  ];

  const globalFeatures = [
    "Professional Editing",
    "Professional Formatting according to International Publishing Standards",
    "Typesetting: e-book, Paperback and Hardcover",
    "Professional Proofreading & Final Revision",
    "Authors Central Page: Author Intro on the Platform for Branding",
    "Book Profile & Summary Discussion",
    "Print-on-demand services - No limit of purchase",
    "Book Categorization & Optimization",
    "Keyword Enhancement, Integration, and Optimization",
    "Publishing on 10 Platforms (Barnes & Noble, Amazon, IngramSpark, Google Books, Apple Books, Books Express, KOBO, Draft2Digital, Chapters Indigo, Walmart)",
    "Customized Cover Design (front, spine and back)",
    "Multiple Book Formats: eBook, Paperback & Hardcover",
    "Unlimited Revisions",
    "ISBN and Barcode Assignment",
    "Dedicated Project Manager Support",
    "Copyright Registration"
  ];

  const renderFeatureList = (features: string[]) => `
    <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
      ${features.map(feat => `<li style="margin-bottom: 4px;">${feat}</li>`).join('')}
    </ul>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Book Publishing Proposal - Marketing & Publishing House</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #cbd5e1;">
          
          <!-- Website Matching Header Banner -->
          <tr>
            <td style="background: #0b0f19; padding: 28px 24px; border-bottom: 4px solid #f59e0b;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="middle">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px;">
                          <div style="background: #f59e0b; color: #000000; font-size: 18px; font-weight: 900; padding: 6px 10px; border-radius: 6px; letter-spacing: 0.5px;">
                            MPH
                          </div>
                        </td>
                        <td valign="middle">
                          <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.3px;">
                            Marketing & Publishing House
                          </h1>
                          <p style="margin: 2px 0 0 0; color: #f59e0b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            Bringing Stories To Life
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <a href="tel:2295226307" style="color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; background: rgba(255, 255, 255, 0.1); padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.4); display: inline-block;">
                      📞 (229) 522-6307
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 32px 24px; background-color: #ffffff;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 14px 0; color: #0b0f19; font-size: 19px; font-weight: 800;">
                Dear,
              </h2>

              <p style="margin: 0 0 14px 0; line-height: 1.6; color: #334155; font-size: 14px;">
                It was truly a pleasure speaking with you and learning more about your book. What you have written is far from an ordinary story.
              </p>

              <p style="margin: 0 0 20px 0; line-height: 1.6; color: #334155; font-size: 14px;">
                I would love to be a part of this project. For your better understanding, here is our step-by-step process:
              </p>

              <!-- Publishing Process Section -->
              <div style="margin-bottom: 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 18px 20px;">
                <h3 style="margin: 0 0 14px 0; color: #0b0f19; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  🚀 The 6-Step Publishing Process
                </h3>

                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  ${steps.map(s => `
                    <tr>
                      <td width="30" valign="top" style="padding-bottom: 8px;">
                        <div style="background: #0b0f19; color: #f59e0b; border: 1px solid #f59e0b; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 22px; font-weight: 800; font-size: 11px;">
                          ${s.num}
                        </div>
                      </td>
                      <td valign="top" style="padding-bottom: 8px; padding-left: 6px;">
                        <strong style="color: #0b0f19; font-size: 13px;">${s.title}:</strong>
                        <span style="color: #64748b; font-size: 13px;"> ${s.desc}</span>
                      </td>
                    </tr>
                  `).join('')}
                </table>
              </div>

              <h3 style="margin: 0 0 18px 0; color: #0b0f19; font-size: 17px; font-weight: 800; text-align: center;">
                Select Your Publishing Plan
              </h3>

              <!-- PLAN 1: GLOBAL (MOST POPULAR & COMPLETE) -->
              <div style="margin-bottom: 20px; border: 2px solid #f59e0b; border-radius: 10px; overflow: hidden; background: #ffffff;">
                <div style="background: #0b0f19; padding: 16px 18px; color: #ffffff;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <span style="background: #f59e0b; color: #000000; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 2px 8px; border-radius: 8px; display: inline-block; margin-bottom: 4px;">
                          ⭐ MOST POPULAR & COMPLETE
                        </span>
                        <h4 style="margin: 0; color: #ffffff; font-size: 17px; font-weight: 800;">Global Publishing Plan</h4>
                      </td>
                      <td align="right">
                        ${priceVisible ? `
                        <span style="background: #f59e0b; color: #000000; font-weight: 900; font-size: 16px; padding: 4px 12px; border-radius: 16px;">
                          $1,799 <span style="font-size: 11px; font-weight: 700;">(One-Time Fee)</span>
                        </span>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="padding: 14px 18px;">
                  ${renderFeatureList(globalFeatures)}
                </div>
              </div>

              <!-- PLAN 2: NATIONWIDE -->
              <div style="margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; background: #ffffff;">
                <div style="background: #eff6ff; padding: 14px 18px; border-bottom: 1px solid #bfdbfe;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <h4 style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 800;">Nationwide Publishing Plan</h4>
                      </td>
                      <td align="right">
                        ${priceVisible ? `
                        <span style="background: #dbeafe; color: #1e40af; font-weight: 800; font-size: 15px; padding: 3px 10px; border-radius: 16px; border: 1px solid #93c5fd;">
                          $999 <span style="font-size: 11px; font-weight: 500;">(One-Time Fee)</span>
                        </span>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="padding: 14px 18px;">
                  ${renderFeatureList(nationwideFeatures)}
                </div>
              </div>

              <!-- PLAN 3: KICKSTARTER -->
              <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #ffffff;">
                <div style="background: #f8fafc; padding: 14px 18px; border-bottom: 1px solid #e2e8f0;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <h4 style="margin: 0; color: #0b0f19; font-size: 16px; font-weight: 800;">Kickstarter Publishing Plan</h4>
                      </td>
                      <td align="right">
                        ${priceVisible ? `
                        <span style="background: #ecfdf5; color: #047857; font-weight: 800; font-size: 15px; padding: 3px 10px; border-radius: 16px; border: 1px solid #a7f3d0;">
                          $699 <span style="font-size: 11px; font-weight: 500;">(One-Time Fee)</span>
                        </span>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="padding: 14px 18px;">
                  ${renderFeatureList(kickstarterFeatures)}
                </div>
              </div>

              <!-- AUTHOR ASSURANCES BOX -->
              <div style="background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 10px 0; color: #065f46; font-size: 15px; font-weight: 800; text-transform: uppercase;">
                  🛡️ You Are Backed By The Following Assurances:
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: #064e3b; font-weight: 700; font-size: 13px; line-height: 1.6;">
                  <li>100% Ownership Rights and Control.</li>
                  <li>100% Royalties Belonging To The Author.</li>
                  <li>100% Satisfaction of Services.</li>
                </ul>
              </div>

              <!-- Closing Remark & Phone CTA -->
              <p style="margin: 0 0 20px 0; line-height: 1.6; color: #334155; font-size: 14px;">
                If you have any questions, I would be happy to assist you further. Thank You!
              </p>

              <!-- Call-to-action button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="tel:2295226307" style="background: #f59e0b; color: #000000; text-decoration: none; font-size: 14px; font-weight: 800; padding: 12px 24px; border-radius: 24px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                  📞 Call Us: (229) 522-6307
                </a>
              </div>

              <!-- Signature Block -->
              <div style="padding-top: 16px; border-top: 1px dashed #cbd5e1;">
                <div style="color: #475569; font-size: 13px;">Warm regards,</div>
                <div style="color: #0b0f19; font-weight: 800; font-size: 15px; margin-top: 2px;">Author Relations Team</div>
                <div style="color: #f59e0b; font-weight: 800; font-size: 13px; text-transform: uppercase;">Marketing And Publishing House LLC</div>
              </div>

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #0b0f19; padding: 24px 20px; text-align: center; border-top: 1px solid #1e293b; color: #94a3b8;">
              <p style="margin: 0 0 6px 0; color: #ffffff; font-size: 13px; font-weight: 700;">
                Marketing And Publishing House LLC
              </p>
              <p style="margin: 0 0 10px 0; color: #cbd5e1; font-size: 11px; line-height: 1.4;">
                Providing end-to-end author services, professional editing, custom cover designs & worldwide distribution.
              </p>
              <p style="margin: 0 0 10px 0;">
                <a href="https://marketingandpublishinghousellc.com/" target="_blank" style="color: #f59e0b; font-size: 12px; font-weight: 700; text-decoration: underline;">
                  🌐 www.marketingandpublishinghousellc.com
                </a>
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © ${year} Marketing And Publishing House. All rights reserved. &bull; Proposal Ref: #${refCode}
              </p>
            </td>
          </tr>

        </table>
        <!-- Transactional Proposal ID: ${refCode} -->
      </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    // 1. Get data from the request
    const body = await request.json();
    const { to, from, subject, message, name, price_visible = true } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, message: 'Recipient email ("to") is required.' },
        { status: 400 }
      );
    }

    // 2. Configure the SMTP transporter using environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.APP_PASSWORD || process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('SMTP Error: Missing SMTP environment variables (SMTP_HOST, SMTP_USER, APP_PASSWORD/SMTP_PASS).');
      return NextResponse.json(
        { success: false, message: 'SMTP server settings are missing in environment configuration.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for port 465, false for port 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed SSL / cert validation issues
      },
    });

    // 3. Extract or fallback client name & generate unique proposal reference
    const clientName = name || (typeof message === 'string' && message.match(/Dear\s+([^,]+)/i)?.[1]) || '';
    const refId = 'MPH-' + Date.now().toString(36).toUpperCase();

    // 4. Build executive HTML proposal template
    const htmlTemplate = generateExecutiveProposalHtml(clientName, refId, price_visible);

    // 5. Configure mail options (Unique headers & reference ID prevent Gmail thread collapsing)
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

    // 6. Send the email via SMTP
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Executive proposal email sent successfully!'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email', error: String(error) },
      { status: 500 }
    );
  }
}

