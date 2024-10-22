import { AxiosRequestConfig, AxiosResponse } from "./types";

class Axios {
  request(config: AxiosRequestConfig) {
    return new Promise<AxiosResponse>((resolve, reject) => {
      resolve({} as AxiosResponse);
    });
  }
}

export default Axios;
