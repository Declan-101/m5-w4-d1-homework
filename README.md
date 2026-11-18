# Module 5 Week 4 Day 1 Homework — React Weather App

Declan Wilde · WEB 403 Advanced Full Stack Web Development

## Start in VS Code

Open `react-weather-app` and run:

```sh
npm ci
npm start
```

Use the localhost address printed in the terminal. Search for a city, optionally followed by the ISO country code: `Irvine,US`, `London,GB`, or `Sydney,AU`. Press Search or Enter. Submitting the same city again refreshes the weather.

## API key

The project reads `REACT_APP_API_KEY` from a local `.env` file in `react-weather-app`, as the course PDF specifies. `.env` is excluded from Git. On another computer, copy `.env.example` to `.env`, add your own OpenWeather key, and restart the server.

Verify the account email with OpenWeather. New keys may take up to two hours to become ready even if the dashboard shows Active. A 401 message can mean activation is still pending. Never commit or share your key. In a browser-only React app, build-time environment values are visible to the browser; ignoring .env prevents publishing the source key to GitHub but does not make a deployed client key secret. This project is intended for local coursework.

## What the homework implements

- Functional App component using useState and useEffect.
- apiData holds the response; getState holds the typed input; state holds the submitted location.
- Fetch requests the OpenWeather Current Weather endpoint over HTTPS. It runs when the submitted request changes, not on every keystroke. AbortController cancels old requests and prevents stale results from replacing newer ones.
- A Kelvin-to-Fahrenheit function rounds current, minimum and maximum temperatures to whole numbers.
- The returned icon, location, weather condition, and full country name appear in a Bootstrap card.
- i18n-iso-countries registers its English locale and converts country codes to names.
- Font Awesome supplies location, low-temperature and high-temperature icons.
- Loading, empty input, unknown location, invalid or inactive key, request-limit and network errors are handled. Missing configuration shows setup instructions.

The min/max values come from the current-weather response, as in the slides; they are not a separate daily forecast. No extra React-Ajax library is needed: the PDF implements AJAX with the browser's fetch API.

The app uses react-scripts (Create React App tooling), scaffolded locally with the course structure instead of rerunning the deprecated generator.

## Checks

```sh
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

The automated tests use mocked OpenWeather responses and do not spend API calls. They cover configuration, output, conversion, submit-only and repeat searches, blank input, HTTP 401/404/429, connection failures, and incomplete data. A live account/key check is separate.

## Explain it

“Typing updates getState, and Search copies that location into state. That changes the API URL, so useEffect fetches the weather. I save the response in apiData and render the weather card. I convert Kelvin to Fahrenheit, look up the full country name, and display icons for the weather and temperatures.”

No GAP submission has been made.
