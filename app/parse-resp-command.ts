import { CRLF, TypesMap } from "./default-values";

export interface RedisCommand {
  name: string,
  arguments: string[],
}

export function parseRESPCommand(data: Buffer): RedisCommand {
  let i = 0;
  let commandArguments: string[] = [];

  while(i < data.length){
    const type = String.fromCharCode(data[i]);
    i++;

    if(type === TypesMap.Arrays){
      i += CRLF.length;

      continue;
    }
    if(type === TypesMap.BulkString){
      const stringLength = Number(String.fromCharCode(data[i]));
      i += 1 + CRLF.length;

      const argument = data.subarray(i, i + stringLength).toString();
      commandArguments.push(argument);
      i += stringLength + CRLF.length;

      continue;
    }
  }

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