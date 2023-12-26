import { warn, isThenable } from './util';
import Emitter from './Emitter';

export interface PostMessageOptions {
  name?: string; // 当前窗口名字
  filterSources?: string[]; // 和name搭配使用，过滤消息来源
}

type MessageListener = (event: {
  data: { source: PostMessageOptions['name']; type: string; data: unknown };
}) => void;

type GlobalWindow = typeof globalThis;

export default class PostMessage extends Emitter {
  target;
  options;
  exposes: Set<string>;

  private messageListener: MessageListener;

  constructor(target: GlobalWindow, options?: PostMessageOptions) {
    super();
    this.target = target;
    this.options = options || {};

    // 保存其他window暴露的方法名
    this.exposes = new Set();

    // 监听其他window调用expose方法暴露相关的方法给自己
    this.on('onAddExpose', (keys: string[]) => {
      keys.forEach((key) => {
        // 方法名称重复则覆盖给出提示
        if (this.exposes.has(key)) {
          warn(
            `The method: ${key} already exists. Please modify the name, otherwise it will be overwritten`,
          );
        }
        this.exposes.add(key);
      });
    });

    this.messageListener = (event) => {
      const message = event.data;
      if (!message) {
        return;
      }

      if (
        !this.options.filterSources ||
        (Array.isArray(this.options.filterSources) &&
          this.options.filterSources.length &&
          message.source &&
          this.options.filterSources.includes(message.source))
      ) {
        console.log(`message`, message, this._events, this.exposes);
        const { type, data } = message;
        this.trigger(type, data);
      }
    };

    // 统一监听
    target.addEventListener('message', this.messageListener, false);
  }

  removeAllListeners() {
    this.offAll();
    this.target.removeEventListener('message', this.messageListener);
  }

  // 事件通知
  send(type: string, data: unknown, target: GlobalWindow) {
    const _target = target || this.target;
    const message = {
      type,
      data,
      source: this.options.name,
    };
    _target.postMessage(message, '*');
  }

  /**
   * 暴露方法或者变量给其他iframe
   * @param {object} obj 暴露的方法或者变量
   * @param {Window} target 暴露给那个window
   */
  expose(obj: Record<string, Function>, target: GlobalWindow) {
    if (toString.call(obj) !== '[object Object]') {
      console.log('expose accept a object');
      return;
    }
    const keys = Object.keys(obj);
    this.send('onAddExpose', keys, target);
    keys.forEach((name) => {
      // 同一个类型的方法只能有一个回调
      this.off(name);
      this.on(name, async (param: unknown) => {
        const value = obj[name];
        let data;
        if (typeof value === 'function') {
          const res = value(param);
          if (isThenable(res)) {
            data = await res;
          } else {
            data = res;
          }
        } else {
          data = value;
        }
        this.send(name, data, target);
      });
    });
  }
  // 判断是否暴露了方法
  hasExpose(name: string) {
    return this.exposes.has(name);
  }
  /**
   * 访问iframe提供方法和变量
   * @param {string} name 暴露的方法名或者变量名
   * @param {any} param 方法参数
   * @param {Window} target 访问用那个
   * @returns
   */
  invoke(name: string, param: unknown, target: GlobalWindow) {
    if (!this.hasExpose(name)) {
      // warn(`not found invoke: ${name}`)
      return;
    }
    return new Promise((resolve) => {
      // 同一个类型的方法只能有一个回调
      this.off(name);
      this.on(name, (data: unknown) => {
        resolve(data);
      });
      this.send(name, param, target);
    });
  }
}
