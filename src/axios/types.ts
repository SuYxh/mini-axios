import AxiosInterceptorManager from "./AxiosInterceptorManager";
import { CancelTokenStatic, isCancel } from "./CancelToken";

export type Methods =
  | "get"
  | "Get"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "delete"
  | "DELETE";

export type CancelToken = ReturnType<CancelTokenStatic['source']>['token']

// 请求配置
export interface AxiosRequestConfig {
  url?: string;
  method?: Methods;
  params?: any;
  data?: any;
  headers?: Record<string, any>;
  timeout?: number;
  cancelToken?: CancelToken;

}

// 响应的类型
export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, any>;
  config: AxiosRequestConfig;
  request: XMLHttpRequest;
}

export interface InternalAxiosRequestConfig extends AxiosRequestConfig {
  headers: Record<string, any>;
}

export interface AxiosInstance {
  <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>; 

  interceptors: {
    request: AxiosInterceptorManager<InternalAxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };

  CancelToken: CancelTokenStatic;
  isCancel: typeof isCancel;
}
