import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Play, 
  Sparkles,
  ChevronDown,
  Check,
  AlertCircle,
  Filter,
  X,
  BarChart3,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SentimentCharts } from "@/components/SentimentCharts";

// API Configuration - Update this to match your backend
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  endpoints: {
    predictSingle: "/predict",
    predictBatch: "/predict-batch",
    saveCorrection: "/corrections",
  },
};

interface ReviewRow {
  reviews: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence_score: number;
  correctedSentiment?: "positive" | "negative" | "neutral";
  hasChanged?: boolean;
  isSaved?: boolean;
}

interface PredictionResponse {
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
}

interface BatchPredictionResponse {
  predictions: PredictionResponse[];
}

// Simple CSV parser
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cur);
        cur = "";
      } else if (ch === "\n") {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else if (ch !== "\r") {
        cur += ch;
      }
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((r) => {
    const o: Record<string, string> = {};
    headers.forEach((h, idx) => {
      o[h] = r[idx] ?? "";
    });
    return o;
  });
}

// API calls to your backend
async function predictBatch(reviews: string[], category: string): Promise<PredictionResponse[]> {
  const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.predictBatch}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviews, category }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data: BatchPredictionResponse = await response.json();
  return data.predictions;
}

async function predictSingle(review: string, category: string): Promise<PredictionResponse> {
  const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.predictSingle}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ review, category }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

async function saveCorrection(review: string, originalSentiment: string, correctedSentiment: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.saveCorrection}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ review, originalSentiment, correctedSentiment }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
}

