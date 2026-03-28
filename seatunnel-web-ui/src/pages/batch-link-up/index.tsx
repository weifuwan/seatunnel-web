import { message } from "antd";
import { useState } from "react";
import { history } from "umi";
import { seatunnelJobDefinitionApi } from "./api";
import SyncTaskList from "./SyncTaskList";
import DataSyncHeader from "./components/DataSyncHeader";

const App = () => {
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

  const goDetail = (id?: string, record?: any) => {
  if (id === undefined) {
    seatunnelJobDefinitionApi.getUniqueId().then((data) => {
      if (data?.code === 0) {
        const returnId = data?.data;

        sessionStorage.setItem(
          `batch-link-up-detail-${returnId}`,
          JSON.stringify({
            sourceType,
            targetType,
            id: returnId,
          })
        );

        history.push(`/sync/batch-link-up/${returnId}/detail`);
      } else {
        message.error(data?.message);
      }
    });
  } else {
    sessionStorage.setItem(
      `batch-link-up-detail-${id}`,
      JSON.stringify(record)
    );

    history.push(`/sync/batch-link-up/${id}/detail`);
  }
};

  return (
    <div>
      <DataSyncHeader
        goDetail={goDetail}
        sourceType={sourceType}
        setSourceType={setSourceType}
        targetType={targetType}
        setTargetType={setTargetType}
      />

      <div>
        <SyncTaskList goDetail={goDetail} />
      </div>
    </div>
  );
};

export default App;