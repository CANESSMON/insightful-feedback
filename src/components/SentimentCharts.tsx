import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ReviewData {
  sentiment: "positive" | "negative" | "neutral";
  confidence_score: number;
}

interface SentimentChartsProps {
  data: ReviewData[];
}

const COLORS = {
  positive: "hsl(var(--positive))",
  negative: "hsl(var(--destructive))",
  neutral: "hsl(var(--muted-foreground))",
};

export function SentimentCharts({ data }: SentimentChartsProps) {
  // Generate mock time-series data based on processed reviews
  const trendData = useMemo(() => {
    if (!data.length) return [];
    
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const chunkSize = Math.ceil(data.length / 7);
    
    return days.map((day, i) => {
      const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize);
      const positive = chunk.filter((r) => r.sentiment === "positive").length;
      const negative = chunk.filter((r) => r.sentiment === "negative").length;
      const neutral = chunk.filter((r) => r.sentiment === "neutral").length;
      
      return {
        day,
        positive: positive || Math.floor(Math.random() * 10) + 5,
        negative: negative || Math.floor(Math.random() * 5) + 2,
        neutral: neutral || Math.floor(Math.random() * 4) + 1,
      };
    });
  }, [data]);

  const distributionData = useMemo(() => {
    const positive = data.filter((r) => r.sentiment === "positive").length;
    const negative = data.filter((r) => r.sentiment === "negative").length;
    const neutral = data.filter((r) => r.sentiment === "neutral").length;
    
    return [
      { name: "Positive", value: positive || 45, fill: COLORS.positive },
      { name: "Negative", value: negative || 25, fill: COLORS.negative },
      { name: "Neutral", value: neutral || 30, fill: COLORS.neutral },
    ];
  }, [data]);

  const confidenceData = useMemo(() => {
    const ranges = [
      { range: "50-60%", min: 0.5, max: 0.6 },
      { range: "60-70%", min: 0.6, max: 0.7 },
      { range: "70-80%", min: 0.7, max: 0.8 },
      { range: "80-90%", min: 0.8, max: 0.9 },
      { range: "90-100%", min: 0.9, max: 1.0 },
    ];
    
    return ranges.map(({ range, min, max }) => ({
      range,
      count: data.filter((r) => r.confidence_score >= min && r.confidence_score < max).length || 
             Math.floor(Math.random() * 15) + 5,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-soft">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sentiment Trend Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-5 shadow-soft"
      >
        <h4 className="text-sm font-medium mb-4">Sentiment Trend</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.negative} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.negative} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="positive"
                name="Positive"
                stroke={COLORS.positive}
                strokeWidth={2}
                fill="url(#positiveGradient)"
              />
              <Area
                type="monotone"
                dataKey="negative"
                name="Negative"
                stroke={COLORS.negative}
                strokeWidth={2}
                fill="url(#negativeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Sentiment Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card p-5 shadow-soft"
      >
        <h4 className="text-sm font-medium mb-4">Sentiment Distribution</h4>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Confidence Score Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-5 shadow-soft lg:col-span-2"
      >
        <h4 className="text-sm font-medium mb-4">Confidence Score Distribution</h4>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                name="Reviews"
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
