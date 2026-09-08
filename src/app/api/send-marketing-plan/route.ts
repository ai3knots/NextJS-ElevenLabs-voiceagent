import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const silverFeaturesDetailed = [
  {
    title: '1. Extended Publishing on 15 Platforms',
    description: 'Publish your book across 15 major platforms, reaching over 40,000 bookstores and libraries worldwide in eBook and paperback formats.',
    outcome: 'Greater visibility, wider audience reach, and increased sales opportunities.'
  },
  {
    title: '2. Design Optimization & Creation',
    description: 'Professional banner designs, A/B testing, Author Central optimization, and A+ Content creation to maximize reader engagement.',
    outcome: 'Stronger branding, higher click-through rates, and improved conversions.'
  },
  {
    title: '3. Google Knowledge Panel',
    description: 'Strengthen your online authority and eligibility for a Google Knowledge Panel through strategic branding and optimization.',
    outcome: 'Increased credibility, visibility, and author recognition.'
  },
  {
    title: '4. Social Media Presence & Credibility',
    description: 'Professional setup and optimization of your social media profiles with consistent branding and audience-building strategies.',
    outcome: 'Enhanced credibility, stronger online presence, and increased reader trust.'
  },
  {
    title: '5. Social Media Marketing & Management',
    description: 'Content creation, audience engagement, targeted advertising, and campaign optimization across major social platforms.',
    outcome: 'Increased brand awareness, audience growth, and book sales.'
  },
  {
    title: '6. Video Trailer Creation & Advertising',
    description: 'Custom book trailers promoted through Facebook, Instagram, TikTok, YouTube, and other digital platforms.',
    outcome: 'Greater visibility, stronger engagement, and increased reader conversions.'
  },
  {
    title: '7. Search Engine Optimization (SEO)',
    description: 'Social Media optimization, keyword implementation, technical SEO, and ongoing performance tracking.',
    outcome: 'Higher search rankings, increased organic traffic, and long-term discoverability.'
  }
];

const goldFeaturesDetailed = [
  {
    title: '1. Extended Publishing on 15 Platforms',
    description: 'Publish your book across 15 major platforms, reaching over 40,000 bookstores and libraries worldwide in eBook and paperback formats.',
    outcome: 'Greater visibility, wider audience reach, and increased sales opportunities.'
  },
  {
    title: '2. Design Optimization & Creation',
    description: 'Professional banner designs, A/B testing, Author Central optimization, and A+ Content creation to maximize reader engagement.',
    outcome: 'Stronger branding, higher click-through rates, and improved conversions.'
  },
  {
    title: '3. Test Marketing',
    description: 'Audience testing, reader feedback, market analysis, and pricing evaluation to refine your book\'s positioning before scaling.',
    outcome: 'Better targeting, stronger market positioning, and improved sales potential.'
  },
  {
    title: '4. Social Media Presence & Credibility',
    description: 'Professional setup and optimization of your social media profiles with consistent branding and audience-building strategies.',
    outcome: 'Enhanced credibility, stronger online presence, and increased reader trust.'
  },
  {
    title: '5. Social Media Marketing & Management',
    description: 'Content creation, audience engagement, targeted advertising, and campaign optimization across major social platforms.',
    outcome: 'Increased brand awareness, audience growth, and book sales.'
  },
  {
    title: '6. Video Trailer Creation & Advertising (12 Months)',
    description: 'Custom book trailers promoted through Facebook, Instagram, TikTok, YouTube, and other digital platforms.',
    outcome: 'Greater visibility, stronger engagement, and increased reader conversions.'
  },
  {
    title: '7. Search Engine Optimization (SEO)',
    description: 'Social Media optimization, keyword implementation, technical SEO, and ongoing performance tracking.',
    outcome: 'Higher search rankings, increased organic traffic, and long-term discoverability.'
  },
  {
    title: '8. Monthly Sales Reports',
    description: 'Comprehensive monthly reports covering sales performance, marketing results, and audience growth.',
    outcome: 'Clear insights to measure progress and optimize future campaigns.'
  },
  {
    title: '9. Google Knowledge Panel',
    description: 'Strengthen your online authority and eligibility for a Google Knowledge Panel through strategic branding and optimization.',
    outcome: 'Increased credibility, visibility, and author recognition.'
  },
  {
    title: '10. Amazon Bestseller Campaign & Management',
    description: 'Amazon listing optimization, keyword strategy, advertising, category placement, and bestseller campaign management.',
    outcome: 'Higher rankings, increased visibility, and Guaranteed Amazon Best Seller Tag.'
  },
  {
    title: '11. News Featured Publications, Guest Posts, and PR Campaigns',
    description: 'Strategic media exposure through articles, guest posts, press releases, and publicity campaigns to increase visibility and authority. Includes: Press release creation and distribution, guest post opportunities on relevant websites and blogs, media and publication outreach, author feature articles and interviews, brand awareness and reputation-building campaigns, and Press Releases on more than 500 news channels including Fox News and NY Times.',
    outcome: 'Increased credibility, enhanced online presence, wider audience reach, and greater opportunities for book discovery and sales.'
  }
];

