import { QuestionCircleOutlined, ReadOutlined } from "@ant-design/icons";
import { SelectLang as UmiSelectLang } from "@umijs/max";
import { history } from "umi";

export type SiderTheme = "light" | "dark";

export const SelectLang: React.FC = () => {
  return (
    <UmiSelectLang
      style={{
        padding: 4,
      }}
    />
  );
};

export const Question: React.FC = () => {
  return (
    <a
      href="http://localhost:3000/"
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        padding: "4px",
        fontSize: "18px",
        color: "inherit",
      }}
    >
      <QuestionCircleOutlined />
    </a>
  );
};

export const Knowledge: React.FC = () => {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: "4px",
        fontSize: "18px",
        color: "inherit",
      }}
      onClick={() => {
        history.push("/knowledge-management");
      }}
    >
      <ReadOutlined />
    </div>
  );
};
