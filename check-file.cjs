const fs = require('fs');
const c = fs.readFileSync('src/mock/data.ts', 'utf8');
console.log('File length:', c.length);
console.log('Char at 39215:', JSON.stringify(c[39215]));
console.log('Context:', JSON.stringify(c.slice(39200, 39240)));
// Check for non-standard dashes
for (let i = 0; i < c.length; i++) {
  const code = c.charCodeAt(i);
  if (code === 0x2013 || code === 0x2014 || code === 0x2018 || code === 0x2019 || code === 0x201C || code === 0x201D) {
    console.log('Special char at', i, ':', JSON.stringify(c[i]), 'code:', code, 'context:', JSON.stringify(c.slice(i-5, i+5)));
  }
}
