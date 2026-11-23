import * as crypto from 'crypto';

export const REGISTRATION_CODE_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const REGISTRATION_CODE_LENGTH = 12;

// Uppercase alphanumeric code from a CSPRNG (36^12 ≈ 4.7e18 combinations at
// the default length); randomInt avoids modulo bias.
export function generateRegistrationCode(
  length = REGISTRATION_CODE_LENGTH,
): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code +=
      REGISTRATION_CODE_ALPHABET[
        crypto.randomInt(REGISTRATION_CODE_ALPHABET.length)
      ];
  }
  return code;
}
