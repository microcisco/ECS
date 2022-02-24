import {ECSComponent, ECSSystem} from "../ECS";
import {Move} from "../comp/Move";
import {Translate} from "../comp/Translate";
import {EcsTags} from "../Game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MoveSystem extends ECSSystem {

    constructor() {
        super();
        this.setMatchCondition<ECSComponent>([Move, Translate], []);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyUp() {
        this.dir.x = 0;
        this.dir.y = 0;
        this.dir.z = 0;
    }

    protected dir:cc.Vec3 = cc.v3();
    onKeyDown(event) {
        switch(event.keyCode) {
            case cc.macro.KEY.w:
                this.dir.y = 1;
                break;
            case cc.macro.KEY.s:
                this.dir.y = -1;
                break;
            case cc.macro.KEY.a:
                this.dir.x = -1;
                break;
            case cc.macro.KEY.d:
                this.dir.x = 1;
                break;
        }
    }

    update(dt: number) {
        super.update(dt);
        this.entities.forEach((n, entity) => {
            let move = entity.getComp(Move);
            let tf = entity.getComp(Translate);
            if(entity.hasTag(EcsTags.hero)) {
                //英雄不处理
                move.dir = this.dir;
                let pos = tf.node.position;
                tf.node.position = pos.add(move.dir.normalize().mul(move.speed * dt));
                return;
            }
            let pos = tf.node.position;
            let nextPos = pos.add(move.dir.normalize().mul(move.speed * dt));
            if(Math.abs(tf.node.x) > cc.winSize.width * 0.5 || Math.abs(tf.node.y) > cc.winSize.height * 0.5) {
                //到达边界
                move.dir = cc.Vec3.ZERO.sub(tf.node.position);
                nextPos = pos.add(move.dir.normalize().mul(move.speed * dt));
                tf.node.position = nextPos;
            } else {
                //未到达边界
                tf.node.position = nextPos;
            }
        });
    }
}
