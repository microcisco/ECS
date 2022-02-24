import CCComp from "./CCComp";
import {ECSComponent, ECSSystem, registerTag,} from "./ECS";
import CollideSystem from "./sys/CollideSystem";
import MoveSystem from "./sys/MoveSystem";
import {Move} from "./comp/Move";
import {Actor} from "./comp/Actor";

const {ccclass, property} = cc._decorator;

@registerTag
export class EcsTags {
    static no: symbol = Symbol();
    static enemy: symbol = Symbol();
    static hero: symbol = Symbol();
}

@ccclass
export default class Game extends CCComp {

    @property(cc.Prefab)
    enemy: cc.Prefab = null;

    public static instance:Game;
    rootSys: ECSSystem;
    protected onLoad() {
        Game.instance = this;
        this.rootSys = new ECSSystem();
        this.rootSys.setMatchCondition<ECSComponent>([Move, Actor], [EcsTags.no]);
        this.rootSys.addSystem(new CollideSystem())
        this.rootSys.addSystem(new MoveSystem())
    }

    t:number = 0;
    enemyAmount:number = 0;
    protected update(dt: number) {
        this.rootSys.update(dt);
        if(this.enemyAmount > 10) {
            return;
        }
        this.t -= dt;
        if(this.t <= 10) {
            this.t = 2;
            let node = cc.instantiate(this.enemy);
            cc.Canvas.instance.node.addChild(node);
            ++this.enemyAmount;
        }
    }

}
