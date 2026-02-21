import { forwardRef, useImperativeHandle, useState } from 'react';

import { Drawer, Table } from 'antd';
import './index.less';

const QualityDetail = forwardRef((_, ref) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  // 展开抽屉
  const onOpen = (status: boolean, content: any) => {
    const { columns, data } = content?.data || [];
    setColumns(columns); // 将列名映射为 dataIndex
    setData(data);
    setVisible(status);
  };

  // 关闭抽屉
  const onClose = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    onOpen,
  }));
  // 动态计算 x 轴滚动宽度
  const tableWidth = columns && columns?.reduce((totalWidth, col) => totalWidth + 200, 0) || 0;

  return (
    <Drawer
      title="数据预览（最多展示10条数据）"
      open={visible}
      footer={null}
      placement="bottom"
      onClose={onClose}
      height={500}
    >
      <div style={{ margin: '0 12px 12px 12px' }}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
          scroll={{ x: tableWidth, y: 360 }}
        />
      </div>
    </Drawer>
  );
});

export default QualityDetail;
