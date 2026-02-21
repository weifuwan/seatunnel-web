
import { ApiResponse } from "./d";
import request from "@/utils/request";

class HttpUtils {
  public static async post<T>(
    url: string,
    body?: Record<string, any>,
    options?: RequestInit
    // headers?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  }

  public static async request<T>(
    url: string,
    method: string,
    body?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  public static async get<T>(
    url: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  }

  public static async put<T>(
    url: string,
    body?: Record<string, any>,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  }

  public static async delete<T>(
    url: string,
    data?: Record<string, any>,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: "DELETE",
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  }

  public static async download(
    url: string,
    options?: Record<string, any>
  ): Promise<{ data: string }> {
    return request(url, {
      method: "GET", // 请求方式
      responseType: 'blob',
      getResponse: true, // 确保获取完整的响应，包括 headers
      // data: body,
      ...(options || {}),
    });
  }
}

export default HttpUtils;
