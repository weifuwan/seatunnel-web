import Header from "@/components/Header";
import { HolderOutlined } from "@ant-design/icons";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TableColumnsType } from "antd";
import { Button, Table } from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";

interface DataType {
  key: string;
  fieldName: string;
  fieldType: string;
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: "move" }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

const columns: TableColumnsType<DataType> = [
  // { key: "sort", align: "center", width: 40, render: () => <DragHandle /> },
  {
    key: "key",
    dataIndex: "key",
    align: "center",
    width: 40,
    ellipsis: true,
    title: "编号",
  },
  {
    title: "字段名称",
    align: "center",
    width: "50%",
    ellipsis: true,
    dataIndex: "fieldName",
  },
  {
    title: "字段类型",
    align: "center",
    width: "50%",
    ellipsis: true,
    dataIndex: "fieldType",
  },
];

const initialData: DataType[] = [
  { key: "1", fieldName: "John Brown", fieldType: "Lon Long" },
  { key: "2", fieldName: "Jim Green", fieldType: "Londonrk" },
  { key: "3", fieldName: "Joe Black", fieldType: "Sidneark" },
];

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const Row: React.FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props["data-row-key"] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners]
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

interface SourceConfigTabProps {
  onNodeDataChange?: (nodeId: string, newData: any) => void;
  selectedNode: {
    id: string;
    data: any;
  };
  setSourceColumns: (value: any) => void;
  sourceColumns: any;
}
const App: React.FC<SourceConfigTabProps> = ({
  selectedNode,
  onNodeDataChange,
  sourceColumns,
  setSourceColumns,
}) => {
  const [flag, setFlag] = useState<boolean>(false);

  const handleFieldChange = (newParams: any[]) => {
    if (selectedNode && onNodeDataChange) {
      onNodeDataChange(selectedNode.id, {
        ...selectedNode.data,
        sourceFields: newParams,
        filedsChanged: flag,
      });
    }
  };

  useEffect(() => {
    if (sourceColumns) {
      handleFieldChange(sourceColumns);
    }
  }, [sourceColumns]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setSourceColumns((prevState: any) => {
        const activeIndex = prevState.findIndex(
          (record: any) => record.key === active?.id
        );
        const overIndex = prevState.findIndex(
          (record: any) => record.key === over?.id
        );
        return arrayMove(prevState, activeIndex, overIndex);
      });
      setFlag(true);
    }
  };

  return (
    <div>
      <div style={{ margin: "8px 0 " }}></div>
      <Header
        title={<div style={{ fontSize: 13, fontWeight: 500 }}>字段信息</div>}
      />
      <div style={{ margin: "8px 0 " }}></div>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext
          items={sourceColumns.map((i: any) => i.key)}
          strategy={verticalListSortingStrategy}
        >
          <Table<DataType>
            rowKey="key"
            components={{ body: { row: Row } }}
            columns={columns}
            dataSource={sourceColumns}
            pagination={false}
            bordered
            scroll={{ x: "auto", y: "63vh" }}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default App;
