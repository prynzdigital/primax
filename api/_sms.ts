// Sends SMS via Twilio's plain REST API (no `twilio` package needed, same
// lightweight-dependency approach as the rest of this API layer). No-ops
// gracefully when Twilio isn't configured yet, or when a phone number can't
// be parsed — a notification failure should never break a booking.

/** Strips a US phone number down to E.164 (+1XXXXXXXXXX), or null if unparseable. */
export function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

export async function sendSms(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  // Twilio supports two Basic Auth credential pairs — an API Key (username
  // is the SK... key SID, not the Account SID) is preferred when present,
  // falling back to the main Account SID + Auth Token pair. Either way, the
  // Account SID (AC...) always goes in the URL path, never in the auth header
  // when using an API Key.
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const authUser = apiKeySid && apiKeySecret ? apiKeySid : accountSid;
  const authPass = apiKeySid && apiKeySecret ? apiKeySecret : authToken;

  if (!accountSid || !fromNumber || !authUser || !authPass) {
    console.warn('[sms] Twilio is not configured — skipping SMS send.');
    return;
  }

  const toNumber = toE164(to);
  if (!toNumber) {
    console.warn(`[sms] Could not parse phone number "${to}" — skipping SMS send.`);
    return;
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${authUser}:${authPass}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: toNumber, From: fromNumber, Body: body }).toString(),
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`[sms] Twilio send failed (${res.status}): ${text}`);
    }
  } catch (e) {
    console.warn('[sms] Twilio send threw:', e instanceof Error ? e.message : e);
  }
}
