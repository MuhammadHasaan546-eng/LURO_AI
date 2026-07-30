import { ChartAreaInteractive } from "@/components/dashboard/ChartAreaInteractive";
import Container from "@/components/global/container";
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
} from "lucide-react";
import React from "react";

const Page = () => {
  return (
    <div className="p-4 w-full">
      <div className="flex flex-col w-full gap-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is your performance summary for this month.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total Posts */}
          <Container delay={0.1}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Posts
                </CardTitle>
                <FileText className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">128</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-1">
                  <span className="text-emerald-500 font-medium inline-flex items-center">
                    +18% <ArrowUpRight className="size-3" />
                  </span>{" "}
                  from last month (108)
                </p>
              </CardContent>
            </Card>
          </Container>

          {/* 2. Engagement Rate */}
          <Container delay={0.2}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Engagement Rate
                </CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8%</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-1">
                  <span className="text-emerald-500 font-medium inline-flex items-center">
                    +0.6% <ArrowUpRight className="size-3" />
                  </span>{" "}
                  from last month (4.2%)
                </p>
              </CardContent>
            </Card>
          </Container>

          {/* 3. Active Campaigns */}
          <Container delay={0.3}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Active Campaigns
                </CardTitle>
                <Megaphone className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-1">
                  <span className="text-emerald-500 font-medium inline-flex items-center">
                    +3 <ArrowUpRight className="size-3" />
                  </span>{" "}
                  new from last month
                </p>
              </CardContent>
            </Card>
          </Container>

          {/* 4. Total Impressions / Reach */}
          <Container delay={0.4}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Impressions
                </CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45.2K</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-x-1">
                  <span className="text-emerald-500 font-medium inline-flex items-center">
                    +12.4% <ArrowUpRight className="size-3" />
                  </span>{" "}
                  from last month (40.2K)
                </p>
              </CardContent>
            </Card>
          </Container>
        </div>
        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Container delay={0.5}>
            <ChartAreaInteractive />
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Page;
