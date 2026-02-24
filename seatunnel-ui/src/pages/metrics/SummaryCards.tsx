import React from 'react';
import { SummaryData } from './types';

interface SummaryCardsProps {
  summaryData: SummaryData;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summaryData }) => {
  const cards = [
    { title: '同步总数', value: summaryData.totalRecords, unit: '万条' },
    { title: '同步总量', value: summaryData.totalBytes, unit: 'MB' },
    { title: '运行总量', value: summaryData.totalTasks, unit: '次' },
    { title: '运行成功', value: summaryData.successTasks, unit: '次' },
  ];

  return (
    <div
      style={{
        margin: '16px 16px 0 16px',
        padding: 12,
        background: 'white',
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'nowrap',
          width: '100%',
        }}
      >
        {cards.map((item, index) => (
          <div key={index} style={{ flex: '1', width: '100%' }}>
            <div className="css-1qqgizd">
              <div className="title">{item.title}</div>
              <div className="big-number">{item.value || 0}</div>
              <div>
                <div className="small-number">单位：{item.unit}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;