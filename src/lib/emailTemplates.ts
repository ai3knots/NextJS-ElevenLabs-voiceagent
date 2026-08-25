export const renderFeatureList = (features: string[]) => `
  <ul style="margin: 0; padding-left: 15px; color: #334155; font-size: 13px; line-height: 1.6;">
    ${features.map(feat => `<li style="margin-bottom: 6px;">${feat}</li>`).join('')}
  </ul>
`;

export const renderHeader = () => `
  <tr>
    <td style="background: #0b0f19; padding: 24px 20px; border-bottom: 4px solid #f59e0b;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="middle" class="stack-column logo-container">
            <table border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="middle" style="padding-right: 12px;">
                  <div style="background: #f59e0b; color: #000000; font-size: 16px; font-weight: 900; padding: 6px 8px; border-radius: 6px; letter-spacing: 0.5px;">
                    MPH
                  </div>
                </td>
                <td valign="middle">
                  <h1 style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.3px; line-height: 1.2;">
                    Marketing & Publishing House
                  </h1>
                  <p style="margin: 2px 0 0 0; color: #f59e0b; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    Bringing Stories To Life
                  </p>
                </td>
              </tr>
            </table>
          </td>
          <td align="right" valign="middle" class="stack-column phone-container">
            <a href="tel:2295226307" style="color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; background: rgba(255, 255, 255, 0.1); padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.4); display: inline-block;">
              📞 (229) 522-6307
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

export const renderGreeting = (name: string) => `
  <h2 style="margin: 0 0 14px 0; color: #0b0f19; font-size: 18px; font-weight: 800;">
    Dear ${name},
  </h2>
  <p style="margin: 0 0 14px 0; line-height: 1.6; color: #334155; font-size: 14px;">
    It was truly a pleasure speaking with you and learning more about your book. What you have written is far from an ordinary story.
  </p>
  <p style="margin: 0 0 20px 0; line-height: 1.6; color: #334155; font-size: 14px;">
    I would love to be a part of this project. For your better understanding, here is our step-by-step process:
  </p>
`;

export const renderProcessSection = (steps: {num: string, title: string, desc: string}[]) => `
  <div style="margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 14px;">
    <h3 style="margin: 0 0 14px 0; color: #0b0f19; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
      🚀 The 6-Step Publishing Process
    </h3>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      ${steps.map(s => `
        <tr>
          <td width="28" valign="top" style="padding-bottom: 10px;">
            <div style="background: #0b0f19; color: #f59e0b; border: 1px solid #f59e0b; width: 22px; height: 22px; border-radius: 50%; text-align: center; line-height: 20px; font-weight: 800; font-size: 11px;">
              ${s.num}
            </div>
          </td>
          <td valign="top" style="padding-bottom: 10px; padding-left: 6px;">
            <strong style="color: #0b0f19; font-size: 13px;">${s.title}:</strong>
            <span style="color: #64748b; font-size: 13px;"> ${s.desc}</span>
          </td>
        </tr>
      `).join('')}
    </table>
  </div>
