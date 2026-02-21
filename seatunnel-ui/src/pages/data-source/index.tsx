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

const { confirm } = Modal;

const Index = () => {
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
    ref.current?.setVisible(true, Operate.Add, {}, cbk, '数据源');
  };

  const editDataSource = (data: DataSource) => {
    ref.current?.setVisible(true, Operate.Edit, data, cbk, '数据源');
  };

  const batchConnectTest = () => {
    dataSourceApi.batchConnectTest(selectedRowKeys).then((data) => {
      if (data?.code === 0) {
        message.success('全部连接成功');
        cbk();
      } else {
        message.error(data?.message);
      }
    });
  };

  const batchDeleteTest = () => {
    dataSourceApi.batchDelete(selectedRowKeys).then((data) => {
      if (data?.code === 0) {
        message.success('败删除成功');
        cbk();
      } else {
        message.error(data?.message);
      }
    });
  };

  const handleDeleteDataSource = async (record: DataSource) => {
    confirm({
      title: '确认要删除么？',
      centered: true,
      content: (
        <span>
          您确定要删除数据源 [{<span style={{ color: 'orange' }}> {record.dbName} </span>}
          ] 吗？ <br />
          数据源一旦删除将无法恢复，请谨慎操作。
        </span>
      ),
      okText: '删除',
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
          message.error('id不存在');
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
                    width: 90,
                    marginRight: 24,
                    padding: '8px 2px',
                    lineHeight: '16px',
                  }}
                  type="primary"
                  onClick={() => {
                    createDataSource();
                  }}
                >
                  新建数据源
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
