/**
 * LineChart component for visualizing trends in analytics data
 * Requirements addressed:
 * - Analytics Dashboard (Technical Specification/User Interface Design/Analytics Dashboard)
 *   Provides a comprehensive dashboard for visualizing analytics data using line charts.
 * 
 * Human Tasks:
 * 1. Verify Chart.js version compatibility with React 18
 * 2. Ensure theme colors meet WCAG 2.1 AA contrast requirements
 * 3. Review chart responsiveness on different screen sizes
 */

// react v18.2.0
import React, { useEffect, useRef } from 'react';

// chart.js v4.0.1
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

// Internal imports
import { colors, fonts } from '../../../styles/theme';
import { formatAnalyticsData } from '../../../services/analytics.service';
import useAnalytics from '../../../hooks/useAnalytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  title?: string;
  height?: number;
  width?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  title = 'Analytics Trend',
  height = 300,
  width = 600
}) => {
  // Get analytics data using the custom hook
  const { data, loading, error, refreshAnalytics } = useAnalytics();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // Chart configuration options
  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: fonts.primary,
            size: 12,
            weight: '500'
          },
          color: colors.textPrimary
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          family: fonts.primary,
          size: 16,
          weight: '600'
        },
        color: colors.textPrimary,
        padding: 20
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: colors.surface,
        titleColor: colors.textPrimary,
        bodyColor: colors.textSecondary,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 12,
        titleFont: {
          family: fonts.primary,
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: fonts.primary,
          size: 12,
          weight: '400'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: colors.border,
          drawBorder: false
        },
        ticks: {
          font: {
            family: fonts.primary,
            size: 12
          },
          color: colors.textSecondary
        }
      },
      y: {
        grid: {
          color: colors.border,
          drawBorder: false
        },
        ticks: {
          font: {
            family: fonts.primary,
            size: 12
          },
          color: colors.textSecondary
        },
        beginAtZero: true
      }
    }
  };

  useEffect(() => {
    if (!data || !chartRef.current) return;

    // Format the analytics data for the chart
    const formattedData = formatAnalyticsData(data);
    
    // Prepare chart data
    const chartData: ChartData = {
      labels: formattedData.labels,
      datasets: [
        {
          label: 'Executions',
          data: formattedData.values,
          borderColor: colors.primary,
          backgroundColor: colors.primaryLight,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: colors.background,
          pointBorderColor: colors.primary,
          pointHoverBackgroundColor: colors.primary,
          pointHoverBorderColor: colors.background
        }
      ]
    };

    // Destroy existing chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new ChartJS(ctx, {
        type: 'line',
        data: chartData,
        options
      });
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, title]);

  // Handle loading state
  if (loading) {
    return (
      <div
        style={{
          height,
          width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts.primary,
          color: colors.textSecondary
        }}
      >
        Loading chart data...
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div
        style={{
          height,
          width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts.primary,
          color: colors.error
        }}
      >
        Error loading chart data. Please try again.
      </div>
    );
  }

  return (
    <div style={{ height, width }}>
      <canvas ref={chartRef} />
    </div>
  );
};