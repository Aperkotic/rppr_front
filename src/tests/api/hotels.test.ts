import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHotels, getLocationSuggestions, type LocationSuggestionsResponse } from '../../api/hotels';

//  mock setup 
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

function createResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('getHotels', () => {
  const params = new URLSearchParams({ city: 'Moscow', stars: '5' });

  it('should send a GET request with the encoded query string and return data on success', async () => {
    const fakeData = [{ id: 1, name: 'Hotel A' }];
    mockFetch.mockResolvedValueOnce(createResponse(fakeData, true));

    const result = await getHotels(params);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`/hotels/?${params.toString()}`);
    expect(options.method).toBe('GET');
    expect(options.headers).toEqual({ accept: 'application/json' });

    expect(result).toEqual(fakeData);
  });

  it('should throw an error with server detail when the response is not ok', async () => {
    mockFetch.mockResolvedValueOnce(
      createResponse({ detail: 'City not found' }, false, 404)
    );
    await expect(getHotels(params)).rejects.toThrow('City not found');
  });

  it('should throw a default error message if the server returns no detail', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({}, false, 500));
    await expect(getHotels(params)).rejects.toThrow('Ошибка при загрузке отелей');
  });
});

describe('getLocationSuggestions', () => {
  const query = 'Mos';
  const fakeSuggestions: LocationSuggestionsResponse = {
    suggestions: ['Moscow', 'Mossel Bay'],
  };

  it('should send a GET request with the q parameter and return suggestions on success', async () => {
    mockFetch.mockResolvedValueOnce(createResponse(fakeSuggestions, true));

    const result = await getLocationSuggestions(query);

    const expectedUrl = `/hotels/locations/suggest?q=${encodeURIComponent(query)}`;
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(expectedUrl);
    expect(options.method).toBe('GET');
    expect(options.headers).toEqual({ accept: 'application/json' });
    expect(result).toEqual(fakeSuggestions);
  });

  it('should pass the AbortSignal when provided', async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    mockFetch.mockResolvedValueOnce(createResponse(fakeSuggestions, true));

    await getLocationSuggestions(query, signal);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.signal).toBe(signal);
  });

  it('should throw an error with server detail on failure', async () => {
    mockFetch.mockResolvedValueOnce(
      createResponse({ detail: 'Invalid query' }, false, 400)
    );
    await expect(getLocationSuggestions(query)).rejects.toThrow('Invalid query');
  });

  it('should throw a default error if server error has no detail', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({}, false, 500));
    await expect(getLocationSuggestions(query)).rejects.toThrow(
      'Ошибка при загрузке подсказок локаций'
    );
  });
});
