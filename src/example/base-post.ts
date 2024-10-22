// import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import axios, { AxiosRequestConfig, AxiosResponse } from "../axios";

const baseURL = "http://localhost:8080";

// 1.定义”传递数据“和”返回数据“的接口
interface Person {
  name: string;
  age: number;
}

const person: Person = { name: "dahuang", age: 30 };

// 2.配置请求参数
const requestConfig: AxiosRequestConfig = {
  method: "post",
  url: baseURL + "/post",
  data: person,
  headers: {
    "Content-Type": "application/json",
  },
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
