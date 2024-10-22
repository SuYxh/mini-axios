
export type Methods =
  | "get"
  | "Get"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "delete"
  | "DELETE";

// 请求配置
export interface AxiosRequestConfig {
  url?: string;
  method?: Methods;
  params?: any;
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

export interface AxiosInstance {
  <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>; 
}
