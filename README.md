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



## 错误处理

### 网络异常错误

```typescript
request.onerror = function () {
  reject("net::ERR_INTERNET_DISCONNECTED");
};
```

> 可以通过`onerror`监控网络产生的异常。

### 超时处理

```typescript
export interface AxiosRequestConfig {
  // ...
  timeout?: number; // 增加超时时间
}
```

**请求参数**

```typescript
const requestConfig: AxiosRequestConfig = {
  method: "post",
  url: baseURL + "/post_timeout?timeout=3000", // 3s后返回结果
  data: person,
  headers: {
    "content-type": "application/json",
  },
  timeout: 1000, // 1s后就超时
};
```

**设置超时时间**

```typescript
// axios/Axios.ts

if (timeout) {
  request.timeout = timeout;
  request.ontimeout = function () {
    reject(`Error: timeout of ${timeout}ms exceeded`);
  };
}
```

### 状态码错误



**请求参数**

```typescript
const requestConfig: AxiosRequestConfig = {
  method: "post",
  url: baseURL + "/post_status?code=401", // 3s后返回结果
  data: person,
  headers: {
    "content-type": "application/json",
  },
};
```

**设置错误信息**

```typescript
request.onreadystatechange = function () {
  if (request.readyState === 4 && request.status !== 0) {
    if (request.status >= 200 && request.status < 300) {
      // ...
    } else {
      reject(`Error: Request faild with status code ${request.status}`);
    }
  }
};
```



## 拦截器

```typescript
const requestConfig: AxiosRequestConfig = {
  url: baseURL + "/post",
  method: "post",
  data: person,
  headers: {
    "Content-Type": "application/json",
    name: "", // 用来交给拦截器来做处理
  },
};
```

### 拦截器执行顺序

请求拦截器是倒序执行的，先放入的拦截器最后执行

```typescript
// 请求拦截器
const request = axios.interceptors.request.use(
  (config) => {
    config.headers.name += "a";
    return config;
  },
  (err) => Promise.reject(err)
);

axios.interceptors.request.use((config) => {
  config.headers.name += "b";
  return config;
});

axios.interceptors.request.use((config) => {
  config.headers.name += "c";
  return config;
});

axios.interceptors.request.eject(request); // 放入的可以抛出来
```



响应拦截器是正序执行的，先放入的拦截器先执行

```typescript
// 响应拦截器
const response = axios.interceptors.response.use((response) => {
  response.data.name += "a";
  return response;
});

axios.interceptors.response.use((response) => {
  response.data.name += "b";
  return response;
});

axios.interceptors.response.use((response) => {
  response.data.name += "c";
  return response;
});

axios.interceptors.response.eject(response);
```

> 具体的可以参考代码 src/example/interceptors.ts



### 拦截器 promise 写法

```typescript
axios.interceptors.request.use((config) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      config.headers!.name += "c";
      resolve(config);
    }, 1000);
  });
  return Promise.reject("失败了");
});
```



### 拦截器类型定义

```typescript
// 强制将headers属性进行重写，变为非可选
export interface InternalAxiosRequestConfig extends AxiosRequestConfig {
  headers: Record<string, any>;
}

export interface AxiosInstance {
  <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  
  interceptors: {
    request: AxiosInterceptorManager<InternalAxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
}

```



### AxiosInterceptorManager 实现

```typescript
type OnFufilled<V> = (value: V) => V | Promise<V>;
type OnRejected = (error: any) => any;

export interface Interceptor<V> {
  onFulfilled?: OnFufilled<V>;
  onRejected?: OnRejected;
}

class AxiosInterceptorManager<V> {
  public interceptors: Array<Interceptor<V> | null> = [];

  use(onFulfilled?: OnFufilled<V>, onRejected?: OnRejected): number {
    this.interceptors.push({
      onFulfilled,
      onRejected,
    });

    return this.interceptors.length - 1;
  }
  eject(id: number) {
    if (this.interceptors[id]) {
      this.interceptors[id] = null;
    }
  }
}

export default AxiosInterceptorManager;
```



### 拦截器执行原理

给Axios的实例增加 intercetpors, 并不是request方法

```typescript
class Axios {
  public interceptors = {
    request: new AxiosInterceptorManager<InternalAxiosRequestConfig>(),
    response: new AxiosInterceptorManager<AxiosResponse>(),
  };
}
```



将实例属性合并到request中

```typescript
function createInstance() {
  // 1.创建axios实例
  const context = new Axios();
  // 2.获取request方法，并且绑定this
  let instance = Axios.prototype.request.bind(context);
  // 3.将实例属性合并到request中
  instance = Object.assign(instance, context);

  return instance as AxiosInstance;
}
```



构建执行链

```typescript
class Axios {
  public interceptors = {
    request: new AxiosInterceptorManager<InternalAxiosRequestConfig>(),
    response: new AxiosInterceptorManager<AxiosResponse>(),
  };

  request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // 1、对配置进行合并
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
			// ... 
    });
  }
}
```

