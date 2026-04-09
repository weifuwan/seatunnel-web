import React, { useMemo, useState } from "react";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Form, MenuProps, message, Modal } from "antd";
import PageHeader from "./components/PageHeader";
import SideNav from "./components/SideNav";
import ContentHeader from "./components/ContentHeader";

import { CARD_BG, BORDER_COLOR, initialData, PAGE_BG } from "./constants";
import {
  ConnectorParamItem,
  FormValues,
  MenuKey,
  ParamItem,
  TimeParamItem,
} from "./types";
import ParamTable from "./components/ParamTable";
import ParamModal from "./components/ParamModal";

const { confirm } = Modal;

const Index: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("connector");
  const [keyword, setKeyword] = useState("");
  const [tableData, setTableData] =
    useState<Record<MenuKey, ParamItem[]>>(initialData);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ParamItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const currentList = useMemo(() => {
    const list = tableData[activeMenu] || [];
    const kw = keyword.trim().toLowerCase();
    if (!kw) return list;

    return list.filter((item) => {
      const fields = [
        item.paramName,
        item.paramDesc,
        item.defaultValue,
        item.exampleValue,
        item.type === "connector" ? item.connectorName : "",
        item.type === "connector" ? item.paramType : "",
        item.type === "time" ? item.timeFormat : "",
        item.type === "time" ? item.expression || "" : "",
      ];

      return fields.some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(kw)
      );
    });
  }, [tableData, activeMenu, keyword]);

  const resetModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleResetSelection = () => {
    setKeyword("");
  };

  const openAddModal = () => {
    setEditingRecord(null);
    form.resetFields();

    if (activeMenu === "connector") {
      form.setFieldsValue({
        required: false,
        paramType: "string",
      });
    } else {
      form.setFieldsValue({
        timeFormat: "yyyy-MM-dd HH:mm:ss",
      });
    }

    setModalOpen(true);
  };

  const openEditModal = (record: ParamItem) => {
    setEditingRecord(record);

    if (record.type === "connector") {
      form.setFieldsValue({
        connectorName: record.connectorName,
        paramName: record.paramName,
        paramDesc: record.paramDesc,
        paramType: record.paramType,
        required: record.required,
        defaultValue: record.defaultValue,
        exampleValue: record.exampleValue,
      });
    } else {
      form.setFieldsValue({
        paramName: record.paramName,
        paramDesc: record.paramDesc,
        timeFormat: record.timeFormat,
        defaultValue: record.defaultValue,
        exampleValue: record.exampleValue,
        expression: record.expression,
      });
    }

    setModalOpen(true);
  };

  const handleDelete = (record: ParamItem) => {
    confirm({
      title: "确认删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定删除「${record.paramName}」吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk() {
        setTableData((prev) => ({
          ...prev,
          [activeMenu]: prev[activeMenu].filter(
            (item) => item.id !== record.id
          ),
        }));
        
        message.success("删除成功");
      },
    });
  };

  const handleBatchDelete = () => {
    
    confirm({
      title: "确认批量删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定删除已选中的 ${selectedRowKeys.length} 条数据吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk() {
        setTableData((prev) => ({
          ...prev,
          [activeMenu]: prev[activeMenu].filter(
            (item) => !selectedRowKeys.includes(item.id)
          ),
        }));
        setSelectedRowKeys([]);
        message.success("批量删除成功");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const nextId = Date.now();

      if (activeMenu === "connector") {
        const payload: ConnectorParamItem = {
          id: editingRecord?.id ?? nextId,
          type: "connector",
          connectorName: values.connectorName || "",
          paramName: values.paramName,
          paramDesc: values.paramDesc,
          paramType: values.paramType || "string",
          required: !!values.required,
          defaultValue: values.defaultValue || "",
          exampleValue: values.exampleValue || "",
        };

        setTableData((prev) => ({
          ...prev,
          connector: editingRecord
            ? prev.connector.map((item) =>
                item.id === editingRecord.id ? payload : item
              )
            : [payload, ...prev.connector],
        }));
      } else {
        const payload: TimeParamItem = {
          id: editingRecord?.id ?? nextId,
          type: "time",
          paramName: values.paramName,
          paramDesc: values.paramDesc,
          timeFormat: values.timeFormat || "yyyy-MM-dd HH:mm:ss",
          defaultValue: values.defaultValue || "",
          exampleValue: values.exampleValue || "",
          expression: values.expression || "",
        };

        setTableData((prev) => ({
          ...prev,
          time: editingRecord
            ? prev.time.map((item) =>
                item.id === editingRecord.id ? payload : item
              )
            : [payload, ...prev.time],
        }));
      }

      message.success(editingRecord ? "编辑成功" : "新增成功");
      resetModal();
    } catch (error) {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div
      style={{
        height: "calc(100vh - 48px)",
        background: PAGE_BG,
        overflow: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          padding: "24px 24px 20px",
          boxSizing: "border-box",
        }}
      >
        <PageHeader />

        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              minHeight: "calc(100vh - 170px)",
            }}
          >
            <SideNav
              activeMenu={activeMenu}
              onChange={setActiveMenu}
              onResetSelection={handleResetSelection}
            />

            <div
              style={{
                padding: 24,
                boxSizing: "border-box",
                minWidth: 0,
              }}
            >
              <ContentHeader
                activeMenu={activeMenu}
                count={currentList.length}
                keyword={keyword}
                onKeywordChange={setKeyword}
                onAdd={openAddModal}
              />

              <ParamTable
                activeMenu={activeMenu}
                dataSource={currentList}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      <ParamModal
        activeMenu={activeMenu}
        open={modalOpen}
        editingRecord={editingRecord}
        submitting={submitting}
        form={form}
        onCancel={resetModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Index;