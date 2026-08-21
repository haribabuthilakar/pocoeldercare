# Phase 1: Foundation & Core Backend API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-21
**Phase:** 01-Foundation & Core Backend API
**Areas discussed:** Auth & Session Strategy, 90-Service Catalog & Plan Quota Schema, Dynamic SOP & Checklist Engine, Seed Data & Mock Environment

---

## Auth & Session Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Phone Number (with mockable OTP) + Email & Password fallback | Ideal for Indian seniors, field officers & NRI children | ✓ |
| Email & Password only | Standard for web portals | |
| Phone Number + OTP exclusively | Mobile only | |

**User's choice:** Phone Number (with mockable OTP) + Email & Password fallback
**Notes:** Universal identity supporting elderly parents, field officers, and overseas NRI children. Dual Bearer JWT token architecture for web and mobile compatibility. Multi-role context switching supported per user account.

---

## 90-Service Catalog & Plan Quota Schema

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit Quota Ledgers | Each subscription tracks included visits and auto-deducts on completion | ✓ |
| Simple counter on subscription record | Basic count | |

**User's choice:** Explicit Quota Ledgers with pre-funded wallet atomic holds & first-class clinical consult models
**Notes:** Subscriptions (Kavach, Sahara, Sampoorna) decrement quota upon service completion. Pay-per-use requests hold wallet balance and settle on verified visit completion. Doctor visits store structured clinical notes and prescriptions.

---

## Dynamic SOP & Checklist Engine

| Option | Description | Selected |
|--------|-------------|----------|
| Versioned JSON-Schema Step Definitions | Fast execution, dynamic UI rendering on Field App, immutable template snapshots | ✓ |
| Normalized relational SOP step tables | Multi-table joins | |

**User's choice:** Versioned JSON-Schema Step Definitions with relational ICE profile fast caching
**Notes:** Allows checklist templates across all 90 services to evolve centrally without requiring mobile app binary updates. Emergency drills use explicit is_drill: true flag.

---

## Seed Data & Mock Environment

| Option | Description | Selected |
|--------|-------------|----------|
| Full 90-Service Catalog Seed | All 90 services populated with exact matrix pricing, plan quotas, and default SOPs | ✓ |
| Minimal 10-service pilot seed | Skeleton seed | |

**User's choice:** Full 90-Service Catalog Seed with realistic multi-city personas
**Notes:** Populates all 90 services from matrix with realistic multi-city Indian households (Bangalore, Chennai, Mumbai, Delhi), NRI family members, and test vitals histories.
