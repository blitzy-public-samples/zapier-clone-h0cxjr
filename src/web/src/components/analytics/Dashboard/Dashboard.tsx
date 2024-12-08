/**
 * Analytics Dashboard Component
 * Requirements addressed:
 * - Analytics Dashboard (Technical Specification/User Interface Design/Analytics Dashboard)
 *   Provides a comprehensive dashboard for visualizing analytics data using various chart types.
 * 
 * Human Tasks:
 * 1. Verify chart layout responsiveness across different screen sizes
 * 2. Review analytics data refresh intervals with product team
 * 3. Validate chart accessibility with screen readers
 * 4. Test dashboard performance with large datasets
 */

// react v18.2.0
import React, { useEffect, useState } from 'react';
// react-redux v8.1.2
import { useSelector, useDispatch } from 'react-redux';

// Internal imports
import { analyticsId, workflow } from '../../../types/analytics.types';
import { fetchAnalyticsData } from '../../../services/analytics.service';
import { LineChart } from '../Charts/LineChart';
import { BarChart } from '../Charts/BarChart';
import { PieChart } from '../Charts/PieChart';
import { DashboardContainer } from './Dashboard.styles';
import { reducer as analyticsReducer, actions } from '../../../store/slices/analyticsSlice';
import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import Table from '../../common/Table/Table';

interface AnalyticsState {
  data: {
    analyticsId: typeof analyticsId;
    workflow: typeof workflow;
  } | null;
  loading: boolean;
  error: string | null;
}

export const Dashboard: React.FC = () => {
  // Initialize Redux
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state: { analytics: AnalyticsState }) => state.analytics);

  // Local state for refresh timestamp
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch analytics data on component mount and set up refresh interval
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAnalyticsData('dashboard');
        dispatch(actions.setAnalyticsData(response));
        setLastRefresh(new Date());
      } catch (error) {
        dispatch(actions.setAnalyticsData(null));
        console.error('Error fetching analytics data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up refresh interval (every 5 minutes)
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);

    // Cleanup on unmount
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      const response = await fetchAnalyticsData('dashboard');
      dispatch(actions.setAnalyticsData(response));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error refreshing analytics data:', error);
    }
  };

  // Table columns configuration
  const tableColumns = [
    { key: 'workflowId', header: 'Workflow ID' },
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
    { 
      key: 'createdBy',
      header: 'Created By',
      formatter: (value: any) => value?.username || 'N/A'
    }
  ];

  // Render loading state
  if (loading) {
    return (
      <DashboardContainer>
        <Card
          body={
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading analytics data...
            </div>
          }
        />
      </DashboardContainer>
    );
  }

  // Render error state
  if (error) {
    return (
      <DashboardContainer>
        <Card
          body={
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
              Error loading analytics data. Please try again.
              <Button
                variant="primary"
                onClick={handleRefresh}
                style={{ marginTop: '1rem' }}
              >
                Retry
              </Button>
            </div>
          }
        />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Header Card */}
      <Card
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h2>Analytics Dashboard</h2>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              leftIcon={<span>🔄</span>}
            >
              Refresh
            </Button>
          </div>
        }
        body={
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            Last updated: {lastRefresh.toLocaleString()}
          </div>
        }
      />

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
        margin: '1rem 0'
      }}>
        {/* Workflow Trends */}
        <Card
          header={<h3>Workflow Trends</h3>}
          body={
            <div style={{ height: '300px' }}>
              <LineChart />
            </div>
          }
        />

        {/* Status Distribution */}
        <Card
          header={<h3>Status Distribution</h3>}
          body={
            <div style={{ height: '300px' }}>
              <PieChart />
            </div>
          }
        />

        {/* Execution Metrics */}
        <Card
          header={<h3>Execution Metrics</h3>}
          body={
            <div style={{ height: '300px' }}>
              <BarChart
                labels={data?.workflow ? ['Successful', 'Failed', 'Pending'] : []}
                data={data?.workflow ? [75, 15, 10] : []}
              />
            </div>
          }
        />
      </div>

      {/* Workflows Table */}
      <Card
        header={<h3>Recent Workflows</h3>}
        body={
          <Table
            data={data?.workflow ? [data.workflow] : []}
            columns={tableColumns}
          />
        }
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button variant="primary">View All Workflows</Button>
          </div>
        }
      />
    </DashboardContainer>
  );
};

export default Dashboard;