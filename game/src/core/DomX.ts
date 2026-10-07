/**
 * DomX
 * Author: Kim tae shin
 */
import { BaseComponent, mixin } from 'src/core/BaseComponent';

export class DomX extends Phaser.GameObjects.DOMElement {
    constructor($scene: Phaser.Scene) {
        super($scene, 0, 0);
    }
}

export interface DomX extends BaseComponent {}
mixin(DomX, BaseComponent);
