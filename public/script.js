document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".panel");
  const generateBtn = document.getElementById("generate-btn");
  const locateBtn = document.getElementById("locate-btn");
  const resultSection = document.getElementById("result");
  const feedUrlInput = document.getElementById("feed-url");
  const copyBtn = document.getElementById("copy-btn");
  const webcalLink = document.getElementById("webcal-link");
  const downloadLink = document.getElementById("download-link");

  let currentMode = "zip";

  // Tab Switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const target = tab.getAttribute("data-tab");
      document.getElementById(`${target}-panel`).classList.add("active");
      currentMode = target;
    });
  });

  // Geolocation
  locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    locateBtn.textContent = "Locating...";
    locateBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        document.getElementById("latitude").value =
          position.coords.latitude.toFixed(4);
        document.getElementById("longitude").value =
          position.coords.longitude.toFixed(4);

        // Try to detect timezone
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          document.getElementById("tzid").value = tz;
        } catch (e) {
          // Ignore if can't detect
        }

        locateBtn.textContent = "📍 Locate Me";
        locateBtn.disabled = false;
      },
      (error) => {
        alert("Unable to retrieve your location");
        locateBtn.textContent = "📍 Locate Me";
        locateBtn.disabled = false;
      },
    );
  });

  // Generate Link
  generateBtn.addEventListener("click", () => {
    let queryParams = new URLSearchParams();

    if (currentMode === "zip") {
      const zip = document.getElementById("zipcode").value.trim();
      if (!zip) {
        alert("Please enter a zip code");
        return;
      }
      queryParams.append("zip", zip);
    } else {
      const lat = document.getElementById("latitude").value.trim();
      const lng = document.getElementById("longitude").value.trim();
      const tzid = document.getElementById("tzid").value.trim();

      if (!lat || !lng) {
        alert("Please enter latitude and longitude");
        return;
      }
      queryParams.append("lat", lat);
      queryParams.append("lng", lng);
      if (tzid) {
        queryParams.append("tzid", tzid);
      }
    }

    const baseUrl = window.location.origin + "/feed";
    const fullUrl = `${baseUrl}?${queryParams.toString()}`;

    feedUrlInput.value = fullUrl;

    // Setup links
    // WebCal: replace https:// or http:// with webcal://
    const webcalUrl = fullUrl.replace(/^https?:\/\//, "webcal://");
    webcalLink.href = webcalUrl;
    downloadLink.href = fullUrl;

    resultSection.classList.remove("hidden");
  });

  // Copy to Clipboard
  copyBtn.addEventListener("click", () => {
    feedUrlInput.select();
    document.execCommand("copy"); // Fallback

    // Modern API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(feedUrlInput.value);
    }

    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });
});
