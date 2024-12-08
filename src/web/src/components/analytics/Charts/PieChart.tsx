/**
 * PieChart component for visualizing proportional analytics data
 * Requirements addressed:
 * - Analytics Dashboard (Technical Specification/User Interface Design/Analytics Dashboard)
 *   Provides a comprehensive dashboard for visualizing analytics data using pie charts.
 * 
 * Human Tasks:
 * 1. Verify chart colors match the latest brand guidelines
 * 2. Review chart accessibility with design team
 * 3. Validate chart responsiveness across different screen sizes
 */

// react v18.2.0
import React, { useEffect, useRef } from 'react';
// react-redux v8.1.2
import { useDispatch } from 'react-redux';

// Internal imports
import { colors, fonts } from '../../../styles/theme';
import { formatAnalyticsData } from '../../../services/analytics.service';
import useAnalytics from '../../../hooks/useAnalytics';
import { applyThemeToText } from '../../../utils/format.util';

/**
 * Interface for pie chart segment data
 */
interface PieChartSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * PieChart component that visualizes proportional analytics data
 * @returns JSX.Element A rendered pie chart component
 */
export const PieChart: React.FC = () => {
  // Initialize canvas ref for chart rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize Redux dispatch
  const dispatch = useDispatch();
  
  // Get analytics data and utilities from custom hook
  const { 
    data: analyticsData,
    loading,
    error,
    fetchAnalytics
  } = useAnalytics();

  /**
   * Draws the pie chart on the canvas
   * @param segments Chart segments to render
   */
  const drawPieChart = (segments: PieChartSegment[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up chart dimensions
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate total value for proportions
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    
    // Draw segments
    let startAngle = 0;
    segments.forEach(segment => {
      const sliceAngle = (2 * Math.PI * segment.value) / total;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      // Apply theme colors
      ctx.fillStyle = segment.color;
      ctx.fill();
      
      // Add segment border
      ctx.strokeStyle = colors.background;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Calculate label position
      const labelAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      // Draw label
      ctx.font = `${fonts.weights.medium} ${fonts.sizes.sm} ${fonts.primary}`;
      ctx.fillStyle = colors.textPrimary;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(segment.label, labelX, labelY);
      
      startAngle += sliceAngle;
    });
  };

  /**
   * Formats analytics data for pie chart visualization
   * @param rawData Raw analytics data
   * @returns Formatted segments for the pie chart
   */
  const formatChartData = (rawData: any): PieChartSegment[] => {
    const formattedData = formatAnalyticsData(rawData);
    
    // Transform formatted data into pie chart segments
    return Object.entries(formattedData).map(([label, value], index) => ({
      label,
      value: typeof value === 'number' ? value : 0,
      color: [
        colors.primary,
        colors.secondary,
        colors.accent,
        colors.primaryLight,
        colors.primaryDark
      ][index % 5]
    }));
  };

  // Fetch analytics data on component mount
  useEffect(() => {
    fetchAnalytics('chart/distribution');
  }, [fetchAnalytics]);

  // Update chart when data changes
  useEffect(() => {
    if (analyticsData && !loading) {
      const chartSegments = formatChartData(analyticsData);
      drawPieChart(chartSegments);
    }
  }, [analyticsData, loading]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Update canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Redraw chart if data exists
      if (analyticsData && !loading) {
        const chartSegments = formatChartData(analyticsData);
        drawPieChart(chartSegments);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size setup

    return () => window.removeEventListener('resize', handleResize);
  }, [analyticsData, loading]);

  // Render loading state
  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center',
        padding: '2rem',
        color: colors.textSecondary
      }}>
        {applyThemeToText('Loading chart data...', 'secondary')}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{ 
        textAlign: 'center',
        padding: '2rem',
        color: colors.error
      }}>
        {applyThemeToText('Error loading chart data', 'secondary')}
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%',
      height: '100%',
      minHeight: '300px',
      position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%'
        }}
        aria-label="Analytics Pie Chart"
        role="img"
      />
    </div>
  );
};