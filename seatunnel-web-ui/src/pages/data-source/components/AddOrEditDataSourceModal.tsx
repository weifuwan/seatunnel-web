import { useIntl } from "@umijs/max";
import { Button, Form, message, Modal } from "antd";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import DynamicDataSourceForm from "./DynamicDataSourceForm";
import DatabaseIcons from "../icon/DatabaseIcons";
import { dataSourceGroupList } from "../constants";
import {
  createDataSource,
  testDataSourceConnectionWithParams,
  updateDataSource,
} from "../service";
import { buildSubmitPayload, parseOriginalJson } from "../utils";
import DataSourceTypeSelector from "./DataSourceTypeSelector";
import type {
  DataSourceFormValues,
  DataSourceModalOpenPayload,
  DataSourceModalRef,
  DataSourceOperateType,
  DataSourceRecord,
} from "../types";

const AddOrEditDataSourceModal = forwardRef<DataSourceModalRef>((_, ref) => {
  const intl = useIntl();
  const [basicForm] = Form.useForm<DataSourceFormValues>();
  const [configForm] = Form.useForm();

  const [open, setOpen] = useState(false);
  const [operateType, setOperateType] = useState<DataSourceOperateType>(
    "CREATE" as DataSourceOperateType
  );
  const [currentRecord, setCurrentRecord] = useState<DataSourceRecord>();
  const [selectedDbType, setSelectedDbType] = useState("");
  const [showFormStep, setShowFormStep] = useState(false);

  const successCallbackRef = useRef<(() => void) | undefined>();

  const handleClose = () => {
    setOpen(false);
    setCurrentRecord(undefined);
    setSelectedDbType("");
    setShowFormStep(false);
    basicForm.resetFields();
    configForm.resetFields();
  };

  const initializeEditForm = (record: DataSourceRecord) => {
    basicForm.setFieldsValue({
      name: record.name || "",
      environment: record.environment || "",
      remark: record.remark || "",
    });

    configForm.setFieldsValue(parseOriginalJson(record.originalJson));
  };

  useImperativeHandle(ref, () => ({
    open: ({
      operateType: nextOperateType,
      currentRecord: nextRecord,
      onSuccess,
    }: DataSourceModalOpenPayload) => {
      setOpen(true);
      setOperateType(nextOperateType);
      setCurrentRecord(nextRecord);
      successCallbackRef.current = onSuccess;

      if (nextOperateType === "EDIT" && nextRecord) {
        setSelectedDbType(nextRecord.dbType || "");
        setShowFormStep(true);
        initializeEditForm(nextRecord);
      }
    },
    close: handleClose,
  }));

  const handleSelectDbType = (dbType: string) => {
    setSelectedDbType(dbType);
    setShowFormStep(true);
  };

  const handleBackToTypeSelection = () => {
    setShowFormStep(false);
    setSelectedDbType("");
    basicForm.resetFields();
    configForm.resetFields();
  };

  const handleTestConnection = async () => {
    try {
      const connectionValues = await configForm.validateFields();

      const response = await testDataSourceConnectionWithParams({
        connJson: JSON.stringify({
          ...connectionValues,
          type: selectedDbType,
        }),
      });

      if (response.code === 0) {
        if (response.data === true) {
          message.success(
            intl.formatMessage({
              id: "pages.datasource.modal.message.success",
              defaultMessage: "Success",
            })
          );
          return;
        }

        message.error(
          intl.formatMessage({
            id: "pages.datasource.modal.message.fail",
            defaultMessage: "Fail",
          })
        );
        return;
      }

      message.error(response.message);
    } catch (error: any) {
      
    }
  };

  const handleSubmit = async () => {
    try {
      const basicValues = await basicForm.validateFields();
      const connectionValues = await configForm.validateFields();
      const payload = buildSubmitPayload(
        selectedDbType,
        basicValues,
        connectionValues
      );

      if (operateType === "CREATE") {
        const response = await createDataSource(payload);

        if (response.code !== 0) {
          message.error(response.message);
          return;
        }
      }

      if (operateType === "EDIT") {
        if (!currentRecord?.id) {
          message.error(
            intl.formatMessage({
              id: "pages.datasource.message.idNotExist",
              defaultMessage: "id does not exist",
            })
          );
          return;
        }

        const response = await updateDataSource(currentRecord.id, payload);

        if (response.code !== 0) {
          
          return;
        }
      }

      message.success(
        intl.formatMessage({
          id: "pages.datasource.modal.message.success",
          defaultMessage: "Success",
        })
      );
      handleClose();
      successCallbackRef.current?.();
    } catch (error: any) {
      if (error?.errorFields) return;
      
    }
  };

  const isCreateMode = operateType === "CREATE";
  const modalActionText =
    operateType === "EDIT"
      ? intl.formatMessage({
          id: "pages.datasource.modal.title.edit",
          defaultMessage: "Edit",
        })
      : intl.formatMessage({
          id: "pages.datasource.modal.title.add",
          defaultMessage: "Add",
        });

  return (
    <Modal
      width={920}
      open={open}
      centered
      maskClosable={false}
      onCancel={handleClose}
      destroyOnClose
      styles={{
        header: {
          padding: "20px 24px 16px",
          borderBottom: "1px solid #EEF2F6",
          marginBottom: 0,
        },
        body: {
          padding: "20px 24px 16px",
          background: "#F8FAFC",
          maxHeight: "72vh",
          overflowY: "auto",
          minHeight: "60vh"
        },
        footer: {
          padding: "14px 24px 18px",
          borderTop: "1px solid #EEF2F6",
          background: "#FFFFFF",
          marginTop: 0,
        },
        content: {
          borderRadius: 20,
          overflow: "hidden",
        },
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            paddingRight: 24,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#EEF4FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <DatabaseIcons dbType={selectedDbType} width="18" height="18" />
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#101828",
                    lineHeight: "28px",
                  }}
                >
                  {modalActionText}
                  {intl.formatMessage({
                    id: "pages.datasource.common.title",
                    defaultMessage: " Data Source",
                  })}
                </div>

                <div
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    color: "#667085",
                    lineHeight: "20px",
                  }}
                >
                  {selectedDbType ? `当前类型：${selectedDbType}` : "请选择数据源类型"}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            {showFormStep ? (
              isCreateMode ? (
                <Button
                  onClick={handleBackToTypeSelection}
                  style={{ height: 32, borderRadius: 16 }}
                >
                  上一步
                </Button>
              ) : null
            ) : (
              <Button
                onClick={handleClose}
                style={{ height: 32, borderRadius: 16 }}
              >
                取消
              </Button>
            )}
          </div>

          {showFormStep ? (
            <div style={{ display: "flex", gap: 10 }}>
              <Button
                onClick={handleTestConnection}
                style={{ height: 32, borderRadius: 16 }}
              >
                连接测试
              </Button>

              <Button
                type="primary"
                onClick={handleSubmit}
                style={{ height: 32, borderRadius: 16, paddingInline: 18 }}
              >
                完成
              </Button>
            </div>
          ) : null}
        </div>
      }
    >
      {showFormStep ? (
        <DynamicDataSourceForm
          dbType={selectedDbType}
          form={basicForm}
          configForm={configForm}
          operateType={operateType}
        />
      ) : (
        <div style={{ padding: "4px 0 8px" }}>
          <DataSourceTypeSelector
            dataSourceGroups={dataSourceGroupList}
            onSelect={handleSelectDbType}
          />
        </div>
      )}
    </Modal>
  );
});

export default AddOrEditDataSourceModal;