"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { motion } from "framer-motion";

import { useLiveDataStore } from "@/lib/realtime/live-data-store";

const axisText = "#738096";
const gridLine = "#E4E9E1";

function chartShell(title: string, subtitle: string, option: EChartsOption) {
  return (
    <motion.section
      className="rounded-xl border border-[#E4E9E1] bg-white p-5 shadow-xs"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <h3 className="font-display text-base font-semibold tracking-tight text-[#1F2937]">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-[#586579]">{subtitle}</p>
      <ReactECharts
        lazyUpdate
        notMerge
        option={option}
        opts={{ renderer: "canvas" }}
        style={{ height: 280, marginTop: 18, width: "100%" }}
      />
    </motion.section>
  );
}

export function LiveOperationsCharts() {
  const history = useLiveDataStore((state) => state.chartHistory);
  const resources = useLiveDataStore((state) => state.resources);
  const labels = history.map((point) => point.time);

  const trendOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 700,
      color: ["#7DD3FC", "#8B5CF6", "#22C55E"],
      grid: { bottom: 28, left: 34, right: 20, top: 28 },
      legend: {
        bottom: 0,
        icon: "roundRect",
        itemHeight: 8,
        itemWidth: 18,
        textStyle: { color: axisText },
      },
      tooltip: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E4E9E1",
        textStyle: { color: "#1F2937" },
        trigger: "axis",
      },
      xAxis: {
        axisLabel: { color: axisText },
        axisLine: { lineStyle: { color: gridLine } },
        axisTick: { show: false },
        data: labels,
        type: "category",
      },
      yAxis: {
        axisLabel: { color: axisText },
        axisLine: { lineStyle: { color: gridLine } },
        splitLine: { lineStyle: { color: gridLine } },
        type: "value",
      },
      series: [
        { areaStyle: { color: "rgba(125,211,252,0.13)" }, data: history.map((point) => point.threat), lineStyle: { width: 3 }, name: "Threat", showSymbol: false, smooth: true, type: "line" },
        { data: history.map((point) => point.readiness), lineStyle: { width: 3 }, name: "Readiness", showSymbol: false, smooth: true, type: "line" },
        { data: history.map((point) => point.aiConfidence), lineStyle: { width: 3 }, name: "AI confidence", showSymbol: false, smooth: true, type: "line" },
      ],
    }),
    [history, labels],
  );

  const resourceOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 700,
      color: ["#7DD3FC", "#8B5CF6"],
      grid: { bottom: 42, left: 34, right: 20, top: 24 },
      legend: {
        bottom: 0,
        icon: "roundRect",
        itemHeight: 8,
        itemWidth: 18,
        textStyle: { color: axisText },
      },
      tooltip: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E4E9E1",
        textStyle: { color: "#1F2937" },
        trigger: "axis",
      },
      xAxis: {
        axisLabel: { color: axisText },
        axisLine: { lineStyle: { color: gridLine } },
        axisTick: { show: false },
        data: resources.map((resource) => resource.label),
        type: "category",
      },
      yAxis: {
        axisLabel: { color: axisText },
        axisLine: { lineStyle: { color: gridLine } },
        splitLine: { lineStyle: { color: gridLine } },
        type: "value",
      },
      series: [
        { barMaxWidth: 18, data: resources.map((resource) => resource.deployed), itemStyle: { borderRadius: [10, 10, 3, 3] }, name: "Deployed", type: "bar" },
        { barMaxWidth: 18, data: resources.map((resource) => resource.available), itemStyle: { borderRadius: [10, 10, 3, 3] }, name: "Available", type: "bar" },
      ],
    }),
    [resources],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {chartShell("Live threat, readiness, and confidence", "Streaming command history from the shared Sentra live-data engine.", trendOption)}
      {chartShell("Resource deployment pressure", "Responder availability, reserve depth, and deployment load by asset class.", resourceOption)}
    </div>
  );
}
