import express from "express";
import { HebrewCalendar, HDate, Location, Zmanim } from "@hebcal/core";
import ical from "ical-generator";
import zipcodes from "zipcodes";
import tzLookup from "tz-lookup";
import moment from "moment-timezone";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.static("public"));

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
        `${z.city}, ${z.state}, ${z.country}`,
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
        "Custom Location",
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
      sedrot: true,
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
      const eventTime = ev.eventTime || ev.getDate().greg();
      const tzid = location.getTzid();

      // "Wall Clock" Shim:
      // 1. Get the wall-clock time in the target timezone (e.g. 16:28)
      // 2. Create a Date object that represents that time in UTC (16:28 Z)
      // 3. ical-generator (running in UTC) will output "162800" (floating),
      //    which combined with the Calendar's TZID header, works perfectly.
      const m = moment(eventTime).tz(tzid);
      const wallClockStr = m.format("YYYY-MM-DDTHH:mm:ss");
      const shiftedDate = new Date(wallClockStr + "Z");

      const formatOptions = { timeZone: tzid };

      if (desc === "Candle lighting") {
        calendar.createEvent({
          start: shiftedDate,
          end: shiftedDate,
          summary: `🕯️ Candle Lighting`,
          description: `Candle Lighting at ${eventTime.toLocaleTimeString(
            "en-US",
            formatOptions,
          )}`,
        });

        const zmanim = new Zmanim(location, eventTime, false);
        const sunset = zmanim.sunset();

        if (sunset) {
          const mSunset = moment(sunset).tz(tzid);
          const sunsetStr = mSunset.format("YYYY-MM-DDTHH:mm:ss");
          const shiftedSunset = new Date(sunsetStr + "Z");

          calendar.createEvent({
            start: shiftedSunset,
            end: shiftedSunset,
            summary: `☀️ Shkiya`,
            description: `Sunset (Shkiya) at ${sunset.toLocaleTimeString(
              "en-US",
              formatOptions,
            )}`,
          });
        }
      } else if (desc === "Havdalah") {
        calendar.createEvent({
          start: shiftedDate,
          end: shiftedDate,
          summary: `✨ Havdallah`,
          description: `Havdallah at ${eventTime.toLocaleTimeString(
            "en-US",
            formatOptions,
          )}`,
        });
      } else if (desc.startsWith("Parashat ")) {
        calendar.createEvent({
          start: eventTime,
          allDay: true,
          summary: desc,
          description: ``,
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
