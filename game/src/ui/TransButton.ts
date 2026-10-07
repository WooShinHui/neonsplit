import { GraphicsX } from '../core/GraphicsX';
import EVENT from '../EVT';

export class TransButton extends GraphicsX {
    private _width: number;
    private _height: number;

    constructor(
        $scene: Phaser.Scene,
        $width: number,
        $height: number,
        $alpha: number = 0
    ) {
        super($scene);

        this._width = $width;
        this._height = $height;

        this.fillStyle(0xff0000, $alpha);
        this.fillRect(0, 0, $width, $height);

        const hitArea = new Phaser.Geom.Rectangle(0, 0, $width, $height);
        this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        this.on('pointerdown', () => {
            this.dispatchEventX({ type: EVENT.CLICK });
        });

        this.on('pointerover', () => {});

        this.on('pointerout', () => {});

        this.scene.add.existing(this);
    }

    get width(): number {
        return this._width;
    }
    get height(): number {
        return this._height;
    }

    get midX(): number {
        return this.x + this._width / 2;
    }

    get midY(): number {
        return this.y + this._height / 2;
    }
}
