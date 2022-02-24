import {ECSComponent, registerComp} from "../ECS";

@registerComp("Move")
export class Move extends ECSComponent {
    dir:cc.Vec3 = cc.Vec3.ZERO;
    speed:number = 0;
}