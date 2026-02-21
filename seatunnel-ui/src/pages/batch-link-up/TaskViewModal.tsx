import { Modal, Splitter } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import './sumary.less';
import TaskDetailPanel from './TaskDetailPanel';
import TaskHistoryPanel from './TaskHistoryPanel';

interface CreateModalProps {
  onCreate?: (values: any) => void;
}

const TaskViewModal = forwardRef(({}: CreateModalProps, ref) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [instanceItem, setInstanceItem] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const callback = useRef(() => {
    return;
  });

  const onClose = () => {
    setVisible(false);
    setInstanceItem({});
    setSelectedItem(null);
  };

  const onOpen = (status: boolean, record: any, cbk: () => void) => {
    setVisible(status);
    setSelectedItem(record);
    callback.current = cbk;
  };

  useImperativeHandle(ref, () => ({
    onOpen,
  }));



  return (
    <Modal
      title={<></>}
      open={visible}
      onCancel={onClose}
      maskStyle={{ background: '#f2f4f7f2' }}
      destroyOnClose
      className="custom-modal"
      maskClosable={false}
      style={{ top: 10 }}
      width="99vw"
      footer={null}
    >
      <div style={{ height: 'calc(100vh - 43px)', padding: 16 }}>
        <div style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>Run History</div>
        <Splitter style={{ height: 'calc(100% - 43px)', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel defaultSize="20%" min="20%" max="70%">
            <TaskHistoryPanel
              selectedItem={selectedItem}
              statusFilter={statusFilter}
              onItemSelect={setSelectedItem}
              onStatusFilterChange={setStatusFilter}
              setInstanceItem={setInstanceItem}
              instanceItem={instanceItem}
            />
          </Splitter.Panel>
          <Splitter.Panel>
            <TaskDetailPanel instanceItem={instanceItem} />
          </Splitter.Panel>
        </Splitter>
      </div>
    </Modal>
  );
});

export default TaskViewModal;
