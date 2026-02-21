import { Table } from 'antd';
import { useEffect, useState } from 'react';

const DataTable = ({ tableDetail }) => {
 // 固定列宽（根据你的实际需求调整）
 const columnWidth = 150; // 每列固定宽度
  
 // 计算总宽度（列数 * 列宽 + 边距等）
 const tableWidth = tableDetail.columns.length * columnWidth + 32; // 32是预留的边距和滚动条宽度
 
 // 设置滚动配置
 const scrollConfig = {
   x: tableWidth, // 水平滚动宽度
   y: 460        // 固定垂直高度
 };

 // 列配置（每列使用相同宽度）
 const columns = tableDetail.columns.map(column => ({
  title: (
    <div>
      <div>{column.name}</div>
      <div style={{ fontSize: 12, color: '#999' }}>{column.type}</div>
      {column.comment && (
        <div style={{ fontSize: 12, color: '#666' }}>{column.comment}</div>
      )}
    </div>
  ),
   dataIndex: column.name,
   key: column.name,
   width: columnWidth, // 每列固定宽度
   ellipsis: true,     // 超出宽度显示省略号
   render: (text) => {
     if (text === null) return <span style={{ color: '#999' }}>NULL</span>;
     return String(text);
   }
 }));

 

  // 处理 sampleData 数据
  const dataSource = tableDetail?.sampleData.map((row, index) => ({
    ...row,
    key: index, // 为每行数据添加唯一key
  }));

  return (
    <div style={{width: "100%"}}>
      <Table
        columns={columns}
        dataSource={dataSource}
        bordered
        size="middle"
        pagination={false}
        scroll={scrollConfig}
        // scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default DataTable;
