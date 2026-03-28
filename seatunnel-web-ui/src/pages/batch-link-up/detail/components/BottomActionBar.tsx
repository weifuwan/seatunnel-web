import { Button, Typography } from "antd";

const { Text } = Typography;

interface Props {
  onCancel: () => void;
  onNext: () => void;
}

const BottomActionBar: React.FC<Props> = ({ onCancel, onNext }) => {
  return (
    <div
      className="fixed bottom-0 right-0 z-[99] border-t border-[#EAECF0] bg-white/95 px-6 py-4 backdrop-blur"
      style={{
        left: "var(--pro-sider-current-width)",
        transition: "left var(--pro-sider-transition-duration) ease",
      }}
    >
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4">
        <Text className="text-[14px] text-[#667085]">
          完成基础信息与客户端链接配置后，即可进入下一步
        </Text>

        <div className="flex items-center gap-3">
          <Button className="!h-10 !rounded-full !px-5" onClick={onCancel}>
            取消
          </Button>

          <Button
            type="primary"
            onClick={onNext}
            className="!h-10 !rounded-full !px-5 shadow-sm"
          >
            下一步
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;