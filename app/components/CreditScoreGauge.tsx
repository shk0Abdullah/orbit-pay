import Colors from "@/app/constants/Colors";
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

interface Props {
  score?: number | string | null;
  size?: number;
  strokeWidth?: number;
}

export default function CreditScoreGauge({
  score,
  size = 240,
  strokeWidth = 20,
}: Props) {

  // ---------- SAFE SCORE ----------
  const raw = typeof score === "string" ? parseFloat(score) : Number(score);
  const safeScore =
    isFinite(raw) && !isNaN(raw)
      ? Math.min(850, Math.max(300, raw))
      : 300;

  const min = 300;
  const max = 850;
  const percent = (safeScore - min) / (max - min);

  // ---------- GEOMETRY ----------
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2 - 10;

  const startAngle = -180;
  const endAngle = 0;
  const angle = startAngle + percent * 180;

  const toRad = (a: number) => (a * Math.PI) / 180;

  const polar = (a: number) => ({
    x: cx + radius * Math.cos(toRad(a)),
    y: cy + radius * Math.sin(toRad(a)),
  });

  const arc = (s: number, e: number) => {
    const p1 = polar(s);
    const p2 = polar(e);
    return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}`;
  };

  // ---------- COLORS ----------
  const getColor = (s: number) => {
    if (s < 580) return "#EF4444";
    if (s < 670) return "#F59E0B";
    if (s < 740) return "#EAB308";
    if (s < 800) return "#10B981";
    return "#059669";
  };

  const getLabel = (s: number) => {
    if (s < 580) return "Poor";
    if (s < 670) return "Fair";
    if (s < 740) return "Good";
    if (s < 800) return "Very Good";
    return "Excellent";
  };

  const color = getColor(safeScore);
  const label = getLabel(safeScore);

  const needle = polar(angle);
  // Fixed viewBox to show the full gauge including top text
  const visibleHeight = Math.round(size / 2 + 50);

  return (
    <View className="items-center justify-center my-8">
      <Svg
        width={size}
        height={visibleHeight}
        viewBox={`0 0 ${size} ${cy + 50}`}
      >

          {/* Background Arc */}
          <Path
            d={arc(startAngle, endAngle)}
            stroke="#3A3A68"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          {/* Progress Arc */}
          <Path
            d={arc(startAngle, angle)}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          {/* Needle Line */}
          <Line
            x1={cx}
            y1={cy}
            x2={needle.x}
            y2={needle.y}
            stroke={color}
            strokeWidth={4}
          />

          {/* Needle Center */}
          <Circle cx={cx} cy={cy} r={7} fill={color} />

          {/* Score */}
          <SvgText
            x={cx}
            y={cy - 15}
            fontSize="44"
            fontWeight="bold"
            fill={Colors.portfolio.textPrimary}
            textAnchor="middle"
          >
            {Math.round(safeScore)}
          </SvgText>

          {/* Label */}
          <SvgText
            x={cx}
            y={cy + 20}
            fontSize="16"
            fill={color}
            textAnchor="middle"
            fontWeight="600"
          >
            {label}
          </SvgText>

      </Svg>

      {/* Min / Max */}
      <View className="flex-row justify-between w-full px-6 mt-2">
        <Text className="text-[#C4DBF7] text-xs">300</Text>
        <Text className="text-[#C4DBF7] text-xs">850</Text>
      </View>
    </View>
  );
}