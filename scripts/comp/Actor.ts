import {ECSComponent, registerComp} from "../ECS";

@registerComp("Actor")
export class Actor extends ECSComponent{
    hp = 0;
}