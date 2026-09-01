export interface SopStepRecord {
  id: string;
  sop_version_id: string;
  step_index: number;
  title: string;
  description: string;
  input_type: 'CHECKBOX' | 'TEXT' | 'PHOTO' | 'CHOICE' | 'VITALS';
  is_mandatory: boolean;
  validation_rules?: {
    allowedChoices?: string[];
    vitalsFields?: string[];
    maxPhotoCount?: number;
  };
}

export class SopStepModel {
  static table = 'sop_steps';

  constructor(public raw: SopStepRecord) {}

  get id(): string {
    return this.raw.id;
  }
  get sopVersionId(): string {
    return this.raw.sop_version_id;
  }
  get stepIndex(): number {
    return this.raw.step_index;
  }
  get title(): string {
    return this.raw.title;
  }
  get description(): string {
    return this.raw.description;
  }
  get inputType(): SopStepRecord['input_type'] {
    return this.raw.input_type;
  }
  get isMandatory(): boolean {
    return this.raw.is_mandatory;
  }
  get validationRules(): SopStepRecord['validation_rules'] {
    return this.raw.validation_rules;
  }
}
