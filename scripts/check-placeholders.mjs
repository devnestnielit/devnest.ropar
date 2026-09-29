import fs from 'fs';
import path from 'path';

// BUG-7: Build-time check that fails if placeholder strings ship
const FORBIDDEN_PATTERNS = [
  { pattern: /Quote or description/i, label: 'Placeholder quote text' },
  { pattern: />Role</, label: 'Placeholder Role text' },
  { pattern: /"Role"/, label: 'Placeholder "Role" string' },
];

const SCAN_DIRS = ['app', 'components'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

let hasError = false;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      // Exclude this script or tests
      if (fullPath.includes('check-placeholders')) continue;

      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Skip comment lines
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

        for (const { pattern, label } of FORBIDDEN_PATTERNS) {
          if (pattern.test(line)) {
            console.error(`❌ [BUG-7 CHECK FAILED] ${label} found at ${fullPath}:${index + 1}`);
            console.error(`   Line content: ${trimmed}`);
            hasError = true;
          }
        }
      });
    }
  }
}

console.log('🔍 Running BUG-7 placeholder audit...');
for (const dir of SCAN_DIRS) {
  scanDir(path.resolve(process.cwd(), dir));
}

if (hasError) {
  console.error('\n🚨 Build failed: placeholder strings found in source code. Replace them before shipping.');
  process.exit(1);
} else {
  console.log('✅ BUG-7 audit passed: No placeholder content detected in app/ or components/.');
  process.exit(0);
}
