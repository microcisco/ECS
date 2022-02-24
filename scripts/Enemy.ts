import CCComp from "./CCComp";
import {ECSEntity} from "./ECS";
import {EcsTags} from "./Game";
import {Move} from "./comp/Move";
import {Actor} from "./comp/Actor";
import {Translate} from "./comp/Translate";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends CCComp {

    protected ecsEntity: ECSEntity;
    protected move: Move;
    protected actor: Actor;
    protected transform: Translate;
    protected onLoad() {
        this.ecsEntity = new ECSEntity();
        this.ecsEntity.addTag(EcsTags.enemy);

        this.move = new Move();
        this.actor = new Actor();
        this.transform = new Translate();
        this.transform.node = this.node;

        //随机方向
        cc.Vec3.random(this.move.dir);
        this.move.speed = 100 + Math.random() * 400;

        this.ecsEntity.addComp(this.move);
        this.ecsEntity.addComp(this.actor);
        this.ecsEntity.addComp(this.transform);

        this.node.position = cc.Vec3.ZERO;

        this.node.on(cc.Node.EventType.TOUCH_START, this.onClick, this);
    }

    onClick() {
        if(this.ecsEntity.hasComp(Move)) {
            this.ecsEntity.removeComp(Move);
        }
    }

    protected onDestroy() {
        this.ecsEntity.clear();
    }

}
