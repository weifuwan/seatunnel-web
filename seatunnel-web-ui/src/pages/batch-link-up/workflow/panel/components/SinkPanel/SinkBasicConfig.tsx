import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";

import { Button, Col, Form, Popover, Row, Select, message } from "antd";
import { FC, useState } from "react";

import { useIntl } from "@umijs/max";
import CustomQuerySource from "./CustomQuerySource";
import SingleTableSink from "./SingleTableSink";
import { dataSourceCatalogApi } from "@/pages/data-source/service";

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
  const intl = useIntl();

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
    const autoCreate = sinkForm?.getFieldValue("generate_sink_sql");
    if (autoCreate === true) {
      message.warning(
        intl.formatMessage({
          id: "pages.job.config.sink.basic.warn.previewNotSupportAutoCreate",
          defaultMessage:
            "Auto-create table mode does not support data preview",
        })
      );
      return;
    }

    const sinkId = sinkForm?.getFieldValue("sinkId");
    if (sinkId === undefined || sinkId === "") {
      message.warning(
        intl.formatMessage({
          id: "pages.job.config.sink.basic.warn.selectDatasource",
          defaultMessage: "Please select a datasource",
        })
      );
      return;
    }

    const taskExecuteType = sinkForm?.getFieldValue("taskExecuteType");
    const table = sinkForm?.getFieldValue("table");
    const query = sinkForm?.getFieldValue("query");

    setViewLoading(true);
    dataSourceCatalogApi
      .getTop20Data(sinkId, {
        taskExecuteType,
        table_path: table || "",
        query: query || "",
      })
      .then((data) => {
        if (data?.code === 0) {
          qualityDetailRef.current?.onOpen(true, data);
        } else {
          message.error(data?.message);
        }
      })
      .finally(() => setViewLoading(false));
  };

  const count = () => {
    const autoCreate = sinkForm?.getFieldValue("generate_sink_sql");
    if (autoCreate === true) {
      message.warning(
        intl.formatMessage({
          id: "pages.job.config.sink.basic.warn.countNotSupportAutoCreate",
          defaultMessage: "Auto-create table mode does not support data count",
        })
      );
      return;
    }

    const sinkId = sinkForm?.getFieldValue("sinkId");
    if (sinkId === undefined || sinkId === "") {
      message.warning(
        intl.formatMessage({
          id: "pages.job.config.sink.basic.warn.selectDatasource",
          defaultMessage: "Please select a datasource",
        })
      );
      return;
    }

    setCountLoading(true);
    sinkForm
      .validateFields()
      .then(() => {
        const taskExecuteType = sinkForm?.getFieldValue("taskExecuteType");
        const table = sinkForm?.getFieldValue("table");
        const query = sinkForm?.getFieldValue("query");

        return dataSourceCatalogApi.count(sinkId, {
          taskExecuteType,
          table_path: table || "",
          query: query || "",
        });
      })
      .then((data) => {
        if (!data) return;
        if (data?.code === 0) {
          setRecordCount(data?.data || 0);
        } else {
          message.error(data?.message);
        }
      })
      .finally(() => setCountLoading(false));
  };

  const renderSink = () => {
    const selectedType = sinkForm?.getFieldValue("taskExecuteType");
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
                      table: sinkForm?.getFieldValue("table"),
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
      onValuesChange={(changedValues, allValues) => {
        if (changedValues.sinkId !== undefined) {
          getSinkTableList(changedValues.sinkId);
        }
        if (onNodeDataChange && selectedNode) {
          onNodeDataChange(selectedNode.id, {
            ...selectedNode.data,
            ...allValues,
          });
        }
      }}
    >
      <Form.Item
        label={intl.formatMessage({
          id: "pages.job.config.sink.basic.datasource",
          defaultMessage: "Datasource",
        })}
        name="sinkId"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "pages.job.config.sink.basic.datasource.required",
              defaultMessage: "Please select a datasource",
            }),
          },
        ]}
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
          onChange={(value) => {
            sinkForm.setFieldValue("table", undefined);
            sinkForm.setFieldValue("query", undefined);
            getSinkTableList(value);
          }}
          placeholder={intl.formatMessage({
            id: "pages.job.config.sink.basic.datasource.placeholder",
            defaultMessage: "Select datasource",
          })}
          options={sinkOption || []}
        />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "pages.job.config.sink.basic.syncType",
          defaultMessage: "Sync Type",
        })}
        name="taskExecuteType"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "pages.job.config.sink.basic.syncType.required",
              defaultMessage: "Please select sync type",
            }),
          },
        ]}
      >
        <Select
          size="small"
          options={[
            { label: "单表同步", value: "SINGLE_TABLE" },
            { label: "自定义同步", value: "TABLE_CUSTOM" },
          ]}
          onChange={handleTaskTypeChange}
          placeholder={intl.formatMessage({
            id: "pages.job.config.sink.basic.syncType.placeholder",
            defaultMessage: "Select sync type",
          })}
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
              {intl.formatMessage({
                id: "pages.job.config.sink.basic.preview",
                defaultMessage: "Data Preview",
              })}
            </Button>
          </Col>

          <Col span={12}>
            <Popover
              title={intl.formatMessage({
                id: "pages.job.config.sink.basic.count.title",
                defaultMessage: "Data Count",
              })}
              content={
                <div>
                  {intl.formatMessage({
                    id: "pages.job.config.sink.basic.count.total",
                    defaultMessage: "Total records:",
                  })}{" "}
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
                {intl.formatMessage({
                  id: "pages.job.config.sink.basic.count",
                  defaultMessage: "Data Count",
                })}
              </Button>
            </Popover>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default SinkBasicConfig;
