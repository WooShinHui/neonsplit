import { ContainerX } from '../core/ContainerX';
import EVT from '../EVT';

export class BasicButton extends ContainerX {
    private txt: Phaser.GameObjects.Text;
    private rectBg: Phaser.GameObjects.Rectangle;
    private hitArea: Phaser.GameObjects.Rectangle;
    private _label: string;
    private _draggable: boolean;

    constructor(
        $scene: Phaser.Scene,
        $width: number,
        $height: number,
        $color: number = 0x000000,
        $alpha: number = 1
    ) {
        super($scene);

        this.width = $width;
        this.height = $height;

        this.txt = this.scene.add.text(0, 0, 'Button', {
            fontFamily: 'Roboto',
            fontSize: '16px',
            color: '#ffffff',
        });

        this.rectBg = this.scene.add.rectangle(
            0,
            0,
            this.txt.width + 20,
            this.txt.height + 4,
            $color,
            $alpha
        );

        this.hitArea = this.scene.add
            .rectangle(
                0,
                0,
                this.txt.width + 20,
                this.txt.height + 4,
                0xff0000,
                0
            )
            .setOrigin(0, 0);

        this.add(this.rectBg);
        this.add(this.txt);
        this.add(this.hitArea);

        // pointer event
        this.hitArea.on('pointerdown', () => {
            this.dispatchEventX({ type: EVT.CLICK });
        });
        this.hitArea.on('pointerover', () => {});
        this.hitArea.on('pointerout', () => {});

        // drag event
        this.hitArea.on(
            'dragstart',
            ($pt: Phaser.Input.Pointer, $dragX: number, $dragY: number) => {
                this.dispatchEventX({
                    type: EVT.DRAG_START,
                    pt: $pt,
                    dragX: $dragX,
                    dragY: $dragY,
                });
            }
        );

        this.hitArea.on(
            'drag',
            ($pt: Phaser.Input.Pointer, $dragX: number, $dragY: number) => {
                this.dispatchEventX({
                    type: EVT.DRAG_MOVE,
                    pt: $pt,
                    dragX: $dragX,
                    dragY: $dragY,
                });
            }
        );

        this.hitArea.on(
            'dragend',
            (
                $pt: Phaser.Input.Pointer,
                $dragX: number,
                $dragY: number,
                $dropped: boolean
            ) => {
                this.dispatchEventX({
                    type: EVT.DRAG_END,
                    pt: $pt,
                    dragX: $dragX,
                    dragY: $dragY,
                    dropped: $dropped,
                });
            }
        );

        this.rectBg.setOrigin(0, 0);
        this.txt.setOrigin(0, 0);
        this.txt.x = 10;
        this.txt.y = 2;
        this.rectBg.x = 0;
        this.hitArea.setInteractive({ draggable: true });
        this.scene.add.existing(this);
    }

    set label($label: string) {
        this._label = $label;
        this.txt.text = $label;
        this.rectBg.setSize(this.txt.width + 20, this.txt.height + 4);
        this.hitArea.setSize(this.txt.width + 20, this.txt.height + 4);
        this.width = this.rectBg.width;
        this.height = this.rectBg.height;
    }

    get label(): string {
        return this._label;
    }

    set draggable($bool: boolean) {
        this._draggable = $bool;
        this.hitArea.setInteractive({ draggable: this._draggable });
    }

    get draggable(): boolean {
        return this._draggable;
    }
}
