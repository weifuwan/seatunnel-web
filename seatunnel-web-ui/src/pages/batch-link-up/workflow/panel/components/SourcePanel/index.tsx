// App.tsx
import type { FC } from "react";
import { memo, useEffect, useRef, useState } from "react";

import QualityDetail from "@/pages/batch-link-up/DataViewSQL";
import { dataSourceApi, dataSourceCatalogApi } from "@/pages/data-source/type";
import { useIntl } from "@umijs/max";
import { Form, message, Tabs } from "antd";
import "./index.less";
import OutputFieldsTab from "./OutputFieldsTab";
import SourceConfigTab from "./SourceConfigTab";

interface AppProps {
  selectedNode: {
    id: string;
    data: any;
  };
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

const App: FC<AppProps> = ({ selectedNode, onNodeDataChange }) => {
  const intl = useIntl();

  const [sourceOption, setSourceOption] = useState<any[]>([]);
  const [sourceColumns, setSourceColumns] = useState<any[]>([]);
  const ref = useRef<any>(null);
  const [sourceForm] = Form.useForm();
  const [sourceTableOption, setSourceTableOption] = useState<any[]>([]);
  const [params, setParams] = useState<any[]>(selectedNode?.data?.params || []);

  const getSourceTableList = (id: string) => {
    dataSourceCatalogApi.listTable(id).then((data) => {
      if (data?.code === 0) {
        setSourceTableOption(data?.data);
      } else {
        message.error(data?.message);
      }
    });
  };

  // useEffect(() => {
  //   if (sourceColumns && sourceColumns?.length > 0) {
  //     onNodeDataChange(selectedNode?.id, {
  //       ...selectedNode?.data,
  //       sourceColumns,
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [sourceColumns]);

  const prevNodeIdRef = useRef<string>();

  useEffect(() => {
    if (!selectedNode) return;

    const isNodeChanged = prevNodeIdRef.current !== selectedNode.id;
    prevNodeIdRef.current = selectedNode.id;

    if (!isNodeChanged) {
      return;
    }

    const sourceId = selectedNode?.data?.sourceId;

    if (sourceId === undefined || sourceId === "") {
      dataSourceApi.option(selectedNode?.data?.dbType).then((data) => {
        if (data?.code === 0) {
          setSourceOption(data?.data);

          if (data?.data?.length > 0) {
            const firstOption = data.data[0];
            const firstSourceId = firstOption.value;

            sourceForm.setFieldsValue({
              sourceId: firstSourceId,
              taskExecuteType: "SINGLE_TABLE",
            });

            onNodeDataChange(selectedNode?.id, {
              ...selectedNode?.data,
              sourceId: firstSourceId,
              taskExecuteType: "SINGLE_TABLE",
            });

            getSourceTableList(firstOption.value);
          }
        } else {
          message.error(data?.message);
        }
      });
    } else {
      dataSourceApi.option(selectedNode?.data?.dbType).then((data) => {
        if (data?.code === 0) {
          setSourceOption(data?.data);
          if (selectedNode?.data?.sourceId) {
            getSourceTableList(selectedNode.data.sourceId);
          }
        } else {
          message.error(data?.message);
        }
      });

      setSourceColumns(selectedNode?.data?.sourceColumns || []);
      setParams(selectedNode?.data?.params || []);

      sourceForm.setFieldsValue({
        sourceId: selectedNode?.data?.sourceId,
        taskExecuteType: selectedNode?.data?.taskExecuteType,
        query: selectedNode?.data?.query,
        table_path: selectedNode?.data?.table_path,
      });
    }
  }, [selectedNode?.id]);

  const items = [
    {
      key: "1",
      label: intl.formatMessage({
        id: "pages.job.node.source.tab.sourceSetting",
        defaultMessage: "Source Setting",
      }),
      children: (
        <SourceConfigTab
          selectedNode={selectedNode}
          sourceOption={sourceOption}
          onNodeDataChange={onNodeDataChange}
          qualityDetailRef={ref}
          setSourceColumns={setSourceColumns}
          sourceForm={sourceForm}
          sourceTableOption={sourceTableOption}
          getSourceTableList={getSourceTableList}
          setParams={setParams}
          params={params}
        />
      ),
    },
    {
      key: "2",
      label: intl.formatMessage({
        id: "pages.job.node.source.tab.outputFields",
        defaultMessage: "Output Fields",
      }),
      children: (
        <OutputFieldsTab
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
          sourceColumns={sourceColumns}
          setSourceColumns={setSourceColumns}
        />
      ),
    },
  ];

  return (
    <>
      <div style={{ padding: "0 16px" }}>
        <Tabs defaultActiveKey="1" items={items} />
      </div>
      <QualityDetail ref={ref} />
    </>
  );
};

export default memo(App);
