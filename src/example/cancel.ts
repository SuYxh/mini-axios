import { CancelToken } from "../axios/types";
import axios, { AxiosRequestConfig, AxiosResponse } from "../axios";

const baseURL = "http://localhost:8080";

// 1. 创建取消令牌
// 使用 axios.CancelToken.source() 方法创建一个取消令牌源。这个方法返回一个包含 token 和 cancel 方法的对象。
// token 用于将取消功能关联到特定的请求，而 cancel 方法用于触发取消操作。
const CancelToken = axios.CancelToken;
const source = CancelToken.source()

// 发送get请求和post请求
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
  },
  // 2.配置请求与取消令牌关联
  // 在配置 Axios 请求时，将 token 作为请求配置的一部分传递给 Axios。这样，这个请求就与生成的取消令牌关联起来了。
  cancelToken: source.token,
};

axios(requestConfig)
  .then((response: AxiosResponse<Person>) => {
    console.log(response.data.name);
    return response.data;
  })
  .catch((error: any) => {
    // 判断是否是取消的错误
    if (axios.isCancel(error)) {
      console.log("是取消的错误", error);
    }

    console.log("error", error);
  });

// 3. 取消请求
// 通过调用 source.cancel() 方法取消请求。你可以传递一个字符串参数给 cancel 方法，这个字符串将作为取消请求的原因，这对于调试非常有用。
source.cancel("我不想请求了");


// 思路 
// 1、CancelToken.source() 会创建一个 promise
// 2、axios 请求时，在请求配置中 将配置请求与取消令牌关联 cancelToken: source.token,
// 3、通过调用 source.cancel() 方法取消请求，会让之前的 promise 成功， 
// 4、promise 成功后，会在 dispatchRequest方法 进行 request.abort() 和 reject(reason) ，  reject 后，这里就可以捕获到