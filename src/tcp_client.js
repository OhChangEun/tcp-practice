const net = require('net');

const HOST = '127.0.0.1';
const PORT = 8080;

const client = net.createConnection({ host: HOST, port: PORT }, () => {
    console.log('Connected to server');

    // 서버에 메시지 전송
    client.write('Hello, TCP Server!');
});

client.on('data', (buffer) => {
    const data = buffer.toString();
    console.log('Server response:', data);

    // 응답 받은 후 연결 종료
    client.end();
});

client.on('end', () => {
    console.log('Disconnected from server');
});

client.on('error', (err) => {
    console.error('Connection error:', err.message);
});
