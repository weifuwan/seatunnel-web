import React from "react";
import { MenuKey, ParamItem } from "../../types";
import ConnectorParamTable from "./ConnectorParamTable";
import TimeParamTable from "./TimeParamTable";

interface Props {
  activeMenu: MenuKey;
  dataSource: ParamItem[];
  onEdit: (record: ParamItem) => void;
  onDelete: (record: ParamItem) => void;
}

const ParamTable: React.FC<Props> = (props) => {
  if (props.activeMenu === "connector") {
    return <ConnectorParamTable {...props} />;
  }

  return <TimeParamTable {...props} />;
};

export default ParamTable;