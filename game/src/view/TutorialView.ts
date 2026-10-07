import Phaser from 'phaser';

export class TutorialView {
    private scene: Phaser.Scene;
    private isMobile: boolean;
    private tutorialText: Phaser.GameObjects.Text | null = null;
    private isHidden: boolean = false;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;
    }

    public hasSeenTutorial(): boolean {
        return localStorage.getItem('neon_split_tutorial') === 'seen';
    }

    public showHint(onHide?: () => void): void {
        if (this.hasSeenTutorial()) return;

        const { centerX, height } = this.scene.cameras.main;
        const hintY = height - (this.isMobile ? height * 0.25 : 140);
        const hintFontSize = this.isMobile ? Math.floor(height * 0.045) : 20;

        const inputMethod = this.isMobile ? '👆 TAP' : '🖱️ CLICK / ⌨️ SPACE';
        this.tutorialText = this.scene.add
            .text(centerX, hintY, inputMethod, {
                fontFamily: 'Arial Black',
                fontSize: `${hintFontSize}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: Math.floor(hintFontSize * 0.25),
                align: 'center',
            })
            .setOrigin(0.5)
            .setDepth(31)
            .setAlpha(0);

        this.scene.tweens.add({
            targets: this.tutorialText,
            alpha: 1,
            duration: 500,
            delay: 500,
        });

        this.scene.tweens.add({
            targets: this.tutorialText,
            alpha: 0.4,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
            delay: 1000,
        });

        this.scene.time.delayedCall(3000, () => {
            this.hide(onHide);
        });
    }

    public hide(onHide?: () => void): void {
        if (this.isHidden) return;
        this.isHidden = true;

        if (this.tutorialText) {
            localStorage.setItem('neon_split_tutorial', 'seen');
            this.scene.tweens.add({
                targets: this.tutorialText,
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    this.tutorialText?.destroy();
                    this.tutorialText = null;
                    if (onHide) onHide();
                },
            });
        }
    }

    public destroy(): void {
        if (this.tutorialText && this.tutorialText.scene) {
            this.tutorialText.destroy();
            this.tutorialText = null;
        }
    }
}
