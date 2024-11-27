import { describe, expect, test } from "bun:test";

import { parseRESPCommand } from '../app/parse-resp-command';
import { parseSetCommand } from "../app/parse-set-command";

describe('parseSetCommand', () => {
  // TODO: improve more test cases
  test('should parse set command without options', () => {

    const command = {
      name: 'set',
      arguments: ['keyValue', 'foo', 'lalalala'],
    }

    const result = parseSetCommand(command);

    expect(result).toEqual({ keySet: "keyValue", value: ['foo', 'lalalala'], optionsMap: null });
  });

  test('should parse set command with options', () => {
    const command = {
      name: 'set',
      arguments: ['keyValue', 'foo', 'lalalala', 'PX', '1000'],
    }

    const result = parseSetCommand(command);

    expect(result).toEqual({ keySet: "keyValue", value: ['foo', 'lalalala'], optionsMap: { px: 1000 } });
  });
});