export interface TableColumnSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isOptional?: boolean;
  isIndexed?: boolean;
}

export interface TableSchema {
  name: string;
  columns: TableColumnSchema[];
}

export interface AppSchema {
  version: number;
  tables: Record<string, TableSchema>;
}

export const appSchema: AppSchema = {
  version: 1,
  tables: {
    households: {
      name: 'households',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'address_line1', type: 'string' },
        { name: 'address_line2', type: 'string', isOptional: true },
        { name: 'city', type: 'string' },
        { name: 'pincode', type: 'string' },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'assigned_care_officer_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    },
    seniors: {
      name: 'seniors',
      columns: [
        { name: 'household_id', type: 'string', isIndexed: true },
        { name: 'full_name', type: 'string' },
        { name: 'date_of_birth', type: 'string', isOptional: true },
        { name: 'gender', type: 'string', isOptional: true },
        { name: 'blood_group', type: 'string', isOptional: true },
        { name: 'allergies', type: 'json', isOptional: true },
        { name: 'preferred_hospital', type: 'string', isOptional: true },
        { name: 'emergency_contact_name', type: 'string', isOptional: true },
        { name: 'emergency_contact_phone', type: 'string', isOptional: true },
        { name: 'is_primary', type: 'boolean' },
      ],
    },
    tickets: {
      name: 'tickets',
      columns: [
        { name: 'household_id', type: 'string', isIndexed: true },
        { name: 'senior_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'category', type: 'string' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'triage_status', type: 'string' },
        { name: 'assigned_care_officer_id', type: 'string', isIndexed: true },
        { name: 'description', type: 'string' },
        { name: 'response_due_at', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    },
    service_requests: {
      name: 'service_requests',
      columns: [
        { name: 'ticket_id', type: 'string', isIndexed: true },
        { name: 'service_catalog_version_id', type: 'string' },
        { name: 'title', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'scheduled_for', type: 'string', isOptional: true },
        { name: 'sop_version_id', type: 'string', isOptional: true },
      ],
    },
    sop_steps: {
      name: 'sop_steps',
      columns: [
        { name: 'sop_version_id', type: 'string', isIndexed: true },
        { name: 'step_index', type: 'number' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'input_type', type: 'string' },
        { name: 'is_mandatory', type: 'boolean' },
        { name: 'validation_rules', type: 'json', isOptional: true },
      ],
    },
    sop_progress: {
      name: 'sop_progress',
      columns: [
        { name: 'service_request_id', type: 'string', isIndexed: true },
        { name: 'sop_step_id', type: 'string', isIndexed: true },
        { name: 'is_completed', type: 'boolean' },
        { name: 'proof_url', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'choice_value', type: 'string', isOptional: true },
        { name: 'completed_at', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean', isIndexed: true },
      ],
    },
    activity_feed_items: {
      name: 'activity_feed_items',
      columns: [
        { name: 'household_id', type: 'string', isIndexed: true },
        { name: 'author_id', type: 'string' },
        { name: 'author_role', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'media_url', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'synced', type: 'boolean', isIndexed: true },
      ],
    },
    sync_outbox: {
      name: 'sync_outbox',
      columns: [
        { name: 'mutation_type', type: 'string' },
        { name: 'entity_name', type: 'string', isIndexed: true },
        { name: 'entity_id', type: 'string', isIndexed: true },
        { name: 'payload', type: 'json' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'retry_count', type: 'number' },
        { name: 'error_message', type: 'string', isOptional: true },
      ],
    },
    media_uploads: {
      name: 'media_uploads',
      columns: [
        { name: 'local_uri', type: 'string' },
        { name: 's3_key', type: 'string', isOptional: true },
        { name: 'presigned_url', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'entity_type', type: 'string' },
        { name: 'entity_id', type: 'string', isIndexed: true },
        { name: 'progress', type: 'number' },
      ],
    },
  },
};
