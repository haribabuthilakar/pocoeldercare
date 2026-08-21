# Phase 2: Family Portal Web Application - Context & Decisions

Date: 2026-08-21
Status: LOCKED (User Approved)

---

## 1. Architecture & UI Stack Decisions
- **Frontend Framework**: Next.js 14 / 15 App Router located in `apps/family-portal` connecting to the NestJS API at `http://localhost:3001/api/v1` via REST over JSON.
- **Styling & Components**: Tailwind CSS, Lucide React icons, and Shadcn-derived responsive components (Button, Card, Badge, Modal, Tabs, Dropdown, Avatar). Fully responsive for desktop (NRIs) and mobile browsers (local family).

---

## 2. Vitals Trend Visualization & Health Summaries
- **Charting Engine**: Interactive Recharts visualizations for Blood Pressure (Systolic/Diastolic), SpO2 %, Fasting & Random Blood Glucose, Pulse, and Weight.
- **Safe-Zone Reference Bands**: Light green background bands representing safe geriatric reference ranges (e.g. BP 90-to-140/60-to-90, SpO2 >92%), with auto-flagged amber/red points for abnormal readings.
- **Timeframes**: Timeframe toggles for 7d, last 30d, last 90d.
- **Plain-Language Status Badges**: Health status badges for family peace of mind ("Vitals Stable", "Glucose Within Target", "Attending Doctor Reviewed").

---

## 3. Dual-Timezone Interactive Calendar & Appointments
- **Dual-Time Rendering**: Prominent badges on every appointment card and detail view, showing both Indian Standard Time (IST) and the family member's local timezone (e.g. "Tomorrow 10:30 AM IST (Today 10:00 PM PDT)") to prevent NRI time confusion.
- **Timezone Preference Switcher**: Auto-detects browser timezone with an instant dropdown to switch between US Pacific, US Eastern, UK GMT, Dubai GST, Singapore SGT, etc.
- **Appointment Categories**: Doctor Home Visits, GP/Specialist Teleconsults, Care Officer Home Visits, Diagnostics Sample Collections.

---

## 4. 90-Service Catalog Booking & Wallet Workflow
- **Quota-First Check**: Upon selecting any of the 90 services, system checks the Household's active Subscription Plan (Kavach, Sahara, Sampoorna):
  - If included in quota and quota remains: depletes quota at ₹0 charge.
  - If pay-per-use extra or quota exhausted: displays transparent INR pricing upfront and atomically holds from in-app wallet.
- **Instant Wallet Top-Up Modal**: If wallet balance is insufficient, prompts a simple INR wallet top-up modal (simulating Razorpay/UPI/Netbanking) before confirming the booking.

---

## 5. Monthly Value Digest & Named Care Officer Profile
- **Value Digest View**: Clear monthly rollup displaying total visits completed, recorded vitals, preventive clinical catches, emergency readiness status, and quantified savings.
- **Named Care Officer Card**: Displays Care Officer photo, military/healthcare background bio, direct phone link, and published caseload transparency (e.g. "35 families/care officer").
- **Invoice Download**: One-click Invoice View & PDF/Print generation for monthly subscriptions and extra wallet transactions.
