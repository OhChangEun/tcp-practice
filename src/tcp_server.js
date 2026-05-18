const net = require('net');

initServer();

function initServer() {
    const server = net.createServer(onConnect);
    server.listen(8080, () => {
        console.log('Binded - TCP Server listening on port 8080');
    });
}

function onConnect(client) {
    const addr = `${client.remoteAddress}:${client.remotePort}`;
    console.log(`Connected: ${addr}`);

    client.on('data', (buffer) => {
        const data = buffer.toString();
        console.log(`[${addr}] Received:`, data);

        // 클라이언트에게 응답 보내기
        client.write(`Echo: ${data}`);
    });

    client.on('end', () => {
        console.log(`Disconnected: ${addr}`);
    });

    client.on('error', (err) => {
        console.error(`Error [${addr}]:`, err.message);
    });
}
