import { SyncOutlined } from "@ant-design/icons";
import { Sender, SenderProps } from "@ant-design/x";
import { Dropdown, Flex, GetRef, MenuProps, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import DeepSeekIcon from "../../icon/DeepSeekIcon";

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
  sync_copilot: {
    icon: <SyncOutlined />,
    label: "Full Copilot",
    zh_label: "同步助手",

    skill: {
      value: "syncCopilot",
      title: "Full Copilot",
      closable: true,
    },

    zh_skill: {
      value: "syncCopilot",
      title: "同步助手",
      closable: true,
    },

    slotConfig: [
      {
        type: "text",
        value: "Perform a full data synchronization from [",
      },
      {
        type: "select",
        key: "source_db",
        props: {
          options: [`MySQL`, "PostgreSQL", "Oracle"],
          placeholder: "select source",
        },
      },
      { type: "text", value: "." },
      {
        type: "select",
        key: "source_table",
        props: {
          options: ["users", "orders", "products"],
          placeholder: "select source table",
        },
      },
      { type: "text", value: "] to [" },
      {
        type: "select",
        key: "sink_db",
        props: {
          options: ["Oracle", "MySQL"],
          placeholder: "select sink ",
        },
      },
      { type: "text", value: "." },
      {
        type: "input",
        key: "sink_table",
        props: {
          placeholder: "enter sink table",
        },
      },
      { type: "text", value: "]." },
    ],

    zh_slotConfig: [
      { type: "text", value: "请将 [" },
      {
        type: "select",
        key: "source_db",
        props: {
          options: ["MySQL", "PostgreSQL", "Oracle"],
          placeholder: "选择源数据库",
        },
      },
      { type: "text", value: "] 中的 [" },
      {
        type: "select",
        key: "source_table",
        props: {
          options: ["users", "orders", "products"],
          placeholder: "选择源表",
        },
      },
      { type: "text", value: "] 表，全量同步至 " },
      {
        type: "select",
        key: "sink_db",
        props: {
          options: ["Oracle", "MySQL"],
          placeholder: "选择目标数据库",
        },
      },
      { type: "text", value: " 的 " },
      {
        type: "input",
        key: "sink_table",
        props: {
          placeholder: "输入目标表名",
        },
      },
      { type: "text", value: " 表。" },
    ],
  },
};

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeAgentKey, setActiveAgentKey] = useState("sync_copilot");
  const [slotConfig, setSlotConfig] = useState(AgentInfo[activeAgentKey]);

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
                  <Switch
                    value={false}
                    icon={<DeepSeekIcon style={{ paddingTop: 4 }} />}
                    style={{ borderRadius: 12 }}
                  >
                    Copilot
                  </Switch>
                </Dropdown>
              </Flex>
              <Flex align="center">{actionNode}</Flex>
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
