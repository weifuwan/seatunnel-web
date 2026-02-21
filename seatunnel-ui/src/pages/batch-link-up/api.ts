
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



export const apiPrefix = "/api/v1/job/batch-definition"

export const seatunnelJobDefinitionApi = {

    saveOrUpdate: (data: any) => {
        return HttpUtils.post(apiPrefix, data);
    },


    selectById: (id: string): Promise<{ code: number; data: SeatunnelJobDefinition; message?: string }> => {
        return HttpUtils.get(`${apiPrefix}/${id}`);
    },

    getUniqueId: (): Promise<{ code: number; data: SeatunnelJobDefinition; message?: string }> => {
        return HttpUtils.get(`${apiPrefix}/get-unique-id`);
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

    executeadHoc: (data: any) => {
        return HttpUtils.post(executeApiPrefix + "/execute/ad-hoc", data);

    },
};

export const instanceApiPrefix = "/api/v1/job/batch-instance"

export const seatunnelJobInstanceApi = {

    page: (data: any): Promise<{ code: number; data: any; message?: string }> => {
        return HttpUtils.post(`${instanceApiPrefix}/page`, data);
    },

    selectById: (id: string): Promise<{ code: number; data: any; message?: string }> => {
        return HttpUtils.get(`${instanceApiPrefix}/${id}`);
    },

    getLog(instanceId: string) {
        return HttpUtils.get(`${instanceApiPrefix}/${instanceId}/log`);
    },
};

export const seatunnelJobScheduleApiPrefix = "/api/v1/job/schedule"

export const seatunnelJobScheduleApi = {
    getLast5ExecutionTimes: (cron: string) => {
        return HttpUtils.get<any[]>(`${seatunnelJobScheduleApiPrefix}/last5-execution-times?cron=` + cron);
    },

    stopSchedule: (jobScheduleId: string) => {
        return HttpUtils.get<any[]>(`${seatunnelJobScheduleApiPrefix}/stop-schedule?scheduleId=` + jobScheduleId);
    },

    startSchedule: (jobScheduleId: string) => {
        return HttpUtils.get<any[]>(`${seatunnelJobScheduleApiPrefix}/start-schedule?scheduleId=` + jobScheduleId);
    
    }
}