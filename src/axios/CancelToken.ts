// 此方法是用于判断是不是取消的字符串
export function isCancel(message: any): message is Cancel {
  return message instanceof Cancel;
}

class Cancel {
  constructor(public message: string) {}
}


export class CancelTokenStatic {
  public resolve: any;

  source() {
    return {
      //  token就是一个promise
      token: new Promise<Cancel>((resolve, reject) => {
        this.resolve = resolve;
      }),
      // 让这个promise成功，并且传入中断的原因
      cancel: (message: string) => {
        this.resolve(new Cancel(message));
      },
    };
  }
}
