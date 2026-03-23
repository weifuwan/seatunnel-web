// App.tsx
import type { FC } from "react";
import { memo, useEffect, useRef, useState } from "react";

import QualityDetail from "@/pages/batch-link-up/DataViewSQL";

import { useIntl } from "@umijs/max";
import { Form, message, Tabs } from "antd";
import { useReactFlow } from "reactflow";
import "./index.less";
import OutputFieldsTab from "./OutputFieldsTab";
import SinkConfigTab from "./SinkConfigTab";
import UpstreamFieldValidateTab from "./UpstreamFieldValidateTab";
import { dataSourceCatalogApi, fetchDataSourceOptions } from "@/pages/data-source/service";

interface AppProps {
  selectedNode: {
    id: string;
    data: any;
  };
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

const App: FC<AppProps> = ({ selectedNode, onNodeDataChange }) => {
  const intl = useIntl();

  const [activeKey, setActiveKey] = useState("1");

  const [sinkOption, setSinkOption] = useState<any[]>([]);
  const [sinkColumns, setSinkColumns] = useState<any[]>([]);
  const ref = useRef<any>(null);
  const [sinkForm] = Form.useForm();
  const [sinkTableOption, setSinkTableOption] = useState<any[]>([]);

  const autoCreateTable = Form.useWatch("generate_sink_sql", sinkForm) ?? true;

  // useEffect(() => {
  //   if (autoCreateTable && activeKey === "2") {
  //     setActiveKey("1");
  //   }
  // }, [autoCreateTable, activeKey]);

  const { getEdges, getNode } = useReactFlow();

  const getSinkTableList = (id: string) => {
    dataSourceCatalogApi.listTable(id).then((data) => {
      if (data?.code === 0) {
        setSinkTableOption(data?.data);
      } else {
        message.error(data?.message);
      }
    });
  };

  const handleAutoCreateTableChange = (flag: boolean) => {
    sinkForm.setFieldValue("generate_sink_sql", flag);

    const prevNodes = getPrevNodes(selectedNode?.id);
    const lastNode = prevNodes?.[0];

    let nextSinkColumns = [];

    if (flag) {
      nextSinkColumns = lastNode?.data?.sourceFields || [];
    } else {
      nextSinkColumns = selectedNode?.data?.sinkFields || [];
    }

    setSinkColumns(nextSinkColumns);

    onNodeDataChange(selectedNode?.id, {
      ...selectedNode?.data,
      ...sinkForm.getFieldsValue(),
      generate_sink_sql: flag,
      sinkFields: !flag
        ? selectedNode?.data?.sinkFields
        : selectedNode?.data?.sinkFields,
    });
  };

  useEffect(() => {
    if (selectedNode) {
      const sinkId = selectedNode?.data?.sinkId;
      if (sinkId === undefined || sinkId === "") {
        fetchDataSourceOptions(selectedNode?.data?.dbType).then((data) => {
          if (data?.code === 0) {
            setSinkOption(data?.data);

            if (data?.data?.length > 0) {
              const firstOption = data.data[0];
              const firstSinkId = firstOption.value;

              sinkForm.setFieldValue("sinkId", firstSinkId);
              sinkForm.setFieldValue("taskExecuteType", "SINGLE_TABLE");
              sinkForm.setFieldValue("generate_sink_sql", true);

              onNodeDataChange(selectedNode?.id, {
                ...selectedNode?.data,
                sinkId: firstSinkId,
                taskExecuteType: "SINGLE_TABLE",
                generate_sink_sql: true,
              });

              const lastPrevNodes = getPrevNodes(selectedNode?.id);
              let lastNode: any = {};
              if (lastPrevNodes && lastPrevNodes?.length > 0) {
                lastNode = lastPrevNodes[0];
              }
              if (lastNode?.data?.sourceFields) {
                setSinkColumns(lastNode?.data?.sourceFields || []);
              }
              getSinkTableList(firstOption.value);
            }
          } else {
            message.error(data?.message);
          }
        });
      } else {
        const lastPrevNodes = getPrevNodes(selectedNode?.id);
        let lastNode: any = {};
        if (lastPrevNodes && lastPrevNodes?.length > 0) {
          lastNode = lastPrevNodes[0];
        }

        fetchDataSourceOptions(selectedNode?.data?.dbType).then((data) => {
          if (data?.code === 0) {
            setSinkOption(data?.data);
            if (data?.data?.length > 0) {
              if (selectedNode?.data?.sinkId) {
                getSinkTableList(selectedNode.data.sinkId);
              }
            }
          } else {
            message.error(data?.message);
          }
        });

        if (
          selectedNode?.data?.generate_sink_sql === true &&
          lastNode?.data?.sourceFields
        ) {
          setSinkColumns(lastNode?.data?.sourceFields || []);
        } else {
          setSinkColumns(selectedNode?.data?.sinkFields || []);
        }

        sinkForm.setFieldsValue({
          sinkId: selectedNode?.data?.sinkId || undefined,
          taskExecuteType: selectedNode?.data?.taskExecuteType || undefined,
          query: selectedNode?.data?.query || undefined,
          table: selectedNode?.data?.table || undefined,
          generate_sink_sql: selectedNode?.data?.generate_sink_sql || undefined,
        });

        sinkForm.setFieldValue(
          "generate_sink_sql",
          selectedNode?.data?.generate_sink_sql ?? true
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode]);

  const getPrevNodes = (currentNodeId: string) => {
    const edges = getEdges();
    return edges
      .filter((e) => e.target === currentNodeId)
      .map((e) => getNode(e.source))
      .filter(Boolean);
  };

  const items = [
    {
      key: "1",
      label: intl.formatMessage({
        id: "pages.job.node.sink.tab.sinkSetting",
        defaultMessage: "Sink Setting",
      }),
      children: (
        <SinkConfigTab
          selectedNode={selectedNode}
          sinkOption={sinkOption}
          onNodeDataChange={onNodeDataChange}
          qualityDetailRef={ref}
          setSinkColumns={setSinkColumns}
          sinkForm={sinkForm}
          sinkTableOption={sinkTableOption}
          getSinkTableList={getSinkTableList}
          setAutoCreateTable={handleAutoCreateTableChange}
          autoCreateTable={autoCreateTable}
        />
      ),
    },

    {
      key: "2",
      label: intl.formatMessage({
        id: "pages.job.node.sink.tab.fieldsValidate",
        defaultMessage: "Fields Validate",
      }),
      children: (
        <UpstreamFieldValidateTab
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
          sinkColumns={sinkColumns}
          sinkForm={sinkForm}
          autoCreateTable={autoCreateTable}
        />
      ),
    },

    {
      key: "3",
      label: intl.formatMessage({
        id: "pages.job.node.sink.tab.outputFields",
        defaultMessage: "Output Fields",
      }),
      children: (
        <OutputFieldsTab
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
          sinkColumns={sinkColumns}
          setSinkColumns={setSinkColumns}
        />
      ),
    },
  ];

  return (
    <>
      <div style={{ padding: "0 16px" }}>
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          destroyOnHidden
          items={items}
        />
      </div>
      <QualityDetail ref={ref} />
    </>
  );
};

export default memo(App);
