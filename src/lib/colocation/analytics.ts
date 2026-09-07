// Lightweight analytics bridge: pushes to window.dataLayer / gtag when present, otherwise no-op.
// Never send personally identifiable form fields through this helper.
export type ColocationEvent =
    | "colocation_page_view"
    | "colocation_calculator_started"
    | "colocation_server_type_selected"
    | "colocation_b200_selected"
    | "colocation_b300_selected"
    | "colocation_quantity_changed"
    | "colocation_enterprise_threshold_reached"
    | "colocation_quote_clicked"
    | "colocation_quote_submitted"
    | "colocation_whatsapp_clicked";

export interface ColocationEventProps {
    server_type?: string;
    quantity?: number;
    power_kw?: number;
    monthly_estimate?: number;
    contract_term?: number;
    enterprise_tier?: string;
}

declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>;
        gtag?: (...args: unknown[]) => void;
    }
}

export function track(event: ColocationEvent, props: ColocationEventProps = {}) {
    if (typeof window === "undefined") return;
    try {
        window.dataLayer?.push({ event, ...props });
        window.gtag?.("event", event, props);
    } catch {
        /* analytics must never break the page */
    }
}
