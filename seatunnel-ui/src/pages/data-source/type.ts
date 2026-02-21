
import HttpUtils from '@/utils/HttpUtils';
import { FormInstance, TablePaginationConfig } from 'antd';
import { Key } from 'antd/es/table/interface';

export enum Operate {
    Add,
    Edit,
}

export interface DataSource {
    id?: string;
    dbName?: string;
    enShortName?: string;
    enName?: string;
    cnName?: string;
    dbType?: string;
    remark?: string;
    leaf?: boolean;
    submit?: boolean;
    parentId?: string;
    reviewer?: string;
    createBy?: string;
    createTime?: string;
    updateBy?: string;
    updateTime?: string;
    currentVersion?: number;
    originalJson?: string;
}

export interface AddOrEditModalRef {
    setVisible: (
        status: boolean,
        type: Operate,
        content: any,
        cbk: () => void,
        title: string,
    ) => void;
}

// 表单字段配置类型
export interface FormField {
    key: string;
    label: string;
    type: 'INPUT' | 'PASSWORD' | 'SELECT' | 'NUMBER' | 'SWITCH' | 'TEXTAREA' | 'CUSTOM_SELECT';
    placeholder?: string;
    options?: Array<{ label: string; value: string | number }>;
    defaultValue?: any;
    rules?: FormRule[];
}

// 验证规则类型
export interface FormRule {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
    message: string;
}

// API响应类型
export interface ApiResponse {
    code: number;
    data: {
        formFields: FormField[];
    };
}

// 组件Props类型
export interface DynamicDataSourceFormProps {
    dbType: string;
    form: any;
    configForm: any;
    operateType: Operate;
}

// 提交的数据类型
export interface DataSourceValues {
    pluginType: string;
    alias: string;
    environmentId: number;
    [key: string]: any;
}


export const apiPrefix = "/api/v1/data-source"

export const dataSourceApi = {


    // 获取数据源详情
    selectById: (id: string): Promise<{ code: number; data: DataSource; message?: string }> => {
        return HttpUtils.get(`${apiPrefix}/${id}`);
    },

    // 新增数据源
    create: (data: any) => {
        return HttpUtils.post(apiPrefix, data);
    },

    // 更新数据源
    update: (id: string, data: any) => {
        return HttpUtils.put(`${apiPrefix}/${id}`, data);
    },

    // 删除数据源
    delete: (id: string) => {
        return HttpUtils.delete(`${apiPrefix}/${id}`);
    },

    // 测试数据源连接
    connectTest: (id: string) => {
        return HttpUtils.get(`${apiPrefix}/${id}/connect-test`);
    },

    connectionTestWithParam: (data: any) => {
        return HttpUtils.post(`${apiPrefix}/connect-test-with-param`, data);
    },

    // 分页查询数据源
    page: (data: any): Promise<{ code: number; data: any; message?: string }> => {
        return HttpUtils.post(`${apiPrefix}/page`, data);
    },

    // 查询数据源所有数据
    all: () => {
        return HttpUtils.get(`${apiPrefix}/all`);
    },
    // 根据类型查询数据源数据
    option: (dbType: string): Promise<{ code: number; data: any[]; message?: string }> => {
        return HttpUtils.get(`${apiPrefix}/option?dbType=` + dbType);
    },

    batchDelete: (data: any): Promise<{ code: number; data: any; message?: string }> => {
        return HttpUtils.delete(`${apiPrefix}/batch`, data);
    },

    batchConnectTest: (data: any): Promise<{ code: number; data: any[]; message?: string }> => {
        return HttpUtils.post(`${apiPrefix}/batch-connect-test`, data);
    },
};

export const apiPrefixCatalog = "/api/v1/data-source/catalog"

export const dataSourceCatalogApi = {

    listTable: (id: string): Promise<{ code: number; data: any; message?: string }> => {
        return HttpUtils.get(`${apiPrefixCatalog}/list/${id}`);
    },

    listTableReference: (id: string, matchMode: any, keyword: any): Promise<{ code: number; data: any[]; message?: string }> => {
        return HttpUtils.get(`${apiPrefixCatalog}/listByMatchMode/${id}?matchMode=${matchMode}&keyword=${keyword}`);
    },

    count: (datasourceId: string, requestBody: any): Promise<{ code: number; data: number; message?: string }> => {
        return HttpUtils.post(`${apiPrefixCatalog}/count/${datasourceId}`, requestBody);
    },

    listColumn: (id: string, requestBody: any): Promise<{ code: number; data: any[]; message?: string }> => {
        return HttpUtils.post(`${apiPrefixCatalog}/column/${id}`, requestBody);
    },

    getTop20Data: (datasourceId: string, requestBody: any): Promise<{ code: number; data: any[]; message?: string }> => {
        return HttpUtils.post(`${apiPrefixCatalog}/getTop20Data/${datasourceId}`, requestBody);
    },

};