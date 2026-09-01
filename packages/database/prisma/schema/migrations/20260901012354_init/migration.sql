-- CreateEnum
CREATE TYPE "ActivityActorType" AS ENUM ('PERSON', 'INTERNAL_USER', 'SYSTEM', 'AI_BOT');

-- CreateEnum
CREATE TYPE "ActivityEventType" AS ENUM ('MESSAGE', 'VISIT_REPORT', 'VITAL_ALERT', 'SYSTEM_EVENT', 'TICKET_UPDATE', 'BILLING_EVENT');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('INTERNAL_USER', 'FAMILY_MEMBER', 'SYSTEM', 'PARTNER_WEBHOOK');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'OPS_MANAGER', 'CARE_MANAGER', 'CARE_OFFICER', 'SALES_LEAD');

-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('PRIMARY_CAREGIVER', 'SECONDARY_CAREGIVER', 'SENIOR', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "BillingTransactionType" AS ENUM ('QUOTA_DEBIT', 'WALLET_DEBIT', 'WALLET_CREDIT', 'HOLD_CREATE', 'HOLD_RELEASE', 'EMERGENCY_OVERDRAFT', 'REFUND');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('CLINICAL', 'COMPANIONSHIP', 'LOGISTICS', 'EMERGENCY', 'HOUSEHOLD', 'ADVICE');

-- CreateEnum
CREATE TYPE "SopProofType" AS ENUM ('NONE', 'PHOTO', 'CHOICE', 'TEXT');

-- CreateEnum
CREATE TYPE "PackageTier" AS ENUM ('KAVACH', 'SAHARA', 'SAMPOORNA');

-- CreateEnum
CREATE TYPE "PartnerCode" AS ENUM ('RAZORPAY', 'EXOTEL', 'POCOCARE', 'POCOCARE_EMR', 'WEARABLE_IOT', 'ABHA', 'WHATSAPP', 'ONE_MG', 'APOLLO_1MG', 'ORANGE_LABS', 'HEALTH_SERVICES', 'MAX_HEALTHCARE', 'INSTAMART', 'SWIGGY', 'URBAN_COMPANY', 'OLA', 'UBER_CARE', 'PORTER_LOGISTICS');

-- CreateEnum
CREATE TYPE "PartnerCategory" AS ENUM ('PAYMENT', 'TELEPHONY', 'HEALTHCARE_EMR', 'IOT_DEVICE', 'PHARMACY', 'HOSPITAL', 'TRANSPORT', 'LOGISTICS', 'DIAGNOSTICS', 'MESSAGING', 'QUICK_COMMERCE', 'MEAL_DELIVERY', 'HOME_SERVICES');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('ACTIVE', 'DEGRADED', 'DOWN', 'MOCK_ONLY');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FAMILY_INPUT', 'WAITING_OPS_UPDATE', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_TRANSIT', 'ON_SITE', 'IN_PROGRESS', 'COMPLETED', 'EXCEPTION', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('EMERGENCY', 'URGENT', 'ROUTINE');

-- CreateEnum
CREATE TYPE "SlaStatus" AS ENUM ('NORMAL', 'AT_RISK', 'BREACHED');

-- CreateEnum
CREATE TYPE "TriageStatus" AS ENUM ('PENDING_TRIAGE', 'CONFIRMED', 'DISMISSED', 'AUTO_CONVERTED');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'VISIT_SCHEDULED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "VitalType" AS ENUM ('BLOOD_PRESSURE', 'BLOOD_GLUCOSE', 'SPO2', 'HEART_RATE', 'BODY_TEMPERATURE', 'WEIGHT', 'FALL_ALERT');

-- CreateEnum
CREATE TYPE "VitalSeverity" AS ENUM ('NORMAL', 'ATTENTION', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VitalSource" AS ENUM ('MANUAL', 'BLUETOOTH', 'WEARABLE_IOT', 'POCOCARE_EMR');

-- CreateTable
CREATE TABLE "activity_feed_items" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "actorType" "ActivityActorType" NOT NULL,
    "actorId" TEXT,
    "senderName" TEXT NOT NULL,
    "eventType" "ActivityEventType" NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "aiTriageStatus" "TriageStatus",
    "aiTriageResult" JSONB,
    "linkedTicketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_officer_profiles" (
    "id" TEXT NOT NULL,
    "internalUserId" TEXT NOT NULL,
    "managerId" TEXT,
    "phone" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "homeBaseLat" DOUBLE PRECISION NOT NULL,
    "homeBaseLng" DOUBLE PRECISION NOT NULL,
    "clusterCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_officer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "validityDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_officer_certifications" (
    "id" TEXT NOT NULL,
    "careOfficerId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "CertificationStatus" NOT NULL DEFAULT 'ACTIVE',
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_officer_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorType" "AuditActorType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_memberships" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "role" "FamilyRole" NOT NULL DEFAULT 'PRIMARY_CAREGIVER',
    "isPrimaryContact" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_user_roles" (
    "id" TEXT NOT NULL,
    "internalUserId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_wallets" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "balancePaise" INTEGER NOT NULL DEFAULT 0,
    "creditLimitPaise" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "balanceAfterPaise" INTEGER NOT NULL,
    "type" "BillingTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "referenceEntityType" TEXT,
    "referenceEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_subscriptions" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "packageVersionId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quota_allocations" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "serviceCatalogId" TEXT NOT NULL,
    "allocatedUnits" INTEGER NOT NULL,
    "usedUnits" INTEGER NOT NULL DEFAULT 0,
    "billingPeriodStart" TIMESTAMP(3) NOT NULL,
    "billingPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quota_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_catalogs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "defaultIsEmergency" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_catalog_versions" (
    "id" TEXT NOT NULL,
    "serviceCatalogId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "requiredCertifications" JSONB NOT NULL DEFAULT '[]',
    "estimatedDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_catalog_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sop_step_versions" (
    "id" TEXT NOT NULL,
    "serviceCatalogVersionId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "proofType" "SopProofType" NOT NULL DEFAULT 'NONE',
    "choiceOptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sop_step_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "PackageTier" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_versions" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "monthlyPricePaise" INTEGER NOT NULL,
    "yearlyPricePaise" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_service_quotas" (
    "id" TEXT NOT NULL,
    "packageVersionId" TEXT NOT NULL,
    "serviceCatalogId" TEXT NOT NULL,
    "monthlyUnits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_service_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "assignedCareOfficerId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seniors" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seniors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "senior_medical_profiles" (
    "id" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chronicConditions" JSONB NOT NULL DEFAULT '[]',
    "abhaId" TEXT,
    "iceContactName" TEXT NOT NULL,
    "iceContactPhone" TEXT NOT NULL,
    "iceRelationship" TEXT NOT NULL,
    "pococarePatientId" TEXT,
    "notes" TEXT,
    "wearableDeviceId" TEXT,
    "lastWearablePingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "senior_medical_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_escalation_tiers" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "tierOrder" INTEGER NOT NULL,
    "personId" TEXT NOT NULL,
    "contactMethods" TEXT[] DEFAULT ARRAY['SMS', 'PHONE']::TEXT[],
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_escalation_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_partners" (
    "id" TEXT NOT NULL,
    "partnerCode" "PartnerCode" NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PartnerCategory" NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'MOCK_ONLY',
    "mockSettings" JSONB,
    "lastPingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "source" "PartnerCode" NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_integration_calls" (
    "id" TEXT NOT NULL,
    "partnerCode" "PartnerCode" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestPayload" JSONB NOT NULL,
    "responseStatus" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "householdId" TEXT,
    "ticketId" TEXT,
    "serviceRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbound_integration_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_attachments" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "seniorId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "slaStatus" "SlaStatus" NOT NULL DEFAULT 'NORMAL',
    "responseDueAt" TIMESTAMP(3) NOT NULL,
    "deliveryDueAt" TIMESTAMP(3) NOT NULL,
    "assignedCareOfficerId" TEXT,
    "triageStatus" "TriageStatus",
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "serviceCatalogVersionId" TEXT NOT NULL,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "unitPricePaise" INTEGER NOT NULL,
    "assignedCareOfficerId" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_sop_progress" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "sopStepVersionId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "proofUrl" TEXT,
    "choiceValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_sop_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_officer_visit_logs" (
    "id" TEXT NOT NULL,
    "careOfficerId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "ticketId" TEXT,
    "checkInAt" TIMESTAMP(3) NOT NULL,
    "checkOutAt" TIMESTAMP(3),
    "checkInLat" DOUBLE PRECISION NOT NULL,
    "checkInLng" DOUBLE PRECISION NOT NULL,
    "distanceMeters" INTEGER NOT NULL DEFAULT 0,
    "isGeofenceVerified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "care_officer_visit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "addressLine1" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "assignedOfficerId" TEXT,
    "convertedHouseholdId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_visits" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "careOfficerId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "assessmentNotes" JSONB,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "senior_vital_readings" (
    "id" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "vitalType" "VitalType" NOT NULL,
    "numericValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "severity" "VitalSeverity" NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "source" "VitalSource" NOT NULL DEFAULT 'MANUAL',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "senior_vital_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_feed_items_householdId_createdAt_idx" ON "activity_feed_items"("householdId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "care_officer_profiles_internalUserId_key" ON "care_officer_profiles"("internalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_code_key" ON "certifications"("code");

-- CreateIndex
CREATE UNIQUE INDEX "care_officer_certifications_careOfficerId_certificationId_key" ON "care_officer_certifications"("careOfficerId", "certificationId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_timestamp_idx" ON "audit_logs"("actorId", "timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_configKey_key" ON "system_configs"("configKey");

-- CreateIndex
CREATE UNIQUE INDEX "persons_phone_key" ON "persons"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "household_memberships_personId_householdId_key" ON "household_memberships"("personId", "householdId");

-- CreateIndex
CREATE UNIQUE INDEX "internal_users_email_key" ON "internal_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "internal_user_roles_internalUserId_role_key" ON "internal_user_roles"("internalUserId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "household_wallets_householdId_key" ON "household_wallets"("householdId");

-- CreateIndex
CREATE INDEX "wallet_transactions_walletId_createdAt_idx" ON "wallet_transactions"("walletId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "household_subscriptions_householdId_status_idx" ON "household_subscriptions"("householdId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "quota_allocations_subscriptionId_serviceCatalogId_billingPe_key" ON "quota_allocations"("subscriptionId", "serviceCatalogId", "billingPeriodStart");

-- CreateIndex
CREATE UNIQUE INDEX "service_catalogs_code_key" ON "service_catalogs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "service_catalog_versions_serviceCatalogId_version_key" ON "service_catalog_versions"("serviceCatalogId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "sop_step_versions_serviceCatalogVersionId_stepOrder_key" ON "sop_step_versions"("serviceCatalogVersionId", "stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "packages_code_key" ON "packages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "package_versions_packageId_version_key" ON "package_versions"("packageId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "package_service_quotas_packageVersionId_serviceCatalogId_key" ON "package_service_quotas"("packageVersionId", "serviceCatalogId");

-- CreateIndex
CREATE UNIQUE INDEX "households_assignedCareOfficerId_key" ON "households"("assignedCareOfficerId");

-- CreateIndex
CREATE UNIQUE INDEX "senior_medical_profiles_seniorId_key" ON "senior_medical_profiles"("seniorId");

-- CreateIndex
CREATE INDEX "senior_medical_profiles_wearableDeviceId_idx" ON "senior_medical_profiles"("wearableDeviceId");

-- CreateIndex
CREATE UNIQUE INDEX "family_escalation_tiers_householdId_tierOrder_key" ON "family_escalation_tiers"("householdId", "tierOrder");

-- CreateIndex
CREATE UNIQUE INDEX "integration_partners_partnerCode_key" ON "integration_partners"("partnerCode");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_idempotencyKey_key" ON "webhook_events"("idempotencyKey");

-- CreateIndex
CREATE INDEX "outbound_integration_calls_partnerCode_idx" ON "outbound_integration_calls"("partnerCode");

-- CreateIndex
CREATE INDEX "outbound_integration_calls_householdId_idx" ON "outbound_integration_calls"("householdId");

-- CreateIndex
CREATE INDEX "outbound_integration_calls_ticketId_idx" ON "outbound_integration_calls"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "media_attachments_s3Key_key" ON "media_attachments"("s3Key");

-- CreateIndex
CREATE INDEX "media_attachments_entityType_entityId_idx" ON "media_attachments"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "tickets_slaStatus_responseDueAt_idx" ON "tickets"("slaStatus", "responseDueAt");

-- CreateIndex
CREATE INDEX "tickets_householdId_createdAt_idx" ON "tickets"("householdId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "tickets_assignedCareOfficerId_status_idx" ON "tickets"("assignedCareOfficerId", "status");

-- CreateIndex
CREATE INDEX "service_requests_ticketId_status_idx" ON "service_requests"("ticketId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_sop_progress_serviceRequestId_sopStepVersionId_key" ON "ticket_sop_progress"("serviceRequestId", "sopStepVersionId");

-- CreateIndex
CREATE INDEX "care_officer_visit_logs_careOfficerId_checkInAt_idx" ON "care_officer_visit_logs"("careOfficerId", "checkInAt" DESC);

-- CreateIndex
CREATE INDEX "care_officer_visit_logs_householdId_checkInAt_idx" ON "care_officer_visit_logs"("householdId", "checkInAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_visits_leadId_key" ON "onboarding_visits"("leadId");

-- CreateIndex
CREATE INDEX "senior_vital_readings_seniorId_recordedAt_idx" ON "senior_vital_readings"("seniorId", "recordedAt" DESC);

-- AddForeignKey
ALTER TABLE "activity_feed_items" ADD CONSTRAINT "activity_feed_items_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_feed_items" ADD CONSTRAINT "activity_feed_items_linkedTicketId_fkey" FOREIGN KEY ("linkedTicketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_officer_profiles" ADD CONSTRAINT "care_officer_profiles_internalUserId_fkey" FOREIGN KEY ("internalUserId") REFERENCES "internal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_officer_profiles" ADD CONSTRAINT "care_officer_profiles_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "care_officer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_officer_certifications" ADD CONSTRAINT "care_officer_certifications_careOfficerId_fkey" FOREIGN KEY ("careOfficerId") REFERENCES "care_officer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_officer_certifications" ADD CONSTRAINT "care_officer_certifications_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_memberships" ADD CONSTRAINT "household_memberships_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_memberships" ADD CONSTRAINT "household_memberships_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_user_roles" ADD CONSTRAINT "internal_user_roles_internalUserId_fkey" FOREIGN KEY ("internalUserId") REFERENCES "internal_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_wallets" ADD CONSTRAINT "household_wallets_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "household_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_subscriptions" ADD CONSTRAINT "household_subscriptions_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_subscriptions" ADD CONSTRAINT "household_subscriptions_packageVersionId_fkey" FOREIGN KEY ("packageVersionId") REFERENCES "package_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_allocations" ADD CONSTRAINT "quota_allocations_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "household_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_allocations" ADD CONSTRAINT "quota_allocations_serviceCatalogId_fkey" FOREIGN KEY ("serviceCatalogId") REFERENCES "service_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_catalog_versions" ADD CONSTRAINT "service_catalog_versions_serviceCatalogId_fkey" FOREIGN KEY ("serviceCatalogId") REFERENCES "service_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sop_step_versions" ADD CONSTRAINT "sop_step_versions_serviceCatalogVersionId_fkey" FOREIGN KEY ("serviceCatalogVersionId") REFERENCES "service_catalog_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_versions" ADD CONSTRAINT "package_versions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_service_quotas" ADD CONSTRAINT "package_service_quotas_packageVersionId_fkey" FOREIGN KEY ("packageVersionId") REFERENCES "package_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_service_quotas" ADD CONSTRAINT "package_service_quotas_serviceCatalogId_fkey" FOREIGN KEY ("serviceCatalogId") REFERENCES "service_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_assignedCareOfficerId_fkey" FOREIGN KEY ("assignedCareOfficerId") REFERENCES "care_officer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seniors" ADD CONSTRAINT "seniors_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "senior_medical_profiles" ADD CONSTRAINT "senior_medical_profiles_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "seniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_escalation_tiers" ADD CONSTRAINT "family_escalation_tiers_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_escalation_tiers" ADD CONSTRAINT "family_escalation_tiers_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "seniors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedCareOfficerId_fkey" FOREIGN KEY ("assignedCareOfficerId") REFERENCES "care_officer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_serviceCatalogVersionId_fkey" FOREIGN KEY ("serviceCatalogVersionId") REFERENCES "service_catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_assignedCareOfficerId_fkey" FOREIGN KEY ("assignedCareOfficerId") REFERENCES "care_officer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sop_progress" ADD CONSTRAINT "ticket_sop_progress_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sop_progress" ADD CONSTRAINT "ticket_sop_progress_sopStepVersionId_fkey" FOREIGN KEY ("sopStepVersionId") REFERENCES "sop_step_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_officer_visit_logs" ADD CONSTRAINT "care_officer_visit_logs_careOfficerId_fkey" FOREIGN KEY ("careOfficerId") REFERENCES "care_officer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_officer_visit_logs" ADD CONSTRAINT "care_officer_visit_logs_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_officer_visit_logs" ADD CONSTRAINT "care_officer_visit_logs_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_visits" ADD CONSTRAINT "onboarding_visits_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_visits" ADD CONSTRAINT "onboarding_visits_careOfficerId_fkey" FOREIGN KEY ("careOfficerId") REFERENCES "care_officer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "senior_vital_readings" ADD CONSTRAINT "senior_vital_readings_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "seniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