function generateMarketingProposalHtml(clientName: string, refId: string, planType: 'all' | 'silver' | 'gold', priceVisible: boolean = true, silverPrice: number = 6299, goldPrice: number = 10499): string {
  const year = new Date().getFullYear();
  const name = clientName && clientName.trim() ? clientName.trim() : 'Author';
  
  const renderFeatureList = (features: any[], colorHex: string) => `
    <div style="margin: 0; padding: 0 10px; color: #334155; font-size: 13px; line-height: 1.6;">
      ${features.map(feat => `
        <div style="margin-bottom: 16px;">
          <h5 style="margin: 0 0 4px 0; color: #0b0f19; font-size: 14px; font-weight: 700;">
            <span style="color: ${colorHex}; margin-right: 4px;">&#10003;</span> ${feat.title}
          </h5>
          <p style="margin: 0 0 6px 0; padding-left: 18px; color: #475569;">
            ${feat.description}
          </p>
          <div style="margin: 0 0 0 18px; padding: 6px 10px; background-color: #f8fafc; border-left: 3px solid ${colorHex}; border-radius: 4px;">
            <strong style="color: #0f172a; font-size: 12px;">Expected Outcome:</strong> 
            <span style="color: #64748b; font-size: 12px;">${feat.outcome}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const renderPlan = (title: string, price: number, colorHex: string, badgeText: string, features: any[]) => `
    <div style="margin-bottom: 30px; border: 2px solid ${colorHex}; border-radius: 10px; overflow: hidden; background: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <div style="background: #0b0f19; padding: 16px 18px; color: #ffffff;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <span style="background: ${colorHex}; color: #000000; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 2px 8px; border-radius: 8px; display: inline-block; margin-bottom: 4px;">
                ${badgeText}
              </span>
              <h4 style="margin: 0; color: #ffffff; font-size: 17px; font-weight: 800;">${title}</h4>
            </td>
            <td align="right">
              ${priceVisible ? `
              <span style="background: ${colorHex}; color: #000000; font-weight: 900; font-size: 16px; padding: 4px 12px; border-radius: 16px;">
                $${price.toLocaleString()} <span style="font-size: 11px; font-weight: 700;">(One-Time Fee)</span>
              </span>
              ` : ''}
            </td>
          </tr>
        </table>
      </div>
      <div style="padding: 20px 14px;">
        ${renderFeatureList(features, colorHex)}
      </div>
    </div>
  `;

  let plansHtml = '';
  let themeColor = '#0b0f19'; 

  if (planType === 'all') {
    plansHtml += renderPlan('Gold Marketing Plan (12 Months)', goldPrice, '#f59e0b', '👑 ULTIMATE BESTSELLER BUNDLE', goldFeaturesDetailed);
    plansHtml += renderPlan('Silver Marketing Plan (6 Months)', silverPrice, '#94a3b8', '⭐ PREMIUM VISIBILITY', silverFeaturesDetailed);
  } else if (planType === 'gold') {
    plansHtml += renderPlan('Gold Marketing Plan (12 Months)', goldPrice, '#f59e0b', '👑 ULTIMATE BESTSELLER BUNDLE', goldFeaturesDetailed);
    themeColor = '#f59e0b';
  } else if (planType === 'silver') {
    plansHtml += renderPlan('Silver Marketing Plan (6 Months)', silverPrice, '#94a3b8', '⭐ PREMIUM VISIBILITY', silverFeaturesDetailed);
    themeColor = '#94a3b8';
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Marketing Plan Proposal - Marketing & Publishing House</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #cbd5e1;">
          
          <!-- Website Matching Header Banner -->
          <tr>
            <td style="background: #0b0f19; padding: 28px 24px; border-bottom: 4px solid ${themeColor === '#0b0f19' ? '#f59e0b' : themeColor};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="middle">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px;">
                          <div style="background: ${themeColor === '#0b0f19' ? '#f59e0b' : themeColor}; color: #000000; font-size: 18px; font-weight: 900; padding: 6px 10px; border-radius: 6px; letter-spacing: 0.5px;">
                            MPH
                          </div>
                        </td>
                        <td valign="middle">
                          <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.3px;">
                            Marketing & Publishing House
                          </h1>
                          <p style="margin: 2px 0 0 0; color: ${themeColor === '#0b0f19' ? '#f59e0b' : themeColor}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            Bringing Stories To Life
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <a href="tel:2295226307" style="color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; background: rgba(255, 255, 255, 0.1); padding: 6px 12px; border-radius: 20px; border: 1px solid ${themeColor === '#0b0f19' ? '#f59e0b' : themeColor}; display: inline-block;">
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
                We are thrilled to present our exclusive marketing bundles designed to maximize your book's potential. Below are the detailed plans, structured for maximum impact and visibility.
              </p>

              ${plansHtml}

              <!-- AUTHOR ASSURANCES BOX -->
              <div style="background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 10px 0; color: #065f46; font-size: 15px; font-weight: 800; text-transform: uppercase;">
                  🛡️ You Are Backed By The Following Assurances:
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: #064e3b; font-weight: 700; font-size: 13px; line-height: 1.6;">
                  <li>100% Ownership Rights and Control.</li>
                  <li>100% Royalties Belonging To The Author.</li>
                  <li>Dedicated Marketing Manager.</li>
                </ul>
              </div>

              <!-- Closing Remark & Phone CTA -->
              <p style="margin: 0 0 20px 0; line-height: 1.6; color: #334155; font-size: 14px;">
                If you have any questions, I would be happy to assist you further. Let's make your book a bestseller!
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
                <div style="color: #0b0f19; font-weight: 800; font-size: 15px; margin-top: 2px;">Marketing Team</div>
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
      planType = 'all', 
      price_visible = true,
      silverPrice = 6299,
      goldPrice = 10499
    } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, message: 'Recipient email ("to") is required.' },
        { status: 400 }
      );
    }

    if (!['all', 'silver', 'gold'].includes(planType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid planType. Must be "all", "silver", or "gold".' },
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

    const refId = 'MPH-MKT-' + Date.now().toString(36).toUpperCase();
    const htmlTemplate = generateMarketingProposalHtml(name, refId, planType as 'all' | 'silver' | 'gold', price_visible, silverPrice, goldPrice);
    
    let emailSubject = subject;
    if (!emailSubject) {
      if (planType === 'all') {
        emailSubject = `Your Marketing Plans Proposal - ${name || 'Author'} [${refId}]`;
      } else {
        const planName = planType === 'gold' ? 'Gold' : 'Silver';
        emailSubject = `Your ${planName} Marketing Plan Proposal - ${name || 'Author'} [${refId}]`;
      }
    }

    const mailOptions = {
      from: `"Marketing & Publishing House" <${smtpUser}>`,
      to: to,
      replyTo: from || undefined,
      subject: emailSubject,
      text: `Dear ${name || 'Author'},\n\nThank you for speaking with us. Please view your official marketing proposal (Ref: ${refId}) in HTML view.`,
      html: htmlTemplate,
      headers: {
        'X-Entity-Ref-ID': refId,
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Marketing proposal email sent successfully!'
    });

  } catch (error) {
    console.error('Error sending marketing email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send marketing email', error: String(error) },
      { status: 500 }
    );
  }
}
