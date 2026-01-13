# Zmanim Calendar Feed

A lightweight, self-hosted Node.js service that generates a custom iCalendar (`.ics`) feed for Jewish Zmanim.

It is designed to check for exactly what you need and nothing else:

- **Candle Lighting** (Friday / Erev Yom Tov)
- **Shkiya / Sunset** (Friday / Erev Yom Tov)
- **Havdallah** (Motzei Shabbos / Motzei Yom Tov)

> All events are "point-in-time" (0 minutes duration) to keep your calendar clean.

## Features

- **Dynamic Location**: Supports US Zip Codes or global Latitude/Longitude.
- **Automatic Timezone**: Automatically detects the correct timezone for any location.
- **Israel Support**: Automatically detects if the location is in Israel and adjusts holiday lengths (1 day vs 2 days) accordingly.
- **Smart Filtering**: Calculates Shkiya _only_ for days with Candle Lighting, avoiding daily clutter.

## Usage

### Subscription URL Pattern

Replace `https://` with `webcal://` to subscribe directly on iOS/macOS.

**By Zip Code (US Only):**

```
webcal://your-domain.com/feed?zip=11211
```

**By Coordinates (Global):**

```
webcal://your-domain.com/feed?lat=31.7767&lng=35.2345
```

_(Coordinates for the Kotel, Jerusalem)_

## Hosting

This project is ready to deploy on **Render**, **Railway**, or any Node.js host.
See [DEPLOY.md](DEPLOY.md) for step-by-step instructions.

## Local Development

1. Clone the repo
2. `npm install`
3. `node index.js`
4. Visit `http://localhost:3000/feed?zip=10001`
