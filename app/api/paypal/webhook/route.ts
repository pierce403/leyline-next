import { NextRequest, NextResponse } from "next/server";
import {
  getPayPalAccessToken,
  getPayPalBaseUrl,
  isPayPalConfigured,
} from "@/lib/paypal";

export async function POST(req: NextRequest) {
  // Read the raw body once so we can both parse it and, later, verify it.
  const bodyText = await req.text();

  let event: unknown;
  try {
    event = JSON.parse(bodyText);
  } catch (error) {
    console.error("PayPal webhook received invalid JSON", error);
    // Respond 200 so PayPal does not repeatedly retry; we are not taking
    // any side effects yet and this endpoint is currently best-effort.
    return NextResponse.json(
      { ok: false, message: "Invalid JSON payload" },
      { status: 200 },
    );
  }

  const headers = req.headers;

  const transmissionId = headers.get("paypal-transmission-id") ?? undefined;
  const transmissionTime = headers.get("paypal-transmission-time") ?? undefined;
  const certUrl = headers.get("paypal-cert-url") ?? undefined;
  const authAlgo = headers.get("paypal-auth-algo") ?? undefined;
  const transmissionSig =
    headers.get("paypal-transmission-sig") ?? undefined;

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  console.log("PayPal webhook received", {
    transmissionId,
    transmissionTime,
    authAlgo,
    certUrl,
    hasSignature: Boolean(transmissionSig),
    webhookIdConfigured: Boolean(webhookId),
    // Do not log the full payload at info level in production logs.
  });

  let verificationStatus: string | null = null;

  if (
    isPayPalConfigured() &&
    webhookId &&
    transmissionId &&
    transmissionTime &&
    certUrl &&
    authAlgo &&
    transmissionSig
  ) {
    try {
      const baseUrl = getPayPalBaseUrl();
      const accessToken = await getPayPalAccessToken();

      const verifyResponse = await fetch(
        `${baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_algo: authAlgo,
            cert_url: certUrl,
            transmission_id: transmissionId,
            transmission_sig: transmissionSig,
            transmission_time: transmissionTime,
            webhook_id: webhookId,
            webhook_event: event,
          }),
        },
      );

      if (!verifyResponse.ok) {
        const text = await verifyResponse.text();
        console.error(
          "PayPal webhook signature verification failed",
          verifyResponse.status,
          verifyResponse.statusText,
          text,
        );
        verificationStatus = "ERROR";
      } else {
        const verifyJson = (await verifyResponse.json()) as {
          verification_status?: string;
        };
        verificationStatus = verifyJson.verification_status ?? null;
        console.log("PayPal webhook verification status", verificationStatus);
      }
    } catch (error) {
      console.error("Error while verifying PayPal webhook signature", error);
      verificationStatus = "ERROR";
    }
  } else {
    console.warn(
      "PayPal webhook received but verification is not fully configured (missing env vars or headers).",
    );
  }

  // At this stage we only log and acknowledge. Once we are ready to wire
  // this into local subscription state, we can:
  // - enforce verification_status === 'SUCCESS'
  // - inspect event type and update our database accordingly.

  console.log("PayPal webhook event (truncated)", {
    verificationStatus,
    // Provide a minimal shape for debugging.
    summary:
      event && typeof event === "object" && "event_type" in (event as Record<string, unknown>)
        ? { event_type: (event as { event_type?: string }).event_type }
        : null,
  });

  return NextResponse.json(
    {
      ok: true,
      verificationStatus,
    },
    { status: 200 },
  );
}

