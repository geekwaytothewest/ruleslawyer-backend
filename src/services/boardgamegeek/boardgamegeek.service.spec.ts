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
      ['A Feast for Odin', 'feast for odin'],
      ['Café', 'cafe'],
      ['Ticket to Ride: Europe', 'ticket to ride europe'],
      ['  Multi   Space  ', 'multi space'],
      ['7 Wonders', '7 wonders'],
      ['', ''],
    ])('normalizes %p -> %p', (input, expected) => {
      expect(normalizeBggName(input)).toBe(expected);
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
  });

  describe('adaptive throttle', () => {
    it('starts at the baseline delay', () => {
      expect(service.throttleDelayMs).toBe(1000);
    });

    it('raises the delay after a 429 and resets on demand', async () => {
      http.get.mockRejectedValueOnce(rateLimited()).mockResolvedValueOnce(ok('<items/>'));
      await service.getBoardGameBatchByBGGIds([13]);

      expect(service.throttleDelayMs).toBeGreaterThan(1000);

      service.resetThrottle();
      expect(service.throttleDelayMs).toBe(1000);
    });

    it('caps the delay under sustained 429s', async () => {
      http.get.mockRejectedValue(rateLimited());
      await service.getBoardGameBatchByBGGIds([13]);
      expect(service.throttleDelayMs).toBeLessThanOrEqual(8000);
      expect(service.throttleDelayMs).toBeGreaterThan(1000);
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
        'id,name,yearpublished,rank\n' +
        '13,CATAN,1995,512\n' +
        '822,Carcassonne,2000,200\n' +
        '0,BadRow,,\n'; // id=0 should be skipped
      http.get.mockResolvedValue({ data: zipWithCsv(csv), status: 200, headers: {} });

      const index = await service.getRankDumpIndex('https://signed-url');

      expect(index.get('catan')).toEqual([{ id: 13, year: 1995, rank: 512 }]);
      expect(index.get('carcassonne')).toEqual([{ id: 822, year: 2000, rank: 200 }]);
      expect(index.has('badrow')).toBe(false);
    });

    it('groups duplicate names under one key', async () => {
      const csv =
        'id,name,yearpublished,rank\n' +
        '2655,Hive,2001,300\n' +
        '999,Hive,2018,0\n';
      http.get.mockResolvedValue({ data: zipWithCsv(csv), status: 200, headers: {} });

      const index = await service.getRankDumpIndex('https://signed-url');
      const hive = index.get('hive');

      expect(hive).toHaveLength(2);
      expect(hive!.map((e) => e.id).sort((a, b) => a - b)).toEqual([999, 2655]);
      // rank "0" parses to null (unranked)
      expect(hive!.find((e) => e.id === 999)!.rank).toBeNull();
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
