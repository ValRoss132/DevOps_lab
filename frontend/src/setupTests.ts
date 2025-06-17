// setupTests.ts
import '@testing-library/jest-dom';
import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

global.TextDecoder = class TextDecoder {
  encoding = 'utf-8';
  fatal = false;
  ignoreBOM = false;

  decode(input?: ArrayBuffer | DataView) {
    if (input instanceof ArrayBuffer) {
      return Buffer.from(new Uint8Array(input)).toString('utf-8');
    } else if (input instanceof DataView) {
      return Buffer.from(new Uint8Array(input.buffer)).toString('utf-8');
    }
    return '';
  }
};

window.HTMLElement.prototype.scrollIntoView = jest.fn();
