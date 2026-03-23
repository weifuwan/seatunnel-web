import { useIntl } from '@umijs/max';
import { Button, Form, message, Modal } from 'antd';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import DynamicDataSourceForm from './DynamicDataSourceForm';
import DatabaseIcons from '../icon/DatabaseIcons';
import { dataSourceGroupList } from '../constants';
import {
  createDataSource,
  testDataSourceConnectionWithParams,
  updateDataSource,
} from '../service';
import { buildSubmitPayload, parseOriginalJson } from '../utils';
import DataSourceTypeSelector from './DataSourceTypeSelector';
import type {
  DataSourceFormValues,
  DataSourceModalOpenPayload,
  DataSourceModalRef,
  DataSourceOperateType,
  DataSourceRecord,
} from '../types';

const AddOrEditDataSourceModal = forwardRef<DataSourceModalRef>((_, ref) => {
  const intl = useIntl();
  const [basicForm] = Form.useForm<DataSourceFormValues>();
  const [configForm] = Form.useForm();

  const [open, setOpen] = useState(false);
  const [operateType, setOperateType] = useState<DataSourceOperateType>('CREATE' as DataSourceOperateType);
  const [currentRecord, setCurrentRecord] = useState<DataSourceRecord>();
  const [selectedDbType, setSelectedDbType] = useState('');
  const [showFormStep, setShowFormStep] = useState(false);

  const successCallbackRef = useRef<(() => void) | undefined>();

  const handleClose = () => {
    setOpen(false);
    setCurrentRecord(undefined);
    setSelectedDbType('');
    setShowFormStep(false);
    basicForm.resetFields();
    configForm.resetFields();
  };

  const initializeEditForm = (record: DataSourceRecord) => {
    basicForm.setFieldsValue({
      name: record.name || '',
      environment: record.environment || '',
      remark: record.remark || '',
    });

    configForm.setFieldsValue(parseOriginalJson(record.originalJson));
  };

  useImperativeHandle(ref, () => ({
    open: ({ operateType: nextOperateType, currentRecord: nextRecord, onSuccess }: DataSourceModalOpenPayload) => {
      setOpen(true);
      setOperateType(nextOperateType);
      setCurrentRecord(nextRecord);
      successCallbackRef.current = onSuccess;

      if (nextOperateType === 'EDIT' && nextRecord) {
        setSelectedDbType(nextRecord.dbType || '');
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
    setSelectedDbType('');
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
              id: 'pages.datasource.modal.message.success',
              defaultMessage: 'Success',
            }),
          );
          return;
        }

        message.error(
          intl.formatMessage({
            id: 'pages.datasource.modal.message.fail',
            defaultMessage: 'Fail',
          }),
        );
        return;
      }

      message.error(response.message);
    } catch (error: any) {
      message.error(error?.message || 'Connection test failed');
    }
  };

  const handleSubmit = async () => {
    try {
      const basicValues = await basicForm.validateFields();
      const connectionValues = await configForm.validateFields();
      const payload = buildSubmitPayload(selectedDbType, basicValues, connectionValues);

      if (operateType === 'CREATE') {
        const response = await createDataSource(payload);

        if (response.code !== 0) {
          message.error(response.message);
          return;
        }
      }

      if (operateType === 'EDIT') {
        if (!currentRecord?.id) {
          message.error(
            intl.formatMessage({
              id: 'pages.datasource.message.idNotExist',
              defaultMessage: 'id does not exist',
            }),
          );
          return;
        }

        const response = await updateDataSource(currentRecord.id, payload);

        if (response.code !== 0) {
          message.error(response.message);
          return;
        }
      }

      message.success(
        intl.formatMessage({
          id: 'pages.datasource.modal.message.success',
          defaultMessage: 'Success',
        }),
      );
      handleClose();
      successCallbackRef.current?.();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }

      message.error(error?.message || 'Submit failed');
    }
  };

  const isCreateMode = operateType === 'CREATE';

  return (
    <Modal
      title={
        <div className="datasource-modal-title">
          {intl.formatMessage({
            id:
              operateType === 'EDIT'
                ? 'pages.datasource.modal.title.edit'
                : 'pages.datasource.modal.title.add',
            defaultMessage: operateType === 'EDIT' ? 'Edit' : 'Add',
          })}
          &nbsp;[
          <DatabaseIcons dbType={selectedDbType} width="20" height="20" />
          {selectedDbType}]&nbsp;
          {intl.formatMessage({
            id: 'pages.datasource.common.title',
            defaultMessage: 'Data Source',
          })}
        </div>
      }
      width={900}
      open={open}
      centered
      maskClosable={false}
      onCancel={handleClose}
      destroyOnClose
      footer={
        <div className="datasource-modal-footer">
          {showFormStep ? (
            <>
              {isCreateMode && (
                <Button size="small" onClick={handleBackToTypeSelection}>
                  {intl.formatMessage({
                    id: 'pages.datasource.modal.button.lastStep',
                    defaultMessage: 'Last step',
                  })}
                </Button>
              )}

              <Button type="primary" size="small" onClick={handleTestConnection}>
                {intl.formatMessage({
                  id: 'pages.datasource.modal.button.connTest',
                  defaultMessage: 'Connection Test',
                })}
              </Button>

              <Button type="primary" size="small" onClick={handleSubmit}>
                {intl.formatMessage({
                  id: 'pages.datasource.modal.button.finish',
                  defaultMessage: 'Finish',
                })}
              </Button>
            </>
          ) : (
            <Button size="small" onClick={handleClose}>
              {intl.formatMessage({
                id: 'pages.datasource.modal.button.cancel',
                defaultMessage: 'Cancel',
              })}
            </Button>
          )}
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
        <div className="datasource-modal-selector-wrapper">
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