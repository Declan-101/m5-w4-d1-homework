import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import App from './App';
import { kelvinToFarenheit } from './weather';

const fixture = { name: 'Irvine', sys: { country: 'US' }, main: { temp: 293.15, temp_min: 289.15, temp_max: 297.15 }, weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }] };
const ok = data => Promise.resolve({ ok: true, json: async () => data });
const originalKey = process.env.REACT_APP_API_KEY;
beforeEach(() => { process.env.REACT_APP_API_KEY = 'test-key'; global.fetch = jest.fn(() => ok(fixture)); });
afterEach(() => { cleanup(); jest.restoreAllMocks(); });
afterAll(() => { process.env.REACT_APP_API_KEY = originalKey; });

test('shows setup instructions without a key and makes no request', () => {
  process.env.REACT_APP_API_KEY = '';
  render(<App />);
  expect(screen.getByText('Connect OpenWeather')).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

test('renders weather, Fahrenheit temperatures, icon and country', async () => {
  render(<App />);
  expect(await screen.findByRole('region', { name: 'Current weather' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '68° F' })).toBeInTheDocument();
  expect(screen.getByText('Irvine')).toBeInTheDocument();
  expect(screen.getByText('United States of America')).toBeInTheDocument();
  expect(screen.getByAltText('scattered clouds')).toHaveAttribute('src', expect.stringContaining('03d@2x.png'));
  expect(kelvinToFarenheit(273.15)).toBe(32);
});

test('only searches on submit and supports repeat searches', async () => {
  render(<App />);
  await screen.findByRole('region', { name: 'Current weather' });
  fireEvent.change(screen.getByLabelText('Enter location'), { target: { value: 'London,GB' } });
  expect(fetch).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(fetch.mock.calls[1][0]).toContain('q=London%2CGB');
  await screen.findByRole('region', { name: 'Current weather' });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
});

test('rejects blank locations without a request', async () => {
  render(<App />); await screen.findByRole('region', { name: 'Current weather' });
  fireEvent.change(screen.getByLabelText('Enter location'), { target: { value: '   ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Enter a city');
  expect(fetch).toHaveBeenCalledTimes(1);
});

test.each([[404, 'Location not found'], [401, 'API key is invalid'], [429, 'request limit']])('explains HTTP %s responses', async (status, message) => {
  fetch.mockResolvedValue({ ok: false, status }); render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
});

test('handles connection failures and incomplete weather data', async () => {
  fetch.mockRejectedValueOnce(new TypeError('network'));
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not connect');
  fetch.mockImplementationOnce(() => ok({ name: 'Irvine' }));
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('incomplete data'));
});
