import Phaser from 'phaser';
import { StageInfo } from '../model/StageModel';

export class FXView {
    private scene: Phaser.Scene;
    private isMobile: boolean;

    private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private stageNotification: Phaser.GameObjects.Container | null = null;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;
    }

    public init(): void {
        if (!this.scene.textures.exists('white_p')) {
            const g = this.scene.make.graphics({ x: 0, y: 0 }, false);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(8, 8, 8);
            g.generateTexture('white_p', 16, 16);
        }

        this.particleEmitter = this.scene.add
            .particles(0, 0, 'white_p', {
                lifespan: 800,
                speed: { min: 250, max: 650 },
                scale: { start: 1.4, end: 0 },
                blendMode: 'ADD',
                emitting: false,
            })
            .setDepth(20);
    }

    public explodeParticles(
        x: number,
        y: number,
        color: number,
        count: number
    ): void {
        if (!this.particleEmitter) return;
        this.particleEmitter.setParticleTint(color);
        this.particleEmitter.explode(count, x, y);
    }

    public showPopup(
        x: number,
        y: number,
        text: string,
        color: string,
        points: number
    ): void {
        const getFontSize = (defaultSize: string): string => {
            if (!this.isMobile) return defaultSize;
            const size = parseInt(defaultSize);
            return `${Math.floor(size * 1.5)}px`;
        };

        const fontSize =
            text === 'FLAWLESS!!'
                ? getFontSize('76px')
                : text === 'PERFECT!'
                ? getFontSize('68px')
                : text === 'GREAT'
                ? getFontSize('56px')
                : text === 'GOOD'
                ? getFontSize('48px')
                : getFontSize('52px');

        const feedbackText = this.scene.add
            .text(x, y - (this.isMobile ? 100 : 70), text, {
                fontSize: fontSize,
                fontFamily: 'Arial Black',
                color: color,
            })
            .setOrigin(0.5)
            .setStroke('#000', Math.floor(parseInt(fontSize) * 0.12))
            .setDepth(15);

        if (points > 0) {
            const pointsFontSize = this.isMobile ? '54px' : '36px';
            const pointsText = this.scene.add
                .text(
                    x,
                    y - (this.isMobile ? 15 : 10),
                    `+${points.toLocaleString()}`,
                    {
                        fontSize: pointsFontSize,
                        fontFamily: 'Arial Black',
                        color: '#ffffff',
                    }
                )
                .setOrigin(0.5)
                .setStroke('#000', Math.floor(parseInt(pointsFontSize) * 0.17))
                .setDepth(15);

            this.scene.tweens.add({
                targets: pointsText,
                y: y - (this.isMobile ? 195 : 130),
                alpha: 0,
                scale: 1.3,
                duration: 1000,
                ease: 'Cubic.out',
                onComplete: () => pointsText.destroy(),
            });
        }

        this.scene.tweens.add({
            targets: feedbackText,
            y: y - (this.isMobile ? 300 : 200),
            alpha: 0,
            scale: text === 'FLAWLESS!!' ? 2.2 : text === 'PERFECT!' ? 2 : 1.6,
            duration: 800,
            ease: 'Cubic.out',
            onComplete: () => feedbackText.destroy(),
        });
    }

    public showTimeBonus(seconds: number): void {
        const { centerX, centerY } = this.scene.cameras.main;
        const color = seconds > 0 ? '#00ff88' : '#ff0055';
        const text = seconds > 0 ? `+${seconds}s` : `${seconds}s`;

        const timeBonusText = this.scene.add
            .text(
                centerX,
                centerY - (this.isMobile ? 180 : 120),
                text,
                {
                    fontFamily: 'Arial Black',
                    fontSize: this.isMobile ? '48px' : '36px',
                    color: color,
                }
            )
            .setOrigin(0.5)
            .setDepth(20)
            .setStroke('#000000', 6);

        this.scene.tweens.add({
            targets: timeBonusText,
            y: timeBonusText.y - (this.isMobile ? 80 : 60),
            alpha: 0,
            scale: 1.3,
            duration: 700,
            ease: 'Back.out',
            onComplete: () => timeBonusText.destroy(),
        });
    }

    public triggerImpactEffects(isPerfect: boolean): void {
        this.scene.cameras.main.flash(
            isPerfect ? 150 : 80,
            255,
            255,
            255,
            false
        );

        if (isPerfect) {
            this.scene.cameras.main.shake(120, 0.008);
        }
    }

    public triggerShake(duration: number = 250, intensity: number = 0.012): void {
        this.scene.cameras.main.shake(duration, intensity);
    }

    public triggerFlash(
        duration: number = 100,
        r: number = 0,
        g: number = 255,
        b: number = 0
    ): void {
        this.scene.cameras.main.flash(duration, r, g, b, false);
    }

    public triggerTeleportEffects(oldX: number, newX: number, barY: number): void {
        if (!this.particleEmitter) return;
        this.particleEmitter.setParticleTint(0x9900ff);
        this.particleEmitter.explode(25, oldX, barY);

        this.scene.time.delayedCall(50, () => {
            if (this.particleEmitter) {
                this.particleEmitter.explode(25, newX, barY);
            }
        });

        this.scene.cameras.main.flash(120, 153, 0, 255, false);
    }

    public showStageNotification(stage: StageInfo): void {
        const [r, g, b] = this.hexToRgb(stage.accentColor);
        this.scene.cameras.main.flash(350, r, g, b);

        const { width, height } = this.scene.cameras.main;

        const cardWidth = this.isMobile ? width * 0.88 : 450;
        const cardHeight = this.isMobile ? 120 : 105;

        const container = this.scene.add
            .container(width / 2, height * 0.35)
            .setDepth(250)
            .setAlpha(0);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.lineStyle(5, stage.accentColor, 1);
        bg.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            18
        );
        bg.strokeRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            18
        );
        container.add(bg);

        const colorHex = '#' + stage.accentColor.toString(16).padStart(6, '0');
        const titleFontSize = this.isMobile ? 36 : 38;

        const title = this.scene.add
            .text(0, -16, `${stage.emoji} ${stage.displayName}`, {
                fontFamily: 'Arial Black',
                fontSize: `${titleFontSize}px`,
                color: colorHex,
                stroke: '#000000',
                strokeThickness: 7,
            })
            .setOrigin(0.5);
        container.add(title);

        const subtitleFontSize = this.isMobile ? 17 : 18;
        const subtitle = this.scene.add
            .text(0, 22, stage.subtitle, {
                fontFamily: 'Arial',
                fontSize: `${subtitleFontSize}px`,
                color: '#ffffff',
            })
            .setOrigin(0.5);
        container.add(subtitle);

        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 250,
            ease: 'Back.out',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 180,
                    ease: 'Sine.out',
                });

                this.scene.time.delayedCall(1700, () => {
                    this.scene.tweens.add({
                        targets: container,
                        alpha: 0,
                        scaleY: 0.7,
                        duration: 350,
                        ease: 'Power2.in',
                        onComplete: () => container.destroy(),
                    });
                });
            },
        });

        this.stageNotification = container;
    }

    private hexToRgb(hex: number): [number, number, number] {
        return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
    }

    public destroy(): void {
        if (this.particleEmitter && this.particleEmitter.scene) {
            this.particleEmitter.destroy();
            this.particleEmitter = null;
        }
        if (this.stageNotification && this.stageNotification.scene) {
            this.stageNotification.destroy();
            this.stageNotification = null;
        }
    }
}
