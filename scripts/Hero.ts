import CCComp from "./CCComp";
import {ECSEntity} from "./ECS";
import {EcsTags} from "./Game";
import {Move} from "./comp/Move";
import {Actor} from "./comp/Actor";
import {Translate} from "./comp/Translate";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Hero extends CCComp {

    protected ecsEntity: ECSEntity;
    protected move: Move;
    protected actor: Actor;
    protected transform: Translate;
    protected onLoad() {
        this.ecsEntity = new ECSEntity();

        this.move = new Move();
        this.actor = new Actor();
        this.transform = new Translate();
        this.transform.node = this.node;

        this.move.speed = 500;

        // this.ecsEntity.addComp(this.move);
        // this.ecsEntity.addComp(this.actor);
        // this.ecsEntity.addComp(this.transform);
        // this.ecsEntity.addTag(EcsTags.hero);

        this.ecsEntity.addCompsAndTags([this.move, this.actor, this.transform], [EcsTags.hero]);

    }

}
