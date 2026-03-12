
const fs = require('fs');
const filePath = 'd:/Tsrijanali Project/Satvik_Kaleva/sattvikKaleva/app/(tabs)/profile.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
let level = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const sanitizedLine = line.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '');
  const opens = (sanitizedLine.match(/{/g) || []).length;
  const closes = (sanitizedLine.match(/}/g) || []).length;
  const prevLevel = level;
  level += opens;
  level -= closes;
  if (i >= 2100 && i <= 2300) {
     console.log(`${i + 1}: [Level ${prevLevel} -> ${level}] ${line}`);
  }
}
