/**
 * Shared email templates for all Aura Labs transactional + automated emails.
 * Files under api/_lib are NOT deployed as serverless functions (underscore prefix).
 *
 * All markup is table-based with inline styles for maximum email-client support.
 */

export const BOOKING_URL = "https://calendar.app.google/ZQNXkk3AFDSdbyReA";
export const SITE_URL = "https://aura-labs-one.vercel.app";

const FEATURED_WORK = [
  { title: "Bud n' Buddies — Cannabis E-Commerce", url: `${SITE_URL}/work/bud-n-buddies` },
  { title: "Apex Towing — 24/7 Lead Generation", url: `${SITE_URL}/work/apex-towing` },
  { title: "Bagel Bar — Local Food Brand", url: `${SITE_URL}/work/bagel-bar` },
];

// ─── Shared shell ─────────────────────────────────────────────────────────────
const shell = (label: string, accent: string, body: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:40px;text-align:center;">
          <span style="font-size:10px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:rgba(255,255,255,0.25);">${label}</span>
        </td></tr>
        <tr><td style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:3px;background:${accent};"></td></tr>
          </table>
          ${body}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:24px 48px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;">
                © 2026 Aura Labs · Edmonton, Alberta · <a href="${SITE_URL}" style="color:rgba(255,255,255,0.2);text-decoration:none;">aura-labs</a>
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const ctaButton = (href: string, text: string) => `
<table role="presentation" cellpadding="0" cellspacing="0">
  <tr><td style="border-radius:100px;background:#fff;">
    <a href="${href}" style="display:inline-block;padding:14px 36px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000;text-decoration:none;">${text}</a>
  </td></tr>
</table>
`;

const featuredWorkBlock = () => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
  <tr><td style="height:1px;background:rgba(255,255,255,0.06);"></td></tr>
</table>
<p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25);">Recent Work</p>
${FEATURED_WORK.map(w => `
<p style="margin:0 0 10px;">
  <a href="${w.url}" style="font-size:13px;color:#00f0ff;text-decoration:none;">${w.title} →</a>
</p>`).join("")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 36px;">
  <tr><td style="height:1px;background:rgba(255,255,255,0.06);"></td></tr>
</table>
`;

// ─── Admin alert ──────────────────────────────────────────────────────────────
export const adminAlertHTML = (name: string, email: string, message: string, type: string, plan?: string) =>
  shell("AURA LABS · ADMIN ALERT", "linear-gradient(90deg,#ff4d4d,#ff9900)", `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:48px 48px 40px;">
      <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#ff9900;">New ${type}</p>
      <h1 style="margin:0 0 32px;font-size:28px;font-weight:300;color:#ffffff;letter-spacing:-0.5px;line-height:1.3;">Incoming Inquiry</h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">Name</p>
          <p style="margin:0;font-size:15px;color:#fff;">${name}</p>
        </td></tr>
        <tr><td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">Email</p>
          <a href="mailto:${email}" style="margin:0;font-size:15px;color:#00f0ff;text-decoration:none;">${email}</a>
        </td></tr>
        ${plan ? `
        <tr><td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">Plan / Service</p>
          <p style="margin:0;font-size:15px;color:#fff;">${plan}</p>
        </td></tr>` : ""}
        <tr><td style="padding:16px 0;">
          <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">Message</p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.6);font-style:italic;">"${message || "No message provided."}"</p>
        </td></tr>
      </table>
      ${ctaButton(`mailto:${email}`, "Reply Now")}
    </td></tr>
  </table>
`);

// ─── Client confirmation (instant) ────────────────────────────────────────────
export const clientConfirmationHTML = (name: string, plan?: string) => {
  const firstName = name.split(" ")[0] || name;
  return shell("AURA LABS", "linear-gradient(90deg,#00f0ff,#0055ff)", `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:52px 48px 44px;">
      <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#00f0ff;">Transmission Received</p>
      <h1 style="margin:0 0 20px;font-size:34px;font-weight:300;color:#ffffff;letter-spacing:-1px;line-height:1.2;">We've got you,<br />${firstName}.</h1>
      <p style="margin:0 0 36px;font-size:15px;line-height:1.75;color:rgba(255,255,255,0.55);">
        Your inquiry has landed with our team. We review every submission personally and typically respond within <strong style="color:rgba(255,255,255,0.8);font-weight:600;">1–2 business days</strong>.
      </p>

      <p style="margin:0 0 20px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25);">What Happens Next</p>
      ${[
        "Our team reviews your project brief",
        "We reach out to schedule a strategy call",
        "We architect your digital experience together",
      ].map((step, i) => `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td style="width:28px;vertical-align:top;padding-top:2px;">
            <div style="width:20px;height:20px;border-radius:50%;background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);text-align:center;line-height:20px;font-size:9px;font-weight:700;color:#00f0ff;">${i + 1}</div>
          </td>
          <td style="padding-left:14px;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">${step}</p>
          </td>
        </tr>
      </table>`).join("")}

      <div style="height:20px;"></div>

      ${plan ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
        <tr><td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:100px;padding:10px 20px;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);">Enquiring about: <span style="color:#fff;">${plan}</span></p>
        </td></tr>
      </table>` : ""}

      ${featuredWorkBlock()}

      <p style="margin:0 0 20px;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.45);">Want to skip the wait? Grab a time directly on our calendar:</p>
      ${ctaButton(BOOKING_URL, "Book a Call Now")}
    </td></tr>
  </table>
`);
};

