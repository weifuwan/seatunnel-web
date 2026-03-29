import { history, useParams } from "@umijs/max";
import { Button, Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function MultiConfigPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="mx-auto max-w-[1200px]">
        <Card className="rounded-[24px]">
          <Title level={3}>多表同步配置</Title>
          <Text className="text-[#667085]">
            这里先作为多表同步配置的空页面占位。
          </Text>

          <div className="mt-8 flex justify-end">
            <Button onClick={() => history.push(`/sync/batch-link-up/${id}/detail`)}>
              返回上一步
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}