import { useIntl } from "@umijs/max";
import { Button, Form, message, Modal } from "antd";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import DynamicDataSourceForm from "./components/DynamicDataSourceForm";
import { sourceList } from "./config";
import DatabaseIcons from "./icon/DatabaseIcons";
import "./index.less";
import SearchFilter from "./SearchFilter";
import { AddOrEditModalRef, dataSourceApi, Operate } from "./type";

// 新增/编辑配置抽屉
const AddAndEditDataSourceModal = forwardRef<
  AddOrEditModalRef,
  AddOrEditModalRef
>((_, ref) => {
  const intl = useIntl();

  const [type, setType] = useState<Operate>(Operate.Add);
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const [content, setContent] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  const callback = useRef(() => {
    return;
  });
  const [showOk, setShowOk] = useState(false);
  const [dbType, setDbType] = useState("");

  // 提交表单
  const onSubmit = () => {
    form.validateFields().then((value) => {
      configForm.validateFields().then((configValues) => {
        const params = {
          dbType: dbType,
          ...value,
          // 将配置表单数据作为 JSON 传递
          connectionParams: JSON.stringify({ ...configValues, type: dbType }),
        };
        const isAdd = type === Operate.Add;

        if (isAdd) {
          dataSourceApi.create(params).then((data) => {
            if (data?.code === 0) {
              onClose();
              setShowOk(false);
              setDbType("");
              callback.current();
              message.success(
                intl.formatMessage({
                  id: "pages.datasource.modal.message.success",
                  defaultMessage: "Success",
                })
              );
            } else {
              message.error(data?.message);
            }
          });
        } else {
          if (content?.id) {
            dataSourceApi.update(content?.id, params).then((data) => {
              if (data?.code === 0) {
                onClose();
                setShowOk(false);
                setDbType("");
                callback.current();
                message.success(
                  intl.formatMessage({
                    id: "pages.datasource.modal.message.success",
                    defaultMessage: "Success",
                  })
                );
              } else {
                message.error(data?.message);
              }
            });
          } else {
            message.error(
              intl.formatMessage({
                id: "pages.datasource.message.idNotExist",
                defaultMessage: "id does not exist",
              })
            );
          }
        }
      });
    });
  };

  useImperativeHandle(ref, () => ({
    setVisible: (
      status: boolean,
      type: Operate,
      content: any,
      cbk: () => void,
      title: string
    ) => {
      setContent(content);
      setOpen(status);
      callback.current = cbk;
      setType(type);

      if (type === Operate.Edit && content?.dbType) {
        setDbType(content.dbType);
        form.setFieldsValue({
          dbName: content?.dbName,
          environment: content?.environment,
          remark: content?.remark,
        });
        configForm.setFieldsValue({
          ...JSON.parse(content?.originalJson),
        });
        setShowOk(true);
      }
    },
  }));

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    configForm?.resetFields();
    setShowOk(false);
    setDbType("");
  };

  const selectSource = (dsSource: string, flag: boolean) => {
    setShowOk(flag);
    setDbType(dsSource);
  };

  const shouldShowForm = showOk || type === Operate.Edit;

  return (
    <>
      <Modal
        title={
          <div
            style={{
              padding: "20px 24px 12px 24px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {intl.formatMessage({
              id:
                type !== Operate.Add
                  ? "pages.datasource.modal.title.edit"
                  : "pages.datasource.modal.title.add",
              defaultMessage: type !== Operate.Add ? "Edit" : "Add",
            })}
            &nbsp;[
            <DatabaseIcons dbType={dbType} width="20" height="20" />
            {dbType}]&nbsp;
            {intl.formatMessage({
              id: "pages.datasource.common.title",
              defaultMessage: "Data Source",
            })}
          </div>
        }
        width={900}
        open={open}
        maskClosable={false}
        onCancel={onClose}
        centered={true}
        footer={
          <div style={{ textAlign: "right" }}>
            {shouldShowForm ? (
              <>
                {type === Operate.Add && (
                  <Button
                    onClick={() => {
                      setShowOk(false);
                      setDbType("");
                      form?.resetFields();
                    }}
                    size="small"
                    style={{ marginRight: 8 }}
                  >
                    {intl.formatMessage({
                      id: "pages.datasource.modal.button.lastStep",
                      defaultMessage: "Last step",
                    })}
                  </Button>
                )}

                <Button
                  style={{ marginRight: 8 }}
                  type="primary"
                  size="small"
                  onClick={() => {
                    const res = configForm.getFieldsValue();
                    console.log("configForm:", configForm.getFieldsValue(true));
                    console.log("outer form:", form.getFieldsValue(true));

                    configForm.validateFields().then((values) => {
                      const param = {
                        ...values,
                        type: dbType,
                      };
                      dataSourceApi
                        .connectionTestWithParam({
                          connJson: JSON.stringify(param),
                        })
                        .then((data) => {
                          if (data?.code === 0) {
                            if (data?.data === true) {
                              message.success(
                                intl.formatMessage({
                                  id: "pages.datasource.modal.message.success",
                                  defaultMessage: "Success",
                                })
                              );
                            } else {
                              message.error(
                                intl.formatMessage({
                                  id: "pages.datasource.modal.message.fail",
                                  defaultMessage: "Fail",
                                })
                              );
                            }
                          } else {
                            message.error(data?.message);
                          }
                        });
                    });
                  }}
                >
                  {intl.formatMessage({
                    id: "pages.datasource.modal.button.connTest",
                    defaultMessage: "Connection Test",
                  })}
                </Button>

                <Button
                  onClick={onSubmit}
                  style={{ marginRight: 8 }}
                  type="primary"
                  size="small"
                >
                  {intl.formatMessage({
                    id: "pages.datasource.modal.button.finish",
                    defaultMessage: "Finish",
                  })}
                </Button>
              </>
            ) : (
              <Button size="small" onClick={onClose}>
                {intl.formatMessage({
                  id: "pages.datasource.modal.button.cancel",
                  defaultMessage: "Cancel",
                })}
              </Button>
            )}
          </div>
        }
        destroyOnClose
      >
        {shouldShowForm ? (
          <DynamicDataSourceForm
            dbType={dbType}
            form={form}
            configForm={configForm}
            operateType={type}
          />
        ) : (
          <div style={{ height: "60vh", overflow: "auto", padding: "0 16px" }}>
            <SearchFilter data={sourceList} selectSource={selectSource} />
          </div>
        )}
      </Modal>
    </>
  );
});

export default AddAndEditDataSourceModal;