export function BulkReviewProcessor() {
  const [rawRows, setRawRows] = useState<ReviewRow[]>([]);
  const [processedRows, setProcessedRows] = useState<ReviewRow[]>([]);
  const [status, setStatus] = useState<"idle" | "uploaded" | "processing" | "done">("idle");
  const [error, setError] = useState("");
  const [showOnlyLowConfidence, setShowOnlyLowConfidence] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [absaCategory, setAbsaCategory] = useState("smartphones");
  const [showCharts, setShowCharts] = useState(true);
  const { toast } = useToast();

  const hasUpload = rawRows.length > 0;
  const hasProcessed = processedRows.length > 0;

  const handleDownloadTemplate = () => {
    const csvContent = "reviews,sentiment,confidence_score\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reviews_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const parseFile = useCallback(async (file: File) => {
    setError("");
    setStatus("idle");
    setProcessedRows([]);
    
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      
      if (!parsed.length) {
        throw new Error("File is empty");
      }

      const normalized: ReviewRow[] = parsed.map((r) => ({
        reviews: String(r.reviews ?? ""),
        sentiment: (r.sentiment as any) || "neutral",
        confidence_score: parseFloat(r.confidence_score) || 0,
      }));

      setRawRows(normalized);
      setStatus("uploaded");
      toast({
        title: "File uploaded",
        description: `${normalized.length} reviews ready for processing`,
      });
    } catch (e: any) {
      setError(e.message || "Failed to parse file");
      setRawRows([]);
    }
  }, [toast]);

  const processData = async () => {
    setStatus("processing");
    setError("");

    try {
      const reviews = rawRows.map((r) => r.reviews);
      const predictions = await predictBatch(reviews, absaCategory);

      const out = rawRows.map((r, i) => ({
        ...r,
        sentiment: predictions[i].sentiment,
        confidence_score: Number(predictions[i].confidence.toFixed(2)),
        correctedSentiment: predictions[i].sentiment,
        hasChanged: false,
        isSaved: false,
      }));

      setProcessedRows(out);
      setStatus("done");
      toast({
        title: "Processing complete",
        description: `Analyzed ${out.length} reviews`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to process reviews. Check backend connection.");
      setStatus("uploaded");
    }
  };

  const filteredRows = useMemo(() => {
    if (!hasProcessed) return [];
    if (!showOnlyLowConfidence) return processedRows;
    return processedRows.filter((r) => r.confidence_score < confidenceThreshold);
  }, [hasProcessed, processedRows, showOnlyLowConfidence, confidenceThreshold]);

  const handleCorrectionChange = (index: number, newSentiment: "positive" | "negative" | "neutral") => {
    const actualIndex = processedRows.findIndex((r) => r === filteredRows[index]);
    if (actualIndex === -1) return;
    
    setProcessedRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== actualIndex) return row;
        return {
          ...row,
          correctedSentiment: newSentiment,
          hasChanged: newSentiment !== row.sentiment,
          isSaved: false,
        };
      })
    );
  };

  const handleSaveCorrection = async (index: number) => {
    const actualIndex = processedRows.findIndex((r) => r === filteredRows[index]);
    if (actualIndex === -1) return;
    
    const row = processedRows[actualIndex];
    
    try {
      await saveCorrection(
        row.reviews,
        row.sentiment,
        row.correctedSentiment || row.sentiment
      );
      
      setProcessedRows((prev) =>
        prev.map((r, idx) =>
          idx === actualIndex ? { ...r, hasChanged: false, isSaved: true } : r
        )
      );
      
      toast({
        title: "Correction saved",
        description: "Your feedback helps improve the model",
      });
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err.message || "Could not save correction",
        variant: "destructive",
      });
    }
  };

  const handleDownloadResults = () => {
    const headers = ["reviews", "sentiment", "confidence_score", "corrected_sentiment"];
    const csvRows = [
      headers.join(","),
      ...processedRows.map((r) =>
        [
          `"${r.reviews.replace(/"/g, '""')}"`,
          r.sentiment,
          r.confidence_score,
          r.correctedSentiment || r.sentiment,
        ].join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processed_reviews.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your processed reviews are being downloaded",
    });
  };

  const stats = useMemo(() => {
    if (!hasProcessed) return null;
    const positive = processedRows.filter((r) => r.sentiment === "positive").length;
    const negative = processedRows.filter((r) => r.sentiment === "negative").length;
    const neutral = processedRows.filter((r) => r.sentiment === "neutral").length;
    const lowConfidence = processedRows.filter((r) => r.confidence_score < 0.7).length;
    return { positive, negative, neutral, lowConfidence, total: processedRows.length };
  }, [hasProcessed, processedRows]);

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
            <button onClick={() => setError("")} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">Upload Reviews</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload a CSV file with your reviews for analysis
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Template
          </Button>
        </div>

        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
            </div>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) parseFile(f);
              }}
            />
          </label>

          {hasUpload && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{rawRows.length} reviews loaded</p>
                  <p className="text-xs text-muted-foreground">Ready to process</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={absaCategory} onValueChange={setAbsaCategory}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smartphones">Smartphones</SelectItem>
                    <SelectItem value="laptops">Laptops</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={processData}
                  disabled={status === "processing"}
                  className="gap-2"
                >
                  {status === "processing" ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {hasProcessed && stats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="space-y-6"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Reviews", value: stats.total, color: "text-foreground" },
                { label: "Positive", value: stats.positive, color: "text-positive" },
                { label: "Negative", value: stats.negative, color: "text-destructive" },
                { label: "Low Confidence", value: stats.lowConfidence, color: "text-primary" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4 shadow-soft"
                >
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Toggle & Visualization */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showCharts}
                    onCheckedChange={setShowCharts}
                    id="show-charts"
                  />
                  <Label htmlFor="show-charts" className="text-sm text-muted-foreground">
                    Show charts
                  </Label>
                </div>
              </div>
              
              <AnimatePresence>
                {showCharts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SentimentCharts data={processedRows} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showOnlyLowConfidence}
                  onCheckedChange={setShowOnlyLowConfidence}
                  id="low-confidence"
                />
                <Label htmlFor="low-confidence" className="text-sm">
                  Low confidence only
                </Label>
              </div>
              {showOnlyLowConfidence && (
                <div className="flex items-center gap-3 ml-4">
                  <Label className="text-sm text-muted-foreground">Threshold</Label>
                  <Slider
                    value={[confidenceThreshold]}
                    onValueChange={([v]) => setConfidenceThreshold(v)}
                    min={0.5}
                    max={0.9}
                    step={0.05}
                    className="w-24"
                  />
                  <span className="text-sm font-medium w-12">{Math.round(confidenceThreshold * 100)}%</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleDownloadResults} className="ml-auto gap-2">
                <Download className="h-4 w-4" />
                Export Results
              </Button>
            </div>

            {/* Results Table */}
            <div className="rounded-xl border border-border overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                        Review
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-32">
                        Sentiment
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-28">
                        Confidence
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-40">
                        Correction
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-24">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredRows.slice(0, 20).map((row, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm line-clamp-2">{row.reviews}</p>
                        </td>
                        <td className="px-4 py-3">
                          <SentimentBadge sentiment={row.sentiment} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${row.confidence_score * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10">
                              {Math.round(row.confidence_score * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={row.correctedSentiment || row.sentiment}
                            onValueChange={(v) => handleCorrectionChange(i, v as any)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="positive">Positive</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="negative">Negative</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          {row.isSaved ? (
                            <span className="inline-flex items-center gap-1 text-xs text-positive">
                              <Check className="h-3 w-3" />
                              Saved
                            </span>
                          ) : row.hasChanged ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => handleSaveCorrection(i)}
                            >
                              Save
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > 20 && (
                <div className="px-4 py-3 bg-muted/30 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing 20 of {filteredRows.length} reviews
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
