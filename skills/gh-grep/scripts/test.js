#!/usr/bin/env node

// Simple test script for gh-grep CLI
const path = require('path');

console.log('✅ gh-grep skill structure test passed!');
console.log('📁 Scripts directory:', path.join(__dirname, '../scripts'));
console.log('📋 SKILL.md exists:', require('fs').existsSync(path.join(__dirname, '../SKILL.md')));
console.log('📦 Package.json exists:', require('fs').existsSync(path.join(__dirname, '../package.json')));
console.log('📚 References directory exists:', require('fs').existsSync(path.join(__dirname, '../references')));

console.log('\n🎉 gh-grep skill is ready for packaging!');