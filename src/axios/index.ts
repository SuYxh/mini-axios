import Axios from "./Axios";
import { AxiosInstance } from './types'

function createInstance() {
  // 1.创建axios实例
  const context = new Axios();
  // 2.获取request方法，并且绑定this
  let instance = Axios.prototype.request.bind(context);
  
  instance = Object.assign(instance, context);

  return instance as AxiosInstance;
}

// 我们真实调用的就是axios.request方法
const axios = createInstance();

export default axios;

// 导出所有类型
export * from "./types";