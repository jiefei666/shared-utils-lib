/**
 * 事件收集管理
 */
declare class Emitter {
    _events: Map<string, Set<Function>>;
    constructor();
    off(evtName: string, fn?: Function): void;
    offAll(): void;
    on(evtName: string, fn: Function): this;
    trigger(evtName: string, param: unknown): Promise<any[]>;
    listen(listeners: Record<string, Function>): this;
}

interface PostMessageOptions {
    name?: string;
    filterSources?: string[];
}
declare class PostMessage extends Emitter {
    target: any;
    options: any;
    exposes: Set<string>;
    private messageListener;
    constructor(target: Window, options?: PostMessageOptions);
    removeAllListeners(): void;
    send(type: string, data: unknown, target: Window): void;
    /**
     * 暴露方法或者变量给其他iframe
     * @param {object} obj 暴露的方法或者变量
     * @param {Window} target 暴露给那个window
     */
    expose(obj: Record<string, Function>, target: Window): void;
    hasExpose(name: string): boolean;
    /**
     * 访问iframe提供方法和变量
     * @param {string} name 暴露的方法名或者变量名
     * @param {any} param 方法参数
     * @param {Window} target 访问用那个
     * @returns
     */
    invoke(name: string, param: unknown, target: Window): Promise<unknown>;
}

export { Emitter, PostMessage };
