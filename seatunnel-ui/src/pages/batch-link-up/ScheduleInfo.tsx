import { message, Popover } from 'antd';
import { useState } from 'react';
import { taskScheduleApi } from './type';

interface ExecutionStatusProps {
  record: any;
}

const ScheduleInfo: React.FC<ExecutionStatusProps> = ({ record }) => {
  const renderStatus = (status: string) => {
    if (status === 'ACTIVE') {
      return <span style={{ color: 'green' }}>{status}</span>;
    } else {
      return <span style={{ color: 'red' }}>{status}</span>;
    }
  };
  const [cronExpression, setCronExpression] = useState<any[]>([]);
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 58, fontWeight: 700 }}>Cron: </span>
        <Popover
          content={
            <div>
              {cronExpression.map((item, index) => (
                <div key={index}>{item}</div> // 每个数字换行展示
              ))}
            </div>
          }
          title="未来最近5次执行时间"
          trigger="click"
        >
          <a
            onClick={() => {
              if (record?.cronExpression) {
                taskScheduleApi.getLast5ExecutionTimes(record?.cronExpression).then((data) => {
                  if (data?.code === 0) {
                    setCronExpression(data?.data || []);
                  } else {
                    message.error(data?.message);
                  }
                });
              } else {
                message.error('cron表达式为空');
              }
            }}
            style={{ fontSize: 12, marginLeft: 8 }}
            type="text"
          >
            {record?.cronExpression || '-'}
          </a>
        </Popover>
        {/* <a>{record?.cronExpression || '-'}</a> */}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 56,fontWeight: 700 }}>Status: </span>
        <span style={{ color: 'gray' }}>{renderStatus(record?.scheduleStatus)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 12,fontWeight: 700 }}>Last Run Time: </span>
        <span style={{ color: 'gray' }}>{record?.lastScheduleTime || "-"}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 9,fontWeight: 700 }}>Next Run Time: </span>
        <span style={{ color: 'gray' }}>{record?.nextScheduleTime || "-"}</span>
      </div>
    </>
  );
};

export default ScheduleInfo;
