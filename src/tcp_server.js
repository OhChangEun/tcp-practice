const net = require('net');

initServer();

function initServer() {
    const server = net.createServer(onConnect);
    server.listen(8080, () => {
        console.log('Binded - TCP Server listening on port 8080');
    });
}

// GET / HTTP/1.1
// Host: 127.0.0.1:8080
function getHttpMessage(data) {
    const lines = data.split('\r\n');
    const start_line = lines[0];
    const [method, url, version] = start_line.split(' ');
    const headers = {};

    for (let i=1; i<lines.length; i++) {
        const line = lines[i];
        const [k,v] = line.split(': ');
        headers[k] = v;
    }

    return {method, url, headers};
}

function onConnect(client) {
    const addr = `${client.remoteAddress}:${client.remotePort}`;
    console.log(`Connected: ${addr}`);

    client.on('data', (buffer) => {
        const data = buffer.toString();
        console.log(`[${addr}] Received:`, data);

        const { method, url, headers } = getHttpMessage(data);
        console.log('Method:', method, '| URL:', url, '| Headers:', headers);

        client.write(`Echo: ${data}`);
    });

    client.on('end', () => {
        console.log(`Disconnected: ${addr}`);
    });

    client.on('error', (err) => {
        console.error(`Error [${addr}]:`, err.message);
    });
}
