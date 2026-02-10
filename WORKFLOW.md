# Application Workflow Analysis: Agent Commission System

This document outlines the core workflows for **Agents** (Users) and **Administrators** within the Electric Sojourner (GDI Consult) platform, focusing on the dynamic commission calculation system.

## 1. Core Concept: Users are Agents
The platform is designed for **Agents** who purchase packages/services on behalf of their end customers. The application automates the calculation of the **Commission** the agent earns for each sale.

## 2. Agent Workflow (The User)

### A. Onboarding
- **Registration:** Agents sign up (`/auth/register`).
- **Profile:** System assigns a default **Commission Rate** (e.g., 80%) upon registration. This rate is stored in the agent's profile.

### B. Procurement (Making a Purchase)
1.  **Agent Action:** The agent logs in and purchases a package (e.g., "Web Dev Package") for a customer.
2.  **Transaction:**
    -   Agent pays the full price (e.g., $1000).
    -   System records the order.

### C. Commission Calculation (The "Snapshot" Logic)
This is the critical financial engine:
1.  **Trigger:** When the payment is confirmed (`COMPLETED`).
2.  **Rate Lookup:** The system looks up the **Agent's Current Commission Rate** at that exact moment.
    *   *Example:* IF Agent Rate = 40%, THEN Commission = $400.
3.  **Snapshot:** This specific dollar amount and rate are saved permanently for *this* transaction.
    *   *Crucial Behavior:* If the Admin changes the agent's rate to 60% tomorrow, **this past transaction remains at $400**. Only *new* purchases will earn $600.
4.  **Wallet Credit:** The calculated commission ($400) is added to the Agent's **Wallet Balance**.

### D. Payout (Withdrawal)
-   The Agent can see their total accumulated commissions in the **Dashboard**.
-   Agent requests a Payout to withdraw their earnings.

---

## 3. Administrator Workflow

### A. Managing Agents & Rates
- **Flexible Rates:** Admins can adjust the `Commission Rate` for any specific agent via the Dashboard (`/super-admin/users` or `/admin/users`).
-   **Scenario:**
    -   Agent A is performing well. Admin increases their rate from 40% to 50%.
    -   **Result:** All *future* purchases by Agent A will now earn 50%. All *past* purchases remain safely calculated at 40%.

### B. Processing Payouts
-   Admins review payout requests.
-   Since the commission was already calculated and "locked" at the time of purchase, the Admin simply verifies the current Wallet Balance and approves the transfer.

---

## 4. Technical Mapping (Codebase)

| Business Term | Codebase Term |
| :--- | :--- |
| **Agent** | `User` (Role: USER) |
| **Commission Rate** | `User.cashbackPercentage` (Float) |
| **Commission Transaction** | `CashbackTransaction` |
| **Wallet** | `Wallet` |
| **Payout** | `Payout` |

*Note: The code uses the term "Cashback", which effectively functions as the "Commission" in this business model.*
