import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import { dataSourceCatalogApi } from "@/pages/data-source/type";
import { Button, Col, Form, Popover, Row, Select } from "antd";
import { FC, useState } from "react";

import { message } from "antd";
import CustomQuerySource from "./CustomQuerySource";
import SingleTableSink from "./SingleTableSink";

interface SourceBasicConfigProps {
  selectedNode: {
    id: string;
    data: any;
  };
  sinkOption: any[];
  qualityDetailRef: any;
  onNodeDataChange?: (nodeId: string, newData: any) => void;
  setSinkColumns: (value: any) => void;
  sinkForm: any;
  sinkTableOption: any[];
  getSinkTableList: (value: any) => void;
  setAutoCreateTable: (value: any) => void;
  autoCreateTable: any;
}

const SinkBasicConfig: FC<SourceBasicConfigProps> = ({
  selectedNode,
  sinkOption,
  qualityDetailRef,
  onNodeDataChange,
  setSinkColumns,
  sinkTableOption,
  sinkForm,
  getSinkTableList,
  autoCreateTable,
  setAutoCreateTable,
}) => {
  const [viewLoading, setViewLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [recordCount, setRecordCount] = useState(0);

  const handleTaskTypeChange = (value: string) => {
    if (value === "SINGLE_TABLE") {
      sinkForm.resetFields(["query"]);
    } else if (value === "TABLE_CUSTOM") {
      sinkForm.resetFields(["table"]);
    }
  };

  const getTop20Data = () => {
    const autoCreateTable = sinkForm?.getFieldValue("generate_sink_sql");
    if (autoCreateTable === true) {
      message.warning("自动建表模式不支持数据预览");
      return;
    }
    const sinkId = sinkForm?.getFieldValue("sinkId");
    if (sinkId === undefined || sinkId === "") {
      message.warning("请选择数据源");
    } else {
      const taskExecuteType = sinkForm?.getFieldValue("taskExecuteType");
      const table = sinkForm?.getFieldValue("table");
      const query = sinkForm?.getFieldValue("query");
      setViewLoading(true);
      dataSourceCatalogApi
        .getTop20Data(sinkId, {
          taskExecuteType: taskExecuteType,
          table_path: table || "",
          query: query || "",
        })
        .then((data) => {
          if (data?.code === 0) {
            qualityDetailRef.current?.onOpen(true, data);
            setViewLoading(false);
          } else {
            message.error(data?.message);
            setViewLoading(false);
          }
        });
    }
  };

  const count = () => {
    const autoCreateTable = sinkForm?.getFieldValue("generate_sink_sql");
    if (autoCreateTable === true) {
      message.warning("自动建表模式不支持数据统计");
      return;
    }
    const sourceId = sinkForm?.getFieldValue("sinkId");

    if (sourceId === undefined || sourceId === "") {
      message.warning("请选择数据源");
    } else {
      sinkForm.validateFields().then((value: any) => {
        const taskExecuteType = sinkForm?.getFieldValue("taskExecuteType");
        const table = sinkForm?.getFieldValue("table");
        const query = sinkForm?.getFieldValue("query");

        dataSourceCatalogApi
          .count(sourceId, {
            taskExecuteType: taskExecuteType,
            table_path: table || "",
            query: query || "",
          })
          .then((data) => {
            if (data?.code === 0) {
              setRecordCount(data?.data || 0);
            } else {
              message.error(data?.message);
            }
          });
      });
    }
  };

  const renderSink = () => {
    const selectedType = sinkForm?.getFieldValue("taskExecuteType"); // 从表单获取
    switch (selectedType) {
      case "SINGLE_TABLE":
        return (
          <SingleTableSink
            form={sinkForm}
            sinkTableOption={sinkTableOption}
            selectedType={selectedType}
            autoCreateTable={autoCreateTable}
            setAutoCreateTable={setAutoCreateTable}
            onTableChange={(value) => {
              const sinkId = sinkForm?.getFieldValue("sinkId");
              const params = {
                taskExecuteType: selectedType,
                table_path: value,
                query: "",
              };
              dataSourceCatalogApi.listColumn(sinkId, params).then((data) => {
                if (data?.code === 0) {
                  setSinkColumns(data?.data);
                  if (onNodeDataChange) {
                    onNodeDataChange(selectedNode.id, {
                      ...selectedNode.data,
                      sinkFields: data?.data,
                      table: sinkForm?.getFieldValue("table")
                    });
                  }
                } else {
                  message.error(data?.message);
                }
              });
            }}
          />
        );
      case "TABLE_CUSTOM":
        return <CustomQuerySource form={sinkForm} />;
      default:
        return null;
    }
  };

  return (
    <Form
      form={sinkForm}
      name="basic"
      layout="vertical"
      style={{ maxWidth: 600 }}
      initialValues={{
        taskExecuteType: "SINGLE_TABLE",
      }}
      //   autoComplete="off"
      onValuesChange={(changedValues, allValues) => {
        if (changedValues.sinkId !== undefined) {
          // 触发获取表列表
          getSinkTableList(changedValues.sinkId);
        }

        // 通知父组件
        if (onNodeDataChange && selectedNode) {
          onNodeDataChange(selectedNode.id, {
            ...selectedNode.data,
            ...allValues,
          });
        }
      }}
    >
      <Form.Item label="Datasource" name="sinkId" rules={[{ required: true }]}>
        <Select
          prefix={
            <DatabaseIcons
              dbType={selectedNode?.data?.dbType}
              width="14"
              height="14"
            />
          }
          size="small"
          onChange={(value) => {
            sinkForm.setFieldValue("table", undefined);
            sinkForm.setFieldValue("query", undefined);
            getSinkTableList(value);
          }}
          placeholder="请选择数据源"
          options={sinkOption || []}
        />
      </Form.Item>

      <Form.Item
        label="Sync Type"
        name="taskExecuteType"
        rules={[{ required: true, message: "请选择同步类型" }]}
      >
        <Select
          size="small"
          options={[
            {
              label: "SINGLE_TABLE",
              value: "SINGLE_TABLE",
            },
            {
              label: "TABLE_CUSTOM",
              value: "TABLE_CUSTOM",
            },
          ]}
          onChange={handleTaskTypeChange}
          placeholder="请选择同步类型"
        />
      </Form.Item>

      {renderSink()}

      <Form.Item label="" name="">
        <Row gutter={24} justify="space-between">
          <Col span={12}>
            <Button
              style={{ width: "100%", marginTop: 12 }}
              type="primary"
              size="small"
              onClick={getTop20Data}
              loading={viewLoading}
            >
              Data Preview
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
                loading={countLoading}
                size="small"
                onClick={count}
              >
                Data Count
              </Button>
            </Popover>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default SinkBasicConfig;
