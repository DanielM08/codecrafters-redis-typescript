import type { RedisCommand } from "./parse-resp-command";

type SetOptions = 'px'
const SET_OPTIONS_WITH_ARG = new Set<SetOptions>(['px']); 
function setOptionsWithArgMapFactory(): Record<SetOptions, number | null> {
  return {
    px: null,
  }
}

export function parseSetCommand(command: RedisCommand){
  const setOptionsMap = setOptionsWithArgMapFactory();

  const keySet = command.arguments.splice(0, 1)[0];
  const value: string[] = [];

  let i = 0
  let setOptionsFound = false;
  while (i < command.arguments.length) {
    const item = command.arguments[i];
    
    if(SET_OPTIONS_WITH_ARG.has(item.toLowerCase() as SetOptions)){
      i++
      // TODO: validate if its ok using 0 as default value
      const optionArg = Number(command.arguments[i]) ?? 0;
      setOptionsMap[item.toLowerCase() as SetOptions] = optionArg;

      setOptionsFound = true;
      continue;
    }

    i++;
    if(setOptionsFound){
      continue;
    }

    value.push(item);
  }

  return {
    keySet,
    value,
    optionsMap: setOptionsFound ? setOptionsMap : null,
  }
}