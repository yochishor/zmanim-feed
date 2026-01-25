document.addEventListener("DOMContentLoaded", () => {
  const locateBtn = document.getElementById("locate-btn");
  const zipInput = document.getElementById("zipcode");
  const zipBtn = document.getElementById("zip-btn");
  const errorMsg = document.getElementById("error-msg");
  const resultSection = document.getElementById("result");
  const feedUrlInput = document.getElementById("feed-url");
  const copyBtn = document.getElementById("copy-btn");
  const webcalLink = document.getElementById("webcal-link");
  const downloadLink = document.getElementById("download-link");

  // State
  let isLoading = false;

  const setLoading = (loading) => {
    isLoading = loading;
    locateBtn.disabled = loading;
    zipBtn.disabled = loading;
    zipInput.disabled = loading;

    if (loading) {
      errorMsg.classList.add("hidden");
      resultSection.classList.add("hidden");
    }
  };

  const showError = (message) => {
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");
    setLoading(false);
  };

  const generateFeed = (params) => {
    const baseUrl = window.location.origin + "/feed";
    const fullUrl = `${baseUrl}?${params.toString()}`;

    feedUrlInput.value = fullUrl;

    // Setup links
    const webcalUrl = fullUrl.replace(/^https?:\/\//, "webcal://");
    webcalLink.href = webcalUrl;
    downloadLink.href = fullUrl;

    resultSection.classList.remove("hidden");
    setLoading(false);
  };

  // 1. Geolocation Flow
  locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    locateBtn.innerHTML = '<span class="icon">⌛</span> Locating...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        let params = new URLSearchParams({ lat, lng });

        // Try to detect timezone
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz) params.append("tzid", tz);
        } catch (e) {
          // Ignore
        }

        generateFeed(params);
        locateBtn.innerHTML =
          '<span class="icon">📍</span> Use My Current Location';
      },
      (error) => {
        console.error(error);
        showError(
          "Unable to retrieve your location. Please check browser permissions or use Zip Code.",
        );
        locateBtn.innerHTML =
          '<span class="icon">📍</span> Use My Current Location';
      },
    );
  });

  // 2. Zip Code Flow
  const handleZip = () => {
    const zip = zipInput.value.trim();
    if (!zip) {
      showError("Please enter a valid zip code.");
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ zip });
    generateFeed(params);
  };

  zipBtn.addEventListener("click", handleZip);
  zipInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleZip();
  });

  // Copy to Clipboard
  copyBtn.addEventListener("click", () => {
    feedUrlInput.select();
    document.execCommand("copy"); // Fallback

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
