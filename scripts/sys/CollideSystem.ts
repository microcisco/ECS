import {ECSSystem} from "../ECS";
import {EcsTags} from "../Game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CollideSystem extends ECSSystem {

    constructor() {
        super();
        this.setMatchCondition([], [EcsTags.hero]);
    }

    update(dt: number) {
        super.update(dt);
    }

}
