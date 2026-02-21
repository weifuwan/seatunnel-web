// App.tsx
import type { FC } from "react";
import { memo, useEffect, useRef, useState } from "react";

import QualityDetail from "@/pages/batch-link-up/DataViewSQL";
import { dataSourceApi, dataSourceCatalogApi } from "@/pages/data-source/type";
import { Form, message, Tabs } from "antd";
import { useReactFlow } from "reactflow";
import "./index.less";
import OutputFieldsTab from "./OutputFieldsTab";
import SinkConfigTab from "./SinkConfigTab";
import UpstreamFieldValidateTab from "./UpstreamFieldValidateTab";

interface AppProps {
  selectedNode: {
    id: string;
    data: any;
  };
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

const App: FC<AppProps> = ({ selectedNode, onNodeDataChange }) => {
  const [sinkOption, setSinkOption] = useState<any[]>([]);
  const [sinkColumns, setSinkColumns] = useState<any[]>([]);
  const ref = useRef<any>(null);
  const [sinkForm] = Form.useForm();
  const [sinkTableOption, setSinkTableOption] = useState<any[]>([]);

  const [autoCreateTable, setAutoCreateTable] = useState<boolean>(true);

  const setAutoCreateTableWithNodeChange = (flag: boolean) => {
    setAutoCreateTable(flag);
    onNodeDataChange(selectedNode?.id, {
      ...selectedNode?.data,
      generate_sink_sql: flag,
    });
  };

  const { getEdges, getNode, getNodes } = useReactFlow();

  const getSinkTableList = (id: string) => {
    dataSourceCatalogApi.listTable(id).then((data) => {
      if (data?.code === 0) {
        setSinkTableOption(data?.data);
      } else {
        message.error(data?.message);
      }
    });
  };

  useEffect(() => {
    console.log(selectedNode);
    if (selectedNode) {
      const sinkId = selectedNode?.data?.sinkId;
      if (sinkId === undefined || sinkId === "") {
        console.log(sinkId);
        dataSourceApi.option(selectedNode?.data?.dbType).then((data) => {
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
        console.log("----");
        const lastPrevNodes = getPrevNodes(selectedNode?.id);
        let lastNode: any = {};
        if (lastPrevNodes && lastPrevNodes?.length > 0) {
          lastNode = lastPrevNodes[0];
        }

        dataSourceApi.option(selectedNode?.data?.dbType).then((data) => {
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
        setAutoCreateTable(selectedNode?.data?.generate_sink_sql);
      }
    }
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
      label: "Sink Setting",
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
          setAutoCreateTable={setAutoCreateTableWithNodeChange}
          autoCreateTable={autoCreateTable}
        />
      ),
    },
    ...(!autoCreateTable
      ? [
          {
            key: "2",
            label: "Fields Validate",
            children: (
              <UpstreamFieldValidateTab
                selectedNode={selectedNode}
                onNodeDataChange={onNodeDataChange}
                sinkColumns={sinkColumns}
                sinkForm={sinkForm}
              />
            ),
          },
        ]
      : []),
    {
      key: "3",
      label: "Output Fields",
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
        <Tabs defaultActiveKey="1" destroyOnHidden items={items} />
      </div>
      <QualityDetail ref={ref} />
    </>
  );
};

export default memo(App);
