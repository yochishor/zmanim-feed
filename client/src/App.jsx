import { useState } from "react";
import { Copy, Download, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [zip, setZip] = useState("");
  const [havdallah, setHavdallah] = useState("50");
  const [activeTab, setActiveTab] = useState("location");
  const [copyFeedback, setCopyFeedback] = useState("Copy");

  const generateFeed = (params) => {
    if (havdallah) {
      params.append("havdallah", havdallah);
    }

    const baseUrl = window.location.origin + "/feed";
    const fullUrl = `${baseUrl}?${params.toString()}`;
    setResultUrl(fullUrl);
    setLoading(false);
  };

  const handleLocate = () => {
    setLoading(true);
    setError("");
    setResultUrl("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        let params = new URLSearchParams({ lat, lng });

        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz) params.append("tzid", tz);
        } catch (e) {
          // Ignore
        }

        generateFeed(params);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location. Please check permissions.");
        setLoading(false);
      },
    );
  };

  const handleZip = () => {
    if (!zip) {
      setError("Please enter a valid zip code.");
      return;
    }
    setLoading(true);
    setError("");
    setResultUrl("");

    const params = new URLSearchParams({ zip });
    generateFeed(params);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultUrl);
    setCopyFeedback("Copied!");
    setTimeout(() => setCopyFeedback("Copy"), 2000);
  };

  const webcalUrl = resultUrl.replace(/^https?:\/\//, "webcal://");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-lg space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Zmanim Feed
          </h1>
          <p className="text-slate-500">
            Generate a custom calendar feed for Jewish Zmanim.
          </p>
        </header>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Choose your location and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs
              defaultValue="location"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="location">Current Location</TabsTrigger>
                <TabsTrigger value="zip">Zip Code</TabsTrigger>
              </TabsList>
              <TabsContent value="location" className="space-y-4 py-4">
                <div className="flex flex-col items-center justify-center space-y-3 text-center p-4 border rounded-lg bg-slate-50/50">
                  <MapPin className="h-10 w-10 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Use your browser's geolocation to find your exact
                    coordinates.
                  </p>
                  <Button
                    onClick={handleLocate}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Locating..." : "Use My Current Location"}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="zip" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="zip"
                      placeholder="e.g. 10001"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleZip()}
                      disabled={loading}
                    />
                    <Button onClick={handleZip} disabled={loading}>
                      Go
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="havdallah">
                Havdallah (minutes after sunset)
              </Label>
              <Input
                id="havdallah"
                type="number"
                min="0"
                value={havdallah}
                onChange={(e) => setHavdallah(e.target.value)}
              />
              <p className="text-[0.8rem] text-slate-500">
                Determines when Havdallah is marked on the calendar.
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {resultUrl && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Your Feed URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input value={resultUrl} readOnly />
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="w-24"
                >
                  {copyFeedback === "Copied!" ? (
                    copyFeedback
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between space-x-2">
              <Button asChild className="flex-1" variant="default">
                <a href={webcalUrl}>
                  <Calendar className="w-4 h-4 mr-2" /> Subscribe
                </a>
              </Button>
              <Button asChild className="flex-1" variant="secondary">
                <a href={resultUrl}>
                  <Download className="w-4 h-4 mr-2" /> Download .ics
                </a>
              </Button>
            </CardFooter>
          </Card>
        )}

        <footer className="text-center text-sm text-slate-400 pb-8">
          <p>Times provided by Hebcal.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
