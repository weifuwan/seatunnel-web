import { message } from "antd";
import { useEffect, useState } from "react";
import { history, useLocation } from "umi";
import { seatunnelJobDefinitionApi } from "./api";
import DataSync from "./DataSync";
import SyncTaskList from "./SyncTaskList";
import Workflow from "./workflow";

const App = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const idFromUrl = query.get("id");

  const [detail, setDetail] = useState(!!idFromUrl);
  const [params, setParams] = useState<any>({});

  // useEffect(() => {
  //   if (idFromUrl) {
  //     console.log(idFromUrl);
  //     seatunnelJobDefinitionApi.selectById(idFromUrl).then((data) => {
  //       if (data?.code === 0) {
  //         console.log(data);
  //       } else {
  //         setDetail(false);
  //         history.push("/sync/batch-link-up");
  //       }
  //     });
  //   }
  // }, [idFromUrl]);

  const [sourceType, setSourceType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "JDBC-MYSQL",
  });
  const [targetType, setTargetType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "JDBC-MYSQL",
  });

  const generateDefault = () => {
    const sourcePosition = { x: 0, y: 150 }; // 左边位置
    const sinkPosition = { x: 300, y: 150 }; // 右边位置
    const sourceId = `source-${Date.now()}`;
    const sourceNode = {
      id: sourceId,
      type: "custom",
      position: sourcePosition,
      data: {
        title: sourceType?.dbType,
        plugin_output: sourceId,
        nodeType: "source",
        dbType: sourceType?.dbType,
        type: sourceType?.dbType,
        isPreview: false,
        pluginName: sourceType?.pluginName,
        connectorType: sourceType?.connectorType,
      },
      draggable: true,
      selectable: true,
    };
    const sinkId = `sink-${Date.now()}`;
    const sinkNode = {
      id: sinkId,
      type: "custom",
      position: sinkPosition,
      data: {
        title: targetType?.dbType,
        plugin_input: sinkId,
        nodeType: "sink",
        dbType: targetType?.dbType,
        type: targetType?.dbType,
        isPreview: false,
        pluginName: targetType?.pluginName,
        connectorType: targetType?.connectorType,
      },
      draggable: true,
      selectable: true,
    };

    const nodes = [sourceNode, sinkNode];

    // 创建连接边
    const newEdge = {
      id: `edge-${sourceNode.id}-${sinkNode.id}`,
      source: sourceNode.id,
      target: sinkNode.id,
      type: "custom",
      data: {},
    };
    const edges = [newEdge];

    const defaultForm = {
      clientId: 1,
      jobDesc: "Batch Sync",
      scheduleStatus: "PAUSED",
      wholeSync: false,
      parallelism: 1,
      jobName: `${sourceType?.dbType?.toLowerCase()}2${targetType?.dbType?.toLowerCase()}`,
    };

    const defaultParam = {
      ...defaultForm,
      jobDefinitionInfo: JSON.stringify({
        nodes: nodes,
        edges: edges,
      }),
    };
    return defaultParam;
  };

  const goDetail = (id: string, record?: any) => {
    if (id === undefined) {
      const defaultValue = generateDefault();
      seatunnelJobDefinitionApi.getUniqueId().then((data) => {
        if (data?.code === 0) {
          const returnId = data?.data;
          setDetail(true);
          setParams({
            ...defaultValue,
            id: returnId,
          });
          history.push(`/sync/batch-link-up?id=${returnId}`);
        } else {
          message.error(data?.message);
        }
      });
    } else {
      setDetail(true);
      setParams(record);
      history.push(`/sync/batch-link-up?id=${id}`);
    }
  };

  const goBack = () => {
    setDetail(false);
    setParams({});
    history.push("/sync/batch-link-up");
  };

  return (
    <>
      {detail ? (
        <Workflow
          params={params}
          goBack={goBack}
          sourceType={sourceType}
          setSourceType={setSourceType}
          targetType={targetType}
          setTargetType={setTargetType}
          setParams={setParams}
        />
      ) : (
        <div>
          <DataSync
            goDetail={goDetail}
            setParams={setParams}
            sourceType={sourceType}
            setSourceType={setSourceType}
            targetType={targetType}
            setTargetType={setTargetType}
          />
          <div>
            <SyncTaskList goDetail={goDetail} />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
