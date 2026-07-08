import { memo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TrendChartProps {
  data: Array<{ day: string; [key: string]: string | number }>;
  dataKey: string;
  title: string;
  color: string;
  chartId: string;
}

export const TrendChart = memo(function TrendChart({ data, dataKey, title, color, chartId }: TrendChartProps) {
  return (
    <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-4 md:p-6">
      <h3 className="text-white mb-3 md:mb-4 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={160} className="md:!h-[200px]">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} id={chartId}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2533" />
          <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e2533",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 4 }}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
