
const fs = require('fs');
const path = require('path');
const filePath = 'd:/Tsrijanali Project/Satvik_Kaleva/sattvikKaleva/app/(tabs)/profile.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
let openBraces = 0;
let closeBraces = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Remove string literals to avoid counting braces in strings
  const sanitizedLine = line.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '');
  const opens = (sanitizedLine.match(/{/g) || []).length;
  const closes = (sanitizedLine.match(/}/g) || []).length;
  openBraces += opens;
  closeBraces += closes;
  if (openBraces < closeBraces) {
    console.log(`Mismatch at line ${i + 1}: open=${openBraces}, close=${closeBraces}`);
    console.log(`Line content: ${line}`);
    // Reset so we can find more mismatches
    openBraces = closeBraces; 
  }
}
console.log(`Total: open=${openBraces}, close=${closeBraces}`);
