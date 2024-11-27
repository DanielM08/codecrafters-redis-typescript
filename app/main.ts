import * as net from "net";
import { CRLF, NULL_RESPONSE, OK_RESPONSE, TypesMap } from "./default-values";
import { parseRESPCommand } from "./parse-resp-command";
import { parseSetCommand } from "./parse-set-command";

const clients: Set<net.Socket> = new Set();

const memory: Record<string, { 
  value: string[],
  expirationTime?: number,
}> = {}

const server: net.Server = net.createServer((connection: net.Socket) => {  
  clients.add(connection);

  connection.on('data', (data) => {
    const command = parseRESPCommand(data);

    let response;

    switch (command.name.toLowerCase()) {
      case 'echo': 
        response = command.arguments.map(a => `${TypesMap.BulkString}${a.length}${CRLF}${a}${CRLF}`).join('');
        break;
      case 'ping':
        response = '+PONG\r\n';
        break;
      case 'set': 
        const keySet = command.arguments.splice(0, 1)[0];
        memory[keySet] = command.arguments;
        response = '+OK\r\n';
        break;
      case 'get':
        const keyGet = command.arguments[0];
        const item = memory[keyGet];
        response = item ? item.map(a => `${TypesMap.BulkString}${a.length}${CRLF}${a}${CRLF}`).join('') : '$-1\r\n';
        break;
    }
    connection.write(`${response}`);
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