#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const srcDir = './src';
const outputFile = './game-bundled.html';
const indexHtml = './index-dev.html';

// Order matters for dependencies
const moduleOrder = [
  // Config files first
  'config/constants.js',
  'config/characters.js',
  'config/upgrades.js',
  'config/themes.js',
  'config/achievements.js',
  
  // Utils
  'utils/utils.js',
  
  // Core
  'core/GameState.js',
  
  // Managers
  'managers/AudioManager.js',
  'managers/SaveManager.js',
  'managers/UIManager.js',
  'managers/UpgradeManager.js',
  'managers/CharacterManager.js',
  'managers/AchievementManager.js',
  'managers/ChallengeManager.js',
  
  // Main game
  'core/Game.js'
];

// Read and process modules
function processModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Remove import statements
  let processed = content.replace(/^import\s+.*?from\s+.*?;?\s*$/gm, '');
  
  // Remove export keywords but keep the declarations
  processed = processed.replace(/^export\s+/gm, '');
  
  // Remove default export syntax
  processed = processed.replace(/^export\s+default\s+/gm, '');
  
  // Remove the window load event from Game.js since we'll add it manually
  if (filePath.includes('Game.js')) {
    processed = processed.replace(/\/\/ Start the game[\s\S]*$/, '');
  }
  
  return processed.trim();
}

// Build the bundle
function build() {
  console.log('Building game bundle...');
  
  // Read the HTML template
  let htmlTemplate = fs.readFileSync(indexHtml, 'utf8');
  
  // Collect all JavaScript modules
  let jsBundle = '// Bundled Game Code\n(function() {\n  \'use strict\';\n\n';
  
  moduleOrder.forEach(modulePath => {
    const fullPath = path.join(srcDir, modulePath);
    if (fs.existsSync(fullPath)) {
      console.log(`Processing ${modulePath}...`);
      jsBundle += `  // ==================== ${modulePath} ====================\n`;
      jsBundle += '  ' + processModule(fullPath).replace(/\n/g, '\n  ') + '\n\n';
    } else {
      console.warn(`Warning: ${fullPath} not found`);
    }
  });
  
  // Add initialization
  jsBundle += `
  // Start the game when DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
  });
})();`;
  
  // Replace the module script tag with inline script
  const bundledHtml = htmlTemplate.replace(
    /<script type="module" src=".*?"><\/script>/,
    `<script>\n${jsBundle}\n</script>`
  );
  
  // Write the bundled file
  fs.writeFileSync(outputFile, bundledHtml);
  console.log(`Bundle created: ${outputFile}`);
}

// Run build
build();