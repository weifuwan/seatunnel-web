interface ExecutionStatusProps {
  record: any;
}
// <Progress percent={40} percentPosition={{ align: 'center', type: 'inner' }} size={[300, 20]} />
const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ record }) => {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 16, fontWeight: 700 }}>Time: </span>
        <span style={{ color: 'gray' }}>{record?.duration || '-'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 16, fontWeight: 700 }}>Amount: </span>
        <span style={{ color: 'gray' }}>
          {record?.sinkTotalRecord !== undefined ? record?.sinkTotalRecord || '0' : '0'} record
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 42, fontWeight: 700 }}>QPS: </span>
        <span style={{ color: 'gray' }}>{record?.qps || '0' + ' QPS' || '-'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 16, fontWeight: 700 }}>Size: </span>
        <span style={{ color: 'gray' }}>{record?.syncSize || '-'}</span>
      </div>
    </>
  );
};

export default ExecutionStatus;
