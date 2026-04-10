import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Form, message, Modal } from "antd";

import PageHeader from "./components/PageHeader";
import SideNav from "./components/SideNav";
import ContentHeader from "./components/ContentHeader";
import ParamTable from "./components/ParamTable";
import ParamModal from "./components/ParamModal";

import { CARD_BG, BORDER_COLOR, PAGE_BG } from "./constants/ui";

import {
  ConnectorParamItem,
  ConnectorParamVO,
  FormValues,
  MenuKey,
  ParamItem,
  TimeParamItem,
} from "./types";
import {
  createConnectorParam,
  deleteConnectorParam,
  fetchConnectorParamPage,
  updateConnectorParam,
} from "./api";

const { confirm } = Modal;

const Index: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("connector");
  const [keyword, setKeyword] = useState("");

  const [connectorLoading, setConnectorLoading] = useState(false);
  const [connectorData, setConnectorData] = useState<ConnectorParamItem[]>([]);
  const [connectorPageNum, setConnectorPageNum] = useState(1);
  const [connectorPageSize, setConnectorPageSize] = useState(10);
  const [connectorTotal, setConnectorTotal] = useState(0);

  const [timeData, setTimeData] = useState<TimeParamItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ParamItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm<FormValues>();

  const currentList = useMemo<ParamItem[]>(() => {
    if (activeMenu === "connector") {
      return connectorData;
    }

    const kw = keyword.trim().toLowerCase();
    if (!kw) return timeData;

    return timeData.filter((item) => {
      const fields = [
        item.paramName,
        item.paramDesc,
        item.defaultValue,
        item.exampleValue,
        item.timeFormat,
        item.expression || "",
      ];

      return fields.some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(kw)
      );
    });
  }, [activeMenu, connectorData, keyword, timeData]);

  const resetModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleResetSelection = () => {
    setKeyword("");
    setConnectorPageNum(1);
  };

  const mapConnectorVOToItem = useCallback(
    (record: ConnectorParamVO): ConnectorParamItem => ({
      id: record.id,
      type: "connector",
      connectorName: record.connectorName,
      connectorType: record.connectorType,
      paramName: record.paramName,
      paramDesc: record.paramDesc,
      paramType: record.paramType,
      required: record.requiredFlag === 1,
      defaultValue: record.defaultValue || "",
      exampleValue: record.exampleValue || "",
      paramContext: record.paramContext || "",
    }),
    []
  );

  const loadConnectorData = useCallback(async () => {
    setConnectorLoading(true);
    try {
      const res = await fetchConnectorParamPage({
        type: "connector",
        paramName: keyword || undefined,
        pageNo: connectorPageNum,
        pageSize: connectorPageSize,
      });

      const records = Array.isArray(res?.data?.bizData)
        ? res.data.bizData.map(mapConnectorVOToItem)
        : [];

      setConnectorData(records);
      setConnectorTotal(res?.data?.pagination?.total || 0);
    } catch (error) {
      message.error("获取 Connector 参数失败");
    } finally {
      setConnectorLoading(false);
    }
  }, [connectorPageNum, connectorPageSize, keyword, mapConnectorVOToItem]);

  useEffect(() => {
    if (activeMenu !== "connector") return;
    loadConnectorData();
  }, [activeMenu, loadConnectorData]);

  const openAddModal = () => {
    setEditingRecord(null);
    form.resetFields();

    if (activeMenu === "connector") {
      form.setFieldsValue({
        required: false,
        paramType: "string",
        paramContext: "",
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
        connectorType: record.connectorType,
        paramName: record.paramName,
        paramDesc: record.paramDesc,
        paramType: record.paramType,
        required: record.required,
        defaultValue: record.defaultValue,
        exampleValue: record.exampleValue,
        paramContext: record.paramContext || "",
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
      async onOk() {
        if (record.type === "connector") {
          try {
            await deleteConnectorParam(record.id);
            message.success("删除成功");

            if (
              connectorData.length === 1 &&
              connectorPageNum > 1 &&
              connectorTotal > 1
            ) {
              setConnectorPageNum((prev) => prev - 1);
            } else {
              loadConnectorData();
            }
          } catch (error) {
            message.error("删除失败");
          }
          return;
        }

        setTimeData((prev) => prev.filter((item) => item.id !== record.id));
        message.success("删除成功");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (activeMenu === "connector") {
        const payload = {
          id: editingRecord?.id,
          type: "connector",
          connectorName: values.connectorName || "",
          connectorType: values.connectorType || "",
          paramName: values.paramName,
          paramDesc: values.paramDesc,
          paramType: values.paramType || "string",
          requiredFlag: values.required ? 1 : 0,
          defaultValue: values.defaultValue || "",
          exampleValue: values.exampleValue || "",
          paramContext: values.paramContext || "",
        };

        const isEdit = Boolean(editingRecord?.id);

        if (isEdit) {
          await updateConnectorParam(payload);
        } else {
          await createConnectorParam(payload);
        }

        message.success(isEdit ? "编辑成功" : "新增成功");
        resetModal();
        loadConnectorData();
        return;
      }

      const nextId = editingRecord?.id ?? Date.now();
      const timePayload: TimeParamItem = {
        id: nextId,
        type: "time",
        paramName: values.paramName,
        paramDesc: values.paramDesc,
        timeFormat: values.timeFormat || "yyyy-MM-dd HH:mm:ss",
        defaultValue: values.defaultValue || "",
        exampleValue: values.exampleValue || "",
        expression: values.expression || "",
      };

      setTimeData((prev) =>
        editingRecord?.type === "time"
          ? prev.map((item) => (item.id === editingRecord.id ? timePayload : item))
          : [timePayload, ...prev]
      );

      message.success(editingRecord?.id ? "编辑成功" : "新增成功");
      resetModal();
    } catch (error) {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const tablePagination =
    activeMenu === "connector"
      ? {
          current: connectorPageNum,
          pageSize: connectorPageSize,
          total: connectorTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number) => `共 ${total} 条`,
          onChange: (page: number, pageSize: number) => {
            const pageSizeChanged = pageSize !== connectorPageSize;
            setConnectorPageNum(pageSizeChanged ? 1 : page);
            setConnectorPageSize(pageSize);
          },
        }
      : {
          current: 1,
          pageSize: 10,
          total: currentList.length,
          showSizeChanger: false,
          showTotal: (total: number) => `共 ${total} 条`,
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
              onChange={(key) => {
                setActiveMenu(key);
                setKeyword("");
                setConnectorPageNum(1);
              }}
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
                count={activeMenu === "connector" ? connectorTotal : currentList.length}
                keyword={keyword}
                onKeywordChange={(value) => {
                  setKeyword(value);
                  if (activeMenu === "connector") {
                    setConnectorPageNum(1);
                  }
                }}
                onAdd={openAddModal}
              />

              <ParamTable
                activeMenu={activeMenu}
                dataSource={currentList}
                loading={activeMenu === "connector" ? connectorLoading : false}
                pagination={tablePagination}
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