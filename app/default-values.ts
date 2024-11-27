export const CRLF = '\r\n';
export const OK_RESPONSE = `+OK${CRLF}`;
export const NULL_RESPONSE = `$-1${CRLF}`;

export enum TypesMap {
  SimpleString = '+',
  SimpleError = '-',
  Integer = ':',
  BulkString = '$',
  Arrays = '*'
}