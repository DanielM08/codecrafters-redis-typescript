import * as net from "net";

const clients: Set<net.Socket> = new Set();

const server: net.Server = net.createServer((connection: net.Socket) => {  
  clients.add(connection);

  connection.on('data', (data) => {
    const commands = data.toString().trim().split('\n');
    commands.forEach((command) => {
      if(command === 'PING'){
        connection.write('+PONG\r\n')
      }
    })
  });

  connection.on('end', () => {
    clients.delete(connection);
    console.log('Client disconnected');
  });

  connection.on('error', (err) => {
    console.error('Connection error:', err.message);
    clients.delete(connection);
  });
});

server.listen(6379, "127.0.0.1");