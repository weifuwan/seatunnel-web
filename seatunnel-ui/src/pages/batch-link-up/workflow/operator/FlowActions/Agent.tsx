import {
  AntDesignOutlined,
  FileImageOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Sender, SenderProps } from "@ant-design/x";
import { MenuInfo } from "@rc-component/menu/lib/interface";
import { Dropdown, Flex, GetRef, MenuProps, message } from "antd";
import React, { useEffect, useRef, useState } from "react";

const Switch = Sender.Switch;

const AgentInfo: {
  [key: string]: {
    icon: React.ReactNode;
    label: string;
    zh_label: string;
    skill: SenderProps["skill"];
    zh_skill: SenderProps["skill"];
    slotConfig: SenderProps["slotConfig"];
    zh_slotConfig: SenderProps["slotConfig"];
  };
} = {
  deep_search: {
    icon: <SearchOutlined />,
    label: "Advance",
    zh_label: "深度搜索",
    skill: {
      value: "deepSearch",
      title: "Advance",
      closable: true,
    },
    zh_skill: {
      value: "deepSearch",
      title: "深度搜索",
      closable: true,
    },
    slotConfig: [
      { type: "text", value: "Please help me search for news about " },
      {
        type: "select",
        key: "search_type",
        props: {
          options: ["AI", "Technology", "Entertainment"],
          placeholder: "Please select a category",
        },
      },
      { type: "text", key: "", value: "Please help me search for news about " },
    ],
    zh_slotConfig: [
      { type: "text", value: "请帮我搜索关于" },
      {
        type: "select",
        key: "search_type",
        props: {
          options: ["AI", "技术", "娱乐"],
          placeholder: "请选择一个类别",
        },
      },
      { type: "text", key: "", value: "的新闻。" },
    ],
  },
};



const FileInfo: {
  [key: string]: {
    icon: React.ReactNode;
    label: string;
    zh_label: string;
  };
} = {
  file_image: {
    icon: <FileImageOutlined />,
    label: "x-image",
    zh_label: "x-图片",
  },
};

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeAgentKey, setActiveAgentKey] = useState("deep_search");
  const [slotConfig, setSlotConfig] = useState(AgentInfo[activeAgentKey]);

  // ======================== sender en ========================
  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const agentItems: MenuProps["items"] = Object.keys(AgentInfo).map((agent) => {
    const { icon, label } = AgentInfo[agent];
    return {
      key: agent,
      icon,
      label,
    };
  });


  const agentItemClick: MenuProps["onClick"] = (item) => {
    setActiveAgentKey(item.key);
    try {
      // deep clone
      setSlotConfig(JSON.parse(JSON.stringify(AgentInfo[item.key])));
    } catch (error) {
      console.error(error);
    }
  };

  // ======================== sender zh ========================

  const senderZhRef = useRef<GetRef<typeof Sender>>(null);

  

  // Mock send message
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        message.success("Send message successfully!");
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [loading]);

  return (
    <Flex vertical gap="middle">
      <Sender
        loading={loading}
        ref={senderRef}
        skill={slotConfig.skill}
        placeholder="Press Enter to send message"
        footer={(actionNode) => {
          return (
            <Flex justify="space-between" align="center">
              <Flex gap="small" align="center">
                <Dropdown
                  menu={{
                    selectedKeys: [activeAgentKey],
                    onClick: agentItemClick,
                    items: agentItems,
                  }}
                >
                  <Switch value={false} icon={<AntDesignOutlined />}>
                    Agent
                  </Switch>
                </Dropdown>
              </Flex>
            </Flex>
          );
        }}
        suffix={false}
        onSubmit={(v, _, skill) => {
          setLoading(true);
          message.info(`Send message: ${skill?.value} | ${v}`);

          senderRef.current?.clear?.();
        }}
        onCancel={() => {
          setLoading(false);
          message.error("Cancel sending!");
        }}
        slotConfig={slotConfig.slotConfig}
        autoSize={{ minRows: 3, maxRows: 6 }}
      />
    </Flex>
  );
};

export default () => <App />;
