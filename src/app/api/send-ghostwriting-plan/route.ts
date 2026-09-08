import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { GhostwritingPlan } from '@/types/ghostwriting';

const ghostwritingProcess = [
  {
    step: 'Consultation',
    description: 'To begin with, we start off with a consultation call with an experienced book-writing consultant. During this call, they will attentively listen to your story, allowing them to conduct a thorough review.'
  },
  {
    step: 'Outline Creation',
    description: 'Within two business days following the consultation, they will craft a professional outline of your book, which will be sent to you for review.'
  },
  {
    step: 'Chapter Writing & Communication',
    description: 'Once you\'ve approved the outline, we proceed to the chapter writing phase, where we work methodically, chapter by chapter. You will have direct communication with our writing team, enabling you to discuss each chapter individually. Each chapter will be delivered to you within 3 to 4 business days.'
  },
  {
    step: 'Review & Feedback',
    description: 'Your role is to provide feedback to ensure that our writers are meeting your requirements and delivering the highest quality work.'
  },
  {
    step: 'Cover Design',
    description: 'While your book is in the writing phase, we will engage a graphic designer to create 3 to 4 book cover options based on your ideas. Your task will be to select the cover that aligns best with your vision, which will then be featured on your book.'
  },
  {
    step: 'Publishing & Release',
    description: 'Furthermore, once the editing and reviewing process is finalized, we will introduce you to our team of publishing experts. They will assist you in releasing your book on premium platforms.'
  },
  {
    step: 'Rights & Royalties',
    description: 'Importantly, we do not claim any credit or royalties for your work. The book will remain under your name from inception to completion of the project.'
  },
  {
    step: 'Support',
    description: 'Throughout the entire process, a dedicated project manager will be available to provide assistance at every step of the journey.'
  }
];

const ghostwritingFeatures = [
  'Writing Pages (Up to 70-80 pages)',
  'Meetings and discussions for the storyline.',
  'Drafting chapters and reviewing',
  'Professional Proofreading.',
  'Editing and Refining the story',
  'Layout Adjustment—Page Design.',
  'Formatting—Structuring Content: eBook, Paperback & Hardcover.',
  'Customized Cover Design (Front, spine and Back).',
  'Unlimited Revisions - Making endless changes.',
  'Authors Central Page.',
  'Publication on Amazon',
  'Multiple Book Formats- eBook and Paperback and Hardcover',
  'Print on Demand Setup.',
  'Premium ISBN and Barcode.',
  '100% Ownership Rights.',
  'Dedicated Project Manager.'
];

