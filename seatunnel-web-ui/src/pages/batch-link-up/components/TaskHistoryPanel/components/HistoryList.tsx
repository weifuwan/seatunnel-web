import { Empty, List } from "antd";
import React from "react";
import type { IntlShape } from "react-intl";

import type { HistoryItem } from "@/pages/batch-link-up/type";
import HistoryListItem from "./HistoryListItem";

interface HistoryListProps {
  intl: IntlShape;
  loading: boolean;
  historyItems: HistoryItem[];
  instanceItem: any;
  onSelect: (item: HistoryItem) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({
  intl,
  loading,
  historyItems,
  instanceItem,
  onSelect,
}) => {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-2">
      <List
        loading={loading}
        dataSource={historyItems}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({
                id: "pages.job.history.empty",
                defaultMessage: "No run history",
              })}
            />
          ),
        }}
        renderItem={(item) => (
          <HistoryListItem
            item={item}
            intl={intl}
            active={instanceItem?.id === item.id}
            onSelect={onSelect}
          />
        )}
      />
    </div>
  );
};

export default HistoryList;