export const kelvinToFarenheit = kelvin => Math.round((kelvin - 273.15) * 1.8 + 32);

export function weatherError(status) {
  if (status === 401) return 'The API key is invalid or is not active yet. Check your OpenWeather key and try again later.';
  if (status === 404) return 'Location not found. Try a city and country code, such as Irvine,US.';
  if (status === 429) return 'The weather request limit has been reached. Please try again later.';
  return 'Weather is unavailable right now. Please try again.';
}

export function validWeather(data) {
  return Boolean(data?.name && data?.sys?.country && data?.weather?.[0]?.main &&
    /^\d{2}[dn]$/.test(data.weather[0].icon) &&
    ['temp', 'temp_min', 'temp_max'].every(key => Number.isFinite(data.main?.[key])));
}
