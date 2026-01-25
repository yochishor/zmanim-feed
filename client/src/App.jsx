import { useState } from "react";
import { Copy, Download, MapPin, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
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
    setDialogOpen(true);
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
          // Ignore timezone detection failure
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback("Copy"), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const webcalUrl = resultUrl.replace(/^https?:\/\//, "webcal://");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans text-foreground">
      <div className="w-full max-w-lg space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Zmanim Feed</h1>
          <p className="text-muted-foreground">
            Generate a custom calendar feed for Jewish Zmanim.
          </p>
        </header>

        <main>
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
                  <div className="flex flex-col items-center justify-center space-y-3 text-center p-4 border rounded-lg bg-muted/50">
                    <MapPin
                      className="h-10 w-10 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-muted-foreground">
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
                        aria-describedby={error ? "error-message" : undefined}
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
                <p className="text-sm text-muted-foreground">
                  Determines when Havdallah is marked on the calendar.
                </p>
              </div>

              {error && (
                <div
                  id="error-message"
                  role="alert"
                  aria-live="polite"
                  className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20"
                >
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <footer className="text-center text-sm text-muted-foreground pb-8">
          <p>Times provided by Hebcal.</p>
        </footer>
      </div>

      {/* Success Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle
                className="h-6 w-6 text-green-600"
                aria-hidden="true"
              />
            </div>
            <DialogTitle className="text-center">
              Your Feed is Ready!
            </DialogTitle>
            <DialogDescription className="text-center">
              Subscribe to your personalized Zmanim calendar feed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex space-x-2">
              <Input
                value={resultUrl}
                readOnly
                aria-label="Generated feed URL"
                className="text-xs"
              />
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copyFeedback === "Copied!" ? (
                  copyFeedback
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" aria-hidden="true" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button asChild className="w-full" variant="default">
              <a href={webcalUrl}>
                <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />{" "}
                Subscribe to Calendar
              </a>
            </Button>
            <Button asChild className="w-full" variant="secondary">
              <a href={resultUrl} download="zmanim.ics">
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />{" "}
                Download .ics File
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