`;

export const renderPlanSection = (
  planName: string, 
  price: string, 
  features: string[], 
  theme: 'global' | 'nationwide' | 'kickstarter'
) => {
  let styles = {
    wrapperBorder: '',
    headerBg: '',
    titleColor: '',
    priceBg: '',
    priceColor: '',
    priceBorder: '',
    badge: ''
  };

  if (theme === 'global') {
    styles = {
      wrapperBorder: '2px solid #f59e0b',
      headerBg: '#0b0f19',
      titleColor: '#ffffff',
      priceBg: '#f59e0b',
      priceColor: '#000000',
      priceBorder: 'none',
      badge: '<span style="background: #f59e0b; color: #000000; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 2px 8px; border-radius: 8px; display: inline-block; margin-bottom: 4px;">⭐ MOST POPULAR & COMPLETE</span>'
    };
  } else if (theme === 'nationwide') {
    styles = {
      wrapperBorder: '1px solid #cbd5e1',
      headerBg: '#eff6ff',
      titleColor: '#1e40af',
      priceBg: '#dbeafe',
      priceColor: '#1e40af',
      priceBorder: '1px solid #93c5fd',
      badge: ''
    };
  } else {
    styles = {
      wrapperBorder: '1px solid #e2e8f0',
      headerBg: '#f8fafc',
      titleColor: '#0b0f19',
      priceBg: '#ecfdf5',
      priceColor: '#047857',
      priceBorder: '1px solid #a7f3d0',
      badge: ''
    };
  }

  return `
    <h3 style="margin: 0 0 16px 0; color: #0b0f19; font-size: 16px; font-weight: 800; text-align: center;">
      Your Publishing Plan Details
    </h3>
    <div style="margin-bottom: 24px; border: ${styles.wrapperBorder}; border-radius: 10px; overflow: hidden; background: #ffffff;">
      <div style="background: ${styles.headerBg}; padding: ${theme === 'global' ? '16px 14px' : '14px 14px'}; ${theme !== 'global' ? `border-bottom: ${styles.wrapperBorder};` : ''}">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td class="stack-column plan-title-container">
              ${styles.badge}
              <h4 style="margin: 0; color: ${styles.titleColor}; font-size: 16px; font-weight: 800; line-height: 1.3;">${planName}</h4>
            </td>
            <td align="right" class="stack-column price-badge-container">
              <span style="background: ${styles.priceBg}; color: ${styles.priceColor}; font-weight: ${theme === 'global' ? '900' : '800'}; font-size: ${theme === 'global' ? '16px' : '15px'}; padding: ${theme === 'global' ? '4px 12px' : '3px 10px'}; border-radius: 16px; ${styles.priceBorder !== 'none' ? `border: ${styles.priceBorder};` : ''}; display: inline-block;">
                ${price} <span style="font-size: 10px; font-weight: ${theme === 'global' ? '700' : '500'};">(One-Time Fee)</span>
              </span>
            </td>
          </tr>
        </table>
      </div>
      <div style="padding: 14px 14px;">
        ${renderFeatureList(features)}
      </div>
    </div>
  `;
};

export const renderAssurancesSection = () => `
  <div style="background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px 14px; margin-bottom: 24px;">
    <h4 style="margin: 0 0 10px 0; color: #065f46; font-size: 14px; font-weight: 800; text-transform: uppercase;">
      🛡️ You Are Backed By The Following Assurances:
    </h4>
    <ul style="margin: 0; padding-left: 15px; color: #064e3b; font-weight: 700; font-size: 13px; line-height: 1.6;">
      <li>100% Ownership Rights and Control.</li>
      <li>100% Royalties Belonging To The Author.</li>
      <li>100% Satisfaction of Services.</li>
    </ul>
  </div>
`;

export const renderCallToAction = () => `
  <p style="margin: 0 0 20px 0; line-height: 1.6; color: #334155; font-size: 14px;">
    If you have any questions, I would be happy to assist you further. Thank You!
  </p>
  <div style="text-align: center; margin-bottom: 24px;">
    <a href="tel:2295226307" style="background: #f59e0b; color: #000000; text-decoration: none; font-size: 14px; font-weight: 800; padding: 12px 24px; border-radius: 24px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
      📞 Call Us: (229) 522-6307
    </a>
  </div>
  <div style="padding-top: 16px; border-top: 1px dashed #cbd5e1;">
    <div style="color: #475569; font-size: 13px;">Warm regards,</div>
    <div style="color: #0b0f19; font-weight: 800; font-size: 15px; margin-top: 2px;">Author Relations Team</div>
    <div style="color: #f59e0b; font-weight: 800; font-size: 13px; text-transform: uppercase;">Marketing And Publishing House LLC</div>
  </div>
`;

export const renderFooter = (year: number, refCode: string) => `
  <tr>
    <td style="background-color: #0b0f19; padding: 24px 14px; text-align: center; border-top: 1px solid #1e293b; color: #94a3b8;">
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
`;

export const buildBaseEmailLayout = (content: string, year: number, refCode: string) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Book Publishing Proposal - Marketing & Publishing House</title>
      <style>
        /* Mobile Responsive Styles */
        @media only screen and (max-width: 600px) {
          .stack-column {
            display: block !important;
            width: 100% !important;
            text-align: left !important;
          }
          .logo-container {
            margin-bottom: 12px !important;
          }
          .phone-container {
            text-align: left !important;
          }
          .phone-container a {
            display: inline-block !important;
          }
          .plan-title-container {
            margin-bottom: 10px !important;
          }
          .price-badge-container {
            text-align: left !important;
          }
          /* Adjust overall padding for mobile */
          .mobile-padding-wrapper {
            padding: 10px !important;
          }
          .content-padding {
            padding: 24px 16px !important;
          }
        }
      </style>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;" class="mobile-padding-wrapper">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #cbd5e1;">
        ${renderHeader()}
        <tr>
          <td style="padding: 32px 24px; background-color: #ffffff;" class="content-padding">
            ${content}
          </td>
        </tr>
        ${renderFooter(year, refCode)}
      </table>
      <!-- Transactional Proposal ID: ${refCode} -->
    </body>
  </html>
`;
