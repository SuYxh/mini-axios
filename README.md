# Mini-axios

> axios 核心实现



## 启动 server

```
pnpm express
```



## 基本使用

```typescript
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
// import axios, { AxiosRequestConfig, AxiosResponse } from "../axios";

const baseURL = "http://localhost:8080";

// 1.定义”传递数据“和”返回数据“的接口
interface Person {
  name: string;
  age: number;
}

const person: Person = { name: "dahuang", age: 30 };

// 2.配置请求参数
const requestConfig: AxiosRequestConfig = {
  method: "get",
  url: baseURL + "/get",
  params: person,
};

// 3.发送请求，并且限制接口返回值类型
axios(requestConfig)
  .then((response: AxiosResponse) => {
    console.log("result", response.data);
    return response.data;
  })
  .catch((error: any) => {
    console.log('出错啦', error);
  });
```



## 创建 axios 基本结构

**axios/index.ts**

```typescript
class Axios {
  request(config: any) {
    return new Promise<any>((resolve, reject) => {
      resolve({} as any);
    });
  }
}

function createInstance() {
  // 1.创建axios实例
  const context = new Axios();
  // 2.获取request方法，并且绑定this
  const instance = Axios.prototype.request.bind(context);
  return instance;
}

// 我们真实调用的就是axios.request方法
const axios = createInstance();

export default axios;
```

> 为了编写代码方便，我们将 Axios 类单独拿出去定义

**axios/Axios.ts**

```typescript
class Axios {
  request(config: any) {
    return new Promise<any>((resolve, reject) => {
      resolve({} as any);
    });
  }
}

export default Axios;
```

## 创建请求及响应类型

**axios/types.ts**

### AxiosRequestConfig

```typescript
export type Methods =
  | "get"
  | "GET"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "delete"
  | "DELETE"
  | "options"
  | "OPTIONS";

export interface AxiosRequestConfig {
  url?: string;
  method?: Methods;
  params?: any;
}
```

### AxiosResponse

```typescript
export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, any>;
  config: AxiosRequestConfig;
  request?: XMLHttpRequest;
}
```

> 在入口文件中导出所有类型  `export * from "./types";`





## 编写请求方法

### 编写 request 类型

```typescript
// 用于描述 request 方法
export interface AxiosInstance {
  <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}
```



axios/index.ts:

```typescript
const instance: AxiosInstance = Axios.prototype.request.bind(context);
```

### 编写请求逻辑

```typescript
import { AxiosRequestConfig, AxiosResponse } from "./types";
import qs from "qs";
import parseHeader from "parse-headers";

class Axios {
  request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // 1、对配置进行合并
    // 2、拦截器
    // 3、发送请求
    return this.dipsatchRequest(config);
  }
  
  dipsatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return new Promise(function (resolve, reject) {
      let { method, url, params } = config;
      const request = new XMLHttpRequest();

      // get请求参数
      if (params) {
        if (typeof params === "object") {
          params = qs.stringify(params);
        }
        url += (url!.indexOf("?") > -1 ? "&" : "?") + params;
      }
      
      request.open(method!, url!, true);

      request.responseType = "json";
      
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status !== 0) {
          if (request.status >= 200 && request.status < 300) {
            let response: AxiosResponse<T> = {
              data: request.response ? request.response : request.responseText,
              status: request.status,
              statusText: request.statusText,
              headers: parseHeader(request.getAllResponseHeaders()),
              config,
              request,
            };
            resolve(response);
          } else {
            reject("请求失败~~~");
          }
        }
      };
      request.send();
    });
  }
}
export default Axios;
```

## 处理 Post 请求

### 请求参数

```typescript
const requestConfig: AxiosRequestConfig = {
  method: "post",
  url: baseURL + "/post",
  data: person,
  headers: {
    "content-type": "application/json",
  },
};
```

### 修改接口类型

```typescript
export interface AxiosRequestConfig {
  url?: string;
  method?: Methods;
  params?: any;
  headers?: Record<string, any>;
  data?: any;
}
```

### 修改发送逻辑

```typescript
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
```

