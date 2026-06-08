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