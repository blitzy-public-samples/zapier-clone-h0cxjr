/**
 * @fileoverview Performance page component for the Analytics section
 * Requirements addressed:
 * - Analytics Platform (Technical Specification/System Overview/High-Level Description)
 *   Provides comprehensive monitoring and optimization tools for workflows and system performance.
 */

// Human Tasks:
// 1. Verify analytics data refresh intervals align with business requirements
// 2. Review chart layout and responsiveness on different screen sizes
// 3. Validate accessibility compliance for all chart components
// 4. Confirm performance metrics thresholds with stakeholders

// react v18.2.0
import React, { useEffect } from 'react';
// react-redux v8.1.2
import { useSelector, useDispatch } from 'react-redux';

// Internal imports
import useAnalytics from '../../hooks/useAnalytics';
import { LineChart } from '../../components/analytics/Charts/LineChart';
import { BarChart } from '../../components/analytics/Charts/BarChart';
import { PieChart } from '../../components/analytics/Charts/PieChart';
import { analyticsSlice } from '../../store/slices/analyticsSlice';

// Theme and styling
import { colors, fonts, spacing } from '../../styles/theme';

/**
 * Performance page component that displays various analytics visualizations
 * @returns JSX.Element The rendered Performance page
 */
const PerformancePage: React.FC = () => {
  // Initialize hooks
  const dispatch = useDispatch();
  const { data, loading, error, fetchAnalytics, refreshAnalytics } = useAnalytics();

  // Access analytics state from Redux store
  const analyticsState = useSelector((state: any) => state.analytics);

  // Fetch analytics data on component mount
  useEffect(() => {
    fetchAnalytics('performance');

    // Set up periodic refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      refreshAnalytics('performance');
    }, 300000);

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [fetchAnalytics, refreshAnalytics]);

  // Prepare data for charts
  const prepareChartData = () => {
    if (!data) return null;

    return {
      executionTrends: {
        labels: data.workflow?.executionHistory?.map((entry: any) => entry.timestamp) || [],
        values: data.workflow?.executionHistory?.map((entry: any) => entry.count) || []
      },
      resourceUtilization: {
        labels: ['CPU', 'Memory', 'Network', 'Storage'],
        values: [
          data.execution?.resources?.cpu || 0,
          data.execution?.resources?.memory || 0,
          data.execution?.resources?.network || 0,
          data.execution?.resources?.storage || 0
        ]
      }
    };
  };

  const chartData = prepareChartData();

  // Handle loading state
  if (loading) {
    return (
      <div style={{
        padding: spacing.xl,
        textAlign: 'center',
        color: colors.textSecondary,
        fontFamily: fonts.primary
      }}>
        Loading performance analytics...
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div style={{
        padding: spacing.xl,
        textAlign: 'center',
        color: colors.error,
        fontFamily: fonts.primary
      }}>
        Error loading performance analytics: {error}
      </div>
    );
  }

  return (
    <div style={{
      padding: spacing.xl,
      backgroundColor: colors.background
    }}>
      {/* Page Header */}
      <h1 style={{
        fontFamily: fonts.primary,
        fontSize: fonts.sizes['2xl'],
        fontWeight: fonts.weights.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.lg
      }}>
        Performance Analytics
      </h1>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: spacing.lg,
        marginBottom: spacing.xl
      }}>
        {/* Execution Trends */}
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '8px',
          padding: spacing.lg,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <LineChart
            title="Workflow Execution Trends"
            height={300}
            width={600}
          />
        </div>

        {/* Resource Utilization */}
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '8px',
          padding: spacing.lg,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {chartData && (
            <BarChart
              title="Resource Utilization"
              labels={chartData.resourceUtilization.labels}
              data={chartData.resourceUtilization.values}
              height={300}
              tooltipFormatter={(value) => `${value}%`}
            />
          )}
        </div>

        {/* Distribution Analysis */}
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '8px',
          padding: spacing.lg,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <PieChart />
        </div>
      </div>

      {/* Performance Metrics Summary */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '8px',
        padding: spacing.lg,
        marginTop: spacing.xl
      }}>
        <h2 style={{
          fontFamily: fonts.primary,
          fontSize: fonts.sizes.xl,
          fontWeight: fonts.weights.semibold,
          color: colors.textPrimary,
          marginBottom: spacing.md
        }}>
          Performance Metrics
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing.md
        }}>
          {data?.execution?.metrics && (
            <>
              <MetricCard
                label="Success Rate"
                value={`${data.execution.metrics.successRate}%`}
                trend="up"
              />
              <MetricCard
                label="Average Response Time"
                value={`${data.execution.metrics.averageResponseTime}ms`}
                trend="down"
              />
              <MetricCard
                label="Total Executions"
                value={data.execution.metrics.totalExecutions}
                trend="up"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper component for displaying individual metrics
 */
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  trend: 'up' | 'down';
}> = ({ label, value, trend }) => (
  <div style={{
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: '4px',
    border: `1px solid ${colors.border}`
  }}>
    <div style={{
      fontSize: fonts.sizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs
    }}>
      {label}
    </div>
    <div style={{
      fontSize: fonts.sizes.xl,
      fontWeight: fonts.weights.semibold,
      color: colors.textPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs
    }}>
      {value}
      <span style={{
        color: trend === 'up' ? colors.success : colors.error,
        fontSize: fonts.sizes.sm
      }}>
        {trend === 'up' ? '↑' : '↓'}
      </span>
    </div>
  </div>
);

export default PerformancePage;