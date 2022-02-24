/**
 * 核心思想是系统每帧帧根据匹配规则（Tag或者组件筛选）选出符合条件的所有Entity进行处理
 * */
const debug = true;

function removeFromArray(arr: any[], obj: unknown, removeAll: boolean) {
    for (let i = arr.length - 1; i >= 0; --i) {
        if (arr[i] === obj) {
            arr.splice(i, 1);
            if (!removeAll) {
                return;
            }
        }
    }
}

export interface ICanUsePool {
    //退还时调用
    unUse(): void;

    //重新启用
    reUse(): void;

    //销毁
    doDestroy(): void;

    //是否有效
    doIsValid(): boolean;
}

export class ObjectPool<T extends ICanUsePool> {
    private defaultList = [];
    private static linkPropName = Symbol("__poolLinkPropName__");
    private size: number = 0;
    //头部
    private head: T = null;
    //对象构造函数
    private readonly objectConstructor: new() => T;

    constructor(ctor: new() => T, initAmount: number = 3) {
        this.objectConstructor = ctor;
        for (let i = 0; i < initAmount; i++) {
            this.put(this.newObj());
        }
    }

    private newObj(): T {
        if (debug) {
            console.log('创建新对象');
        }
        return Reflect.construct(this.objectConstructor, this.defaultList);
    }

    public get() {
        if (this.size < 1) {
            this.put(this.newObj());
        }
        --this.size;
        const head = this.head;
        this.head = Reflect.get(head, ObjectPool.linkPropName) || null;
        Reflect.deleteProperty(head, ObjectPool.linkPropName);
        if (debug) {
            console.log('申请一个对象');
        }
    }

    public put(obj: T) {
        if (!obj || !obj.doIsValid()) {
            if (debug) {
                console.warn('归还的对象无效');
            }
            return;
        }
        if (Reflect.has(obj, ObjectPool.linkPropName)) {
            if (debug) {
                console.warn('已经在对象池中');
            }
            return;
        }
        //清理
        obj.unUse();
        Reflect.set(obj, ObjectPool.linkPropName, this.head);
        this.head = obj;
        ++this.size;
        if (debug) {
            console.log('归还一个对象');
        }
    }

    public clear() {
        while (this.head) {
            this.head.doDestroy();
            this.head = Reflect.get(this.head, ObjectPool.linkPropName) || null;
        }
        this.size = 0;
    }
}

//组件
export class ECSComponent {

}

//所有注册的tag
const allRegisterTag: Map<string, symbol> = new Map();

/**
 * 添加tag
 *
 * eg.
 *      @registerTag
 *      class Tag {
 *          static A: number;
 *          static B: number
 *      }
 */
export function registerTag(_class: new () => void) {
    for (let k in _class) {
        if (_class.hasOwnProperty(k)) {
            const symbol = Symbol(k);
            allRegisterTag.set(k, symbol);
            _class[k] = symbol;
        }
    }
}

//所有注册的tag
const allRegisterComp: Map<string, symbol> = new Map();
const getCompKey = Symbol('getCompKey');

export function registerComp(_className: string) {
    return function (_class: new () => void) {
        const symbol = Symbol(_className);
        allRegisterComp.set(_className, symbol);
        Reflect.set(_class, getCompKey, symbol);
    }
}

//实体
export class ECSEntity {
    private compMap: Map<symbol, ECSComponent> = new Map()
    private tags: symbol[] = [];

    //通知实体中的组件或者tag改变
    private notifyChange() {
        for (const it of onComponentAddOrRemoveFunc) {
            it.func.call(it.caller, this);
        }
    }

    //清空实体
    clear() {
        this.compMap.clear();
        this.tags.length = 0;
        this.notifyChange();
    }

    addCompsAndTags(comps: ECSComponent[], tags: symbol[]) {
        for (const comp of comps) {
            const key = Reflect.get(comp.constructor, getCompKey);
            if (this.compMap.has(key)) {
                console.warn('组件已添加过');
                continue;
            }
            this.compMap.set(key, comp);
        }
        for (const tag of tags) {
            if (this.tags.includes(tag)) {
                console.warn('tag已添加过');
                return;
            }
            this.tags.push(tag);
        }
        this.notifyChange();
    }

    addComp(comp: ECSComponent) {
        const key = Reflect.get(comp.constructor, getCompKey);
        if (this.compMap.has(key)) {
            console.warn('组件已添加过');
            return;
        }
        this.compMap.set(key, comp);
        this.notifyChange();
    }

    removeComp(comp: ECSComponent) {
        const key = Reflect.get(comp, getCompKey);
        if (!this.compMap.has(key)) {
            console.warn('没找到组件');
            return;
        }
        this.compMap.delete(key);
        this.notifyChange();
    }

    addTag(tag: symbol) {
        if (this.tags.includes(tag)) {
            console.warn('tag已添加过');
            return;
        }
        this.tags.push(tag);
        this.notifyChange();
    }

    removeTag(tag: symbol) {
        if (!this.tags.includes(tag)) {
            console.warn('tag不存在');
            return;
        }
        removeFromArray(this.tags, tag, true);
        this.notifyChange();
    }

    match<T extends ECSComponent>(comps: { prototype: T }[], tags: symbol[]): boolean {
        for (const tag of tags) {
            if (!this.tags.includes(tag)) {
                return false;
            }
        }
        for (const comp of comps) {
            const key = Reflect.get(comp, getCompKey);
            if (!this.compMap.has(key)) {
                return false;
            }
        }
        return true;
    }

    //是否有组件
    hasComp<T extends ECSComponent>(comp: new () => T): boolean {
        return this.compMap.has(Reflect.get(comp, getCompKey));
    }

    //是否有tag
    hasTag(tag: symbol): boolean {
        return this.tags.includes(tag);
    }

    //获取组件
    getComp<T extends ECSComponent>(comp: new () => T): T {
        return this.compMap.get(Reflect.get(comp, getCompKey)) as unknown as T;
    }
}

const onComponentAddOrRemoveFunc: { func: (entity: ECSEntity) => void, caller: ECSSystem }[] = [];

//系统
export class ECSSystem {
    subSystems: ECSSystem[] = [];

    addSystem(system: ECSSystem) {
        this.subSystems.push(system);
    }

    //匹配条件
    matchCondition: {
        comps: [],
        tags: symbol[],
    } = {
        comps: [],
        tags: [],
    }

    setMatchCondition<T extends ECSComponent>(comps: (new() => T)[], tags: symbol[]) {
        this.matchCondition.comps = comps as unknown as any;
        this.matchCondition.tags = tags;
    }

    constructor() {
        onComponentAddOrRemoveFunc.push({func: this.onComponentAddOrRemove, caller: this});
    }

    public onComponentAddOrRemove(entity: ECSEntity) {
        //实体信息改变回调
        if (entity.match(this.matchCondition.comps, this.matchCondition.tags)) {
            //符合本系统
            if (!this.entities.has(entity)) {
                //不存在该实体 && 加入
                this.entities.set(entity, 1);
                this.entityEnter(entity);
            }
        } else {
            //不符合本系统
            if (this.entities.has(entity)) {
                //存在该实体 && 移除
                this.entities.delete(entity);
                this.entityRemove(entity);
            }
        }
    }

    protected entities: Map<ECSEntity, number> = new Map();

    protected entityEnter(entity: ECSEntity) {

    }

    protected entityRemove(entity: ECSEntity) {
    }

    protected firstUpdate() {

    }

    public update(dt: number) {
        for (const subSystem of this.subSystems) {
            subSystem.update(dt);
        }
    }
}