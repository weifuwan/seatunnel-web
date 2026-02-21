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
import type { MenuProps, TableColumnsType } from "antd";
import { Button, Dropdown, Input, Table } from "antd";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

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
/* 只替换 App 组件即可 */
const App: React.FC<SourceConfigTabProps> = ({
  selectedNode,
  onNodeDataChange,
  sourceColumns,
  setSourceColumns,
}) => {
  const [flag, setFlag] = useState<boolean>(false);

  /* ---------- 1. 防抖钩子（保持你原来的） ---------- */
  function useDebounce<T extends (...args: any[]) => void>(fn: T, ms = 300): T {
    const timer = useRef<NodeJS.Timeout>(null);
    return React.useCallback(
      (...args: Parameters<T>) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => fn(...args), ms);
      },
      [fn, ms]
    ) as T;
  }
  const updateTargetField = useDebounce((key: string, newVal: string) => {
    setSourceColumns((prev: any) =>
      prev.map((item: any) =>
        item.key === key ? { ...item, targetFieldName: newVal } : item
      )
    );
    setFlag(true);
  }, 50);

  /* ---------- 2. 右键菜单状态 ---------- */
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>();

  /* ---------- 3. 菜单项 ---------- */
  const menuItems: MenuProps["items"] = [
    {
      key: "delete",
      label: "删除",
      onClick: () => {
        setSourceColumns((prev: any) =>
          prev.filter((item: any) => item.key !== selectedKey)
        );
        setFlag(true);
        setMenuOpen(false);
      },
    },
  ];

  /* ---------- 4. 列配置（保持你原来的） ---------- */
  const columns: TableColumnsType<DataType> = [
    { key: "sort", align: "center", width: 40, render: () => <DragHandle /> },
    {
      key: "key",
      dataIndex: "key",
      align: "center",
      width: 30,
      ellipsis: true,
      title: "key",
      render: (_, __, i) => i + 1,
    },
    {
      title: "Source Field",
      align: "center",
      width: "50%",
      ellipsis: true,
      dataIndex: "fieldName",
    },
    {
      title: "Sink Field",
      align: "center",
      width: "50%",
      ellipsis: true,
      dataIndex: "targetFieldName",
      render: (_, record: any) => (
        <Input
          size="small"
          variant="filled"
          style={{ width: "100%", textAlign: "center" }}
          value={record.targetFieldName}
          onChange={(e) => updateTargetField(record.key, e.target.value)}
        />
      ),
    },
  ];

  /* ---------- 5. 拖拽回调（保持你原来的） ---------- */
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setSourceColumns((prev: any) => {
        const activeIndex = prev.findIndex((r: any) => r.key === active.id);
        const overIndex = prev.findIndex((r: any) => r.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
      setFlag(true);
    }
  };

  /* ---------- 6. 通知父节点（保持你原来的） ---------- */
  useEffect(() => {
    if (selectedNode && onNodeDataChange) {
      onNodeDataChange(selectedNode.id, {
        ...selectedNode.data,
        transformColumns: sourceColumns,
        filedsChanged: flag,
      });
    }
  }, [sourceColumns, flag]);

  return (
    <div>
      <div style={{ margin: "8px 0" }} />
      <Header
        title={<div style={{ fontSize: 13, fontWeight: 500 }}>字段信息</div>}
      />
      <div style={{ margin: "8px 0" }} />

      {/* 用 Dropdown 包 Table，trigger 只留 contextMenu */}
      <Dropdown
        trigger={["contextMenu"]}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        menu={{ items: menuItems }}
      >
        <div onContextMenu={(e) => e.preventDefault()}>
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={onDragEnd}
          >
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
                onRow={(record) => ({
                  onContextMenu: (e) => {
                    e.preventDefault();
                    setSelectedKey(record.key);
                    setMenuOpen(true);
                  },
                })}
              />
            </SortableContext>
          </DndContext>
        </div>
      </Dropdown>
    </div>
  );
};

export default App;
