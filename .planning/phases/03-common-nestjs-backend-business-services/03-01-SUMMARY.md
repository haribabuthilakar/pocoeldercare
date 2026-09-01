# Phase 3 Plan 1: Dual JWT Authentication & Onboarding Core - Summary

**Completed:** 2026-09-01
**Status:** SUCCESS
**Duration:** ~8 minutes

## Overview
Implemented the dual JWT authentication system, multi-household context switching with X-Household-Id header verification, role-based access control guards (RolesGuard, FieldAuthGuard, HouseholdContextGuard), and customer onboarding workflows with sales-to-customer-success handoff in @poco/api.

## Key Deliverables & Architecture
1. **Dual JWT Auth Module (AuthModule & AuthService):**
   - External authentication for Person returning 15-minute web tokens / 7-day mobile tokens, plus 30-day rotating refresh tokens.
   - Internal authentication for InternalUser verifying bcrypt password hashes and embedding multi-role permissions array (UserRole[]).
   - Token refresh and rotation endpoint (POST /api/auth/refresh).
   - Active household switching endpoint (POST /api/auth/switch-household).
2. **Context & Access Guards:**
   - JwtAuthGuard: Validates Bearer token and attaches decoded principal to equest.user.
   - RolesGuard: Verifies internal user roles and capabilities against @poco/business-rules capability matrix.
   - FieldAuthGuard: Restricts field operations access to CARE_OFFICER and SUPER_ADMIN roles.
   - HouseholdContextGuard: Intercepts X-Household-Id (with fallback) and verifies caller has active membership in HouseholdMembership table, attaching { householdId, role, isPrimaryContact } to equest.household.
3. **Households & Onboarding Controllers:**
   - Multi-senior onboarding endpoint supporting 1 to 4 seniors with medical profiles (POST /api/family/v1/onboarding/household).
   - Sales lead creation on customer signup (POST /api/family/v1/onboarding/signup, ONBD-01).
   - Sales-to-CS handoff transition (POST /api/family/v1/onboarding/submit, ONBD-03).
   - Household membership management (inviting caregivers, removing members).
4. **Verification & Tests:**
   - Full Vitest test suite in pps/api/test/auth.spec.ts and pps/api/test/onboarding.spec.ts (9 tests passing).
   - @poco/api cleanly compiles via 	sup.
