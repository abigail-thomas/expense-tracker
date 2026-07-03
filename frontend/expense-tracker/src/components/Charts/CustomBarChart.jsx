import React, { useEffect, useState } from "react";
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
  // On mobile, show only the category icon (labels overlap when space is tight).
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Alternate bar colors for visual variety
  const getBarColor = (index) => (index % 2 === 0 ? "#875cf5" : "#cfbefb");

  // X-axis tick that renders the category's icon (if any) before its label.
  // On mobile it's icon-only when an icon exists; otherwise (e.g. month labels)
  // it shows a shortened label in a narrow box so the ticks don't overlap. On
  // desktop the box is wide enough for the full label. In every case the box is
  // centered on the tick's `x`.
  const renderTick = ({ x, y, payload, index }) => {
    const Icon = getIconOption(data[index]?.icon)?.Icon;
    const iconOnly = isMobile && Icon;
    // On mobile without an icon, drop the year ("Feb 2026" -> "Feb") to fit.
    const label =
      isMobile && !Icon ? String(payload.value).split(" ")[0] : payload.value;
    const width = iconOnly ? 24 : isMobile ? 48 : 120;
    return (
      <foreignObject x={x - width / 2} y={y + 4} width={width} height={20} overflow="visible">
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            fontSize: 12,
            color: "#555",
            whiteSpace: "nowrap",
          }}
        >
          {Icon && <Icon size={isMobile ? 16 : 14} style={{ flexShrink: 0 }} />}
          {!iconOnly && <span>{label}</span>}
        </div>
      </foreignObject>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />
          <XAxis dataKey={xKey} tick={renderTick} stroke="none" interval={0} />
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
