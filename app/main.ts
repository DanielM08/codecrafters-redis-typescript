import * as net from "net";

interface RedisCommand {
  name: string,
  arguments: string[],
}

const clients: Set<net.Socket> = new Set();

enum TypesMap {
  SimpleString = '+',
  SimpleError = '-',
  Integer = ':',
  BulkString = '$',
  Arrays = '*'
}

const CRLF = '\r\n';
// const CRLFLength = CRLF.length;

function parseRESPCommand(data: Buffer): RedisCommand {
  let i = 0;
  let arrayLength = 0;
  let commandArguments: string[] = [];

  while(i < data.length){
    const type = String.fromCharCode(data[i]);
    i++;

    if(type === TypesMap.Arrays){
      arrayLength = Number(String.fromCharCode(data[i]))
      i = data.indexOf(CRLF, i) + 2;

      continue;
    }
    if(type === TypesMap.BulkString){
      const stringLength = Number(String.fromCharCode(data[i]));
      i = data.indexOf(CRLF, i) + 2;

      const argument = data.subarray(i, i + stringLength).toString();
      commandArguments.push(argument);
      i += stringLength;

      i = data.indexOf(CRLF, i) + 2;

      continue;
    }
  }

  console.log(commandArguments)

  if(commandArguments.length === 0){
    // TODO: improve error handling
    throw new Error('Invalid command');
  }

  const name = commandArguments[0];
  commandArguments.splice(0, 1);

  return {
    name,
    arguments: commandArguments,
  };
}


const server: net.Server = net.createServer((connection: net.Socket) => {  
  clients.add(connection);

  connection.on('data', (data) => {
    const command = parseRESPCommand(data);

    switch (command.name.toLowerCase()) {
      case 'echo': 
        const resp = command.arguments.map(a => `${TypesMap.BulkString}${a.length}${CRLF}${a}${CRLF}`).join('')
        connection.write(`${resp}`)
        break;
      case 'ping':
        connection.write('+PONG\r\n')
        break;
    }
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