import qs from "qs";
import parseHeader from "parse-headers";
import {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  Methods
} from "./types";
import AxiosInterceptorManager, {
  Interceptor,
} from "./AxiosInterceptorManager";
import mergeConfig from "./mergeConfig";

class Axios {
  public defaults: AxiosRequestConfig = {
    method: 'get',
    timeout: 0,
    headers: {
      common: {
        accept: "application/json",
      },
    },
  }
  public interceptors = {
    request: new AxiosInterceptorManager<InternalAxiosRequestConfig>(),
    response: new AxiosInterceptorManager<AxiosResponse>(),
  };

  request<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // 1、对配置进行合并
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }

    config = mergeConfig(this.defaults, config)

    config.method = config.method!.toLowerCase() as Methods

    // 2、拦截器
    // chain 的数组，用于存储拦截器和最终的请求处理函数。
    // 这个数组的初始元素是一个对象，包含了 onFulfilled 方法指向 this.dispatchRequest（即发送真正的网络请求的函数），onRejected 为 undefined（因为在这里没有定义请求失败的处理逻辑）。
    const chain: (Interceptor<InternalAxiosRequestConfig> | Interceptor<AxiosResponse>)[] = [{ onFulfilled: this.dispatchRequest, onRejected: undefined }];

    // 遍历所有注册的请求拦截器，并使用 unshift 方法将它们添加到 chain 数组的前面。这样做的目的是确保请求拦截器在请求发送前按照注册的逆序执行（后注册的先执行）。

    this.interceptors.request.interceptors.forEach((interceptor) => {
      interceptor && chain.unshift(interceptor);
    });

    // 遍历所有注册的响应拦截器，并使用 push 方法将它们添加到 chain 数组的后面。这样做的目的是确保响应拦截器在请求发送后按照注册的顺序执行（先注册的先执行）。
    this.interceptors.response.interceptors.forEach((interceptor) => {
      interceptor && chain.push(interceptor);
    });

    // 初始化一个 Promise 对象 promise，其初始值为请求配置对象 config。这个 Promise 对象用于逐个执行 chain 数组中的拦截器和请求处理函数。
    let promise: Promise<AxiosRequestConfig | AxiosResponse> =
      Promise.resolve(config); // 我们构建一个每次执行后返回的promise

    // 构建 Promise 链，通过promise链将所有的拦截器放在一起，类似于 Promise.resolve(config).then.then.then
    while (chain.length) {
      // (v:AxiosRequestConfig) => AxiosRequestConfig
      // (v:AxiosResponse) => AxiosResponse

      // AxiosRequestConfig -> AxiosResponse
      // AxiosResponse -> AxiosRequestConfig
      const { onFulfilled, onRejected } = chain.shift()!;

      promise = promise.then(
        // 这个取出来的可能是请求拦截器, 也可能是响应拦截器
        onFulfilled as (v: AxiosRequestConfig | AxiosResponse) => any,
        onRejected
      );
    }
    return promise as Promise<AxiosResponse<T>>;

    // 3、发送请求
    // return this.dispatchRequest(config);
  }

  dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      let { url, method, params, data, headers, timeout } = config;

      // 创建xhr对象
      const request = new XMLHttpRequest();

      if (params) {
        if (typeof params === "object") {
          params = qs.stringify(params);
        }
        url += (url?.includes("?") ? "&" : "?") + params;
      }

      request.open(method!, url!, true);

      if (headers) {
        for (let key in headers) {
          // 如果是common或是方法 就将对象合并
          if (key === "common" || key === config.method) {
            for (let key2 in headers[key]) {
              request.setRequestHeader(key2, headers[key][key2]);
            }
          } else {
            request.setRequestHeader(key, headers[key]);
          }
        }
      }
      
      // 设置为 "json" 会使得 response 直接是一个 JavaScript 对象，而不需要手动解析 JSON 字符串
      request.responseType = "json";
      request.onreadystatechange = function () {
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
              request,
            };
            resolve(response);
          } else {
            reject(`Error: Request faild with status code ${request.status}`);
          }
        }
      };

      let requestBody: null | string = null;

      if (data) {
        requestBody = JSON.stringify(data);
      }

      if (timeout) {
        request.timeout = timeout;
        request.ontimeout = function () {
          reject(`Error: timeout of ${timeout}ms exceeded`);
        };
      }

      request.onerror = function () {
        reject("net::ERR_INTERNET_DISCONNECTED");
      };

      if (config.cancelToken) {
        config.cancelToken.then((reason) => {
          // 取消请求
          request.abort();

          // 将取消的原因传递给 reject 函数
          reject(reason);
        });
      }

      request.send(requestBody);
    });
  }
}

export default Axios;
