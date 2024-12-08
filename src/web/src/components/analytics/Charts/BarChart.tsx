/**
 * BarChart component for visualizing categorical data in the analytics dashboard
 * Requirement: Analytics Dashboard - Provides a comprehensive dashboard for visualizing analytics data using various chart types, including bar charts.
 * 
 * Human Tasks:
 * 1. Verify chart accessibility compliance with WCAG 2.1 AA standards
 * 2. Review color contrast ratios for chart elements
 * 3. Test chart responsiveness across different screen sizes
 * 4. Validate chart performance with large datasets
 */

import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // v4.0.1
import { colors, fonts } from '../../../styles/theme';
import { formatApiTimeout } from '../../../utils/format.util';
import { themeConstants } from '../../../constants/theme.constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  /**
   * Labels for the x-axis categories
   */
  labels: string[];
  
  /**
   * Data values for the bars
   */
  data: number[];
  
  /**
   * Title of the chart
   */
  title?: string;
  
  /**
   * Height of the chart in pixels
   */
  height?: number;
  
  /**
   * Whether to show the legend
   */
  showLegend?: boolean;
  
  /**
   * Custom tooltip formatter
   */
  tooltipFormatter?: (value: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  labels,
  data,
  title = 'Analytics Data',
  height = 300,
  showLegend = true,
  tooltipFormatter = (value) => `${value}`
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Configure chart options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top' as const,
          labels: {
            font: {
              family: fonts.primary,
              size: 12,
              weight: fonts.weights.medium
            },
            color: colors.textPrimary
          }
        },
        title: {
          display: !!title,
          text: title,
          font: {
            family: fonts.primary,
            size: 16,
            weight: fonts.weights.semibold
          },
          color: colors.textPrimary,
          padding: 20
        },
        tooltip: {
          enabled: true,
          backgroundColor: colors.surface,
          titleColor: colors.textPrimary,
          bodyColor: colors.textSecondary,
          borderColor: colors.border,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 4,
          titleFont: {
            family: fonts.primary,
            size: 14,
            weight: fonts.weights.semibold
          },
          bodyFont: {
            family: fonts.primary,
            size: 12,
            weight: fonts.weights.normal
          },
          callbacks: {
            label: (context: any) => {
              const value = context.raw;
              return tooltipFormatter ? tooltipFormatter(value) : value;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
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
          beginAtZero: true,
          grid: {
            color: colors.border,
            drawBorder: false
          },
          ticks: {
            font: {
              family: fonts.primary,
              size: 12
            },
            color: colors.textSecondary,
            padding: 8
          }
        }
      }
    };

    // Create chart configuration
    const config = {
      type: 'bar' as const,
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: themeConstants.primaryColor,
          hoverBackgroundColor: colors.primaryLight,
          borderColor: 'transparent',
          borderRadius: 4,
          maxBarThickness: 40,
          minBarLength: 4
        }]
      },
      options
    };

    // Initialize chart
    chartInstance.current = new ChartJS(ctx, config);

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, data, title, height, showLegend, tooltipFormatter]);

  return (
    <div style={{ 
      width: '100%', 
      height, 
      padding: '16px',
      backgroundColor: colors.background,
      borderRadius: '8px',
      border: `1px solid ${colors.border}`
    }}>
      <canvas ref={chartRef} />
    </div>
  );
};