import "server-only";

type LeadEmail = { subject: string; text: string; replyTo?: string };

export async function sendAdminLeadEmail(input: LeadEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !to || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: input.subject, text: input.text, ...(input.replyTo ? { reply_to: input.replyTo } : {}) })
  });
  if (!response.ok) {
    console.error("lead_email_failed", await response.text());
    return false;
  }
  return true;
}
