import {ECSComponent, registerComp} from "../ECS";

@registerComp("Translate")
export class Translate extends ECSComponent{
    node:cc.Node;
}