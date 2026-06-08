export const getHotels = async (params: URLSearchParams) => {
  const response = await fetch(`/hotels/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Ошибка при загрузке отелей');
  }

  return response.json();
};

export interface LocationSuggestionsResponse {
  suggestions: string[];
}

export const getLocationSuggestions = async (
  query: string,
  signal?: AbortSignal,
): Promise<LocationSuggestionsResponse> => {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/hotels/locations/suggest?${params.toString()}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Ошибка при загрузке подсказок локаций');
  }

  return response.json();
};