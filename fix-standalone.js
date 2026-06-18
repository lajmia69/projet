// Post-build script to fix missing client-reference-manifest.js files in standalone output
// This is a workaround for a Next.js bug with route groups on Windows

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextDir = path.join(__dirname, '.next');
const serverDir = path.join(nextDir, 'server');
const standaloneServerDir = path.join(nextDir, 'standalone', '.next', 'server');

function findMissingManifests(dir) {
  const results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      results.push(...findMissingManifests(fullPath));
    } else if (entry.name === 'page.js') {
      const manifestPath = fullPath.replace(/\.js$/, '_client-reference-manifest.js');
      const standaloneManifestPath = manifestPath.replace(serverDir, standaloneServerDir);
      
      if (!fs.existsSync(manifestPath)) {
        results.push({
          serverPath: manifestPath,
          standalonePath: standaloneManifestPath,
        });
      }
    }
  }
  
  return results;
}

const missing = findMissingManifests(serverDir);

if (missing.length > 0) {
  console.log(`Found ${missing.length} missing client-reference-manifest.js files`);
  
  for (const { serverPath, standalonePath } of missing) {
    const serverDirPath = path.dirname(serverPath);
    const standaloneDirPath = path.dirname(standalonePath);
    
    if (!fs.existsSync(serverDirPath)) {
      fs.mkdirSync(serverDirPath, { recursive: true });
    }
    
    fs.writeFileSync(serverPath, '{}', 'utf8');
    console.log(`Created: ${serverPath}`);
    
    if (!fs.existsSync(standaloneDirPath)) {
      fs.mkdirSync(standaloneDirPath, { recursive: true });
    }
    
    fs.writeFileSync(standalonePath, '{}', 'utf8');
    console.log(`Created: ${standalonePath}`);
  }
  
  console.log('Done!');
} else {
  console.log('No missing manifests found.');
}
