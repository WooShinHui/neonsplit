import Phaser from 'phaser';

export class HUDView {
    private scene: Phaser.Scene;
    private isMobile: boolean;

    private scoreText: Phaser.GameObjects.Text | null = null;
    private comboText: Phaser.GameObjects.Text | null = null;
    private timeText: Phaser.GameObjects.Text | null = null;
    private multiplierText: Phaser.GameObjects.Text | null = null;
    private nextRankText: Phaser.GameObjects.Text | null = null;

    private progressBar: Phaser.GameObjects.Graphics | null = null;
    private progressBarBg: Phaser.GameObjects.Graphics | null = null;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;
    }

    public init(): void {
        const { centerX, width, height } = this.scene.cameras.main;

        const scoreFontSize = this.isMobile ? Math.floor(height * 0.1) : 80;
        const timeFontSize = this.isMobile ? Math.floor(height * 0.05) : 36;
        const comboFontSize = this.isMobile ? Math.floor(height * 0.06) : 56;
        const multiplierFontSize = this.isMobile
            ? Math.floor(height * 0.015)
            : 36;
        const nextRankFontSize = this.isMobile
            ? Math.floor(height * 0.035)
            : 24;

        this.scoreText = this.scene.add
            .text(centerX, height * (this.isMobile ? 0.12 : 0.14), '0', {
                fontSize: `${scoreFontSize}px`,
                fontFamily: 'Arial Black',
                color: '#ffffff',
            })
            .setOrigin(0.5)
            .setStroke('#000', Math.floor(scoreFontSize * 0.15))
            .setDepth(10);

        this.comboText = this.scene.add
            .text(centerX, height * (this.isMobile ? 0.22 : 0.25), '', {
                fontSize: `${comboFontSize}px`,
                fontFamily: 'Arial Black',
                color: '#ffe600',
            })
            .setOrigin(0.5)
            .setStroke('#000', Math.floor(comboFontSize * 0.15))
            .setDepth(10)
            .setAlpha(0);

        this.timeText = this.scene.add
            .text(centerX, height * (this.isMobile ? 0.3 : 0.35), '20.0s', {
                fontSize: `${timeFontSize}px`,
                fontFamily: 'Arial Black',
                color: '#00ff88',
            })
            .setOrigin(0.5)
            .setStroke('#000', Math.floor(timeFontSize * 0.15))
            .setDepth(10);

        this.multiplierText = this.scene.add
            .text(centerX, height * (this.isMobile ? 0.04 : 0.06), '', {
                fontSize: `${multiplierFontSize}px`,
                fontFamily: 'Arial Black',
                color: '#00ffff',
            })
            .setOrigin(0.5)
            .setStroke('#000', Math.floor(multiplierFontSize * 0.15))
            .setDepth(10)
            .setAlpha(0);

        this.nextRankText = this.scene.add
            .text(centerX, height * (this.isMobile ? 0.05 : 0.06), '', {
                fontSize: `${nextRankFontSize}px`,
                fontFamily: 'Arial Black',
                color: '#00ff88',
            })
            .setOrigin(0.5)
            .setStroke('#000', Math.floor(nextRankFontSize * 0.15))
            .setDepth(10)
            .setAlpha(0);

        // 프로그레스 바 설정
        this.progressBarBg = this.scene.add.graphics().setDepth(9);
        this.progressBar = this.scene.add.graphics().setDepth(10);

        const pbWidth = width * (this.isMobile ? 0.9 : 0.6);
        const pbHeight = this.isMobile ? 12 : 8;
        const pbX = (width - pbWidth) / 2;
        const pbY = height * (this.isMobile ? 0.34 : 0.4);

        this.progressBarBg.fillStyle(0x333333, 0.5);
        this.progressBarBg.fillRoundedRect(
            pbX,
            pbY,
            pbWidth,
            pbHeight,
            pbHeight / 2
        );
        this.progressBarBg.lineStyle(2, 0x00ffff, 0.3);
        this.progressBarBg.strokeRoundedRect(
            pbX,
            pbY,
            pbWidth,
            pbHeight,
            pbHeight / 2
        );

        this.updateTimeDisplay(20, 20);
    }

    public updateScore(score: number): void {
        if (!this.scoreText) return;
        this.scoreText.setText(score.toLocaleString());
        this.scene.tweens.add({
            targets: this.scoreText,
            scale: 1.15,
            duration: 100,
            yoyo: true,
            ease: 'Quad.out',
        });
    }

    public updateCombo(combo: number): void {
        if (!this.comboText) return;
        if (combo > 0) {
            this.comboText.setText(`${combo}x COMBO`);
            this.comboText.setAlpha(1);
            this.comboText.setScale(1.4);

            const comboColor =
                combo >= 30
                    ? '#ffd700'
                    : combo >= 15
                    ? '#ff00ff'
                    : combo >= 5
                    ? '#00ffff'
                    : '#ffe600';
            this.comboText.setColor(comboColor);

            this.scene.tweens.add({
                targets: this.comboText,
                scale: 1,
                duration: 180,
                ease: 'Back.out',
            });
        } else {
            this.comboText.setAlpha(0);
        }
    }

    public updateTimeDisplay(timeLeft: number, maxTime: number): void {
        if (!this.timeText) return;

        this.timeText.setText(`${timeLeft.toFixed(1)}s`);

        if (timeLeft <= 5) {
            this.timeText.setColor('#ff0055');
            this.scene.tweens.add({
                targets: this.timeText,
                scale: 1.2,
                duration: 200,
                yoyo: true,
                ease: 'Quad.easeInOut',
            });
        } else if (timeLeft <= 10) {
            this.timeText.setColor('#ffaa00');
            this.timeText.setScale(1);
        } else {
            this.timeText.setColor('#00ff88');
            this.timeText.setScale(1);
        }

        this.updateProgressBar(timeLeft, maxTime);
    }

    private updateProgressBar(timeLeft: number, maxTime: number): void {
        if (!this.progressBar) return;

        const { width, height } = this.scene.cameras.main;
        const pbWidth = width * (this.isMobile ? 0.9 : 0.6);
        const pbHeight = this.isMobile ? 12 : 8;
        const pbX = (width - pbWidth) / 2;
        const pbY = height * (this.isMobile ? 0.34 : 0.4);

        const progress = Math.max(0, Math.min(1, timeLeft / maxTime));
        const currentWidth = pbWidth * progress;

        this.progressBar.clear();

        let barColor = 0x00ff88;
        if (timeLeft <= 5) {
            barColor = 0xff0055;
        } else if (timeLeft <= 10) {
            barColor = 0xffaa00;
        }

        if (currentWidth > 0) {
            this.progressBar.fillStyle(barColor, 1);
            this.progressBar.fillRoundedRect(
                pbX,
                pbY,
                currentWidth,
                pbHeight,
                pbHeight / 2
            );
        }
    }

    public updateMultiplier(multiplier: number): void {
        if (!this.multiplierText) return;
        this.multiplierText.setText(`×${multiplier.toFixed(1)} MULTIPLIER!`);
        this.multiplierText.setAlpha(1);

        this.scene.tweens.add({
            targets: this.multiplierText,
            scale: 1.3,
            duration: 200,
            yoyo: true,
        });
    }

    public hideMultiplier(): void {
        if (!this.multiplierText) return;
        this.scene.tweens.killTweensOf(this.multiplierText);
        this.multiplierText.setAlpha(0);
    }

    public updateNextRankUI(
        score: number,
        nextRankScore: number,
        onRankUp?: () => void
    ): void {
        if (!this.nextRankText) return;

        this.scene.tweens.killTweensOf(this.nextRankText);
        this.nextRankText.setScale(1);

        if (nextRankScore > 0 && score < nextRankScore) {
            const gap = nextRankScore - score;
            this.nextRankText.setText(
                `🎯 Beat: ${nextRankScore.toLocaleString()} (-${gap})`
            );
            this.nextRankText.setAlpha(0.8);

            if (gap < 500) {
                this.nextRankText.setColor('#00ff00');
                this.scene.tweens.add({
                    targets: this.nextRankText,
                    scale: 1.1,
                    duration: 300,
                    yoyo: true,
                    repeat: -1,
                });
            }
        } else if (score >= nextRankScore && nextRankScore > 0) {
            this.nextRankText.setText('✅ RANK UP!');
            this.nextRankText.setColor('#ffd700');
            if (onRankUp) onRankUp();
        }
    }

    public destroy(): void {
        if (this.scoreText && this.scoreText.scene) this.scoreText.destroy();
        if (this.comboText && this.comboText.scene) this.comboText.destroy();
        if (this.timeText && this.timeText.scene) this.timeText.destroy();
        if (this.multiplierText && this.multiplierText.scene)
            this.multiplierText.destroy();
        if (this.nextRankText && this.nextRankText.scene)
            this.nextRankText.destroy();
        if (this.progressBar && this.progressBar.scene)
            this.progressBar.destroy();
        if (this.progressBarBg && this.progressBarBg.scene)
            this.progressBarBg.destroy();
    }
}
