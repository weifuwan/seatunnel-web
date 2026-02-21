import { Table, Spin } from "antd";
import { TableItem } from "../types";

interface RegexMatchTableProps {
  data: TableItem[];
  loading: boolean;
}

const RegexMatchTable: React.FC<RegexMatchTableProps> = ({ data, loading }) => {
  return (
    <div style={{ width: "58.8vh", marginLeft: "7.3%", marginBottom: 12 }}>
      <Spin spinning={loading}>
        <Table
          dataSource={data}
          loading={loading}
          bordered
          scroll={{ x: "max-content", y: 300 }}
          pagination={false}
          columns={[
            {
              title: "表名",
              dataIndex: "title",
              key: "title",
            },
          ]}
        />
      </Spin>
    </div>
  );
};

export default RegexMatchTable;