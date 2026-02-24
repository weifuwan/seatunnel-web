import React from 'react';
import LineChart from './LineChart';

import BarChart from './BarChart';
import { ChartData } from './types';

interface ChartsContainerProps {
  chartData: ChartData;
  loading: boolean;
}

const ChartsContainer: React.FC<ChartsContainerProps> = ({ chartData, loading }) => {
  const charts = [
    {
      data: chartData.recordsTrend.data,
      xAxisData: chartData.recordsTrend.xAxis,
      title: '同步条数',
      unit: '万',
      type: 'bar' as const,
    },
    {
      data: chartData.bytesTrend.data,
      xAxisData: chartData.bytesTrend.xAxis,
      title: '同步字节数',
      unit: 'M',
      type: 'bar' as const,
    },
    {
      data: chartData.recordsSpeedTrend.data,
      xAxisData: chartData.recordsSpeedTrend.xAxis,
      title: '同步条数速率',
      unit: '条/s',
      type: 'line' as const,
    },
    {
      data: chartData.bytesSpeedTrend.data,
      xAxisData: chartData.bytesSpeedTrend.xAxis,
      title: '同步字节数速率',
      unit: 'M/s',
      type: 'line' as const,
    },
  ];

  const renderChart = (chart: (typeof charts)[0]) => {
    const commonProps = {
      data: chart.data,
      xAxisData: chart.xAxisData,
      title: chart.title,
      unit: chart.unit,
      loading: loading,
    };

    if (chart.type === 'bar') {
      return <BarChart {...commonProps} />;
    } else {
      return <LineChart {...commonProps} />;
    }
  };

  return (
    <div className="di-process-summary-container">
      {charts.map((chart, index) => (
        <div key={index} className="echart-container col-2">
          <div className="dc-loading dc-loading-inline" style={{ width: '100%' }}>
            <div className="dc-loading-wrap" style={{ width: '100%', padding: 16 }}>
              {renderChart(chart)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChartsContainer;
