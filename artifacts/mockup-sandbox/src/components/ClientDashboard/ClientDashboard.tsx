import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

// Mock data for the client's progress graph
const deadliftData = [
  { week: "Week 1", weight: 315 },
  { week: "Week 2", weight: 325 },
  { week: "Week 3", weight: 335 },
  { week: "Week 4", weight: 350 },
];

const chartConfig = {
  weight: {
    label: "Deadlift (lbs)",
    color: "hsl(var(--primary))",
  },
};

export default function ClientDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">M² Training</h1>
          <p className="text-muted-foreground mt-1">Athlete Portal: Welcome back.</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="text-sm px-4 py-1">Pro Member</Badge>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold hover:opacity-90 transition">
            Message Matt
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today's Protocol */}
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Today's Protocol: Heavy Lower</h2>
              <Badge variant="destructive">Week 4 / Day 2</Badge>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Movement</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Last Week</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Barbell Back Squat</TableCell>
                  <TableCell>4 x 5</TableCell>
                  <TableCell className="text-muted-foreground">315 lbs</TableCell>
                  <TableCell className="text-right">
                    <button className="text-sm font-bold text-blue-500 hover:underline">Log Sets</button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Romanian Deadlift</TableCell>
                  <TableCell>3 x 8</TableCell>
                  <TableCell className="text-muted-foreground">275 lbs</TableCell>
                  <TableCell className="text-right">
                    <button className="text-sm font-bold text-blue-500 hover:underline">Log Sets</button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Bulgarian Split Squat</TableCell>
                  <TableCell>3 x 10 / leg</TableCell>
                  <TableCell className="text-muted-foreground">60 lbs</TableCell>
                  <TableCell className="text-right">
                    <button className="text-sm font-bold text-blue-500 hover:underline">Log Sets</button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          {/* Progress Chart using your Recharts setup */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">1RM Progression: Deadlift</h2>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart data={deadliftData}>
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="weight" fill="var(--color-weight)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </section>
        </div>

        {/* Right Column: Macrocycle & Newsletter */}
        <div className="space-y-8">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Macrocycle Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Hypertrophy Block</span>
                <span className="font-mono text-muted-foreground">80%</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </section>

          <section className="rounded-xl border-2 border-primary bg-primary text-primary-foreground p-6 shadow-lg">
            <h3 className="font-extrabold text-xl mb-2">The Real Deal Newsletter</h3>
            <p className="text-sm opacity-90 mb-4">
              Latest drop: Why your grip strength is ruining your pulls, and exactly how to fix it this week.
            </p>
            <button className="w-full bg-background text-foreground font-bold py-2 rounded border border-transparent hover:border-foreground transition">
              Read Now
            </button>
          </section>
        </div>
        
      </div>
    </div>
  );
}
