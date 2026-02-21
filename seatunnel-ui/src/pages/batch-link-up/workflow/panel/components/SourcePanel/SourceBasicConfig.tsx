// components/SourceConfigTab/SourceBasicConfig.tsx
import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import { dataSourceCatalogApi } from "@/pages/data-source/type";
import { Button, Col, Form, Popover, Row, Select } from "antd";
import { FC, useState } from "react";

import { message } from "antd";
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
  getSourceTableList: (value: any) => void;
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
  const [recordCount, setRecordCount] = useState(0);
  const handleTaskTypeChange = (value: string) => {
    if (value === "SINGLE_TABLE") {
      sourceForm.resetFields(["query"]);
    } else if (value === "TABLE_CUSTOM") {
      sourceForm.resetFields(["table_path"]);
    }
  };

  const getTop20Data = () => {
    const sourceId = sourceForm?.getFieldValue("sourceId");
    if (sourceId === undefined || sourceId === "") {
      message.warning("请选择数据源");
    } else {
      const taskExecuteType = sourceForm?.getFieldValue("taskExecuteType");
      const table_path = sourceForm?.getFieldValue("table_path");
      const query = sourceForm?.getFieldValue("query");
      setViewLoading(true);
      dataSourceCatalogApi
        .getTop20Data(sourceId, {
          taskExecuteType: taskExecuteType,
          table_path: table_path || "",
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
    const sourceId = sourceForm?.getFieldValue("sourceId");
    if (sourceId === undefined || sourceId === "") {
      message.warning("请选择数据源");
    } else {
      sourceForm.validateFields().then((value: any) => {
        const taskExecuteType = sourceForm?.getFieldValue("taskExecuteType");
        const table_path = sourceForm?.getFieldValue("table_path");
        const query = sourceForm?.getFieldValue("query");

        dataSourceCatalogApi
          .count(sourceId, {
            taskExecuteType: taskExecuteType,
            table_path: table_path || "",
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

  const renderSource = () => {
    const selectedType = sourceForm?.getFieldValue("taskExecuteType");
    switch (selectedType) {
      case "SINGLE_TABLE":
        return (
          <SingleTableSource
            form={sourceForm}
            sourceTableOption={sourceTableOption}
            onTableChange={(value) => {
              const sourceId = sourceForm?.getFieldValue("sourceId");
              const params = {
                taskExecuteType: selectedType,
                table_path: value,
                query: "",
              };
              dataSourceCatalogApi.listColumn(sourceId, params).then((data) => {
                if (data?.code === 0) {
                  setSourceColumns(data?.data);
                } else {
                  message.error(data?.message);
                }
              });
            }}
          />
        );
      case "TABLE_CUSTOM":
        return (
          <CustomQuerySource form={sourceForm} onTableChange={(value) => {}} />
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
      //   autoComplete="off"
      onValuesChange={(changedValues, allValues) => {
        if (changedValues.sourceId !== undefined) {
          getSourceTableList(changedValues.sourceId);
        }

        if (onNodeDataChange && selectedNode) {
          onNodeDataChange(selectedNode.id, {
            ...selectedNode.data,
            ...allValues,
          });
        }
      }}
    >
      <Form.Item label="数据源" name="sourceId" rules={[{ required: true }]}>
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
            sourceForm.setFieldValue("table_path", undefined);
            sourceForm.setFieldValue("query", undefined);
            getSourceTableList(value);
          }}
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
            {
              label: "单表同步",
              value: "SINGLE_TABLE",
            },
            {
              label: "自定义同步",
              value: "TABLE_CUSTOM",
            },
          ]}
          onChange={handleTaskTypeChange}
          placeholder="请选择同步类型"
        />
      </Form.Item>

      {renderSource()}

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
              数据预览
            </Button>
          </Col>
          <Col span={12}>
            <Popover
              title="数据统计"
              content={
                <div>
                  数据总量：
                  <span style={{ color: "blue" }}>{recordCount || "0"} </span>
                </div>
              }
              trigger="click"
            >
              <Button
                style={{ width: "100%", marginTop: 12 }}
                type="default"
                size="small"
                onClick={count}
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
