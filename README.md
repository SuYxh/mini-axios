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