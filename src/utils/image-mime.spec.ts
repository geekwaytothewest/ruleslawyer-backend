import { detectImageMime } from './image-mime';

describe('detectImageMime', () => {
  it('detects PNG', () => {
    expect(
      detectImageMime(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe('image/png');
  });

  it('detects JPEG', () => {
    expect(detectImageMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      'image/jpeg',
    );
  });

  it('detects GIF', () => {
    expect(
      detectImageMime(Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])),
    ).toBe('image/gif');
  });

  it('detects WebP', () => {
    const webp = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(detectImageMime(webp)).toBe('image/webp');
  });

  it('defaults to JPEG for unrecognized/short data', () => {
    expect(detectImageMime(Buffer.from([0x00, 0x01]))).toBe('image/jpeg');
    expect(detectImageMime(Buffer.from([]))).toBe('image/jpeg');
  });
});
