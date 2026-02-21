
import HttpUtils from '@/utils/HttpUtils';
import { FormInstance, TablePaginationConfig } from 'antd';
import { Key } from 'antd/es/table/interface';

export enum Operate {
    Add,
    Edit,
}

export interface SeatunnelJobDefinition {
    id?: any;
    jobName?: any;
    jobDesc?: any;
    jobDefinitionInfo?: any;
    jobVersion?: any;
    clientId?: any;
    clientType?: any;
    createTime?: any;
    updateTime?: any;
}



export const apiPrefix = "/api/v1/job/stream-definition"

export const seatunnelStreamJobDefinitionApi = {

    create: (data: any) => {
        return HttpUtils.post(apiPrefix, data);
    },


    selectById: (id: string): Promise<{ code: number; data: SeatunnelJobDefinition; message?: string }> => {
        return HttpUtils.get(`${apiPrefix}/${id}`);
    },



    update: (id: any, data: any) => {
        return HttpUtils.put(`${apiPrefix}/${id}`, data);
    },


    delete: (id: string) => {
        return HttpUtils.delete(`${apiPrefix}/${id}`);
    },


    page: (data: any): Promise<{ code: number; data: any; message?: string }> => {
        return HttpUtils.post(`${apiPrefix}/page`, data);
    },

    hocon: (data: any) => {
        return HttpUtils.post(`${apiPrefix}/hocon`, data);
    },
};



export const executeApiPrefix = "/api/v1/executor"

export const seatunnelJobExecuteApi = {

    execute: (jobDefineId: any) => {
        return HttpUtils.get(executeApiPrefix + "/execute?jobDefineId=" + jobDefineId);
    },

    executeadHoc: (data: any): Promise<{ code: number; data: any; message?: string }>  => {
        return HttpUtils.post(executeApiPrefix + "/execute/ad-hoc", data);
        
    },
};