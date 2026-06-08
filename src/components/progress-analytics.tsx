"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { getTasksByProjectId, getProjectAnalytics } from "@/lib/data";

const BURNDOWN_DAYS = 14;

const STATUS_COLORS: Record<string, string> = {
  planned: "#F59E0B",
  in_progress: "#4F7CFF",
  done: "#10B981",
};

interface ProgressAnalyticsProps {
  projectId: string;
}

export default function ProgressAnalytics({ projectId }: ProgressAnalyticsProps) {
  const analytics = useMemo(() => getProjectAnalytics(projectId), [projectId]);
  const tasks = useMemo(() => getTasksByProjectId(projectId), [projectId]);

  // Generate burndown data
  const burndownData = useMemo(() => {
    const totalTasks = analytics.total;
    const doneTasks = analytics.done;
    const remainingTasks = totalTasks - doneTasks;

    // Simulate an actual burndown curve
    // Evenly distribute the remaining undone tasks across the 14 days
    // so the actual line starts at total and curves toward remaining
    return Array.from({ length: BURNDOWN_DAYS }, (_, i) => {
      const day = i + 1;
      // Ideal burndown: straight line from total to 0
      const idealRemaining = Math.max(0, totalTasks - (totalTasks / BURNDOWN_DAYS) * day);

      // Actual burndown: simulated from mock data
      // Day 1 has almost all tasks remaining, linearly trending toward actual remaining count
      const progressDay = day / BURNDOWN_DAYS;
      const actualRemaining = Math.round(
        remainingTasks + (totalTasks - remainingTasks) * (1 - Math.min(progressDay * 1.3, 1))
      );

      return {
        day: `Day ${day}`,
        ideal: Math.round(idealRemaining * 10) / 10,
        actual: Math.max(0, actualRemaining),
      };
    });
  }, [analytics]);

  // Task distribution data for bar chart
  const barData = useMemo(
    () => [
      { name: "Planned", count: analytics.planned, fill: STATUS_COLORS.planned },
      { name: "In Progress", count: analytics.inProgress, fill: STATUS_COLORS.in_progress },
      { name: "Done", count: analytics.done, fill: STATUS_COLORS.done },
    ],
    [analytics]
  );

  // Pie chart data
  const pieData = useMemo(
    () => [
      { name: "Planned", value: analytics.planned, fill: STATUS_COLORS.planned },
      { name: "In Progress", value: analytics.inProgress, fill: STATUS_COLORS.in_progress },
      { name: "Done", value: analytics.done, fill: STATUS_COLORS.done },
    ],
    [analytics]
  );

  return (
    <div className="space-y-4">
      {/* A. Sprint Burndown */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-text mb-4">
          Sprint Burndown
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={burndownData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="line"
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            />
            <Line
              type="monotone"
              dataKey="ideal"
              name="Ideal Burndown"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#4F7CFF"
              strokeWidth={2}
              dot={{ r: 3, fill: "#4F7CFF", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#4F7CFF" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* B. Task Breakdown */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-text mb-4">
          Task Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Horizontal Bar Chart */}
          <div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#374151" }}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value, name) => {
                    return [`${value} tasks`, name];
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 5 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* C. Velocity & Stats Cards */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-text mb-4">
          Velocity &amp; Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-text">{analytics.total}</span>
            <span className="text-xs text-muted mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Total Tasks
            </span>
          </div>

          {/* Completed */}
          <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-green">
              {analytics.done}
            </span>
            <span className="text-xs text-green/70 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completed
            </span>
            {analytics.total > 0 && (
              <span className="text-[10px] text-green/50 mt-0.5 font-medium">
                {Math.round((analytics.done / analytics.total) * 100)}%
              </span>
            )}
          </div>

          {/* In Progress */}
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-accent">
              {analytics.inProgress}
            </span>
            <span className="text-xs text-accent/70 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              In Progress
            </span>
          </div>

          {/* Avg. Progress */}
          <div className="bg-amber-50 rounded-lg p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-amber-600">
              {analytics.avgProgress}%
            </span>
            <span className="text-xs text-amber-600/70 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Avg. Progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
