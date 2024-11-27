import { describe, expect, test } from "bun:test";

import { parseRESPCommand } from '../app/parse-resp-command';

describe('parseRESPCommand', () => {
  // TODO: improve more test cases
  test('should parse resp command correctly', () => {

    const buffer = Buffer.from('*3\r\n$3\r\nSET\r\n$4\r\npear\r\n$3\r\nfoo\r\n');

    const result = parseRESPCommand(buffer);

    expect(result).toEqual({ name: "SET", arguments: ["pear", "foo"] });
  });
});