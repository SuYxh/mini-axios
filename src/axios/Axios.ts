import qs from "qs";
import parseHeader from "parse-headers";
import { AxiosRequestConfig, AxiosResponse } from "./types";

class Axios {
  request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // 1、对配置进行合并
    // 2、拦截器
    // 3、发送请求
    return this.dispatchRequest(config);
  }

  dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      let { url, method, params, data, headers } = config

      // 创建xhr对象
      const request = new XMLHttpRequest()

      if (params) {
        if (typeof params === 'object') {
          params = qs.stringify(params)
        }
        url += (url?.includes('?') ? '&' : '?') + params
      }

      request.open(method!, url!, true);

      if (headers) {
        for (let key in headers) {
          request.setRequestHeader(key, headers[key]);
        }
      }

      // 设置为 "json" 会使得 response 直接是一个 JavaScript 对象，而不需要手动解析 JSON 字符串
      request.responseType = "json";
      request.onreadystatechange = function() {
        // 请求发送成功了， status为0 表示请求未发送，请求（网络）异常
        if (request.readyState === 4 && request.status !== 0) {
          // 请求成功
          if (request.status >= 200 && request.status < 300) {
            const response: AxiosResponse = {
              data: request.response || request.responseText,
              status: request.status,
              statusText: request.statusText,
              headers: parseHeader(request.getAllResponseHeaders()),
              config,
              request
            }
            resolve(response)
          }
        }
      }

      let requestBody: null | string = null 

      if (data) {
        requestBody = JSON.stringify(data)
      }

      request.send(requestBody)
    });
  }
}

export default Axios;
