import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import { dataSourceCatalogApi } from "@/pages/data-source/type";
import { Button, Col, Form, Popover, Row, Select, message } from "antd";
import { FC, useCallback, useRef, useState } from "react";

import CustomQuerySource from "./CustomQuerySource";
import SingleTableSource from "./SingleTableSource";

interface SourceBasicConfigProps {
  selectedNode: {
    id: string;
    data: any;
  };
  sourceOption: any[];
  qualityDetailRef: any;
  onNodeDataChange?: (nodeId: string, newData: any) => void;
  setSourceColumns: (value: any) => void;
  sourceForm: any;
  sourceTableOption: any[];
  getSourceTableList: (value: any) => Promise<any> | void;
}

const SourceBasicConfig: FC<SourceBasicConfigProps> = ({
  selectedNode,
  sourceOption,
  qualityDetailRef,
  onNodeDataChange,
  setSourceColumns,
  sourceTableOption,
  sourceForm,
  getSourceTableList,
}) => {
  const [viewLoading, setViewLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [columnLoading, setColumnLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [recordCount, setRecordCount] = useState(0);

  const columnRequestIdRef = useRef(0);

  const taskExecuteType = Form.useWatch("taskExecuteType", sourceForm);
  const lastNodeDataRef = useRef("");

  /**
   * 统一清洗节点数据：
   * SINGLE_TABLE 只保留 table_path，清空 query
   * TABLE_CUSTOM 只保留 query，清空 table_path
   */
  const sanitizeNodeData = useCallback((data: Record<string, any>) => {
    const nextData = { ...data };
    const type = nextData.taskExecuteType;

    if (type === "SINGLE_TABLE") {
      nextData.query = undefined;
    } else if (type === "TABLE_CUSTOM") {
      nextData.table_path = undefined;
    }

    return nextData;
  }, []);

  /**
   * 统一同步节点数据
   * 只从这里触发 onNodeDataChange，避免重复调用
   */
  const updateNodeData = useCallback(
    (patch: Record<string, any> = {}) => {
      console.log("-----------")
      if (!onNodeDataChange || !selectedNode) return;

      const formValues = sourceForm.getFieldsValue(true);
      const nextData = sanitizeNodeData({
        ...formValues,
        ...patch,
      });

      const nextDataStr = JSON.stringify(nextData);
      if (lastNodeDataRef.current === nextDataStr) {
        return;
      }

      lastNodeDataRef.current = nextDataStr;
      onNodeDataChange(selectedNode.id, nextData);
    },
    [onNodeDataChange, sanitizeNodeData, selectedNode, sourceForm]
  );

  const getRequestParams = useCallback(() => {
    const currentTaskExecuteType = sourceForm?.getFieldValue("taskExecuteType");
    const table_path = sourceForm?.getFieldValue("table_path") || "";
    const query = sourceForm?.getFieldValue("query") || "";

    if (currentTaskExecuteType === "SINGLE_TABLE") {
      return {
        taskExecuteType: currentTaskExecuteType,
        table_path,
      };
    }

    if (currentTaskExecuteType === "TABLE_CUSTOM") {
      return {
        taskExecuteType: currentTaskExecuteType,
        query,
      };
    }

    return {
      taskExecuteType: currentTaskExecuteType,
    };
  }, [sourceForm]);

  const handleTaskTypeChange = useCallback(
    (value: string) => {
      setSourceColumns([]);
      setRecordCount(0);

      if (value === "SINGLE_TABLE") {
        const patch = {
          taskExecuteType: value,
          query: undefined,
          sourceColumns: [],
        };

        sourceForm.setFieldsValue(patch);
        updateNodeData(patch);
        return;
      }

      if (value === "TABLE_CUSTOM") {
        const patch = {
          taskExecuteType: value,
          table_path: undefined,
          sourceColumns: [],
        };

        sourceForm.setFieldsValue(patch);
        updateNodeData(patch);
      }
    },
    [setSourceColumns, sourceForm, updateNodeData]
  );

  const handleSourceChange = useCallback(
    async (value: string) => {
      const patch = {
        sourceId: value,
        table_path: undefined,
        query: undefined,
        sourceColumns: [],
      };

      sourceForm.setFieldsValue(patch);
      setSourceColumns([]);
      setRecordCount(0);
      updateNodeData(patch);

      try {
        setTableLoading(true);
        await getSourceTableList(value);
      } finally {
        setTableLoading(false);
      }
    },
    [getSourceTableList, setSourceColumns, sourceForm, updateNodeData]
  );

  const loadColumns = useCallback(
    async (tablePath: string) => {
      const sourceId = sourceForm?.getFieldValue("sourceId");

      if (!sourceId || !tablePath) {
        setSourceColumns([]);
        return [];
      }

      const currentRequestId = ++columnRequestIdRef.current;

      try {
        setColumnLoading(true);

        const data = await dataSourceCatalogApi.listColumn(sourceId, {
          taskExecuteType: "SINGLE_TABLE",
          table_path: tablePath,
        });

        if (currentRequestId !== columnRequestIdRef.current) {
          return null;
        }

        if (data?.code === 0) {
          const columns = data?.data || [];
          setSourceColumns(columns);
          return columns;
        }

        setSourceColumns([]);
        message.error(data?.message || "获取字段失败");
        return [];
      } catch {
        if (currentRequestId === columnRequestIdRef.current) {
          setSourceColumns([]);
          message.error("获取字段失败");
        }
        return [];
      } finally {
        if (currentRequestId === columnRequestIdRef.current) {
          setColumnLoading(false);
        }
      }
    },
    [sourceForm, setSourceColumns]
  );

  const getTop20Data = useCallback(async () => {
    const sourceId = sourceForm?.getFieldValue("sourceId");
    if (!sourceId) {
      message.warning("请选择数据源");
      return;
    }

    try {
      await sourceForm.validateFields();
      setViewLoading(true);

      const data = await dataSourceCatalogApi.getTop20Data(
        sourceId,
        getRequestParams()
      );

      if (data?.code === 0) {
        qualityDetailRef.current?.onOpen(true, data);
      } else {
        message.error(data?.message || "数据预览失败");
      }
    } catch (error) {
      // validateFields 失败时，不额外提示
    } finally {
      setViewLoading(false);
    }
  }, [getRequestParams, qualityDetailRef, sourceForm]);

  const count = useCallback(async () => {
    const sourceId = sourceForm?.getFieldValue("sourceId");
    if (!sourceId) {
      message.warning("请选择数据源");
      return;
    }

    try {
      await sourceForm.validateFields();
      setCountLoading(true);

      const data = await dataSourceCatalogApi.count(
        sourceId,
        getRequestParams()
      );

      if (data?.code === 0) {
        setRecordCount(data?.data || 0);
      } else {
        message.error(data?.message || "统计失败");
      }
    } catch (error) {
      // validateFields 失败时，不额外提示
    } finally {
      setCountLoading(false);
    }
  }, [getRequestParams, sourceForm]);

  const renderSource = () => {
    switch (taskExecuteType) {
      case "SINGLE_TABLE":
        return (
          <SingleTableSource
            sourceTableOption={sourceTableOption}
            tableLoading={tableLoading}
            columnLoading={columnLoading}
            onTableChange={async (value: string) => {
              const basePatch = {
                table_path: value,
                query: undefined,
                sourceColumns: [],
              };

              sourceForm.setFieldsValue(basePatch);
              setSourceColumns([]);

              const columns = await loadColumns(value);

              if (columns === null) {
                return;
              }

              updateNodeData({
                ...basePatch,
                sourceColumns: columns || [],
              });
            }}
          />
        );

      case "TABLE_CUSTOM":
        return (
          <CustomQuerySource
            form={sourceForm}
            sourceId={sourceForm?.getFieldValue("sourceId")}
            sourceTableOption={sourceTableOption}
            onQueryChange={(value: string) => {
              setSourceColumns([]);

              const patch = {
                query: value,
                table_path: undefined,
                sourceColumns: [],
              };

              updateNodeData(patch);
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Form
      form={sourceForm}
      name="basic"
      layout="vertical"
      style={{ maxWidth: 600 }}
      initialValues={{
        taskExecuteType: "SINGLE_TABLE",
      }}
    >
      <Form.Item
        label="数据源"
        name="sourceId"
        rules={[{ required: true, message: "请选择数据源" }]}
      >
        <Select
          prefix={
            <DatabaseIcons
              dbType={selectedNode?.data?.dbType}
              width="14"
              height="14"
            />
          }
          size="small"
          onChange={handleSourceChange}
          placeholder="请选择数据源"
          options={sourceOption || []}
        />
      </Form.Item>

      <Form.Item
        label="同步类型"
        name="taskExecuteType"
        rules={[{ required: true, message: "请选择同步类型" }]}
      >
        <Select
          size="small"
          options={[
            { label: "单表同步", value: "SINGLE_TABLE" },
            { label: "自定义同步", value: "TABLE_CUSTOM" },
          ]}
          onChange={handleTaskTypeChange}
          placeholder="请选择同步类型"
        />
      </Form.Item>

      {renderSource()}

      <Form.Item>
        <Row gutter={24} justify="space-between">
          <Col span={12}>
            <Button
              style={{ width: "100%", marginTop: 12 }}
              type="primary"
              size="small"
              onClick={getTop20Data}
              loading={viewLoading}
            >
              数据预览
            </Button>
          </Col>
          <Col span={12}>
            <Popover
              title="数据统计"
              content={
                <div>
                  数据总量：
                  <span style={{ color: "blue" }}>{recordCount || 0}</span>
                </div>
              }
              trigger="click"
            >
              <Button
                style={{ width: "100%", marginTop: 12 }}
                type="default"
                size="small"
                onClick={count}
                loading={countLoading}
              >
                数据统计
              </Button>
            </Popover>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default SourceBasicConfig;
