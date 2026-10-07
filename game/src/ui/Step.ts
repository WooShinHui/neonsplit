import { ContainerX } from '../core/ContainerX';

export class Step extends ContainerX {
    private stepOff: Phaser.GameObjects.Image;
    private stepOn: Phaser.GameObjects.Image;

    constructor($scene: Phaser.Scene, $x?: number, $y?: number) {
        super($scene, $x, $y);

        this.scene = $scene;

        this.stepOff = this.scene.add.image(0, 0, 'step_off');
        this.add(this.stepOff);

        this.stepOn = this.scene.add.image(0, 0, 'step_on');
        this.stepOn.visible = false;
        this.add(this.stepOn);

        this.scene.add.existing(this);
    }

    public setFill($bool: boolean) {
        if ($bool) {
            this.stepOn.visible = true;
        } else {
            this.stepOn.visible = false;
        }
    }
}
