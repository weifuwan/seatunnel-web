
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
    director?: string;
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
}

export interface HistoryItem {
    id: string;
    taskName: string;
    status: any;
    time: string;
    createTime: string;
}

export interface TableInfo {
    sourceDatabase: string;
    sourceTable: string;
    targetTable: string;
    method: string;
    ddl: string;
}

export const apiPrefix = "/api/v1/task-definition"

export const taskDefinitionApi = {

    // 新增任务定义
    create: (data: any) => {
        return HttpUtils.post(apiPrefix, data);
    },

    batch: (data: any) => {
        return HttpUtils.post(apiPrefix + "/batch", data);
    },


    // 分页查询任务定义
    page: (data: any): Promise<{ code: number; data: any; message?: string }> => {
        return HttpUtils.post(`${apiPrefix}/page`, data);
    },

    // 删除任务定义
    delete: (id: string) => {
        return HttpUtils.delete(`${apiPrefix}/${id}`);
    },

    getLast5ExecutionTimes: (id: string) => {
        return HttpUtils.get(`${apiPrefix}/${id}`);
    },

};

export const taskScheduleApiPrefix = "/api/v1/task-schedule"

export const taskScheduleApi = {
    getLast5ExecutionTimes: (cron: string) => {
        return HttpUtils.get<any[]>(`${taskScheduleApiPrefix}/last5-execution-times?cron=` + cron);
    },

    stopSchedule: (taskScheduleId: string) => {
        return HttpUtils.get<any[]>(`${taskScheduleApiPrefix}/stop-schedule?taskScheduleId=` + taskScheduleId);
    },

    startSchedule: (taskScheduleId: string) => {
        return HttpUtils.get<any[]>(`${taskScheduleApiPrefix}/start-schedule?taskScheduleId=` + taskScheduleId);
    },
};


export const apiPrefixExecution = "/api/v1/task-execution"

export const taskExecutionApi = {
    // 新增任务定义
    execute: (definiitionId: string) => {
        return HttpUtils.get(apiPrefixExecution + `/${definiitionId}/execute`);
    },

    batchExecute: (definiitionIds: any[]) => {
        return HttpUtils.post(apiPrefixExecution + `/batch-execute`, definiitionIds);
    },

    cancel: (executionId: string) => {
        return HttpUtils.get(apiPrefixExecution + `/${executionId}/cancel`);
    },

    batchCancel: (definiitionIds: any[]) => {
        return HttpUtils.post(apiPrefixExecution + `/batch-cancel`, definiitionIds);
    },

    get: (executionId: string) => {
        return HttpUtils.get(apiPrefixExecution + `/${executionId}`);
    },

    taskLog: (id: string) => {
        return HttpUtils.get<any>(apiPrefixExecution + `/taskLog/${id}`);
    },


    getExecutionInfo: (id: String): Promise<{ code: number; data: any; message?: string }> => {
        return HttpUtils.get(`${apiPrefixExecution}/execution-info/` + id);
    },
};
