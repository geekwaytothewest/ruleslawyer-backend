import * as crypto from 'crypto';
import {
  generateRegistrationCode,
  REGISTRATION_CODE_ALPHABET,
  REGISTRATION_CODE_LENGTH,
} from './registration-code';

jest.mock('crypto', () => {
  const actual = jest.requireActual<typeof import('crypto')>('crypto');
  return { ...actual, randomInt: jest.fn(actual.randomInt) };
});

const randomIntMock = crypto.randomInt as unknown as jest.Mock;

describe('generateRegistrationCode', () => {
  afterEach(() => {
    randomIntMock.mockClear();
  });

  it('defaults to 12 characters', () => {
    expect(REGISTRATION_CODE_LENGTH).toBe(12);
    expect(generateRegistrationCode()).toHaveLength(12);
  });

  it('honors a custom length', () => {
    expect(generateRegistrationCode(1)).toHaveLength(1);
    expect(generateRegistrationCode(32)).toHaveLength(32);
  });

  it('returns an empty string for length 0', () => {
    expect(generateRegistrationCode(0)).toBe('');
  });

  it('only uses uppercase letters and digits', () => {
    for (let i = 0; i < 500; i++) {
      expect(generateRegistrationCode()).toMatch(/^[A-Z0-9]{12}$/);
    }
  });

  it('uses the full 36-character alphabet', () => {
    expect(REGISTRATION_CODE_ALPHABET).toHaveLength(36);
    expect(new Set(REGISTRATION_CODE_ALPHABET).size).toBe(36);

    const seen = new Set(generateRegistrationCode(5000));
    expect(seen).toEqual(new Set(REGISTRATION_CODE_ALPHABET));
  });

  it('draws each character from crypto.randomInt over the alphabet size', () => {
    generateRegistrationCode();

    expect(randomIntMock).toHaveBeenCalledTimes(12);
    for (const call of randomIntMock.mock.calls) {
      expect(call).toEqual([REGISTRATION_CODE_ALPHABET.length]);
    }
  });

  it('maps random indices directly onto the alphabet', () => {
    const indices = [0, 35, 1, 34, 25, 26, 0, 0, 10, 20, 30, 35];
    indices.forEach((n) => randomIntMock.mockReturnValueOnce(n));

    expect(generateRegistrationCode()).toBe(
      indices.map((n) => REGISTRATION_CODE_ALPHABET[n]).join(''),
    );
  });

  it('produces no collisions across a large batch', () => {
    const codes = new Set(
      Array.from({ length: 10_000 }, () => generateRegistrationCode()),
    );
    expect(codes.size).toBe(10_000);
  });
});
