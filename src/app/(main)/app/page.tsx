"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ChartAreaInteractive,
  dashboardData,
  type DashboardRecord,
  type TimeRange,
} from "@/components/dashboard/ChartAreaInteractive";
import Container from "@/components/global/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  Megaphone,
  Users,
  ArrowUpRight,
  Download,
  Layers,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const parseDate = (date: string) => new Date(`${date}T00:00:00Z`);

const getRangeStart = (range: TimeRange, referenceDate: Date) => {
  if (range === "1y") {
    return new Date(Date.UTC(referenceDate.getUTCFullYear(), 0, 1));
  }

  const rangeDays = { "7d": 7, "30d": 30, "90d": 90 }[range];
  return new Date(referenceDate.getTime() - (rangeDays - 1) * MS_PER_DAY);
};

const aggregateRecords = (records: DashboardRecord[]) =>
  records.reduce(
    (totals, record) => {
      const visitors = record.desktop + record.mobile;
      const day = parseDate(record.date).getUTCDate();

      totals.posts += 1 + (day % 3);
      totals.impressions += visitors;
      totals.engagements += Math.round(visitors * (0.038 + (day % 5) * 0.003));
      totals.campaigns += visitors >= 800 ? 1 : 0;
      totals.revenue += visitors * (1.15 + (day % 4) * 0.08);
      totals.conversions += Math.round(visitors * (0.025 + (day % 3) * 0.004));
      totals.activeUsers += Math.round(visitors * 0.36);
      return totals;
    },
    {
      posts: 0,
      impressions: 0,
      engagements: 0,
      campaigns: 0,
      revenue: 0,
      conversions: 0,
      activeUsers: 0,
    },
  );

const percentChange = (current: number, previous: number) =>
  previous === 0 ? 0 : ((current - previous) / previous) * 100;

