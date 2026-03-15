import { forwardRef, useImperativeHandle, useState } from "react";
import { Drawer, Table } from "antd";
import "./index.less";
import { useIntl } from "@umijs/max";

const QualityDetail = forwardRef((_: any, ref: any) => {
  const intl = useIntl();

  const [visible, setVisible] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  // 展开抽屉
  const onOpen = (status: boolean, content: any) => {
    const { columns, data } = content?.data || {};
    setColumns(columns || []);
    setData(data || []);
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
  const tableWidth =
    (columns && columns.reduce((totalWidth: number) => totalWidth + 200, 0)) || 0;

  return (
    <Drawer
      title={intl.formatMessage({
        id: "pages.quality.preview.title",
        defaultMessage: "Data Preview (max 10 rows)",
      })}
      open={visible}
      footer={null}
      placement="bottom"
      onClose={onClose}
      height={500}
    >
      <div style={{ margin: "0 12px 12px 12px" }}>
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