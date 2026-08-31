/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Forbid UI / portal apps from importing internal backend modules
          {
            target: 'apps/family-portal',
            from: 'apps/api',
            message: 'Family Portal cannot import from Backend API directly. Use shared packages or HTTP APIs.'
          },
          {
            target: 'apps/admin-portal',
            from: 'apps/api',
            message: 'Admin Portal cannot import from Backend API directly. Use shared packages or HTTP APIs.'
          },
          {
            target: 'apps/field-app',
            from: 'apps/api',
            message: 'Field App cannot import from Backend API directly. Use shared packages or HTTP APIs.'
          },
          // Forbid backend API from importing React UI packages
          {
            target: 'apps/api',
            from: 'packages/ui',
            message: 'Backend API cannot import React UI components from @poco/ui.'
          },
          // Forbid packages/business-rules from depending on UI or database ORM directly
          {
            target: 'packages/business-rules',
            from: 'packages/ui',
            message: 'Business rules package must remain pure and cannot import UI components.'
          },
          {
            target: 'packages/business-rules',
            from: 'packages/database',
            message: 'Business rules package must remain pure functional and cannot import database client directly.'
          }
        ]
      }
    ]
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true
      }
    }
  }
};
