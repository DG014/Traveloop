const net = require('net');
const host = 'ep-withered-block-apgqj39o.c-7.us-east-1.aws.neon.tech';
const port = 5432;
console.log(`Testing TCP connection to ${host}:${port}...`);
const sock = net.createConnection(port, host, () => {
  console.log('TCP_CONNECTED_OK');
  sock.destroy();
});
sock.setTimeout(8000);
sock.on('timeout', () => { console.log('TIMEOUT'); sock.destroy(); process.exit(1); });
sock.on('error', (e) => { console.log('FAIL:', e.message); process.exit(1); });
