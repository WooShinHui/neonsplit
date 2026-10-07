import { ContainerX } from 'src/core/ContainerX';

export class Affordance extends ContainerX {
    private thFlicker: Phaser.GameObjects.Container;
    private foFlicker: Phaser.GameObjects.Container;

    private finger: Phaser.GameObjects.Image;
    private pe_1: Phaser.GameObjects.Image;
    private pe_2: Phaser.GameObjects.Image;
    private pe_3: Phaser.GameObjects.Image;
    private pe_4: Phaser.GameObjects.Image;
    private pe_5: Phaser.GameObjects.Image;
    private pe_6: Phaser.GameObjects.Image;
    private pe_7: Phaser.GameObjects.Image;

    constructor($scene: Phaser.Scene) {
        super($scene, 0, 0);

        this.finger = this.scene.add.image(0, 0, 'guide_hand').setOrigin(0);
        this.add(this.finger);

        // 깜빡임 3개 컨테이너
        this.thFlicker = new Phaser.GameObjects.Container(
            this.scene,
            -47,
            -41
        ).setAlpha(0);
        this.pe_1 = this.scene.add.image(0, 27, 'pe_1').setOrigin(0);
        this.thFlicker.add(this.pe_1);

        this.pe_2 = this.scene.add.image(25, 0, 'pe_2').setOrigin(0);
        this.thFlicker.add(this.pe_2);

        this.pe_3 = this.scene.add.image(60, 0, 'pe_3').setOrigin(0);
        this.thFlicker.add(this.pe_3);
        this.add(this.thFlicker);

        // 깜빡임 4개 컨테이너
        this.foFlicker = new Phaser.GameObjects.Container(
            this.scene,
            -47,
            -45
        ).setAlpha(0);
        this.pe_4 = this.scene.add.image(0, 49, 'pe_4').setOrigin(0);
        this.foFlicker.add(this.pe_4);

        this.pe_5 = this.scene.add.image(10, 14, 'pe_5').setOrigin(0);
        this.foFlicker.add(this.pe_5);

        this.pe_6 = this.scene.add.image(45, 0, 'pe_6').setOrigin(0);
        this.foFlicker.add(this.pe_6);

        this.pe_7 = this.scene.add.image(68, 8, 'pe_7').setOrigin(0);
        this.foFlicker.add(this.pe_7);
        this.add(this.foFlicker);

        this.visible = false;
        this.hide();
        this.scene.add.existing(this);
    }

    public show(): void {
        this.killTween();
        this.alpha = 0;
        this.finger.x = 0;
        this.finger.y = 0;
        this.visible = true;
        this.scene.tweens.add({
            targets: this,
            duration: 500,
            alpha: 1,
        });
    }

    public hide(): void {
        this.killTween();
        this.alpha = 1;
        this.thFlicker.alpha = 0;
        this.foFlicker.alpha = 0;
        this.scene.tweens.add({
            targets: this,
            duration: 500,
            alpha: 0,
        });
        this.scene.tweens.add({
            targets: this.finger,
            duration: 500,
            x: 100,
            y: 100,
            onComplete: () => {
                this.visible = false;
            },
        });
    }

    // 손끝 점멸
    public playClick(): void {
        this.scene.tweens.chain({
            tweens: [
                { targets: this.finger, duration: 200, scale: 0.9 },
                { targets: this.thFlicker, duration: 50, alpha: 1 },
                {
                    targets: this.foFlicker,
                    duration: 50,
                    alpha: 1,
                    delay: 100,
                    onStart: () => {
                        this.thFlicker.alpha = 0;
                    },
                },
                {
                    targets: this.finger,
                    duration: 200,
                    scale: 1,
                    delay: 100,
                    onStart: () => {
                        this.foFlicker.alpha = 0;
                    },
                },
            ],
        });
    }

    private killTween(): void {
        this.scene.tweens.killTweensOf([
            this.finger,
            this.thFlicker,
            this.foFlicker,
        ]);
    }
}
