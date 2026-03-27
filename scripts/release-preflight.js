const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const releaseMetadata = require(path.join(projectRoot, 'config', 'release-metadata.json'));

const envCandidateFiles = ['.env', '.env.local', '.env.development', '.env.development.local'];
const requiredEnvVariables = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];
const requiredDocs = [
  'docs/device-smoke-checklist.md',
  'docs/google-play-submission-checklist.md',
  'docs/launch-readiness-plan.md',
  'docs/launch-seed-content.md',
  'docs/preview-build-runbook.md',
  'docs/release-preflight.md',
  'docs/supabase-setup.md',
];
const requiredBootstrapArtifacts = [
  'supabase/bootstrap/full-setup.sql',
  'data/launch-seed/seed-content.json',
  'supabase/bootstrap/seed-authors.example.json',
];
const requiredAssets = [
  'assets/images/icon.png',
  'assets/images/splash-icon.png',
  'assets/images/android-icon-background.png',
  'assets/images/android-icon-foreground.png',
  'assets/images/android-icon-monochrome.png',
  'assets/images/favicon.png',
];

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

function fileExists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
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
  const expoConfig = appJson?.expo ?? {};
  const issues = [];
  const passes = [];

  if (!expoConfig.name?.trim()) {
    issues.push('app.json is missing expo.name.');
  } else {
    passes.push(`App name is set to "${expoConfig.name}".`);
  }

  if (!expoConfig.slug?.trim()) {
    issues.push('app.json is missing expo.slug.');
  } else {
    passes.push(`Expo slug is set to "${expoConfig.slug}".`);
  }

  if (!expoConfig.version?.trim()) {
    issues.push('app.json is missing expo.version.');
  } else {
    passes.push(`App version is set to ${expoConfig.version}.`);
  }

  if (!expoConfig.scheme?.trim()) {
    issues.push('app.json is missing expo.scheme.');
  } else {
    passes.push(`App scheme is set to "${expoConfig.scheme}".`);
  }

  if (!expoConfig.android?.package?.trim()) {
    issues.push('Android package is missing from app.json.');
  } else {
    passes.push(`Android package is set to ${expoConfig.android.package}.`);
  }

  if (!expoConfig.extra?.eas?.projectId?.trim()) {
    issues.push('Expo EAS projectId is missing from app.json.');
  } else {
    passes.push('Expo EAS projectId is present in app.json.');
  }

  return {
    issues,
    passes,
  };
}

function validateEasConfig() {
  const issues = [];
  const passes = [];

  if (!fileExists('eas.json')) {
    issues.push('eas.json is missing.');
    return { issues, passes };
  }

  const easConfig = readJson('eas.json');

  if (!easConfig.build?.development) {
    issues.push('eas.json is missing build.development.');
  } else {
    passes.push('EAS development profile is present.');
  }

  if (!easConfig.build?.preview) {
    issues.push('eas.json is missing build.preview.');
  } else {
    passes.push('EAS preview profile is present.');
  }

  if (!easConfig.build?.production) {
    issues.push('eas.json is missing build.production.');
  } else {
    passes.push('EAS production profile is present.');
  }

  if (!easConfig.submit?.production) {
    issues.push('eas.json is missing submit.production.');
  } else {
    passes.push('EAS submit.production profile is present.');
  }

  return {
    issues,
    passes,
  };
}

function validateFiles(requiredPaths, successMessage) {
  const issues = [];
  const passes = [];

  const missing = requiredPaths.filter((relativePath) => !fileExists(relativePath));

  if (missing.length > 0) {
    issues.push(`Missing files: ${missing.join(', ')}.`);
  } else {
    passes.push(successMessage);
  }

  return {
    issues,
    passes,
  };
}

function findLatestHandoffMarkdownRelativePath() {
  const handoffFiles = fs
    .readdirSync(projectRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^PROJECT_HANDOFF_\d{4}-\d{2}-\d{2}\.md$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));

  return handoffFiles[0] ?? null;
}

function validateLatestHandoff() {
  const latestHandoffPath = findLatestHandoffMarkdownRelativePath();

  if (!latestHandoffPath) {
    return {
      issues: ['No dated PROJECT_HANDOFF_YYYY-MM-DD.md file exists in the repo root.'],
      passes: [],
    };
  }

  return {
    issues: [],
    passes: [`Latest dated handoff is present: ${latestHandoffPath}.`],
  };
}

