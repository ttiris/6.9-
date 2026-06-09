const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const docxPath = path.resolve(__dirname, '..', '文旅IP体验案例.docx');

// PowerShell script to extract text
const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('${docxPath.replace(/'/g, "''")}')
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()
# Strip XML tags
$xml -replace '<[^>]+>', ' ' -replace '\\s+', ' '
`;

try {
  const result = execSync(`powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"')}"`, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  console.log(result);
} catch (e) {
  console.error(e.message);
  // Fallback: use simple zip extraction
  try {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(docxPath);
    const xml = zip.readAsText('word/document.xml');
    const text = xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log(text);
  } catch (e2) {
    console.error('Both methods failed:', e2.message);
  }
}
