import { useState } from "react";
import { history, useLocation } from "umi"; // Umi 提供的 history 和 location
import DataSync from "./DataSync";
import SyncTaskList from "./SyncTaskList";

import { Form } from "antd";
import WholeSync from "./detail";

const App = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const idFromUrl = query.get("id");

  // detail 状态可以根据 URL 自动初始化
  const [detail, setDetail] = useState(!!idFromUrl);
  const [form] = Form.useForm();
  // // 当 URL 的 id 改变时，同步 params 和 detail
  // useEffect(() => {
  //   if (idFromUrl) {
  //     setParams({ id: idFromUrl });
  //     setDetail(true);
  //   } else {
  //     setDetail(false);
  //   }
  // }, [idFromUrl]);

  const [sourceType, setSourceType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
  });
  const [targetType, setTargetType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
  });

  const goDetail = (id: string, record?: any) => {
    if (id === undefined) {
      setDetail(true);
    } else {
      setDetail(true);
      form.setFieldsValue(record);
      history.push(`/sync/stream-link-up?id=${id}`);
    }
  };

  const goBack = () => {
    setDetail(false);
    history.push("/sync/stream-link-up");
  };

  return (
    <>
      {detail ? (
        <WholeSync goBack={goBack} detail={detail} form={form} />
      ) : (
        <div>
          <DataSync
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
      )}
    </>
  );
};

export default App;
