const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const requiredEnvVariables = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];

const expectedMigrations = [
  '20260323_000001_initial_schema.sql',
  '20260323_000002_public_queries.sql',
  '20260323_000003_search_and_safety.sql',
  '20260323_000004_notifications.sql',
  '20260323_000005_moderation_tools.sql',
  '20260323_000006_personal_activity.sql',
  '20260323_000007_post_resolution.sql',
  '20260327_000008_account_deletion.sql',
];

const envCandidateFiles = ['.env', '.env.local', '.env.development', '.env.development.local'];
const redirectUri = 'sideroom://auth/callback';

function color(code, text) {
  return `${code}${text}\u001b[0m`;
}

function green(text) {
  return color('\u001b[32m', text);
}

function yellow(text) {
  return color('\u001b[33m', text);
}

function red(text) {
  return color('\u001b[31m', text);
}

function cyan(text) {
  return color('\u001b[36m', text);
}

function readJson(relativePath) {
  const fullPath = path.join(projectRoot, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function parseDotEnv(fileContents) {
  const values = {};

  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function getEnvSources() {
  const values = new Map();
  const foundFiles = [];

  for (const fileName of envCandidateFiles) {
    const fullPath = path.join(projectRoot, fileName);

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    foundFiles.push(fileName);
    const parsed = parseDotEnv(fs.readFileSync(fullPath, 'utf8'));

    for (const [key, value] of Object.entries(parsed)) {
      values.set(key, {
        source: fileName,
        value,
      });
    }
  }

  for (const key of requiredEnvVariables) {
    const value = process.env[key];

    if (typeof value === 'string' && value.trim()) {
      values.set(key, {
        source: 'process.env',
        value: value.trim(),
      });
    }
  }

  return {
    foundFiles,
    values,
  };
}

function isPlaceholderValue(key, value) {
  const loweredValue = value.toLowerCase();

  if (key === 'EXPO_PUBLIC_SUPABASE_URL') {
    return loweredValue.includes('your-project-ref') || loweredValue === 'https://your-project-ref.supabase.co';
  }

  if (key === 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY') {
    return loweredValue.includes('your-publishable-or-anon-key');
  }

  return false;
}

function validateEnvValues(envSources) {
  const issues = [];
  const passes = [];

  for (const key of requiredEnvVariables) {
    const entry = envSources.values.get(key);

    if (!entry || !entry.value.trim()) {
      issues.push(`${key} is missing.`);
      continue;
    }

    if (isPlaceholderValue(key, entry.value)) {
      issues.push(`${key} is still using the example placeholder in ${entry.source}.`);
      continue;
    }

    if (key === 'EXPO_PUBLIC_SUPABASE_URL' && !/^https:\/\/.+\.supabase\.co$/i.test(entry.value)) {
      issues.push(`${key} does not look like a Supabase project URL.`);
      continue;
    }

    passes.push(`${key} is present via ${entry.source}.`);
  }

  return {
    issues,
    passes,
  };
}

function validateAppConfig() {
  const appJson = readJson('app.json');
  const scheme = appJson?.expo?.scheme ?? null;
  const issues = [];
  const passes = [];

  if (scheme !== 'sideroom') {
    issues.push(`app.json scheme should be "sideroom" but is ${scheme ?? 'missing'}.`);
  } else {
    passes.push(`App scheme is set to "sideroom", so ${redirectUri} matches the client config.`);
  }

  return {
    issues,
    passes,
  };
}

function validateMigrations() {
  const migrationDirectory = path.join(projectRoot, 'supabase', 'migrations');
  const issues = [];
  const passes = [];

  if (!fs.existsSync(migrationDirectory)) {
    issues.push('supabase/migrations is missing.');
    return { issues, passes };
  }

  const presentMigrations = fs
    .readdirSync(migrationDirectory)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();

  const missingMigrations = expectedMigrations.filter(
    (expectedMigration) => !presentMigrations.includes(expectedMigration)
  );

  if (missingMigrations.length > 0) {
    issues.push(`Missing migration files: ${missingMigrations.join(', ')}.`);
  } else {
    passes.push(`All ${expectedMigrations.length} expected migration files are present.`);
  }

  return {
    issues,
    passes,
  };
}

function printSection(title) {
  console.log(`\n${cyan(title)}`);
}

function printList(items, colorize) {
  for (const item of items) {
    console.log(`  ${colorize('-')} ${item}`);
  }
}

function main() {
  console.log(cyan('SideRoom Backend Preflight'));
  console.log('This checks the local setup before real Supabase testing.\n');

  const envSources = getEnvSources();
  const envValidation = validateEnvValues(envSources);
  const appValidation = validateAppConfig();
  const migrationValidation = validateMigrations();

  printSection('Environment');
  if (envSources.foundFiles.length === 0) {
    console.log(`  ${yellow('-')} No local env file found yet. Create .env or .env.local from .env.example.`);
  } else {
    console.log(`  ${green('-')} Found local env file(s): ${envSources.foundFiles.join(', ')}`);
  }
  printList(envValidation.passes, green);
  printList(envValidation.issues, red);

  printSection('App Config');
  printList(appValidation.passes, green);
  printList(appValidation.issues, red);
  console.log(`  ${yellow('-')} Manual check still needed: add ${redirectUri} in Supabase auth redirect settings.`);
  console.log(`  ${yellow('-')} Manual check still needed: enable Google in Supabase before testing provider sign-in.`);

  printSection('Database');
  printList(migrationValidation.passes, green);
  printList(migrationValidation.issues, red);
  console.log(`  ${yellow('-')} Manual check still needed: apply all migrations to the real Supabase project in order.`);

  const allIssues = [
    ...envValidation.issues,
    ...appValidation.issues,
    ...migrationValidation.issues,
  ];

  printSection('Next Tiny Steps');
  console.log('  1. Create a Supabase project.');
  console.log('  2. Copy .env.example to .env and replace the placeholder values.');
  console.log(`  3. Add ${redirectUri} to Supabase auth redirects.`);
  console.log('  4. Enable Google in Supabase auth providers.');
  console.log('  5. Apply the eight SQL migrations.');
  console.log('  6. Run this command again until the red items are gone.');

  if (allIssues.length === 0) {
    console.log(`\n${green('Preflight passed.')}`);
    process.exit(0);
  }

  console.log(`\n${red('Preflight not ready yet.')}`);
  process.exit(1);
}

main();
