###ECS架构
* 核心思想是系统每帧帧根据匹配规则（Tag或者组件筛选）选出符合条件的所有Entity进行处理
* 用法
```
//注册组件
@registerComp("Actor")
export class Actor extends ECSComponent{
    hp = 0;
}

//注册tag
@registerTag
export class EcsTags {
    static no: symbol = Symbol();
    static enemy: symbol = Symbol();
    static hero: symbol = Symbol();
}

//new系统
this.rootSys = new ECSSystem();
this.rootSys.setMatchCondition<ECSComponent>([Move, Actor], [EcsTags.no]);
this.rootSys.addSystem(new CollideSystem())
this.rootSys.addSystem(new MoveSystem())
```
* 偶然的一次机会了解到ECS架构就去研究了一下，感觉确实和常规的面向对象编程不太一样但是感觉也不是特别的出彩可能和使用场景有关吧，后面有时间在研究及研究。
> 参考了这位大佬的思路 https://github.com/shangdibaozi/ECS