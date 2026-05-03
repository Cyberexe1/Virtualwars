import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD?.replace(/\s/g, ''), // strip spaces from 16-digit code
  },
});

const FROM = `"${process.env.EMAIL_FROM_NAME ?? 'Civic Clarity India'}" <${process.env.EMAIL_USER}>`;

// ─── Email Templates ──────────────────────────────────────────────────────────

function alertEmailHtml(recipientEmail: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Election Alerts Activated</title>
  <style>
    body { margin:0; padding:0; background:#f8f9fa; font-family:'Segoe UI',Arial,sans-serif; }
    .container { max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #DEE2E6; }
    .header { background:#002e68; padding:32px 40px; text-align:center; }
    .header h1 { color:#ffffff; margin:0; font-size:24px; letter-spacing:-0.5px; }
    .header p { color:#90b5ff; margin:8px 0 0; font-size:14px; }
    .body { padding:32px 40px; }
    .body h2 { color:#002e68; font-size:20px; margin:0 0 12px; }
    .body p { color:#434751; font-size:15px; line-height:1.6; margin:0 0 16px; }
    .alert-list { background:#f3f4f5; border-radius:8px; padding:20px 24px; margin:20px 0; }
    .alert-item { display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; }
    .alert-item:last-child { margin-bottom:0; }
    .dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:5px; }
    .dot-blue { background:#004492; }
    .dot-red { background:#ba1a1a; }
    .dot-green { background:#006d3a; }
    .alert-text { font-size:14px; color:#191c1d; }
    .alert-date { font-size:12px; color:#737782; margin-top:2px; }
    .cta { display:block; background:#004492; color:#ffffff; text-decoration:none; text-align:center; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:600; margin:24px 0; }
    .footer { background:#f3f4f5; padding:20px 40px; text-align:center; border-top:1px solid #DEE2E6; }
    .footer p { color:#737782; font-size:12px; margin:0; line-height:1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🗳️ Civic Clarity India</h1>
      <p>Official Non-Partisan Election Education Platform</p>
    </div>
    <div class="body">
      <h2>Election Alerts Activated ✅</h2>
      <p>You're now subscribed to election deadline alerts for <strong>${recipientEmail}</strong>. We'll notify you before important dates so you never miss a civic deadline.</p>

      <div class="alert-list">
        <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#737782;margin:0 0 16px;">Upcoming Key Dates — 2024 Lok Sabha</p>

        <div class="alert-item">
          <div class="dot dot-blue"></div>
          <div>
            <div class="alert-text"><strong>Voter Roll Revision</strong> — Jan 1, 2024</div>
            <div class="alert-date">Annual revision begins. Apply via Form 6 at voters.eci.gov.in</div>
          </div>
        </div>

        <div class="alert-item">
          <div class="dot dot-red"></div>
          <div>
            <div class="alert-text"><strong>Final Roll Publication Deadline</strong> — Jan 31, 2024</div>
            <div class="alert-date">Last date to raise objections or apply for corrections</div>
          </div>
        </div>

        <div class="alert-item">
          <div class="dot dot-blue"></div>
          <div>
            <div class="alert-text"><strong>MCC in Effect</strong> — Mar 16, 2024</div>
            <div class="alert-date">Election schedule announced. Model Code of Conduct begins</div>
          </div>
        </div>

        <div class="alert-item">
          <div class="dot dot-green"></div>
          <div>
            <div class="alert-text"><strong>Polling Phase 1</strong> — Apr 19, 2024</div>
            <div class="alert-date">102 constituencies across 21 states. Polls open 7 AM – 6 PM</div>
          </div>
        </div>

        <div class="alert-item">
          <div class="dot dot-green"></div>
          <div>
            <div class="alert-text"><strong>Counting & Results</strong> — Jun 4, 2024</div>
            <div class="alert-date">Vote counting begins at 8 AM. Results declared throughout the day</div>
          </div>
        </div>
      </div>

      <p>Stay informed about India's democratic process. Visit Civic Clarity to explore all election topics and timelines.</p>

      <a class="cta" href="http://localhost:5173/timeline">View Full Election Timeline →</a>

      <p style="font-size:13px;color:#737782;">
        For official election information, visit <a href="https://eci.gov.in" style="color:#004492;">eci.gov.in</a> or call Voter Helpline <strong>1950</strong>.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 Civic Clarity India Election Initiative · Official Non-Partisan Resource<br/>
      You received this because you subscribed to election alerts.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Public Functions ─────────────────────────────────────────────────────────

export async function sendAlertConfirmation(toEmail: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject: '🗳️ Election Alerts Activated — Civic Clarity India',
    html: alertEmailHtml(toEmail),
    text: `Election Alerts Activated!\n\nYou're now subscribed to election deadline alerts.\n\nUpcoming Key Dates:\n- Voter Roll Revision: Jan 1, 2024\n- Final Roll Deadline: Jan 31, 2024\n- MCC in Effect: Mar 16, 2024\n- Polling Phase 1: Apr 19, 2024\n- Counting & Results: Jun 4, 2024\n\nVisit: http://localhost:5173/timeline\nVoter Helpline: 1950\nOfficial: eci.gov.in`,
  });
}

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
