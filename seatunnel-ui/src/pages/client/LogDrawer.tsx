import { forwardRef, useImperativeHandle, useState } from 'react';

import { Drawer } from 'antd';


import './index.less';

const LogDrawer = forwardRef((_, ref) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [content, setContent] = useState<any>({});

  useImperativeHandle(ref, () => ({
    setVisible: (status: boolean, content: any) => {
      setContent(content);
      setVisible(status);
    },
  }));

  return (
    <Drawer
      title="查看日志"
      visible={visible}
      // maskClosable={false}
      onClose={() => {
        setVisible(false);
      }}
      height="73vh"
      // destroyOnClose
      placement="bottom"
    >
      <div>
        
      </div>
    </Drawer>
  );
});

export default LogDrawer;
