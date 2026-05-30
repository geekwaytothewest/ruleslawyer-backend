import AdmZip = require('adm-zip');
import { BoardGameGeekService, normalizeBggName } from './boardgamegeek.service';

type MockHttp = { get: jest.Mock };

const ok = (data: string, status = 200, headers: Record<string, string> = {}) => ({
  data,
  status,
  headers,
});

const rateLimited = (headers: Record<string, string> = {}) => {
  const err: any = new Error('Request failed with status code 429');
  err.response = { status: 429, headers };
  return err;
};

describe('BoardGameGeekService', () => {
  let service: BoardGameGeekService;
  let http: MockHttp;

  beforeEach(() => {
    process.env.BOARDGAMEGEEK_API_TOKEN = 'test-token';
    http = { get: jest.fn() };
    service = new BoardGameGeekService(http as any);
    // Neutralize backoff sleeps so retry tests run instantly.
    (service as any).sleep = jest.fn().mockResolvedValue(undefined);
  });

  describe('normalizeBggName', () => {
    it.each([
      ['CATAN', 'catan'],
      ['The Settlers of Catan', 'settlers of catan'],
      ['Castles of Burgundy, The', 'castles of burgundy'],
      ['Princes of Florence, The', 'princes of florence'],
      ['Ancient World, The (2nd Edition)', 'ancient world 2nd edition'],
      ['A Feast for Odin', 'feast for odin'],
      ['Café', 'cafe'],
      ['Ticket to Ride: Europe', 'ticket to ride europe'],
      ['  Multi   Space  ', 'multi space'],
      ['7 Wonders', '7 wonders'],
      ['', ''],
    ])('normalizes %p -> %p', (input, expected) => {
      expect(normalizeBggName(input)).toBe(expected);
    });

    it('treats null/undefined as an empty string', () => {
      expect(normalizeBggName(undefined as any)).toBe('');
      expect(normalizeBggName(null as any)).toBe('');
    });
  });

  describe('getBoardGameBatchByBGGIds', () => {
    it('returns [] without calling the API for an empty list', async () => {
      const result = await service.getBoardGameBatchByBGGIds([]);
      expect(result).toEqual([]);
      expect(http.get).not.toHaveBeenCalled();
    });

    it('throws when given more than 20 ids', async () => {
      const ids = Array.from({ length: 21 }, (_, i) => i + 1);
      await expect(service.getBoardGameBatchByBGGIds(ids)).rejects.toThrow(
        /exceeds BoardGameGeek API limit/,
      );
    });

    it('throws without calling the API when the token is not set', async () => {
      delete process.env.BOARDGAMEGEEK_API_TOKEN;
      await expect(service.getBoardGameBatchByBGGIds([13])).rejects.toThrow(
        /BOARDGAMEGEEK_API_TOKEN is not set/,
      );
      expect(http.get).not.toHaveBeenCalled();
    });

    it('parses items from a single batched request', async () => {
      http.get.mockResolvedValue(
        ok(
          `<items><item type="boardgame" id="13"><thumbnail>t13</thumbnail></item>` +
            `<item type="boardgame" id="822"><thumbnail>t822</thumbnail></item></items>`,
        ),
      );

      const result = await service.getBoardGameBatchByBGGIds([13, 822]);

      expect(http.get).toHaveBeenCalledTimes(1);
      expect(http.get.mock.calls[0][0]).toContain('thing?id=13,822');
      expect(result.map((i: any) => i['@_id'])).toEqual(['13', '822']);
    });

    it('returns [] when the request errors', async () => {
      http.get.mockRejectedValue(new Error('network down'));
      await expect(service.getBoardGameBatchByBGGIds([13])).resolves.toEqual([]);
    });

    it('retries a 202 (queued) response then succeeds', async () => {
      http.get
        .mockResolvedValueOnce(ok('<message>queued</message>', 202))
        .mockResolvedValueOnce(ok('<items><item id="13"/></items>'));

      const result = await service.getBoardGameBatchByBGGIds([13]);

      expect(http.get).toHaveBeenCalledTimes(2);
      expect(result.map((i: any) => i['@_id'])).toEqual(['13']);
    });

    it('gives up after repeated 202s and yields no items', async () => {
      http.get.mockResolvedValue(ok('<message>queued</message>', 202));
      const result = await service.getBoardGameBatchByBGGIds([13]);
      // 1 initial + 4 retries
      expect(http.get).toHaveBeenCalledTimes(5);
      expect(result).toEqual([]);
    });

    it('retries a 429 then succeeds', async () => {
      http.get
        .mockRejectedValueOnce(rateLimited({ 'retry-after': '2' }))
        .mockResolvedValueOnce(ok('<items><item id="13"/></items>'));

      const result = await service.getBoardGameBatchByBGGIds([13]);

      expect(http.get).toHaveBeenCalledTimes(2);
      expect(result.map((i: any) => i['@_id'])).toEqual(['13']);
      // Retry-After: 2s honored.
      expect((service as any).sleep).toHaveBeenCalledWith(2000);
    });

    it('returns [] after exhausting 429 retries', async () => {
      http.get.mockRejectedValue(rateLimited());
      const result = await service.getBoardGameBatchByBGGIds([13]);
      expect(http.get).toHaveBeenCalledTimes(5);
      expect(result).toEqual([]);
    });
  });

  describe('getBoardGameByBGGId', () => {
    it('resolves the first item on success', async () => {
      http.get.mockResolvedValue(
        ok('<items><item id="13"><thumbnail>t</thumbnail></item></items>'),
      );
      const game: any = await service.getBoardGameByBGGId(13);
      expect(game['@_id']).toBe('13');
    });

    it('resolves null when no item is found', async () => {
      http.get.mockResolvedValue(ok('<items></items>'));
      await expect(service.getBoardGameByBGGId(999)).resolves.toBeNull();
    });

    it('rejects when the request throws a non-429 error', async () => {
      http.get.mockRejectedValue(new Error('boom'));
      await expect(service.getBoardGameByBGGId(13)).rejects.toThrow('boom');
    });

    it('rejects without calling the API when the token is not set', async () => {
      delete process.env.BOARDGAMEGEEK_API_TOKEN;
      await expect(service.getBoardGameByBGGId(13)).rejects.toThrow(
        /BOARDGAMEGEEK_API_TOKEN is not set/,
      );
      expect(http.get).not.toHaveBeenCalled();
    });
  });

  describe('getBoardGameIdByName', () => {
    it('returns the parsed numeric id of the first match', async () => {
      http.get.mockResolvedValue(
        ok('<items><item id="42"><name value="Catan"/></item></items>'),
      );
      await expect(service.getBoardGameIdByName('Catan')).resolves.toBe(42);
      expect(http.get.mock.calls[0][0]).toContain('search?query=Catan');
    });

    it('returns null when nothing matches', async () => {
      http.get.mockResolvedValue(ok('<items></items>'));
      await expect(service.getBoardGameIdByName('Nope')).resolves.toBeNull();
    });

    it('rejects when the request errors', async () => {
      http.get.mockRejectedValue(new Error('boom'));
      await expect(service.getBoardGameIdByName('Catan')).rejects.toThrow(
        'boom',
      );
    });
  });

  describe('retryDelayMs', () => {
    it('honors a numeric Retry-After header (seconds)', () => {
      const delay = (service as any).retryDelayMs(
        { response: { headers: { 'retry-after': '3' } } },
        0,
        1000,
      );
      expect(delay).toBe(3000);
    });

    it('honors an HTTP-date Retry-After header', () => {
      const future = new Date(Date.now() + 5000).toUTCString();
      const delay = (service as any).retryDelayMs(
        { response: { headers: { 'retry-after': future } } },
        0,
        1000,
      );
      // ~5s out; allow slack for clock/rounding.
      expect(delay).toBeGreaterThan(3000);
      expect(delay).toBeLessThanOrEqual(5000);
    });

    it('falls back to exponential backoff without a Retry-After header', () => {
      const delay = (service as any).retryDelayMs({}, 3, 1000);
      expect(delay).toBe(8000);
    });
  });

  describe('getImage', () => {
    it('returns a buffer of the fetched image and sends a timeout', async () => {
      http.get.mockResolvedValue({ data: Buffer.from('imgbytes') });

      const image = await service.getImage('https://img');

      expect(image).toBeInstanceOf(Buffer);
      expect(image?.toString()).toBe('imgbytes');
      expect(http.get.mock.calls[0][1]).toMatchObject({
        responseType: 'arraybuffer',
        timeout: expect.any(Number),
      });
    });

    it('retries a transient failure then succeeds', async () => {
      http.get
        .mockRejectedValueOnce(new Error('socket hang up'))
        .mockResolvedValueOnce({ data: Buffer.from('imgbytes') });

      const image = await service.getImage('https://img');

      expect(image?.toString()).toBe('imgbytes');
      expect(http.get).toHaveBeenCalledTimes(2);
    });

    it('retries a 429 honoring Retry-After', async () => {
      http.get
        .mockRejectedValueOnce(rateLimited({ 'retry-after': '1' }))
        .mockResolvedValueOnce({ data: Buffer.from('imgbytes') });

      const image = await service.getImage('https://img');

      expect(image?.toString()).toBe('imgbytes');
      expect(http.get).toHaveBeenCalledTimes(2);
      expect((service as any).sleep).toHaveBeenCalledWith(1000);
    });

    it('returns null after exhausting retries', async () => {
      http.get.mockRejectedValue(new Error('boom'));

      const image = await service.getImage('https://img');

      expect(image).toBeNull();
      // initial attempt + 2 retries
      expect(http.get).toHaveBeenCalledTimes(3);
    });

    it('does not retry a non-retryable 4xx', async () => {
      const notFound: any = new Error('Request failed with status code 404');
      notFound.response = { status: 404, headers: {} };
      http.get.mockRejectedValue(notFound);

      const image = await service.getImage('https://img');

      expect(image).toBeNull();
      expect(http.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('adaptive throttle', () => {
    it('starts at the baseline delay', () => {
      expect(service.throttleDelayMs).toBe(2000);
    });

    it('raises the delay after a 429 and resets on demand', async () => {
      http.get.mockRejectedValueOnce(rateLimited()).mockResolvedValueOnce(ok('<items/>'));
      await service.getBoardGameBatchByBGGIds([13]);

      expect(service.throttleDelayMs).toBeGreaterThan(2000);

      service.resetThrottle();
      expect(service.throttleDelayMs).toBe(2000);
    });

    it('caps the delay under sustained 429s', async () => {
      http.get.mockRejectedValue(rateLimited());
      await service.getBoardGameBatchByBGGIds([13]);
      expect(service.throttleDelayMs).toBeLessThanOrEqual(8000);
      expect(service.throttleDelayMs).toBeGreaterThan(2000);
    });
  });

  describe('getRankDumpIndex', () => {
    const zipWithCsv = (csv: string, name = 'boardgames_ranks.csv') => {
      const zip = new AdmZip();
      zip.addFile(name, Buffer.from(csv));
      return zip.toBuffer();
    };

    it('builds a normalized name index from the dump CSV', async () => {
      const csv =
        'id,name,yearpublished,rank,bayesaverage\n' +
        '13,CATAN,1995,512,7.2\n' +
        '822,Carcassonne,2000,200,7.4\n' +
        '0,BadRow,,,\n'; // id=0 should be skipped
      http.get.mockResolvedValue({ data: zipWithCsv(csv), status: 200, headers: {} });

      const index = await service.getRankDumpIndex('https://signed-url');

      expect(index.get('catan')).toEqual([
        { id: 13, year: 1995, rank: 512, rating: 7.2 },
      ]);
      expect(index.get('carcassonne')).toEqual([
        { id: 822, year: 2000, rank: 200, rating: 7.4 },
      ]);
      expect(index.has('badrow')).toBe(false);
    });

    it('groups duplicate names under one key', async () => {
      const csv =
        'id,name,yearpublished,rank,bayesaverage\n' +
        '2655,Hive,2001,300,6.9\n' +
        '999,Hive,2018,0,2.3\n';
      http.get.mockResolvedValue({ data: zipWithCsv(csv), status: 200, headers: {} });

      const index = await service.getRankDumpIndex('https://signed-url');
      const hive = index.get('hive');

      expect(hive).toHaveLength(2);
      expect(hive!.map((e) => e.id).sort((a, b) => a - b)).toEqual([999, 2655]);
      // rank "0" parses to null (unranked)
      expect(hive!.find((e) => e.id === 999)!.rank).toBeNull();
    });

    it('skips rows whose name normalizes to empty', async () => {
      const csv =
        'id,name,yearpublished,rank,bayesaverage\n' +
        '13,CATAN,1995,512,6.9\n' +
        '77,   ,2000,100,6.9\n'; // whitespace-only name normalizes to empty -> skipped
      http.get.mockResolvedValue({ data: zipWithCsv(csv), status: 200, headers: {} });

      const index = await service.getRankDumpIndex('https://signed-url');

      expect(index.get('catan')).toEqual([{ id: 13, year: 1995, rank: 512, rating: 6.9 }]);
      // The whitespace-named row produced no key.
      expect(index.size).toBe(1);
    });

    it('stores a null year when yearpublished is missing', async () => {
      const csv = 'id,name,yearpublished,rank,bayesaverage\n' + '55,Untimed Game,,300,5.9\n';
      http.get.mockResolvedValue({ data: zipWithCsv(csv), status: 200, headers: {} });

      const index = await service.getRankDumpIndex('https://signed-url');

      expect(index.get('untimed game')).toEqual([
        { id: 55, year: null, rank: 300, rating: 5.9 },
      ]);
    });

    it('throws a clear error when the download fails without a status', async () => {
      // A network error with no response object exercises the no-status branch.
      http.get.mockRejectedValue(new Error('socket hang up'));

      await expect(
        service.getRankDumpIndex('https://signed-url'),
      ).rejects.toThrow(/Failed to download the BGG rank dump:.*socket hang up/s);
    });

    it('throws a clear error when the buffer is a corrupt zip', async () => {
      // Valid "PK" magic so it passes the zip-signature check, but not a real
      // archive, so AdmZip fails to open it.
      const corrupt = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x01, 0x02]);
      http.get.mockResolvedValue({ data: corrupt, status: 200, headers: {} });

      await expect(
        service.getRankDumpIndex('https://corrupt'),
      ).rejects.toThrow(/zip/i);
    });

    it('throws when the zip contains no CSV', async () => {
      http.get.mockResolvedValue({
        data: zipWithCsv('not a csv', 'readme.txt'),
        status: 200,
        headers: {},
      });
      await expect(service.getRankDumpIndex('https://signed-url')).rejects.toThrow(
        /No CSV file found/,
      );
    });

    it('throws a clear error when the download fails (e.g. expired URL)', async () => {
      const err: any = new Error('Request failed with status code 403');
      err.response = { status: 403 };
      http.get.mockRejectedValue(err);

      await expect(service.getRankDumpIndex('https://expired')).rejects.toThrow(
        /Failed to download the BGG rank dump \(HTTP 403\).*expired/s,
      );
    });

    it('throws a clear error when the response is not a zip', async () => {
      http.get.mockResolvedValue({
        data: Buffer.from('<?xml version="1.0"?><Error><Code>AccessDenied</Code></Error>'),
        status: 200,
        headers: {},
      });

      await expect(service.getRankDumpIndex('https://not-a-zip')).rejects.toThrow(
        /did not return a zip/,
      );
    });
  });
});
