module.exports = {
  apps: [
    {
      name: 'poco-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://postgres:password123@localhost:5432/pocoeldercare?schema=public',
        REDIS_URL: 'redis://localhost:6379',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'poco-ops-crm',
      cwd: './apps/ops-crm',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'poco-family-portal',
      cwd: './apps/family-portal',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'poco-field-app',
      cwd: './apps/field-app',
      script: 'pnpm',
      args: 'preview',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      name: 'poco-db-admin',
      cwd: './apps/db-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3005',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};
