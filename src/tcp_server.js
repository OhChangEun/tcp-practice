const net = require("net");
const fs = require("fs");
const path = require("path");

initServer();

function initServer() {
  const server = net.createServer(onConnect);
  server.listen(8080, () => {
    console.log("Binded - TCP Server listening on port 8080");
  });
}

// GET / HTTP/1.1
// Host: 127.0.0.1:8080
function getHttpMessage(data) {
  const lines = data.split("\r\n");
  const start_line = lines[0];
  const [method, url, version] = start_line.split(" ");
  const headers = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const [k, v] = line.split(": ");
    headers[k] = v;
  }

  return { method, url, headers };
}

function onConnect(client) {
  const addr = `${client.remoteAddress}:${client.remotePort}`;
  console.log(`Connected: ${addr}`);

  client.on("data", (buffer) => {
    const data = buffer.toString();
    console.log(`[${addr}] Received:`, data);

    const req = getHttpMessage(data);
    console.log(req);

    // soma.com:8080 => hello soma
    if (req.headers.Host == "soma.com:8080") {
      if (req.url == "/redirect") {
        client.write("HTTP/1.1 301 Moved Permanently\r\nLocation: http://foo.com:8080/\r\nContent-Length:0\r\n\r\n");
        return;
      }
      const body = "<h1>hello soma</h1>";
      client.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length:${body.length}\r\n\r\n${body}`,
      );
      // foo.com:8080 => hello foo
    } else if (req.headers.Host == "foo.com:8080") {
      if (req.url == "/index.html") {
        const filePath = path.join(__dirname, "../static/index.html");
        fs.stat(filePath, (err, stats) => {
          client.write(`HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length:${stats.size}\r\n\r\n`);
          const readable = fs.createReadStream(filePath);
          readable.pipe(client, { end: false });
        });
        return;
      }
      client.write("HTTP/1.1 200 OK\r\nContent-Length:9\r\n\r\nhello foo");
      // any
    } else {
      client.write("HTTP/1.1 200 OK\r\nContent-Length:5\r\n\r\nhello");
    }
  });

  client.on("end", () => {
    console.log(`Disconnected: ${addr}`);
  });

  client.on("error", (err) => {
    console.error(`Error [${addr}]:`, err.message);
  });
}
