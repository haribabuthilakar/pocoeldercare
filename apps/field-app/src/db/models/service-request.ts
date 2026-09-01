export interface ServiceRequestRecord {
  id: string;
  ticket_id: string;
  service_catalog_version_id: string;
  title?: string;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'SCHEDULED'
    | 'ASSIGNED'
    | 'TRANSIT_START'
    | 'ON_SITE'
    | 'IN_PROGRESS'
    | 'EXCEPTION_FLAGGED'
    | 'COMPLETED'
    | 'CANCELLED';
  scheduled_for?: string;
  sop_version_id?: string;
}

export class ServiceRequestModel {
  static table = 'service_requests';

  constructor(public raw: ServiceRequestRecord) {}

  get id(): string {
    return this.raw.id;
  }
  get ticketId(): string {
    return this.raw.ticket_id;
  }
  get serviceCatalogVersionId(): string {
    return this.raw.service_catalog_version_id;
  }
  get title(): string {
    return this.raw.title || 'Care Officer Home Visit';
  }
  get status(): ServiceRequestRecord['status'] {
    return this.raw.status;
  }
  get scheduledFor(): string | undefined {
    return this.raw.scheduled_for;
  }
  get sopVersionId(): string | undefined {
    return this.raw.sop_version_id;
  }
}
