import { Button, message, Modal } from 'antd';
import styles from './index.less';

import { useForm } from 'antd/es/form/Form';
import { useEffect, useRef, useState } from 'react';
import AddAndEditModal from './AddAndEditModal';
import BottomActionBar from './BottomActionBar';
import DataSourceTable from './DataSourceTable';
import PageHeader from './PageHeader';
import SearchForm from './SearchForm';
import { AddOrEditModalRef, DataSource, dataSourceApi, Operate } from './type';
import { PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';

const { confirm } = Modal;

const Index = () => {
  const intl = useIntl();

  const [dataSourceList, setDataSourceList] = useState<DataSource[]>([]);
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>();
  const ref = useRef<AddOrEditModalRef>(null);
  const [form] = useForm();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const hasSelected = selectedRowKeys.length > 0;

  const fetchDataSourceData = async (data?: any) => {
    setLoading(true);
    const result = await dataSourceApi.page(data);
    if (result.code === 0) {
      setDataSourceList(result?.data?.bizData || []);
      setPagination(result?.data?.pagination || {});
    }
    setLoading(false);
  };

  const onSearch = (params: any) => {
    fetchDataSourceData({ ...params });
  };

  useEffect(() => {
    fetchDataSourceData({ ...pagination });
  }, []);

  const cbk = () => {
    fetchDataSourceData({ ...pagination });
  };

  const createDataSource = () => {
    ref.current?.setVisible(
      true,
      Operate.Add,
      {},
      cbk,
      intl.formatMessage({
        id: 'pages.datasource.common.title',
        defaultMessage: 'Data Source',
      }),
    );
  };

  const editDataSource = (data: DataSource) => {
    ref.current?.setVisible(
      true,
      Operate.Edit,
      data,
      cbk,
      intl.formatMessage({
        id: 'pages.datasource.common.title',
        defaultMessage: 'Data Source',
      }),
    );
  };

  const batchConnectTest = () => {
    dataSourceApi.batchConnectTest(selectedRowKeys).then((data) => {
      if (data?.code === 0) {
        message.success(
          intl.formatMessage({
            id: 'pages.datasource.message.connectSuccess',
            defaultMessage: 'Connected Success',
          }),
        );
        cbk();
      } else {
        message.error(data?.message);
      }
    });
  };

  const batchDeleteTest = () => {
    dataSourceApi.batchDelete(selectedRowKeys).then((data) => {
      if (data?.code === 0) {
        // 你这里原来写的是 "Unknow Error"，我保持原样只是做了 i18n
        message.success(
          intl.formatMessage({
            id: 'pages.datasource.message.unknownError',
            defaultMessage: 'Unknow Error',
          }),
        );
        cbk();
      } else {
        message.error(data?.message);
      }
    });
  };

  const handleDeleteDataSource = async (record: DataSource) => {
    confirm({
      title: intl.formatMessage({
        id: 'pages.datasource.delete.confirmTitle',
        defaultMessage: 'Are you sure you want to delete it ?',
      }),
      centered: true,
      content: (
        <span>
          {intl.formatMessage(
            {
              id: 'pages.datasource.delete.confirmContentLine1',
              defaultMessage: 'Are you sure you delete datasource [{name}] ?',
            },
            {
              name: <span style={{ color: 'orange' }}>{record.name}</span>,
            },
          )}
          <br />
          {intl.formatMessage({
            id: 'pages.datasource.delete.confirmContentLine2',
            defaultMessage:
              'Once a data source is deleted, it cannot be recovered. Please proceed with caution.',
          })}
        </span>
      ),
      okText: intl.formatMessage({
        id: 'pages.datasource.delete.okText',
        defaultMessage: 'Delete',
      }),
      okType: 'primary',
      okButtonProps: {
        size: 'small',
        danger: true,
      },
      cancelButtonProps: {
        size: 'small',
      },
      maskClosable: true,
      onOk() {
        if (record?.id) {
          doDeleteDataSource(record?.id);
        } else {
          message.error(
            intl.formatMessage({
              id: 'pages.datasource.message.idNotExist',
              defaultMessage: 'id does not exist',
            }),
          );
        }
      },
    });
  };

  const doDeleteDataSource = async (id: string) => {
    const response = await dataSourceApi.delete(id);
    if (response.code === 0) {
      message.success(response.message);
      fetchDataSourceData({ ...pagination });
    } else {
      message.error(response.message);
    }
  };

  const onChange = (page: number, pageSize: number) => {
    fetchDataSourceData({
      pageSize: pageSize,
      pageNo: page,
    });
  };

  return (
    <>
      <div>
        <>
          <PageHeader />
          <div className={styles.commonWrapper}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <Button
                  size="small"
                  style={{
                    width: 70,
                    marginRight: 24,
                    padding: '8px 2px',
                    lineHeight: '16px',
                  }}
                  type="primary"
                  onClick={() => {
                    createDataSource();
                  }}
                  icon={<PlusOutlined />}
                >
                  {intl.formatMessage({
                    id: 'pages.datasource.button.add',
                    defaultMessage: 'Add',
                  })}
                </Button>
              </div>
              <div>
                <SearchForm form={form} onSearch={onSearch} />
              </div>
            </div>

            <DataSourceTable
              dataSourceList={dataSourceList}
              loading={loading}
              handleDeleteDataSource={handleDeleteDataSource}
              editDataSource={editDataSource}
              setSelectedRowKeys={setSelectedRowKeys}
              selectedRowKeys={selectedRowKeys}
              cbk={cbk}
            />
          </div>
        </>
      </div>

      <BottomActionBar
        pagination={pagination}
        disabled={!hasSelected}
        batchConnectTest={batchConnectTest}
        batchDeleteTest={batchDeleteTest}
        onChange={onChange}
      />

      <AddAndEditModal
        ref={ref}
        setVisible={function (
          status: boolean,
          type: Operate,
          content: any,
          cbk: () => void,
          title: string,
        ): void {
          throw new Error('Function not implemented.');
        }}
      />
    </>
  );
};

export default Index;