function generateGhostwritingProposalHtml(clientName: string, refId: string, customPrice: number = 1099, priceVisible: boolean = true): string {
  const year = new Date().getFullYear();
  const name = clientName && clientName.trim() ? clientName.trim() : 'Author';
  const themeColor = '#10b981'; // Emerald color for ghostwriting
  
  const renderProcessSteps = () => `
    <div style="margin-bottom: 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${themeColor}; border-radius: 8px; padding: 18px 20px;">
      <h3 style="margin: 0 0 14px 0; color: #0b0f19; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
        📝 The Ghostwriting Process
      </h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        ${ghostwritingProcess.map((s, idx) => `
          <tr>
            <td width="30" valign="top" style="padding-bottom: 12px;">
              <div style="background: #0b0f19; color: ${themeColor}; border: 1px solid ${themeColor}; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 22px; font-weight: 800; font-size: 11px;">
                ${idx + 1}
              </div>
            </td>
            <td valign="top" style="padding-bottom: 12px; padding-left: 6px;">
              <strong style="color: #0b0f19; font-size: 13px;">${s.step}:</strong>
              <div style="color: #64748b; font-size: 13px; margin-top: 4px; line-height: 1.5;">${s.description}</div>
            </td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;

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
        <title>Your Ghostwriting Plan Proposal - Marketing & Publishing House</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #cbd5e1;">
          
          <!-- Website Matching Header Banner -->
          <tr>
            <td style="background: #0b0f19; padding: 28px 24px; border-bottom: 4px solid ${themeColor};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="middle">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px;">
                          <div style="background: ${themeColor}; color: #000000; font-size: 18px; font-weight: 900; padding: 6px 10px; border-radius: 6px; letter-spacing: 0.5px;">
                            MPH
                          </div>
                        </td>
                        <td valign="middle">
                          <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.3px;">
                            Marketing & Publishing House
                          </h1>
                          <p style="margin: 2px 0 0 0; color: ${themeColor}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            Bringing Stories To Life
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <a href="tel:2295226307" style="color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; background: rgba(255, 255, 255, 0.1); padding: 6px 12px; border-radius: 20px; border: 1px solid ${themeColor}; display: inline-block;">
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
                Dear ${name},
              </h2>

              <p style="margin: 0 0 20px 0; line-height: 1.6; color: #334155; font-size: 14px;">
                We are excited to present our exclusive Ghostwriting & Publishing plan, designed to turn your ideas into a fully realized, professionally published book.
              </p>

              ${renderProcessSteps()}

              <h3 style="margin: 0 0 18px 0; color: #0b0f19; font-size: 17px; font-weight: 800; text-align: center;">
                Your Custom Ghostwriting Plan
              </h3>

              <!-- PLAN DETAILS -->
              <div style="margin-bottom: 20px; border: 2px solid ${themeColor}; border-radius: 10px; overflow: hidden; background: #ffffff;">
                <div style="background: #0b0f19; padding: 16px 18px; color: #ffffff;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <span style="background: ${themeColor}; color: #000000; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 2px 8px; border-radius: 8px; display: inline-block; margin-bottom: 4px;">
                          🖋️ COMPLETE BOOK CREATION
                        </span>
                        <h4 style="margin: 0; color: #ffffff; font-size: 17px; font-weight: 800;">Ghostwriting + Amazon Publishing Plan</h4>
                      </td>
                      <td align="right">
                        ${priceVisible ? `
                        <span style="background: ${themeColor}; color: #000000; font-weight: 900; font-size: 16px; padding: 4px 12px; border-radius: 16px;">
                          $${customPrice.toLocaleString()} <span style="font-size: 11px; font-weight: 700;">(One-Time Fee)</span>
                        </span>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="padding: 14px 18px;">
                  ${renderFeatureList(ghostwritingFeatures)}
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
                  <li>Dedicated Project Manager.</li>
                </ul>
              </div>

              <!-- Closing Remark & Phone CTA -->
              <p style="margin: 0 0 20px 0; line-height: 1.6; color: #334155; font-size: 14px;">
                If you have any questions, I would be happy to assist you further. Let's make your story come alive!
              </p>

              <!-- Call-to-action button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="tel:2295226307" style="background: ${themeColor}; color: #000000; text-decoration: none; font-size: 14px; font-weight: 800; padding: 12px 24px; border-radius: 24px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                  📞 Call Us: (229) 522-6307
                </a>
              </div>

              <!-- Signature Block -->
              <div style="padding-top: 16px; border-top: 1px dashed #cbd5e1;">
                <div style="color: #475569; font-size: 13px;">Warm regards,</div>
                <div style="color: #0b0f19; font-weight: 800; font-size: 15px; margin-top: 2px;">Author Relations Team</div>
                <div style="color: ${themeColor}; font-weight: 800; font-size: 13px; text-transform: uppercase;">Marketing And Publishing House LLC</div>
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
                <a href="https://marketingandpublishinghousellc.com/" target="_blank" style="color: ${themeColor}; font-size: 12px; font-weight: 700; text-decoration: underline;">
                  🌐 www.marketingandpublishinghousellc.com
                </a>
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © ${year} Marketing And Publishing House. All rights reserved. &bull; Proposal Ref: #${refId}
              </p>
            </td>
          </tr>

        </table>
      </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      to, 
      from, 
      subject, 
      name, 
      price_visible = true,
      price = 1099
    } = body;

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

    const refId = 'MPH-GW-' + Date.now().toString(36).toUpperCase();
    const htmlTemplate = generateGhostwritingProposalHtml(name, refId, price, price_visible);
    
    let emailSubject = subject || `Your Ghostwriting Plan Proposal - ${name || 'Author'} [${refId}]`;

    const mailOptions = {
      from: `"Marketing & Publishing House" <${smtpUser}>`,
      to: to,
      replyTo: from || undefined,
      subject: emailSubject,
      text: `Dear ${name || 'Author'},\n\nThank you for speaking with us. Please view your official ghostwriting proposal (Ref: ${refId}) in HTML view.`,
      html: htmlTemplate,
      headers: {
        'X-Entity-Ref-ID': refId,
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Ghostwriting proposal email sent successfully!'
    });

  } catch (error) {
    console.error('Error sending ghostwriting email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send ghostwriting email', error: String(error) },
      { status: 500 }
    );
  }
}
