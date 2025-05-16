import * as net from "net";
import { CRLF, NULL_RESPONSE, OK_RESPONSE, TypesMap } from "./default-values";
import { parseRESPCommand } from "./parse-resp-command";
import { parseSetCommand } from "./parse-set-command";

const clients: Set<net.Socket> = new Set();

const memory: Record<string, { 
  value: string[],
  expirationTime?: number,
}> = {}

let dir = '';
let dbfilename = '';

process.argv.forEach((arg) => {
  if (arg === '--dir') {
    dir = process.argv[process.argv.indexOf(arg) + 1];
  } else if (arg === '--dbfilename') {
    dbfilename = process.argv[process.argv.indexOf(arg) + 1];
  }
})

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
        const { keySet, optionsMap, value } = parseSetCommand(command);

        let expirationTime = undefined 
        
        if(optionsMap?.px) {
          expirationTime = new Date().getTime() + optionsMap.px;
        } 

        memory[keySet] = {
          value,
          expirationTime,
        }
        
        response = OK_RESPONSE;
        break;
      case 'get':
        const keyGet = command.arguments[0];
        const item = memory[keyGet];

        if(!item || item.expirationTime && new Date().getTime() > item.expirationTime) {
          response = NULL_RESPONSE;
        } else {
          response = item.value.map(a => `${TypesMap.BulkString}${a.length}${CRLF}${a}${CRLF}`).join('');  
        }
        break;
      case 'config': 
        if(command.arguments[0] === 'GET') {
          const configKey = command.arguments[1];
          const baseResponse = `${TypesMap.Arrays}${2}${CRLF}${TypesMap.BulkString}${configKey.length}${CRLF}${configKey}${CRLF}`;
          if(configKey === 'dir') {
            response = `${baseResponse}${TypesMap.BulkString}${dir.length}${CRLF}${dir}${CRLF}`;
          } else if(configKey === 'dbfilename') {
            response = `${baseResponse}${TypesMap.BulkString}${dbfilename.length}${CRLF}${dbfilename}${CRLF}`;
          } else {
            response = NULL_RESPONSE;
          }
        }
      
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