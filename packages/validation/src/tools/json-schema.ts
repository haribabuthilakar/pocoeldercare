import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodSchema } from 'zod';

export interface ClaudeToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

/**
 * Converts a Zod schema into an Anthropic Claude SDK tool_choice input_schema contract per D-72.
 */
export function convertZodToClaudeToolSchema(
  name: string,
  description: string,
  schema: ZodSchema
): ClaudeToolDefinition {
  const jsonSchema = zodToJsonSchema(schema, {
    target: 'jsonSchema7',
    $refStrategy: 'none'
  }) as Record<string, unknown>;

  // Remove $schema root key if present
  delete jsonSchema['$schema'];

  return {
    name,
    description,
    input_schema: jsonSchema
  };
}
