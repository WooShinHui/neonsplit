import { BaseComponent, mixin } from 'src/core/BaseComponent';

class CJS_ContainerX extends createjs.Container {
    constructor() {
        super();
    }
}

interface CJS_ContainerX extends BaseComponent {}
mixin(CJS_ContainerX, BaseComponent);
export default CJS_ContainerX;
