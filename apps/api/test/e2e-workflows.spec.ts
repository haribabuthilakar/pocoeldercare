import { describe, it, expect, beforeAll } from 'vitest';
import { PrismaClient } from '@poco/database';
import { AuthService } from '../src/modules/auth/auth.service';
import { CareOfficersService } from '../src/modules/care-officers/care-officers.service';
import { TicketsService } from '../src/modules/tickets/tickets.service';
import { BillingService } from '../src/modules/billing/billing.service';
import { JwtService } from '@nestjs/jwt';
import { FamilyRole, TicketPriority, TicketStatus, ServiceRequestStatus, UserRole } from '@poco/constants';

describe('Real PostgreSQL Integration: End-to-End Multi-Actor Workflows (TEST-01, D-09)', () => {
  let prisma: PrismaClient;
  let authService: AuthService;
  let careOfficersService: CareOfficersService;
  let ticketsService: TicketsService;
  let billingService: BillingService;
  let jwtService: JwtService;

  beforeAll(() => {
    prisma = new PrismaClient();
    jwtService = new JwtService({ secret: 'dev-external-secret-change-in-production-min-32-chars-long' });
    const prismaService = { client: prisma, ...prisma } as any;

    authService = new AuthService(prismaService, jwtService);
    careOfficersService = new CareOfficersService(prismaService);
    billingService = new BillingService(prismaService);
    ticketsService = new TicketsService(prismaService, careOfficersService, billingService);
  });

  it('executes complete journey: Lead -> Onboarding -> Care Officer Assignment -> Ticket -> SOP Completion -> 3-Step Billing Debit', async () => {
    const timestamp = Date.now();
    const phone = `98711${(timestamp % 100000).toString().padStart(5, '0')}`;
    const email = `test.family.${timestamp}@pocoeldercare.com`;

    // 1. External Lead Signup & Household Creation
    const signup = await authService.signupExternal({
      name: 'Dr. Subramanian Swamy',
      phone,
      email,
      role: FamilyRole.PRIMARY_CAREGIVER,
    });

    expect(signup.accessToken).toBeDefined();
    const decoded = jwtService.verify(signup.accessToken);
    const householdId = decoded.householdId;

    // Verify Household & Wallet created
    const household = await prisma.household.findUnique({
      where: { id: householdId },
      include: { wallet: true },
    });
    expect(household).toBeDefined();
    expect(household?.wallet).toBeDefined();

    // 2. Add Senior with Clinical Profile
    const senior = await prisma.senior.create({
      data: {
        householdId,
        name: 'Elder Meenakshi Swamy',
        dateOfBirth: new Date('1948-04-12'),
        gender: 'FEMALE',
        bloodGroup: 'B+',
        medicalProfile: {
          create: {
            abhaId: '91-4567-8901-2345',
            allergies: ['Penicillin'],
            chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
            iceContactName: 'Dr. Subramanian Swamy',
            iceContactPhone: phone,
            iceRelationship: 'Son',
          },
        },
      },
    });
    expect(senior.id).toBeDefined();

    // 3. Manager assigns Care Officer to Household
    const careOfficerUser = await prisma.internalUser.findUnique({
      where: { email: 'officer1@pocoeldercare.com' },
      include: { careOfficerProfile: true },
    });
    expect(careOfficerUser?.careOfficerProfile).toBeDefined();
    const officerProfileId = careOfficerUser!.careOfficerProfile!.id;

    // Clear any existing assignment on officer1 to ensure strict 1:1 invariant
    await prisma.household.updateMany({
      where: { assignedCareOfficerId: officerProfileId },
      data: { assignedCareOfficerId: null },
    });

    const assignedResult = await careOfficersService.assignCareOfficer(
      householdId,
      officerProfileId,
      { sub: 'manager-1', roles: [UserRole.CARE_MANAGER] },
      ['BLS_CPR']
    );
    expect(assignedResult.success).toBe(true);
    expect(assignedResult.assignedCareOfficerId).toBe(officerProfileId);

    // 4. Top-up Household Wallet with ₹2,000 (200,000 paise)
    await billingService.creditWalletFromWebhook(householdId, 200000, `rzp_test_pay_${timestamp}`);
    const walletState = await billingService.getHouseholdWallet(householdId);
    expect(walletState.balancePaise).toBe(200000);

    // 5. Create Routine Ticket for Doctor Home Consultation
    const doctorService = await prisma.serviceCatalog.findUnique({
      where: { code: 'DOCTOR_HOME_VISIT' },
      include: { versions: true },
    });
    expect(doctorService).toBeDefined();
    const serviceVersion = doctorService!.versions[0];

    const ticket = await prisma.ticket.create({
      data: {
        householdId,
        seniorId: senior.id,
        title: 'Doctor Home Consultation for Elder Meenakshi',
        description: 'Routine blood pressure and diabetic checkup',
        category: doctorService!.category,
        priority: TicketPriority.ROUTINE,
        status: TicketStatus.OPEN,
        responseDueAt: new Date(Date.now() + 1000 * 60 * 60),
        deliveryDueAt: new Date(Date.now() + 1000 * 60 * 180),
        assignedCareOfficerId: officerProfileId,
        serviceRequests: {
          create: [
            {
              serviceCatalogVersionId: serviceVersion.id,
              status: ServiceRequestStatus.IN_PROGRESS,
              unitPricePaise: serviceVersion.pricePaise, // ₹1,200 (120,000 paise)
              assignedCareOfficerId: officerProfileId,
            },
          ],
        },
      },
      include: { serviceRequests: true },
    });

    expect(ticket.id).toBeDefined();
    const serviceRequestId = ticket.serviceRequests[0].id;

    // 6. Process 3-Step Billing Engine (No quota -> Auto Debit Wallet with 18% GST)
    // ₹1,200 base + 18% GST (₹216) = ₹1,416 (141,600 paise)
    const billingResult = await billingService.processBillingForService(serviceRequestId);
    expect(billingResult.success).toBe(true);
    expect(billingResult.action).toBe('AUTO_DEBIT_WALLET');
    expect(billingResult.amountPaise).toBe(141600);

    // Verify wallet balance decremented cleanly: 200,000 - 141,600 = 58,400 paise (₹584)
    const updatedWallet = await billingService.getHouseholdWallet(householdId);
    expect(updatedWallet.balancePaise).toBe(58400);

    // 7. Resolve Ticket & Complete Service Request
    await prisma.serviceRequest.update({
      where: { id: serviceRequestId },
      data: { status: ServiceRequestStatus.COMPLETED, completedAt: new Date() },
    });
    const resolvedTicket = await ticketsService.recalculateRollupStatus(ticket.id);
    expect(resolvedTicket.status).toBe(TicketStatus.RESOLVED);
  });
});