// ─── Automated 48h follow-up ──────────────────────────────────────────────────
export const followUpHTML = (name: string, plan?: string) => {
  const firstName = name.split(" ")[0] || name;
  return shell("AURA LABS", "linear-gradient(90deg,#bd00ff,#0055ff)", `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:52px 48px 44px;">
      <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#bd00ff;">Following Up</p>
      <h1 style="margin:0 0 20px;font-size:34px;font-weight:300;color:#ffffff;letter-spacing:-1px;line-height:1.2;">Still thinking it over,<br />${firstName}?</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:rgba(255,255,255,0.55);">
        You reached out to us${plan ? ` about <strong style="color:rgba(255,255,255,0.8);">${plan}</strong>` : ""} a couple of days ago — just making sure your inquiry didn't get buried. We'd love to hear more about what you're building.
      </p>
      <p style="margin:0 0 36px;font-size:15px;line-height:1.75;color:rgba(255,255,255,0.55);">
        The fastest way forward is a free 15-minute strategy call. No pressure, no pitch — just a clear plan for your project and an honest quote.
      </p>

      ${featuredWorkBlock()}

      ${ctaButton(BOOKING_URL, "Book Your Free Call")}

      <p style="margin:32px 0 0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.3);">
        Already sorted, or just browsing? No worries — simply ignore this email and we won't follow up again.
      </p>
    </td></tr>
  </table>
`);
};

// ─── Newsletter Welcome ───────────────────────────────────────────────────────
export const newsletterWelcomeHTML = (email: string) => shell("AURA LABS", "linear-gradient(90deg,#00f0ff,#0055ff)", `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:52px 48px 40px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#00f0ff;">The Journal</p>
      <h1 style="margin:0 0 24px;font-size:36px;font-weight:300;line-height:1.2;color:#ffffff;letter-spacing:-1px;">You're in.</h1>
      <p style="margin:0 0 32px;font-size:15px;line-height:1.75;color:rgba(255,255,255,0.55);font-weight:400;">
        Welcome aboard. You'll receive curated insights on design, technology, and the craft behind building exceptional digital products — straight from our studio in Edmonton.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr><td style="height:1px;background:rgba(255,255,255,0.06);"></td></tr>
      </table>

      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25);">Subscribed As</p>
      <p style="margin:0 0 40px;font-size:14px;color:rgba(255,255,255,0.7);">${email}</p>

      ${ctaButton(SITE_URL, "Explore Our Work")}
    </td></tr>
  </table>
`);