function validateReleaseMetadata() {
  const issues = [];
  const passes = [];
  const warnings = [];

  const supportEmail = String(releaseMetadata.supportEmail ?? '').trim();
  const supportUrl = String(releaseMetadata.supportUrl ?? '').trim();
  const privacyPolicyUrl = String(releaseMetadata.privacyPolicyUrl ?? '').trim();
  const termsUrl = String(releaseMetadata.termsUrl ?? '').trim();
  const marketingUrl = String(releaseMetadata.marketingUrl ?? '').trim();
  const shortDescription = String(releaseMetadata.googlePlayShortDescription ?? '').trim();
  const fullDescription = String(releaseMetadata.googlePlayFullDescription ?? '').trim();

  const placeholderDomains = ['example.com', 'yourdomain.com'];
  const isPlaceholderUrl = (value) => placeholderDomains.some((domain) => value.includes(domain));
  const isPlaceholderEmail = (value) => placeholderDomains.some((domain) => value.endsWith(`@${domain}`) || value.includes(domain));

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail) || isPlaceholderEmail(supportEmail)) {
    issues.push('Support email in config/release-metadata.json is still missing or placeholder.');
  } else {
    passes.push('Support email looks configured.');
  }

  if (!/^https?:\/\/.+/i.test(supportUrl) || isPlaceholderUrl(supportUrl)) {
    issues.push('Support URL in config/release-metadata.json is still missing or placeholder.');
  } else {
    passes.push('Support URL looks configured.');
  }

  if (!/^https?:\/\/.+/i.test(privacyPolicyUrl) || isPlaceholderUrl(privacyPolicyUrl)) {
    issues.push('Privacy policy URL in config/release-metadata.json is still missing or placeholder.');
  } else {
    passes.push('Privacy policy URL looks configured.');
  }

  if (!/^https?:\/\/.+/i.test(termsUrl) || isPlaceholderUrl(termsUrl)) {
    issues.push('Terms URL in config/release-metadata.json is still missing or placeholder.');
  } else {
    passes.push('Terms URL looks configured.');
  }

  if (!/^https?:\/\/.+/i.test(marketingUrl) || isPlaceholderUrl(marketingUrl)) {
    warnings.push('Marketing URL in config/release-metadata.json is still missing or placeholder.');
  } else {
    passes.push('Marketing URL looks configured.');
  }

  if (shortDescription.length === 0 || shortDescription.length > 80) {
    issues.push('Google Play short description must be present and 80 characters or fewer.');
  } else {
    passes.push('Google Play short description length looks valid.');
  }

  if (fullDescription.length < 80 || fullDescription.length > 4000) {
    issues.push('Google Play full description should be between 80 and 4000 characters.');
  } else {
    passes.push('Google Play full description length looks valid.');
  }

  return {
    issues,
    passes,
    warnings,
  };
}

function validateOptionalLaunchArtifacts() {
  const warnings = [];

  if (!fileExists('supabase/bootstrap/seed-authors.json')) {
    warnings.push(
      'supabase/bootstrap/seed-authors.json is still missing, so launch-content SQL is only a template right now.'
    );
  }

  if (!fileExists('supabase/bootstrap/seed-launch-content.sql')) {
    if (fileExists('supabase/bootstrap/seed-launch-content.template.sql')) {
      warnings.push(
        'Only the template seed-launch-content SQL exists right now. Generate the real file after real seed accounts are available.'
      );
    } else {
      warnings.push('No generated launch-content SQL exists yet. Run npm run launch:seed after seed accounts are ready.');
    }
  }

  return warnings;
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
  console.log(cyan('SideRoom Release Preflight'));
  console.log('This checks whether the repository is locally prepared for preview and store-release work.\n');

  const envSources = getEnvSources();
  const envValidation = validateEnvValues(envSources);
  const appValidation = validateAppConfig();
  const easValidation = validateEasConfig();
  const docsValidation = validateFiles(
    requiredDocs,
    'Launch, backend, seed, and operational docs required for release prep are present.'
  );
  const handoffValidation = validateLatestHandoff();
  const bootstrapValidation = validateFiles(
    requiredBootstrapArtifacts,
    'Bootstrap SQL and launch-content source files are present.'
  );
  const assetValidation = validateFiles(requiredAssets, 'Required icon, splash, and favicon assets are present.');
  const releaseMetadataValidation = validateReleaseMetadata();
  const launchWarnings = validateOptionalLaunchArtifacts();

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

  printSection('EAS Build Setup');
  printList(easValidation.passes, green);
  printList(easValidation.issues, red);

  printSection('Project Files');
  printList(docsValidation.passes, green);
  printList(docsValidation.issues, red);
  printList(handoffValidation.passes, green);
  printList(handoffValidation.issues, red);
  printList(bootstrapValidation.passes, green);
  printList(bootstrapValidation.issues, red);
  printList(assetValidation.passes, green);
  printList(assetValidation.issues, red);
  printList(releaseMetadataValidation.passes, green);
  printList(releaseMetadataValidation.issues, red);
  printList(releaseMetadataValidation.warnings, yellow);
  printList(launchWarnings, yellow);

  printSection('Manual Launch Gates');
  console.log(`  ${yellow('-')} Closed beta, crash-rate review, and real moderation drills still need human validation.`);
  console.log(`  ${yellow('-')} Privacy policy, terms, support contact, screenshots, descriptions, and reviewer notes still need final launch assets.`);
  console.log(`  ${yellow('-')} Real preview and production builds still need to be generated and smoke-tested on Android devices.`);

  const allIssues = [
    ...envValidation.issues,
    ...appValidation.issues,
    ...easValidation.issues,
    ...docsValidation.issues,
    ...handoffValidation.issues,
    ...bootstrapValidation.issues,
    ...assetValidation.issues,
    ...releaseMetadataValidation.issues,
  ];

  printSection('Next Tiny Steps');
  console.log('  1. Add the real Supabase URL and publishable key locally.');
  console.log('  2. Replace the placeholder policy, terms, support, and marketing values in config/release-metadata.json.');
  console.log('  3. Keep the current Android package name unless brand or legal review requires a change.');
  console.log('  4. Keep eas.json build profiles in sync with the release process.');
  console.log('  5. Generate the real launch-content SQL after seed accounts exist.');
  console.log('  6. Run preview builds, a closed beta, and final device smoke tests before store upload.');

  if (allIssues.length === 0) {
    console.log(`\n${green('Release preflight passed for local repo setup.')}`);
    console.log(yellow('Manual launch gates still remain before app-store submission.'));
    process.exit(0);
  }

  console.log(`\n${red('Release preflight not ready yet.')}`);
  process.exit(1);
}

main();
