import express from "express";
import { HebrewCalendar, HDate, Location, Zmanim } from "@hebcal/core";
import ical from "ical-generator";
import zipcodes from "zipcodes";
import tzLookup from "tz-lookup";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/feed", (req, res) => {
  try {
    const { zip, lat, lng, tzid } = req.query;
    let location;

    // 1. Determine Location
    if (zip) {
      const z = zipcodes.lookup(zip);
      if (!z) {
        return res.status(400).send("Invalid zip code");
      }
      const timeZoneId = tzLookup(z.latitude, z.longitude);
      // zipcodes lib is primarily US/Canada so isIsrael is false unless covered otherwise
      location = new Location(
        z.latitude,
        z.longitude,
        false,
        timeZoneId,
        `${z.city}, ${z.state}, ${z.country}`
      );
    } else if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const timeZoneId = tzid || tzLookup(latitude, longitude);
      const isIsrael =
        timeZoneId === "Asia/Jerusalem" || timeZoneId === "Asia/Tel_Aviv";

      location = new Location(
        latitude,
        longitude,
        isIsrael,
        timeZoneId,
        "Custom Location"
      );
    } else {
      return res
        .status(400)
        .send("Missing location parameters. Provide zip OR lat/lng.");
    }

    // 2. Setup Calendar Range
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 5);
    const end = new Date(now);
    end.setFullYear(end.getFullYear() + 1);

    // 3. Generate Events
    /**
     * @type {import('@hebcal/core').CalOptions}
     */
    const options = {
      start: start,
      end: end,
      location: location,
      candlelighting: true,
      sedrot: false,
      omer: false,
      isHebrewYear: false,
      shabbatMevarchim: false,
    };

    const events = HebrewCalendar.calendar(options);

    // 4. Create iCal Feed
    const calendar = ical({
      name: `Zmanim Feed - ${location.getName()}`,
      timezone: location.getTzid(),
    });

    for (const ev of events) {
      const desc = ev.getDesc();
      // eventTime is usually present for time-bound events like candles/havdalah
      const eventTime = ev.eventTime || ev.getDate().greg();
      const formatOptions = { timeZone: location.getTzid() }; // Force location timezone

      if (desc === "Candle lighting") {
        calendar.createEvent({
          start: eventTime,
          end: eventTime,
          summary: `🕯️ Candle Lighting`,
          description: `Candle Lighting at ${eventTime.toLocaleTimeString(
            "en-US",
            formatOptions
          )}`,
        });

        // Calculate Shkiya
        const zmanim = new Zmanim(location, eventTime, false);
        const sunset = zmanim.sunset();

        if (sunset) {
          calendar.createEvent({
            start: sunset,
            end: sunset,
            summary: `☀️ Shkiya`,
            description: `Sunset (Shkiya) at ${sunset.toLocaleTimeString(
              "en-US",
              formatOptions
            )}`,
          });
        }
      } else if (desc === "Havdalah") {
        calendar.createEvent({
          start: eventTime,
          end: eventTime,
          summary: `✨ Havdallah`,
          description: `Havdallah at ${eventTime.toLocaleTimeString(
            "en-US",
            formatOptions
          )}`,
        });
      }
    }

    // calendar.serve(res); // serve() might be deprecated or missing in this build
    res.set("Content-Type", "text/calendar; charset=utf-8");
    res.set("Content-Disposition", 'attachment; filename="zmanim.ics"');
    res.send(calendar.toString());
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Zmanim feed running on http://localhost:${PORT}`);
});
