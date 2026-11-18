import { useEffect, useState } from 'react';
import countries from 'i18n-iso-countries';
import english from 'i18n-iso-countries/langs/en.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faTemperatureLow, faTemperatureHigh } from '@fortawesome/free-solid-svg-icons';
import { kelvinToFarenheit, weatherError, validWeather } from './weather';
import './App.css';

countries.registerLocale(english);

function App() {
  const [apiData, setApiData] = useState(null);
  const [getState, setGetState] = useState('Irvine,US');
  const [state, setState] = useState('Irvine,US');
  const [requestNumber, setRequestNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState('');
  const apiKey = (process.env.REACT_APP_API_KEY || '').trim();
  const apiUrl = apiKey ? `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(state)}&appid=${encodeURIComponent(apiKey)}` : '';

  useEffect(() => {
    if (!apiUrl) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setApiData(null);
    fetch(apiUrl, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(weatherError(response.status));
        const data = await response.json();
        if (!validWeather(data)) throw new Error('The weather service returned incomplete data. Please try again.');
        return data;
      })
      .then(data => { if (!controller.signal.aborted) setApiData(data); })
      .catch(reason => {
        if (!controller.signal.aborted) setError(reason instanceof TypeError ? 'Could not connect to OpenWeather. Check your internet connection and try again.' : reason.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [apiUrl, requestNumber]);

  const inputHandler = event => { setGetState(event.target.value); setInputError(''); };
  const submitHandler = event => {
    event.preventDefault();
    const city = getState.trim();
    if (!city) { setInputError('Enter a city or location.'); return; }
    setInputError('');
    setState(city);
    // Allow the same location to be searched again after an error or update.
    setRequestNumber(previous => previous + 1);
  };

  return (
    <div className="weather-app">
      <header className="app-header"><p>WEB 403 · Week 4 Day 1</p><h1>React Weather App</h1></header>
      <main className="container weather-container">
        <form className="search-form" onSubmit={submitHandler}>
          <label className="form-label" htmlFor="location">Enter location</label>
          <div className="search-row">
            <input id="location" className="form-control" type="text" value={getState} onChange={inputHandler}
              placeholder="City, country code" autoComplete="off" maxLength={100}
              aria-invalid={Boolean(inputError)} aria-describedby="location-help" />
            <button className="btn btn-primary" type="submit">Search</button>
          </div>
          <p id="location-help" className="form-text">For example: Irvine,US or London,GB</p>
          {inputError && <p className="text-danger" role="alert">{inputError}</p>}
        </form>
        {!apiKey ? <section className="card weather-card"><div className="card-body setup-message"><h2>Connect OpenWeather</h2><p>Add your API key to the local .env file, then restart the app to load live weather.</p></div></section>
          : loading ? <p className="status" role="status">Loading weather for {state}…</p>
          : error ? <div className="alert alert-danger" role="alert">{error}</div>
          : apiData?.main ? (
            <section className="card weather-card" aria-label="Current weather">
              <div className="card-body">
                <img className="weather-icon" src={`https://openweathermap.org/img/wn/${apiData.weather[0].icon}@2x.png`}
                  alt={apiData.weather[0].description || apiData.weather[0].main} width="100" height="100" />
                <h2 className="current-temperature">{kelvinToFarenheit(apiData.main.temp)}° F</h2>
                <p className="location"><FontAwesomeIcon icon={faLocationDot} /> {apiData.name}</p>
                <div className="row weather-details">
                  <div className="col-6"><p><FontAwesomeIcon className="low" icon={faTemperatureLow} /> <span className="detail-label">Low</span> {kelvinToFarenheit(apiData.main.temp_min)}° F</p>
                    <p><FontAwesomeIcon className="high" icon={faTemperatureHigh} /> <span className="detail-label">High</span> {kelvinToFarenheit(apiData.main.temp_max)}° F</p></div>
                  <div className="col-6"><p>{apiData.weather[0].main}</p><p>{countries.getName(apiData.sys.country, 'en') || apiData.sys.country}</p></div>
                </div>
              </div>
            </section>
          ) : <p className="status">Enter a location to see the current weather.</p>}
      </main>
      <footer className="footer">Declan Wilde · <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">Weather data by OpenWeather</a></footer>
    </div>
  );
}
export default App;
