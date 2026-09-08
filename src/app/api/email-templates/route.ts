import { NextResponse } from 'next/server';
import { EmailTemplate } from '@/types/marketing';

const generateMarketingProposalHtml = (planName: string, price: number, features: string[], colorHex: string, badgeText: string) => {
  const year = new Date().getFullYear();
  const refCode = 'MPH-' + Date.now().toString(36).toUpperCase();

  const renderFeatureList = (featuresList: string[]) => `
    <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
      ${featuresList.map(feat => `<li style="margin-bottom: 4px;">${feat}</li>`).join('')}
    </ul>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your ${planName} - Marketing & Publishing House</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #cbd5e1;">
          
          <!-- Website Matching Header Banner -->
          <tr>
            <td style="background: #0b0f19; padding: 28px 24px; border-bottom: 4px solid ${colorHex};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="middle">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px;">
                          <div style="background: ${colorHex}; color: #000000; font-size: 18px; font-weight: 900; padding: 6px 10px; border-radius: 6px; letter-spacing: 0.5px;">
                            MPH
                          </div>
                        </td>
                        <td valign="middle">
                          <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.3px;">
                            Marketing & Publishing House
                          </h1>
                          <p style="margin: 2px 0 0 0; color: ${colorHex}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            Bringing Stories To Life
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <a href="tel:2295226307" style="color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; background: rgba(255, 255, 255, 0.1); padding: 6px 12px; border-radius: 20px; border: 1px solid ${colorHex}; display: inline-block;">
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
                Dear Author,
              </h2>

              <p style="margin: 0 0 14px 0; line-height: 1.6; color: #334155; font-size: 14px;">
                We are thrilled to present our exclusive marketing bundles designed to maximize your book's potential.
              </p>

              <h3 style="margin: 0 0 18px 0; color: #0b0f19; font-size: 17px; font-weight: 800; text-align: center;">
                Your Custom Marketing Plan
              </h3>

              <!-- PLAN DETAILS -->
              <div style="margin-bottom: 20px; border: 2px solid ${colorHex}; border-radius: 10px; overflow: hidden; background: #ffffff;">
                <div style="background: #0b0f19; padding: 16px 18px; color: #ffffff;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <span style="background: ${colorHex}; color: #000000; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 2px 8px; border-radius: 8px; display: inline-block; margin-bottom: 4px;">
                          ${badgeText}
                        </span>
                        <h4 style="margin: 0; color: #ffffff; font-size: 17px; font-weight: 800;">${planName}</h4>
                      </td>
                      <td align="right">
                        <span style="background: ${colorHex}; color: #000000; font-weight: 900; font-size: 16px; padding: 4px 12px; border-radius: 16px;">
                          $${price.toLocaleString()} <span style="font-size: 11px; font-weight: 700;">(One-Time Fee)</span>
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="padding: 14px 18px;">
                  ${renderFeatureList(features)}
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
                  <li>Dedicated Marketing Manager.</li>
                </ul>
              </div>

              <!-- Closing Remark & Phone CTA -->
              <p style="margin: 0 0 20px 0; line-height: 1.6; color: #334155; font-size: 14px;">
                If you have any questions, I would be happy to assist you further. Let's make your book a bestseller!
              </p>

              <!-- Call-to-action button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="tel:2295226307" style="background: ${colorHex}; color: #000000; text-decoration: none; font-size: 14px; font-weight: 800; padding: 12px 24px; border-radius: 24px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                  📞 Call Us: (229) 522-6307
                </a>
              </div>

              <!-- Signature Block -->
              <div style="padding-top: 16px; border-top: 1px dashed #cbd5e1;">
                <div style="color: #475569; font-size: 13px;">Warm regards,</div>
                <div style="color: #0b0f19; font-weight: 800; font-size: 15px; margin-top: 2px;">Marketing Team</div>
                <div style="color: ${colorHex}; font-weight: 800; font-size: 13px; text-transform: uppercase;">Marketing And Publishing House LLC</div>
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
                <a href="https://marketingandpublishinghousellc.com/" target="_blank" style="color: ${colorHex}; font-size: 12px; font-weight: 700; text-decoration: underline;">
                  🌐 www.marketingandpublishinghousellc.com
                </a>
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © ${year} Marketing And Publishing House. All rights reserved. &bull; Proposal Ref: #${refCode}
              </p>
            </td>
          </tr>

        </table>
      </body>
    </html>
  `;
};

const emailTemplates: EmailTemplate[] = [
  {
    id: 'tpl_silver',
    planId: 'silver',
    subject: 'Your Silver Marketing Plan Proposal - MPH',
    htmlContent: generateMarketingProposalHtml(
      'Silver Marketing Plan',
      6299,
      [
        'Extended Publishing on 15 Platforms',
        'Design Optimization & Creation',
        'Google Knowledge Panel',
        'Social Media Presence & Credibility',
        'Social Media Marketing & Management',
        'Video Trailer Creation & Advertising',
        'Search Engine Optimization (SEO)'
      ],
      '#94a3b8', // Silver/slate color
      '⭐ PREMIUM VISIBILITY'
    )
  },
  {
    id: 'tpl_gold',
    planId: 'gold',
    subject: 'Your Gold Marketing Plan Proposal - MPH',
    htmlContent: generateMarketingProposalHtml(
      'Gold Marketing Plan',
      10499,
      [
        'Extended Publishing on 15 Platforms',
        'Design Optimization & Creation',
        'Test Marketing',
        'Social Media Presence & Credibility',
        'Social Media Marketing & Management',
        'Video Trailer Creation & Advertising (12 Months)',
        'Search Engine Optimization (SEO)',
        'Monthly Sales Reports',
        'Google Knowledge Panel',
        'Amazon Bestseller Campaign & Management',
        'News Featured Publications, Guest Posts, and PR Campaigns'
      ],
      '#f59e0b', // Gold/amber color
      '👑 ULTIMATE BESTSELLER BUNDLE'
    )
  }
];

export async function GET() {
  return NextResponse.json({ success: true, data: emailTemplates });
}
