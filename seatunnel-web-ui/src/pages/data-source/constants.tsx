import React from 'react';
import {
  BugFilled,
  CheckCircleFilled,
  SafetyCertificateFilled,
} from '@ant-design/icons';
import type { DataSourceGroup, DataSourceOptionItem } from './types';

export const PAGE_DEFAULT_PAGINATION = {
  pageNo: 1,
  pageSize: 10,
  total: 0,
};

export const COMMON_DB_OPTIONS: DataSourceOptionItem[] = [
  { label: 'MYSQL', value: 'MYSQL' },
  { label: 'ORACLE', value: 'ORACLE' },
  { label: 'PGSQL', value: 'PGSQL' },
];

export const ENVIRONMENT_OPTIONS: DataSourceOptionItem[] = [
  { label: 'DEVELOP', value: 'DEVELOP' },
  { label: 'TEST', value: 'TEST' },
  { label: 'PROD', value: 'PROD' },
];

export const dataSourceGroupList: DataSourceGroup[] = [
  {
    groupName: '关系型数据库',
    datasourceList: [
      {
        onlyDiScript: false,
        dbType: 'MYSQL',
        type: 'MYSQL',
        connectorType: 'Jdbc',
      },
      {
        onlyDiScript: false,
        dbType: 'ORACLE',
        type: 'ORACLE',
        connectorType: 'Jdbc',
      },
      {
        onlyDiScript: false,
        dbType: 'PGSQL',
        type: 'PGSQL',
        connectorType: 'Jdbc',
      },
    ],
  },
];

export const environmentTagConfigMap: Record<
  string,
  {
    text: string;
    color: string;
    backgroundColor: string;
    icon: React.ReactNode;
  }
> = {
  PROD: {
    text: '生产',
    color: '#ff4d4f',
    backgroundColor: '#fff2f0',
    icon: <SafetyCertificateFilled />,
  },
  TEST: {
    text: '测试',
    color: '#52c41a',
    backgroundColor: '#f6ffed',
    icon: <CheckCircleFilled />,
  },
  DEVELOP: {
    text: '开发',
    color: '#1677ff',
    backgroundColor: '#e6f4ff',
    icon: <BugFilled />,
  },
};

export const PAGE_ANIMATION = {
  fadeUp: {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
  sectionStagger: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.06,
      },
    },
  },
  cardStagger: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  },
};