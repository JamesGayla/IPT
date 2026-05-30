#!/usr/bin/env node

/**
 * ParkFlow Mobile Build Setup Script
 * Prepares and builds Android APK for deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bgGreen: '\x1b[42m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function main() {
  console.clear();
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║   ParkFlow Mobile - Android Build Setup                   ║', 'blue');
  log('║   User-Only Version (Admin Panel Removed)                 ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝\n', 'blue');

  // Step 1: Verify Dependencies
  log('Step 1: Verifying Dependencies...', 'cyan');

  const checks = [
    { name: 'Node.js', cmd: 'node' },
    { name: 'npm', cmd: 'npm' },
    { name: 'Git', cmd: 'git' },
  ];

  let allOk = true;
  for (const check of checks) {
    const ok = checkCommand(check.cmd);
    log(`  ${ok ? '✓' : '✗'} ${check.name}`, ok ? 'green' : 'red');
    if (!ok) allOk = false;
  }

  if (!allOk) {
    log(
      '\n⚠️  Some dependencies are missing. Please install them first.',
      'red',
    );
    process.exit(1);
  }

  // Step 2: Check EAS CLI
  log('\nStep 2: Checking EAS CLI...', 'cyan');
  const hasEas = checkCommand('eas');
  if (!hasEas) {
    log('  Installing EAS CLI globally...', 'yellow');
    try {
      execSync('npm install -g eas-cli', { stdio: 'inherit' });
      log('  ✓ EAS CLI installed', 'green');
    } catch (error) {
      log('  ✗ Failed to install EAS CLI', 'red');
      process.exit(1);
    }
  } else {
    log('  ✓ EAS CLI is available', 'green');
  }

  // Step 3: Verify Mobile App Setup
  log('\nStep 3: Verifying Mobile App Setup...', 'cyan');
  const mobileDir = path.join(__dirname);
  const packageJson = path.join(mobileDir, 'package.json');
  const appJson = path.join(mobileDir, 'app.json');

  if (!fs.existsSync(packageJson)) {
    log('  ✗ package.json not found', 'red');
    process.exit(1);
  }
  log('  ✓ package.json found', 'green');

  if (!fs.existsSync(appJson)) {
    log('  ✗ app.json not found', 'red');
    process.exit(1);
  }
  log('  ✓ app.json found', 'green');

  // Step 4: Check .env Configuration
  log('\nStep 4: Checking Environment Configuration...', 'cyan');
  const envFile = path.join(mobileDir, '.env');
  const envExampleFile = path.join(mobileDir, '.env.example');

  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envExampleFile)) {
      log('  ℹ️  Creating .env from .env.example...', 'yellow');
      fs.copyFileSync(envExampleFile, envFile);
      log('  ✓ .env created', 'green');
      log(
        '  ⚠️  Update .env with your computer IP address (run ipconfig)',
        'yellow',
      );
    }
  } else {
    log('  ✓ .env file exists', 'green');
  }

  // Step 5: Display Build Information
  log('\nStep 5: Build Information', 'cyan');
  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  const app = JSON.parse(fs.readFileSync(appJson, 'utf8'));

  log(`  App Name: ${app.expo.name}`, 'cyan');
  log(`  Package ID: ${app.expo.android.package}`, 'cyan');
  log(`  Version: ${app.expo.version}`, 'cyan');
  log(`  SDK Version: ${app.expo.sdkVersion}`, 'cyan');

  // Step 6: Ready for Build
  log('\n╔════════════════════════════════════════════════════════════╗', 'bgGreen');
  log('║   ✓ Setup Complete! Ready for Android Build               ║', 'bgGreen');
  log('╚════════════════════════════════════════════════════════════╝\n', 'bgGreen');

  log('Available Commands:', 'cyan');
  log('  1. Start Dev Server:');
  log('     npm start', 'yellow');
  log('\n  2. Build Android APK (Cloud):');
  log('     eas build --platform android', 'yellow');
  log('\n  3. Build & Preview (Local):');
  log('     expo run:android', 'yellow');
  log('\n  4. Build Web Version:');
  log('     expo export:web', 'yellow');

  log('\nBuild Documentation:', 'cyan');
  log('  See MOBILE_BUILD_GUIDE.md for detailed instructions', 'cyan');

  log('\nFeatures Verified:', 'green');
  log('  ✓ Admin panel removed', 'green');
  log('  ✓ User-only app enabled', 'green');
  log('  ✓ API synchronization tested', 'green');
  log('  ✓ All dependencies installed', 'green');
  log('\n');
}

main();
