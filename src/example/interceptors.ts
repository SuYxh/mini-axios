import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "../axios";


const baseURL = "http://localhost:8080";

interface Person {
  name: string;
  age: number;
}

const person: Person = { name: "dahuang", age: 30 };

const requestConfig: AxiosRequestConfig = {
  url: baseURL + "/post",
  method: "post",
  data: person,
  headers: {
    "Content-Type": "application/json",
    name: "", // 用来交给拦截器来做处理
  },
};

// 注册请求拦截器 a
let r1 = axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log("请求拦截器 a");
    config.headers.name += "a";
    return config;
  }
);

// 注册请求拦截器 b
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  console.log("请求拦截器 b");
  config.headers.name += "b";
  return config;
});

// 注册请求拦截器 c
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  console.log("请求拦截器 c - 异步");
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      config.headers.name += "c";
      resolve(config); // 我们的拦截可以用promise作为返回值，返回config或者reponse
    }, 1000);
  });
  //   return Promise.reject("配置出错");
});

// 删除请求拦截器 a
axios.interceptors.request.eject(r1);


// 注册响应拦截器 a
axios.interceptors.response.use((response) => {
  console.log("响应拦截器 a");
  response.data.name += "a";
  return response;
});

// 注册响应拦截器 b
let r2 = axios.interceptors.response.use((response) => {
  console.log("响应拦截器 b");
  response.data.name += "b";
  return response;
});

// 注册响应拦截器 c
axios.interceptors.response.use((response) => {
  console.log("响应拦截器 c");
  response.data.name += "c";
  return response;
});

// 删除响应拦截器 b
axios.interceptors.response.eject(r2);


// 注意观察一下拦截器的执行顺序： 请求拦截器，按照写的倒序执行，响应拦截器按照写的顺序执行
// 发送请求
axios(requestConfig)
  .then((response: AxiosResponse<Person>) => {
    console.log('result',response.data.name);
    return response.data;
  })
  .catch((error: any) => {
    console.log("error" + error);
  });