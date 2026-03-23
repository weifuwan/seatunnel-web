import {
  ConsoleSqlOutlined,
  CopyOutlined,
  TableOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Divider, Form, Popover, Select, Space, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FC, useMemo, useState } from "react";

import "./index.less";
import { dataSourceCatalogApi } from "@/pages/data-source/service";

interface OptionItem {
  label: string;
  value: string;
  [key: string]: any;
}

interface CustomQuerySourceProps {
  form: any;
  sourceId?: string;
  sourceTableOption: OptionItem[];
  onQueryChange?: (value: string) => void;
}

const CustomQuerySource: FC<CustomQuerySourceProps> = ({
  form,
  sourceId,
  sourceTableOption,
  onQueryChange,
}) => {
  const [sqlPopoverOpen, setSqlPopoverOpen] = useState(false);
  const [resolvePopoverOpen, setResolvePopoverOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>();
  const [generateLoading, setGenerateLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolvedSql, setResolvedSql] = useState("");

  const canGenerate = useMemo(() => {
    return !!sourceId && !!selectedTable;
  }, [sourceId, selectedTable]);

  const currentQuery = Form.useWatch("query", form);

  const handleGenerateSql = async () => {
    if (!sourceId) {
      message.warning("请先选择数据源");
      return;
    }

    if (!selectedTable) {
      message.warning("请选择表");
      return;
    }

    try {
      setGenerateLoading(true);

      const data = await dataSourceCatalogApi.buildSqlTemplate(sourceId, {
        table_path: selectedTable,
      });

      if (data?.code !== 0) {
        message.error(data?.message || "SQL 生成失败");
        return;
      }

      const sql = data?.data || "";
      if (!sql) {
        message.warning("未生成有效 SQL");
        return;
      }

      form?.setFieldValue("query", sql);
      onQueryChange?.(sql);
      setSqlPopoverOpen(false);
      message.success("SQL 生成成功");
    } catch (error) {
      message.error("SQL 生成失败");
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleResolveSqlPreview = async () => {
    if (!sourceId) {
      message.warning("请先选择数据源");
      return;
    }

    const query = form?.getFieldValue("query");
    if (!query) {
      message.warning("请先输入 SQL");
      return;
    }

    try {
      setResolveLoading(true);

      const data = await dataSourceCatalogApi.resolveSql(sourceId, {
        query,
      });

      if (data?.code !== 0) {
        message.error(data?.message || "SQL 变量解析失败");
        return;
      }

      const sql = data?.data || "";
      if (!sql) {
        message.warning("未解析出有效 SQL");
        return;
      }

      setResolvedSql(sql);
    } catch (error) {
      message.error("SQL 变量解析失败");
    } finally {
      setResolveLoading(false);
    }
  };

  const handleOpenResolvePopover = async (open: boolean) => {
    setResolvePopoverOpen(open);
    if (open && currentQuery) {
      await handleResolveSqlPreview();
    }
  };

  const handleCopyResolvedSql = async () => {
    if (!resolvedSql) {
      message.warning("暂无可复制内容");
      return;
    }

    try {
      await navigator.clipboard.writeText(resolvedSql);
      message.success("复制成功");
    } catch (error) {
      message.error("复制失败");
    }
  };

  const sqlPopoverContent = (
    <div style={{ width: 320 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={12}>
        <div style={{ fontSize: 13, color: "#666" }}>
          选择一张表，自动生成查询 SQL
        </div>

        <Select
          size="small"
          prefix={<TableOutlined style={{ color: "orange" }} />}
          style={{ width: "60%" }}
          placeholder="请选择表"
          value={selectedTable}
          options={sourceTableOption || []}
          showSearch
          optionFilterProp="label"
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(value) => setSelectedTable(value)}
        />

        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
          <Button size="small" onClick={() => setSqlPopoverOpen(false)}>
            取消
          </Button>
          <Button
            type="primary"
            size="small"
            loading={generateLoading}
            disabled={!canGenerate}
            onClick={handleGenerateSql}
          >
            生成 SQL
          </Button>
        </Space>
      </Space>
    </div>
  );

  const resolvePopoverContent = (
    <div style={{ width: 460 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={12}>
        <div style={{ fontSize: 13, color: "#666" }}>
          这里展示的是当前 SQL 模板解析后的预览结果，不会替换原始 SQL。
        </div>

        <div className="resolved-sql-preview">
          {resolveLoading ? "正在解析..." : resolvedSql || "暂无解析结果"}
        </div>

        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
          <Button size="small" onClick={handleResolveSqlPreview} loading={resolveLoading}>
            重新解析
          </Button>
          <Button
            size="small"
            icon={<CopyOutlined />}
            disabled={!resolvedSql}
            onClick={handleCopyResolvedSql}
          >
            复制
          </Button>
        </Space>
      </Space>
    </div>
  );

  return (
    <Form.Item
      style={{ width: "100%" }}
      label={
        <div className="custom-query-label">
          <span>自定义查询</span>

          <Space size={10} style={{marginLeft: 230}}>
            <Popover
              content={resolvePopoverContent}
              title="变量解析预览"
              placement="leftTop"
              trigger="click"
              open={resolvePopoverOpen}
              onOpenChange={handleOpenResolvePopover}
            >
              <Button
                type="link"
                size="small"
                icon={<ThunderboltOutlined className="sql-icon" style={{fontSize: 17}}/> }
                disabled={!sourceId || !currentQuery}
                style={{ paddingInline: 0,  }}
              >
                
              </Button>
            </Popover>
            <Divider type="vertical" style={{padding:0, margin: "0 0px"}}/>

            <Popover
              content={sqlPopoverContent}
              title="自动生成 SQL"
              placement="leftTop"
              trigger="click"
              open={sqlPopoverOpen}
              onOpenChange={setSqlPopoverOpen}
            >
              <ConsoleSqlOutlined className="sql-icon" />
            </Popover>
          </Space>
        </div>
      }
      name="query"
      rules={[{ required: true, message: "请输入自定义查询 SQL" }]}
    >
      <TextArea
        rows={9}
        maxLength={40000}
        showCount
        placeholder={`请输入自定义 SQL，例如：
SELECT id, name
FROM users
WHERE create_time >= \${var:today_start}`}
        onChange={(e) => onQueryChange?.(e.target.value)}
      />
    </Form.Item>
  );
};

export default CustomQuerySource;