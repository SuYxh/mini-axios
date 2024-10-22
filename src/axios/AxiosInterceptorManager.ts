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
