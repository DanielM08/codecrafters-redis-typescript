import * as net from "net";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on('data', (data) => {
    const commands = data.toString().trim().split('\n');
    commands.forEach((command) => {
      if(command === 'PING'){
        connection.write('+PONG\r\n')
      }
    })
  })
});

server.listen(6379, "127.0.0.1");
