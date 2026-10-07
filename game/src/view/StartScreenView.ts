import Phaser from 'phaser';
import { LeaderboardEntry } from '../model/LeaderboardModel';

export class StartScreenView {
    private scene: Phaser.Scene;
    private isMobile: boolean;

    private overlay: Phaser.GameObjects.Rectangle | null = null;
    private bgRect: Phaser.GameObjects.Rectangle | null = null;
    private gridGraphics: Phaser.GameObjects.Graphics | null = null;
    private container: Phaser.GameObjects.Container | null = null;

    public onStartClicked?: () => void;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;
    }

    public show(
        sessionBest: number,
        playerName: string,
        topPlayersPromise: Promise<LeaderboardEntry[]>
    ): void {
        const { width, height, centerX, centerY } = this.scene.cameras.main;

        const GAP = {
            SMALL: height * (this.isMobile ? 0.06 : 0.04),
            MEDIUM: height * (this.isMobile ? 0.08 : 0.05),
            LARGE: height * (this.isMobile ? 0.1 : 0.06),
        };

        const titleFontSize = Math.floor(
            height * (this.isMobile ? 0.06 : 0.09)
        );
        const subtitleFontSize = Math.floor(
            height * (this.isMobile ? 0.028 : 0.035)
        );
        const ruleFontSize = Math.floor(
            height * (this.isMobile ? 0.022 : 0.02)
        );
        const lbTitleFontSize = Math.floor(
            height * (this.isMobile ? 0.026 : 0.025)
        );
        const lbRowFontSize = Math.floor(
            height * (this.isMobile ? 0.02 : 0.02)
        );
        const bestLabelFontSize = Math.floor(
            height * (this.isMobile ? 0.02 : 0.018)
        );
        const bestScoreFontSize = Math.floor(
            height * (this.isMobile ? 0.052 : 0.048)
        );
        const controlHintFontSize = Math.floor(
            height * (this.isMobile ? 0.026 : 0.019)
        );
        const btnFontSize = Math.floor(height * (this.isMobile ? 0.04 : 0.033));

        const ruleLineHeight = height * (this.isMobile ? 0.045 : 0.035);
        const lbHeight = height * (this.isMobile ? 0.18 : 0.15);
        const btnHeight = height * (this.isMobile ? 0.1 : 0.09);

        let totalContentHeight = 0;
        totalContentHeight += height * (this.isMobile ? 0.1 : 0.09);
        totalContentHeight += GAP.MEDIUM;
        totalContentHeight += ruleLineHeight * 4 + GAP.SMALL;
        totalContentHeight += lbHeight + GAP.MEDIUM;
        if (sessionBest > 0) {
            totalContentHeight +=
                height * (this.isMobile ? 0.11 : 0.09) + GAP.SMALL;
        }
        totalContentHeight += height * (this.isMobile ? 0.1 : 0.08);
        totalContentHeight += btnHeight;

        let currentY = -totalContentHeight / 2;

        this.bgRect = this.scene.add
            .rectangle(centerX, centerY, width, height, 0x000000)
            .setDepth(199);

        this.gridGraphics = this.scene.add.graphics().setDepth(199);
        this.gridGraphics.lineStyle(1, 0x00ffff, 0.15);

        const gridSize = this.isMobile ? height * 0.07 : 50;
        for (let x = 0; x <= width; x += gridSize) {
            this.gridGraphics.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y <= height; y += gridSize) {
            this.gridGraphics.lineBetween(0, y, width, y);
        }

        this.overlay = this.scene.add
            .rectangle(centerX, centerY, width, height, 0x000000, 0.7)
            .setDepth(200)
            .setAlpha(0);

        this.scene.tweens.add({ targets: this.overlay, alpha: 0.7, duration: 400 });

        this.container = this.scene.add.container(centerX, centerY).setDepth(201);
        const elements: any[] = [];

        const title = this.scene.add
            .text(0, currentY, 'NEON SPLIT', {
                fontFamily: 'Arial Black',
                fontSize: `${titleFontSize}px`,
                color: '#00ffff',
                stroke: '#000',
                strokeThickness: Math.floor(titleFontSize * 0.14),
            })
            .setOrigin(0.5);

        this.scene.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.05 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.container.add(title);
        elements.push(title);

        currentY += height * (this.isMobile ? 0.1 : 0.09);

        const subtitle = this.scene.add
            .text(0, currentY, '⚡ STAY FOCUSED! ⚡', {
                fontFamily: 'Arial Black',
                fontSize: `${subtitleFontSize}px`,
                color: '#ff00ff',
                stroke: '#000000',
                strokeThickness: Math.floor(subtitleFontSize * 0.14),
            })
            .setOrigin(0.5);

        this.container.add(subtitle);
        elements.push(subtitle);

        currentY += GAP.MEDIUM;

        const ruleLines = [
            '🚀 Random Speed',
            '⚠️ Adapt Fast',
            '🚫 Avoid Fakes',
            '🔥 Perfect = Multiplier',
        ];

        ruleLines.forEach((text) => {
            const line = this.scene.add
                .text(0, currentY, text, {
                    fontFamily: 'Arial',
                    fontSize: `${ruleFontSize}px`,
                    color: '#dddddd',
                })
                .setOrigin(0.5);

            this.container?.add(line);
            elements.push(line);
            currentY += ruleLineHeight;
        });

        currentY += GAP.SMALL;

        const lbWidth = width * (this.isMobile ? 0.9 : 0.48);
        const cardWidth = lbWidth;

        const lbContainer = this.scene.add.container(0, currentY + lbHeight / 2);

        const lbBg = this.scene.add.graphics();
        lbBg.lineStyle(4, 0xbd00ff, 1);
        lbBg.fillStyle(0x000000, 0.85);
        lbBg.fillRoundedRect(
            -lbWidth / 2,
            -lbHeight / 2,
            lbWidth,
            lbHeight,
            12
        );
        lbBg.strokeRoundedRect(
            -lbWidth / 2,
            -lbHeight / 2,
            lbWidth,
            lbHeight,
            12
        );
        lbContainer.add(lbBg);

        const loadingText = this.scene.add
            .text(0, 0, '🏆 LOADING...', {
                fontFamily: 'Arial Black',
                fontSize: `${lbTitleFontSize}px`,
                color: '#ffd700',
            })
            .setOrigin(0.5);
        lbContainer.add(loadingText);

        this.container.add(lbContainer);
        elements.push(lbContainer);

        topPlayersPromise
            .then((topPlayers) => {
                if (!this.container || !this.scene.scene.isActive()) return;
                if (loadingText && loadingText.scene) loadingText.destroy();

                if (topPlayers && topPlayers.length > 0) {
                    const titleText = this.scene.add
                        .text(
                            0,
                            -lbHeight / 2 + lbHeight * 0.17,
                            '🏆 GLOBAL TOP 3',
                            {
                                fontFamily: 'Arial Black',
                                fontSize: `${lbTitleFontSize}px`,
                                color: '#00ffff',
                                stroke: '#000000',
                                strokeThickness: 3,
                            }
                        )
                        .setOrigin(0.5);
                    lbContainer.add(titleText);

                    const rowSpacing = lbHeight * 0.24;

                    topPlayers.forEach((player: LeaderboardEntry, index: number) => {
                        const rowY =
                            -lbHeight / 2 +
                            lbHeight * 0.42 +
                            index * rowSpacing;
                        const isMe = player.name === playerName;
                        const rowColor = isMe ? '#ffff00' : '#ffffff';

                        if (isMe) {
                            const meHighlight = this.scene.add.graphics();
                            meHighlight.fillStyle(0xffff00, 0.15);
                            meHighlight.fillRect(
                                -cardWidth * 0.45,
                                rowY - rowSpacing * 0.45,
                                cardWidth * 0.9,
                                rowSpacing * 0.9
                            );
                            lbContainer.add(meHighlight);
                        }

                        const medals = ['🥇', '🥈', '🥉'];
                        const medal = this.scene.add
                            .text(
                                -cardWidth * 0.38,
                                rowY,
                                medals[index] || '•',
                                { fontSize: `${lbRowFontSize}px` }
                            )
                            .setOrigin(0.5);

                        const countryCode = (
                            player.country || 'UNKNOWN'
                        ).toUpperCase();
                        const flagKey = `flag_${countryCode}`;
                        const flagImg = this.scene.add.image(
                            this.isMobile
                                ? -cardWidth * 0.2
                                : -cardWidth * 0.15,
                            rowY,
                            this.scene.textures.exists(flagKey)
                                ? flagKey
                                : 'flag_UNKNOWN'
                        );
                        const flagSize =
                            height * (this.isMobile ? 0.022 : 0.02);
                        flagImg.setDisplaySize(flagSize * 1.5, flagSize);

                        const name = this.scene.add
                            .text(
                                this.isMobile
                                    ? -cardWidth * 0.1
                                    : -cardWidth * 0.05,
                                rowY,
                                player.name.substring(0, 10),
                                {
                                    fontFamily: 'Courier New',
                                    fontSize: `${lbRowFontSize}px`,
                                    color: rowColor,
                                    fontStyle: 'bold',
                                }
                            )
                            .setOrigin(0, 0.5);

                        const score = this.scene.add
                            .text(
                                cardWidth * 0.4,
                                rowY,
                                player.score.toLocaleString(),
                                {
                                    fontFamily: 'Courier New',
                                    fontSize: `${lbRowFontSize}px`,
                                    color: rowColor,
                                    fontStyle: 'bold',
                                }
                            )
                            .setOrigin(1, 0.5);

                        lbContainer.add([medal, flagImg, name, score]);
                    });
                } else {
                    const noDataText = this.scene.add
                        .text(0, lbHeight * 0.08, '🏆 BE THE FIRST!', {
                            fontFamily: 'Arial Black',
                            fontSize: `${lbTitleFontSize}px`,
                            color: '#ffd700',
                        })
                        .setOrigin(0.5);
                    lbContainer.add(noDataText);
                }
            })
            .catch(() => {
                if (loadingText && loadingText.scene) {
                    loadingText.setText('⚠️ OFFLINE');
                }
            });

        currentY += lbHeight + GAP.MEDIUM;

        if (sessionBest > 0) {
            const bestContainer = this.scene.add.container(0, currentY);

            const bestLabel = this.scene.add
                .text(0, 0, '🏆 YOUR BEST', {
                    fontFamily: 'Arial',
                    fontSize: `${bestLabelFontSize}px`,
                    color: '#ffd700',
                    fontStyle: 'bold',
                })
                .setOrigin(0.5);

            const bestScore = this.scene.add
                .text(0, GAP.SMALL, sessionBest.toLocaleString(), {
                    fontFamily: 'Arial Black',
                    fontSize: `${bestScoreFontSize}px`,
                    color: '#ffffff',
                    stroke: '#ffd700',
                    strokeThickness: Math.floor(bestScoreFontSize * 0.08),
                })
                .setOrigin(0.5);

            bestContainer.add([bestLabel, bestScore]);
            this.container.add(bestContainer);
            elements.push(bestContainer);

            currentY += height * (this.isMobile ? 0.11 : 0.09) + GAP.SMALL;
        }

        const inputMethod = this.isMobile ? '👆 TAP' : '🖱️ CLICK  /  ⌨️ SPACE';
        const controlHint = this.scene.add
            .text(0, currentY, inputMethod, {
                fontFamily: 'Arial',
                fontSize: `${controlHintFontSize}px`,
                color: '#00ff88',
                stroke: '#000000',
                strokeThickness: Math.floor(controlHintFontSize * 0.12),
            })
            .setOrigin(0.5)
            .setAlpha(0.7);

        this.container.add(controlHint);
        elements.push(controlHint);

        this.scene.tweens.add({
            targets: controlHint,
            alpha: 0.4,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
        });

        currentY += height * (this.isMobile ? 0.1 : 0.08);

        const btnWidth = width * (this.isMobile ? 0.85 : 0.4);

        const startBtn = this.scene.add
            .rectangle(0, currentY, btnWidth, btnHeight, 0x00ff88)
            .setStrokeStyle(4, 0xffffff)
            .setInteractive({ useHandCursor: true });

        const startText = this.scene.add
            .text(0, currentY, 'START GAME', {
                fontFamily: 'Arial Black',
                fontSize: `${btnFontSize}px`,
                color: '#000000',
            })
            .setOrigin(0.5);

        this.container.add([startBtn, startText]);
        elements.push(startBtn, startText);

        startBtn.on('pointerover', () => {
            startBtn.setFillStyle(0x00ffaa);
            startBtn.setStrokeStyle(4, 0x00ffff);
            this.scene.tweens.add({
                targets: [startBtn, startText],
                scale: 1.05,
                duration: 100,
            });
        });

        startBtn.on('pointerout', () => {
            startBtn.setFillStyle(0x00ff88);
            startBtn.setStrokeStyle(4, 0xffffff);
            this.scene.tweens.add({
                targets: [startBtn, startText],
                scale: 1,
                duration: 100,
            });
        });

        startBtn.on('pointerdown', () => {
            this.hide(() => {
                if (this.onStartClicked) this.onStartClicked();
            });
        });

        elements.forEach((el, i) => {
            const item: any = el;
            const targetY = item.y;
            item.setAlpha(0);
            item.y += 30;

            this.scene.time.delayedCall(i * 60, () => {
                this.scene.tweens.add({
                    targets: item,
                    alpha: item === controlHint ? 0.7 : 1,
                    y: targetY,
                    duration: 500,
                    ease: 'Back.out',
                });
            });
        });
    }

    public hide(onComplete?: () => void): void {
        if (!this.overlay || !this.container) {
            if (onComplete) onComplete();
            return;
        }

        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: 10,
            onComplete: () => {
                if (this.gridGraphics) this.gridGraphics.destroy();
                if (this.container) this.container.destroy();
                if (this.bgRect) this.bgRect.destroy();

                this.scene.tweens.add({
                    targets: this.overlay,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power2.out',
                    onComplete: () => {
                        if (this.overlay) this.overlay.destroy();
                        this.overlay = null;
                        this.gridGraphics = null;
                        this.container = null;
                        this.bgRect = null;
                        if (onComplete) onComplete();
                    },
                });
            },
        });
    }
}
