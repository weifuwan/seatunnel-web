import { Button, Form, message, Modal } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { sourceList } from './config';
import DynamicDataSourceForm from './DynamicDataSourceForm';
import DatabaseIcons from './icon/DatabaseIcons';
import './index.less';
import SearchFilter from './SearchFilter';
import { AddOrEditModalRef, dataSourceApi, Operate } from './type';

// 新增/编辑配置抽屉
const AddAndEditDataSourceModal = forwardRef<AddOrEditModalRef, AddOrEditModalRef>((_, ref) => {
  const [type, setType] = useState<Operate>(Operate.Add);
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const [content, setContent] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  const callback = useRef(() => {
    return;
  });
  const [showOk, setShowOk] = useState(false);
  const [dbType, setDbType] = useState('');

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
              setDbType('');
              // 执行回调，刷新列表数据
              callback.current();
              message.success(`${isAdd ? '新增' : '更新'}数据源成功`);
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
                setDbType('');
                // 执行回调，刷新列表数据
                callback.current();
                message.success(`${isAdd ? '新增' : '更新'}数据源成功`);
              } else {
                message.error(data?.message);
              }
            });
          } else {
            message.error('id不存在');
          }
        }
      });
    });
  };

  useImperativeHandle(ref, () => ({
    setVisible: (status: boolean, type: Operate, content: any, cbk: () => void, title: string) => {
      setContent(content);
      setOpen(status);
      callback.current = cbk;
      setType(type);

      // 编辑模式下直接显示表单，并设置数据库类型
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

  // 关闭抽屉
  const onClose = () => {
    setOpen(false);
    form.resetFields();
    configForm?.resetFields();
    setShowOk(false);
    setDbType('');
  };

  const selectSource = (dsSource: string, flag: boolean) => {
    setShowOk(flag);
    setDbType(dsSource);
  };

  // 判断是否显示表单
  const shouldShowForm = showOk || type === Operate.Edit;
  return (
    <>
      <Modal
        title={
          <div style={{ padding: '20px 24px 12px 24px', display: 'flex', alignItems: 'center' }}>
            {type !== Operate.Add ? '编辑' : '新增'}
            &nbsp;[
            <DatabaseIcons dbType={dbType} width="20" height="20" />
            {dbType}]&nbsp; 数据源
          </div>
        }
        width={900}
        open={open}
        maskClosable={false}
        onCancel={onClose}
        centered={true}
        footer={
          <div style={{ textAlign: 'right' }}>
            {shouldShowForm ? (
              <>
                {type === Operate.Add && (
                  <Button
                    onClick={() => {
                      setShowOk(false);
                      setDbType('');
                      form?.resetFields();
                    }}
                    size="small"
                    style={{ marginRight: 8 }}
                  >
                    上一步
                  </Button>
                )}
                <Button
                  style={{ marginRight: 8 }}
                  type="primary"
                  size="small"
                  onClick={() => {
                    configForm.validateFields().then((values) => {
                      const param = {
                        ...values,
                        type: dbType,
                      };
                      dataSourceApi
                        .connectionTestWithParam({ connJson: JSON.stringify(param) })
                        .then((data) => {
                          if (data?.code === 0) {
                            if (data?.data === true) {
                              message.success('连接成功');
                            } else {
                              message.error('连接失败');
                            }
                          } else {
                            message.error(data?.message);
                          }
                        });
                    });
                  }}
                >
                  测试连接
                </Button>
                <Button onClick={onSubmit} style={{ marginRight: 8 }} type="primary" size="small">
                  完成
                </Button>
              </>
            ) : (
              <Button size="small" onClick={onClose}>
                取消
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
          <div style={{ height: '60vh', overflow: 'auto', padding: '0 16px' }}>
            <SearchFilter data={sourceList} selectSource={selectSource} />
          </div>
        )}
      </Modal>
    </>
  );
});

export default AddAndEditDataSourceModal;
