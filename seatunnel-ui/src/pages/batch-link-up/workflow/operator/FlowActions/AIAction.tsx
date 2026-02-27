import { Button } from "antd";
import React from "react";
import DeepSeekIcon from "../../icon/DeepSeekIcon";
import "./GradientButton.less";

const App: React.FC = () => {
  return (
    <Button className="gradient-button" size="middle">
      <DeepSeekIcon /> AI
    </Button>
  );
};

export default App;