const formatChange = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;
const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const Page = () => {
  const [timeRange, updateTimeRange] = useState<TimeRange>("90d");
  const setTimeRange = useCallback(
    (value: string) => updateTimeRange(value as TimeRange),
    [],
  );

  const { filteredData, metrics, changes } = useMemo(() => {
    const referenceDate = parseDate(dashboardData.at(-1)?.date ?? "2024-06-30");
    const startDate = getRangeStart(timeRange, referenceDate);
    const data = dashboardData.filter((record) => {
      const date = parseDate(record.date);
      return date >= startDate && date <= referenceDate;
    });
    const midpoint = Math.floor(data.length / 2);
    const previousRecords = data.slice(0, midpoint);
    const currentRecords = data.slice(midpoint);
    const totals = aggregateRecords(data);
    const previous = aggregateRecords(previousRecords);
    const current = aggregateRecords(currentRecords);
    const previousEngagement = previous.impressions
      ? (previous.engagements / previous.impressions) * 100
      : 0;
    const currentEngagement = current.impressions
      ? (current.engagements / current.impressions) * 100
      : 0;
    const normalize = (value: number, recordCount: number) =>
      recordCount ? value / recordCount : 0;

    return {
      filteredData: data,
      metrics: {
        ...totals,
        engagementRate: totals.impressions
          ? (totals.engagements / totals.impressions) * 100
          : 0,
        conversionRate: totals.impressions
          ? (totals.conversions / totals.impressions) * 100
          : 0,
      },
      changes: {
        posts: percentChange(
          normalize(current.posts, currentRecords.length),
          normalize(previous.posts, previousRecords.length),
        ),
        engagement: currentEngagement - previousEngagement,
        impressions: percentChange(
          normalize(current.impressions, currentRecords.length),
          normalize(previous.impressions, previousRecords.length),
        ),
      },
    };
  }, [timeRange]);

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col w-full gap-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is your performance summary for this month.
          </p>
        </div>

        {/* Metric Cards Top Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total Posts */}
          <Container delay={0.1}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Posts
                </CardTitle>
                <FileText className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.posts}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-1">
                  <span className="text-emerald-500 font-medium inline-flex items-center">
                    {formatChange(changes.posts)}{" "}
                    <ArrowUpRight className="size-3" />
                  </span>{" "}
                  vs. the first half
                </p>
              </CardContent>
            </Card>
          </Container>

          {/* 2. Engagement Rate */}
          <Container delay={0.2}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Engagement Rate
                </CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(metrics.engagementRate)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-1">
                  <span className="text-emerald-500 font-medium inline-flex items-center">
                    {formatChange(changes.engagement)}{" "}
                    <ArrowUpRight className="size-3" />
                  </span>{" "}
                  vs. the first half
                </p>
              </CardContent>
            </Card>
          </Container>

          {/* 3. Active Campaigns */}
          <Container delay={0.3}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Active Campaigns
                </CardTitle>
                <Megaphone className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.campaigns}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-1">
                  <span className="text-emerald-500 font-medium inline-flex items-center">
                    {metrics.campaigns} <ArrowUpRight className="size-3" />
                  </span>{" "}
                  launched in selected period
                </p>
              </CardContent>
            </Card>
          </Container>

          {/* 4. Total Impressions / Reach */}
          <Container delay={0.4}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Impressions
                </CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCompact(metrics.impressions)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-1">
                  <span className="text-emerald-500 font-medium inline-flex items-center">
                    {formatChange(changes.impressions)}{" "}
                    <ArrowUpRight className="size-3" />
                  </span>{" "}
                  vs. the first half
                </p>
              </CardContent>
            </Card>
          </Container>
        </div>

        {/* Full-Width Interactive Chart Section */}
        <div className="w-full">
          <Container delay={0.5} className="w-full">
            <Card className="w-full relative overflow-hidden border-border/60 bg-gradient-to-b from-card via-card to-card/50 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-x-2">
                    <CardTitle className="text-base sm:text-lg font-semibold tracking-tight flex items-center gap-2">
                      <Layers className="size-4 text-primary" />
                      Analytics Overview
                    </CardTitle>
                    <span className="inline-flex items-center gap-x-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                      <TrendingUp className="size-3" />
                      {formatChange(changes.impressions)}
                    </span>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                    Revenue and engagement trends over time
                  </CardDescription>
                </div>

                {/* Header Actions: Date Picker Dropdown + Download */}
                <div className="flex items-center gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                      className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                      aria-label="Select a time range"
                    >
                      <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="1y" className="rounded-lg">
                        This Year
                      </SelectItem>
                      <SelectItem value="90d" className="rounded-lg">
                        Last 3 months
                      </SelectItem>
                      <SelectItem value="30d" className="rounded-lg">
                        Last 30 days
                      </SelectItem>
                      <SelectItem value="7d" className="rounded-lg">
                        Last 7 days
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground border border-border/40"
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Dynamic Metrics Summary Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-muted/20 border border-border/40">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Total Revenue
                    </p>
                    <p className="text-xl font-bold tracking-tight mt-0.5">
                      {formatCurrency(metrics.revenue)}
                    </p>
                  </div>
                  <div className="border-l border-border/40 pl-4">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Avg. Engagement
                    </p>
                    <p className="text-xl font-bold tracking-tight mt-0.5">
                      {formatPercent(metrics.engagementRate)}
                    </p>
                  </div>
                  <div className="border-l border-border/40 pl-4 hidden md:block">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Conversion Rate
                    </p>
                    <p className="text-xl font-bold tracking-tight mt-0.5">
                      {formatPercent(metrics.conversionRate)}
                    </p>
                  </div>
                  <div className="border-l border-border/40 pl-4 hidden md:block">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Active Users
                    </p>
                    <p className="text-xl font-bold tracking-tight mt-0.5">
                      {metrics.activeUsers.toLocaleString("en-US")}
                    </p>
                  </div>
                </div>

                {/* Interactive Chart Container */}
                <div className="w-full min-h-[350px]">
                  <ChartAreaInteractive data={filteredData} />
                </div>
              </CardContent>
            </Card>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Page;
