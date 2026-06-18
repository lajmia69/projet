// Pre-build script to create empty client-reference-manifest.js files for route groups
// This prevents Next.js build warnings on Windows with route groups

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDir = path.join(__dirname, 'src', 'app');

// Find all route group page.js files that might need manifests
function findRouteGroupPages(dir, basePath = '') {
  const results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    
    if (entry.isDirectory()) {
      results.push(...findRouteGroupPages(fullPath, relativePath));
    } else if (entry.name === 'page.tsx' || entry.name === 'page.js') {
      // Check if path contains route groups (parentheses)
      if (relativePath.includes('(') && relativePath.includes(')')) {
        results.push(relativePath);
      }
    }
  }
  
  return results;
}

const pages = findRouteGroupPages(appDir);

if (pages.length > 0) {
  console.log(`Found ${pages.length} route group pages that may need manifests`);
  
  for (const pagePath of pages) {
    const dirPath = path.dirname(pagePath);
    const manifestName = path.basename(pagePath).replace(/\.(tsx|js)$/, '_client-reference-manifest.js');
    const manifestPath = path.join(dirPath, manifestName);
    const fullManifestPath = path.join(__dirname, 'src', 'app', manifestPath);
    
    if (!fs.existsSync(fullManifestPath)) {
      fs.mkdirSync(path.dirname(fullManifestPath), { recursive: true });
      fs.writeFileSync(fullManifestPath, '{}', 'utf8');
      console.log(`Created: ${manifestPath}`);
    }
  }
  
  console.log('Done!');
} else {
  console.log('No route group pages found.');
}
