const m = require('mammoth');
const f = require('fs');
const path = 'd:/研一工作任务/设计资产建构/文旅IP体验案例.docx';
m.extractRawText({ path }).then(r => {
  f.writeFileSync('docx_output.txt', r.value, 'utf8');
  console.log('OK:', r.value.length, 'chars');
  console.log(r.value.slice(0, 5000));
}).catch(e => console.error(e));
