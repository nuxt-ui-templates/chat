import { tool } from 'ai'
import { z } from 'zod'
import type { UIToolInvocation } from 'ai'

export type ChartUIToolInvocation = UIToolInvocation<typeof chartTool>

export const chartTool = tool({
  description: 'Create a chart visualization with one or multiple data series. Use a line or area chart for time-series data and trends, a bar chart to compare values across categories, and a donut chart to show how a total splits into parts. When the user does not provide data, make up realistic sample data instead of asking for it.',
  inputSchema: z.object({
    title: z.string().optional().describe('Title of the chart'),
    type: z.enum(['line', 'area', 'bar', 'donut']).optional().describe('Type of chart, defaults to line. A donut chart only uses the first series, with one slice per data point'),
    data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))).min(1).describe('REQUIRED: Array of data points (minimum 1 point). Each object must contain the xKey property and all series keys'),
    xKey: z.string().describe('The property name in data objects to use for x-axis values (e.g., "month", "date"), or for the slice labels of a donut chart'),
    series: z.array(z.object({
      key: z.string().describe('The property name in data objects for this series (must exist in all data points)'),
      name: z.string().describe('Display name for this series in the legend'),
      color: z.string().describe('Hex color code for this series (e.g., "#3b82f6" for blue, "#10b981" for green)')
    })).min(1).describe('Array of series configurations (minimum 1 series). Each series represents one line, area or set of bars on the chart'),
    xLabel: z.string().optional().describe('Optional label for x-axis'),
    yLabel: z.string().optional().describe('Optional label for y-axis')
  }),
  execute: async ({ title, type, data, xKey, series, xLabel, yLabel }) => {
    // Create a delay to simulate the input-available state
    await new Promise(resolve => setTimeout(resolve, 1500))

    return {
      title,
      type,
      data,
      xKey,
      series,
      xLabel,
      yLabel
    }
  }
})
