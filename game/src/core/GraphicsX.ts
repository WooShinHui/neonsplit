import { BaseComponent, mixin } from './BaseComponent';

export class GraphicsX extends Phaser.GameObjects.Graphics {
    constructor(
        $scene: Phaser.Scene,
        $options?: Phaser.Types.GameObjects.Graphics.Options
    ) {
        super($scene);
    }
}

export interface GraphicsX extends BaseComponent {}
mixin(GraphicsX, BaseComponent);
