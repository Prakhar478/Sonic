const ytDlp = require('yt-dlp-exec');
const path = require('path');

// Manually specify binary path if needed
const binaryPath = path.resolve(__dirname, '../node_modules/yt-dlp-exec/bin/yt-dlp.exe');
console.log('Binary path:', binaryPath);

ytDlp('https://www.youtube.com/watch?v=4adZ7AguVcw', {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
  addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0'],
  format: 'bestaudio/best',
}).then(info => {
  console.log('Success! Title:', info.title);
}).catch(err => {
  console.error('Failure:', err.message);
});
