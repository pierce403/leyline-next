import "server-only";

type PayPalEnvironment = "live" | "sandbox";

type PayPalMoney = {
  currencyCode: string;
  value: string;
};

export type PayPalTransaction = {
  id: string;
  status: string;
  eventCode?: string;
  time: string;
  amount: PayPalMoney;
  payerEmail?: string;
  paypalReferenceId?: string | null;
  paypalReferenceType?: string | null;
};

export type PayPalSubscriptionSummary = {
  subscriptionId: string;
  payerEmail?: string;
  lastTransactionTime?: string;
  lastTransactionAmount?: PayPalMoney | null;
  transactionCount: number;
};

function getPayPalEnv(): PayPalEnvironment {
  const raw =
    process.env.PAYPAL_ENV ??
    process.env.PAYPAL_MODE ??
    process.env.PAYPAL_ENVIRONMENT ??
    "live";

  const normalized = raw.toString().toLowerCase();
  return normalized === "sandbox" ? "sandbox" : "live";
}

export function getPayPalBaseUrl(): string {
  const env = getPayPalEnv();
  return env === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET,
  );
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
    );
  }

  const baseUrl = getPayPalBaseUrl();
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to obtain PayPal access token: ${response.status} ${response.statusText} – ${text}`,
    );
  }

  const data = (await response.json()) as {
    access_token?: string;
  };

  if (!data.access_token) {
    throw new Error("PayPal OAuth response did not include an access token.");
  }

  return data.access_token;
}

function toIso8601(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export async function listRecentPayPalTransactions(
  days: number = 90,
): Promise<PayPalTransaction[]> {
  if (!isPayPalConfigured()) {
    throw new Error(
      "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
    );
  }

  const baseUrl = getPayPalBaseUrl();
  const accessToken = await getPayPalAccessToken();

  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

  const startIso = toIso8601(start);
  const endIso = toIso8601(end);

  const url = new URL(`${baseUrl}/v1/reporting/transactions`);
  url.searchParams.set("start_date", startIso);
  url.searchParams.set("end_date", endIso);
  url.searchParams.set("fields", "all");
  url.searchParams.set("page_size", "100");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to fetch PayPal transactions: ${response.status} ${response.statusText} – ${text}`,
    );
  }

  const data = (await response.json()) as {
    transaction_details?: Array<{
      transaction_info?: {
        transaction_id?: string;
        transaction_status?: string;
        transaction_event_code?: string;
        transaction_initiation_date?: string;
        transaction_updated_date?: string;
        transaction_amount?: {
          currency_code?: string;
          value?: string;
        };
        paypal_reference_id?: string | null;
        paypal_reference_id_type?: string | null;
      };
      payer_info?: {
        email_address?: string;
      };
    }>;
  };

  const details = data.transaction_details ?? [];

  return details
    .map((detail): PayPalTransaction | null => {
      const info = detail.transaction_info;
      if (!info) return null;

      const id = info.transaction_id ?? "";
      const status = info.transaction_status ?? "UNKNOWN";
      const eventCode = info.transaction_event_code;
      const time =
        info.transaction_updated_date ??
        info.transaction_initiation_date ??
        new Date().toISOString();
      const amountRaw = info.transaction_amount ?? {};
      const amount: PayPalMoney = {
        currencyCode: amountRaw.currency_code ?? "USD",
        value: amountRaw.value ?? "0.00",
      };
      const payerEmail = detail.payer_info?.email_address;

      return {
        id,
        status,
        eventCode,
        time,
        amount,
        payerEmail,
        paypalReferenceId: info.paypal_reference_id ?? null,
        paypalReferenceType: info.paypal_reference_id_type ?? null,
      };
    })
    .filter((tx): tx is PayPalTransaction => tx !== null);
}

export function summarizeSubscriptionsFromTransactions(
  transactions: PayPalTransaction[],
): PayPalSubscriptionSummary[] {
  const summaries = new Map<string, PayPalSubscriptionSummary>();

  transactions.forEach((tx) => {
    const refId = tx.paypalReferenceId;
    const refType = tx.paypalReferenceType;

    // Heuristic: treat PayPal reference IDs marked as subscription-like as a subscription.
    if (
      !refId ||
      !refType ||
      !["SUBSCRIPTION", "SUB", "BILLING_AGREEMENT"].includes(
        refType.toUpperCase(),
      )
    ) {
      return;
    }

    const existing = summaries.get(refId);

    if (!existing) {
      summaries.set(refId, {
        subscriptionId: refId,
        payerEmail: tx.payerEmail,
        lastTransactionTime: tx.time,
        lastTransactionAmount: tx.amount,
        transactionCount: 1,
      });
    } else {
      existing.transactionCount += 1;
      // Keep the most recent transaction time as "last".
      if (!existing.lastTransactionTime || tx.time > existing.lastTransactionTime) {
        existing.lastTransactionTime = tx.time;
        existing.lastTransactionAmount = tx.amount;
        if (tx.payerEmail) {
          existing.payerEmail = tx.payerEmail;
        }
      }
    }
  });

  return Array.from(summaries.values()).sort((a, b) => {
    const aTime = a.lastTransactionTime ?? "";
    const bTime = b.lastTransactionTime ?? "";
    return aTime < bTime ? 1 : aTime > bTime ? -1 : 0;
  });
}
