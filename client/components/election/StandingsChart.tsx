"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Candidate {
  candidate_id: number;
  marka_name: string;
  slogan: string;
  logo_url: string;
  committeepostid: number;
  candidate_name: string;
  regno: string;
  session: string;
  vote_count: string;
  post_name: string;
}

interface Grouped_data {
  post_name: string;
  committeepostid: number;
  candidates: Candidate[];
}

const chartConfig = {
  votes: {
    label: "Votes",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function StandingsChart({
  Grouped_data,
}: {
  Grouped_data: Grouped_data;
}) {
  // Prepare chart data
  const chartData = Grouped_data.candidates.map((c) => ({
    name: c.candidate_name,
    marka_name: c.marka_name,
    votes: parseInt(c.vote_count),
    logo: c.logo_url,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
        <CardDescription className="font-bold text-white">
          Total Candidates: {Grouped_data.candidates.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="min-h-56 max-h-96" config={chartConfig}>
          <BarChart
            data={chartData}
            margin={{ top: 20, bottom: 30 }}
            barSize={50}
            barCategoryGap={20}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
              tick={({ x, y, payload }) => {
                const lines = payload.value.split(" ");
                return (
                  <g transform={`translate(${x},${y + 10})`}>
                    {lines.map((line: string, index: number) => (
                      <text
                        key={index}
                        x={0}
                        y={index * 12}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                );
              }}
            />

            <YAxis allowDecimals={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="votes" fill="var(--color-votes)" radius={8}>
              <LabelList
                dataKey="votes"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing live vote count <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Candidates for post: {Grouped_data.post_name}
        </div>
      </CardFooter> */}
    </Card>
  );
}
