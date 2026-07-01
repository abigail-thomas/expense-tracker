import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import { getIconOption } from "../../utils/transactionIcons";

// Bar chart used on the Income page. `xKey` selects which field labels the X axis.
const CustomBarChart = ({ data, xKey = "month" }) => {
  // Alternate bar colors for visual variety
  const getBarColor = (index) => (index % 2 === 0 ? "#875cf5" : "#cfbefb");

  // X-axis tick that renders the category's icon (if any) before its label.
  const renderTick = ({ x, y, payload, index }) => {
    const Icon = getIconOption(data[index]?.icon)?.Icon;
    return (
      <foreignObject x={x - 80} y={y + 4} width={160} height={20} overflow="visible">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            fontSize: 12,
            color: "#555",
            whiteSpace: "nowrap",
          }}
        >
          {Icon && <Icon size={14} style={{ flexShrink: 0 }} />}
          <span>{payload.value}</span>
        </div>
      </foreignObject>
    );
  };

  return (
    <div className="bg-white mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />
          <XAxis dataKey={xKey} tick={renderTick} stroke="none" />
          <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
