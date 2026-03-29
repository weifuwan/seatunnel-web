import { history, useParams } from "@umijs/max";
import { Empty } from "antd";
import { useEffect, useState } from "react";
import Workflow from "../../workflow";

export default function SingleConfigPage() {
  const { id } = useParams<{ id: string }>();

  const [params, setParams] = useState<any>(null);
  const [sourceType, setSourceType] = useState<any>(null);
  const [targetType, setTargetType] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const cache = sessionStorage.getItem(`batch-link-up-detail-${id}`);
    if (!cache) return;

    const data = JSON.parse(cache);
    setParams(data);
    setSourceType(data?.sourceType || null);
    setTargetType(data?.targetType || null);
  }, [id]);

  const goBack = () => {
    history.push(`/sync/batch-link-up/${id}/detail`);
  };

  if (!params) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Empty description="未找到配置数据，请先完成上一步配置" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Workflow
        params={params}
        goBack={goBack}
        sourceType={sourceType}
        setSourceType={setSourceType}
        targetType={targetType}
        setTargetType={setTargetType}
        setParams={setParams}
      />
    </div>
  );
}
