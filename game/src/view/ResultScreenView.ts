import Phaser from 'phaser';
import { StageInfo } from '../model/StageModel';
import { LeaderboardEntry } from '../model/LeaderboardModel';

export interface ResultScreenData {
    score: number;
    maxCombo: number;
    totalHits: number;
    perfectHits: number;
    greatHits: number;
    isRealNewRecord: boolean;
    isSessionBest: boolean;
    myRank: number;
    previousRank: number;
    playerName: string;
    countryCode: string;
    nextRankScore: number;
    currentStage: StageInfo;
    nextStage: StageInfo | null;
    stageProgress: number;
    leaderboard: LeaderboardEntry[];
}

export class ResultScreenView {
    private scene: Phaser.Scene;
    private isMobile: boolean;

    private overlay: Phaser.GameObjects.Rectangle | null = null;
    private uiElements: Phaser.GameObjects.Container[] = [];

    public onPlayAgainClicked?: () => void;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;
    }

    public show(data: ResultScreenData): void {
        const { width, height, centerX, centerY } = this.scene.cameras.main;
        const isMobile = this.isMobile;

        this.overlay = this.scene.add
            .rectangle(centerX, centerY, width, height, 0x000000, 0.95)
            .setDepth(100)
            .setAlpha(0);
        this.scene.tweens.add({ targets: this.overlay, alpha: 1, duration: 300 });

        this.uiElements = [];

        const GAP = height * 0.015;
        let currentY = height * 0.05;

        const cardWidth = width * (isMobile ? 0.92 : 0.5);
        const statsCardHeight = height * (isMobile ? 0.16 : 0.14);
        const rankCardHeight = height * (isMobile ? 0.1 : 0.09);
        const btnHeight = height * (isMobile ? 0.08 : 0.07);

        const titleFontSize = Math.floor(height * (isMobile ? 0.04 : 0.06));
        const scoreFontSize = Math.floor(height * (isMobile ? 0.085 : 0.09));
        const motivationFontSize = Math.floor(
            height * (isMobile ? 0.022 : 0.024)
        );
        const statLabelFontSize = Math.floor(
            height * (isMobile ? 0.018 : 0.019)
        );
        const statValueFontSize = Math.floor(
            height * (isMobile ? 0.036 : 0.038)
        );
        const lbTitleFontSize = Math.floor(height * (isMobile ? 0.026 : 0.028));
        const lbRowFontSize = Math.floor(height * (isMobile ? 0.02 : 0.024));
        const rankLabelFontSize = Math.floor(
            height * (isMobile ? 0.02 : 0.022)
        );
        const rankValueFontSize = Math.floor(
            height * (isMobile ? 0.045 : 0.05)
        );
        const btnFontSize = Math.floor(height * (isMobile ? 0.03 : 0.032));

        const rankChange = data.previousRank - data.myRank;

        // HEADER
        const headerContainer = this.scene.add
            .container(centerX, currentY)
            .setDepth(101);

        let headerTitle = "TIME'S UP";
        let headerColor = '#ffffff';

        if (data.isRealNewRecord) {
            headerTitle = '🌍 GLOBAL RECORD!';
            headerColor = '#ffd700';
        } else if (data.isSessionBest) {
            headerTitle = '🔥 SESSION BEST!';
            headerColor = '#ff00ff';
        } else if (rankChange > 0) {
            headerTitle = `📈 RANK UP +${rankChange}!`;
            headerColor = '#00ff88';
        }

        const titleText = this.scene.add
            .text(0, 0, headerTitle, {
                fontFamily: 'Arial Black',
                fontSize: `${titleFontSize}px`,
                color: headerColor,
                stroke: '#000000',
                strokeThickness: Math.max(6, titleFontSize * 0.15),
            })
            .setOrigin(0.5);

        const scoreOffsetY = height * (isMobile ? 0.075 : 0.08);
        const scoreText = this.scene.add
            .text(0, scoreOffsetY, data.score.toLocaleString(), {
                fontFamily: 'Arial Black',
                fontSize: `${scoreFontSize}px`,
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: Math.max(8, scoreFontSize * 0.15),
            })
            .setOrigin(0.5);

        headerContainer.add([titleText, scoreText]);
        this.uiElements.push(headerContainer);
        currentY += scoreOffsetY + height * (isMobile ? 0.04 : 0.045) + GAP;

        // STAGE CARD
        const stageCardHeight = height * (isMobile ? 0.1 : 0.09);
        const stageContainer = this.scene.add
            .container(centerX, currentY + stageCardHeight / 2)
            .setDepth(101);

        const stageBg = this.scene.add.graphics();
        stageBg
            .fillStyle(0x1a1a2e, 0.9)
            .lineStyle(3, data.currentStage.accentColor, 1);
        stageBg.fillRoundedRect(
            -cardWidth / 2,
            -stageCardHeight / 2,
            cardWidth,
            stageCardHeight,
            12
        );
        stageBg.strokeRoundedRect(
            -cardWidth / 2,
            -stageCardHeight / 2,
            cardWidth,
            stageCardHeight,
            12
        );
        stageContainer.add(stageBg);

        const stageColor =
            '#' + data.currentStage.accentColor.toString(16).padStart(6, '0');
        const stageFontSize = Math.floor(
            height * (isMobile ? 0.022 : 0.024)
        );

        const stageName = this.scene.add
            .text(
                -cardWidth * 0.38,
                -stageCardHeight * 0.25,
                `${data.currentStage.emoji} ${data.currentStage.displayName}`,
                {
                    fontFamily: 'Arial Black',
                    fontSize: `${stageFontSize}px`,
                    color: stageColor,
                }
            )
            .setOrigin(0, 0.5);
        stageContainer.add(stageName);

        const progressPercent = this.scene.add
            .text(
                cardWidth * 0.38,
                -stageCardHeight * 0.25,
                `${Math.floor(data.stageProgress * 100)}%`,
                {
                    fontFamily: 'Arial Black',
                    fontSize: `${Math.floor(stageFontSize * 0.9)}px`,
                    color: stageColor,
                }
            )
            .setOrigin(1, 0.5);
        stageContainer.add(progressPercent);

        const barWidth = cardWidth * 0.8;
        const barHeight = isMobile ? 10 : 8;
        const barX = -barWidth / 2;
        const barY = stageCardHeight * 0.15;

        const barBg = this.scene.add.graphics();
        barBg.fillStyle(0x333333, 0.8);
        barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);
        stageContainer.add(barBg);

        const barFill = this.scene.add.graphics();
        barFill.fillStyle(data.currentStage.accentColor, 1);
        barFill.fillRoundedRect(
            barX,
            barY,
            barWidth * data.stageProgress,
            barHeight,
            4
        );
        stageContainer.add(barFill);

        if (data.nextStage) {
            const nextInfo = this.scene.add
                .text(
                    0,
                    stageCardHeight * 0.42,
                    `→ ${data.nextStage.displayName} at ${data.nextStage.minScore.toLocaleString()}`,
                    {
                        fontFamily: 'Arial',
                        fontSize: `${Math.floor(
                            height * (isMobile ? 0.016 : 0.015)
                        )}px`,
                        color: '#888888',
                    }
                )
                .setOrigin(0.5);
            stageContainer.add(nextInfo);
        }

        this.uiElements.push(stageContainer);
        currentY += stageCardHeight + GAP;

        // MOTIVATION MESSAGE
        if (data.myRank >= 4 && data.myRank <= 10) {
            const gap = data.nextRankScore - data.score;
            if (gap > 0) {
                const motivationContainer = this.scene.add
                    .container(centerX, currentY)
                    .setDepth(101);
                const motivationText = this.scene.add
                    .text(
                        0,
                        0,
                        `🎯 #${data.myRank} → Just ${gap} pts to #${data.myRank - 1}!`,
                        {
                            fontFamily: 'Arial Black',
                            fontSize: `${motivationFontSize}px`,
                            color: '#ffaa00',
                            stroke: '#000000',
                            strokeThickness: 4,
                        }
                    )
                    .setOrigin(0.5);

                motivationContainer.add(motivationText);
                this.uiElements.push(motivationContainer);
                currentY += height * 0.045;

                this.scene.tweens.add({
                    targets: motivationText,
                    scale: 1.05,
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.inOut',
                });
            }
        }

        // STATS CARD
        const statsContainer = this.scene.add
            .container(centerX, currentY + statsCardHeight / 2)
            .setDepth(101);
        const statsBg = this.scene.add.graphics();
        statsBg.fillStyle(0x222222, 0.85).lineStyle(3, 0x00ffff, 0.5);
        statsBg.fillRoundedRect(
            -cardWidth / 2,
            -statsCardHeight / 2,
            cardWidth,
            statsCardHeight,
            12
        );
        statsBg.strokeRoundedRect(
            -cardWidth / 2,
            -statsCardHeight / 2,
            cardWidth,
            statsCardHeight,
            12
        );
        statsContainer.add(statsBg);

        const accuracyVal =
            data.totalHits > 0
                ? Math.round(
                      ((data.perfectHits + data.greatHits) / data.totalHits) *
                          100
                  )
                : 0;

        const statsData = [
            { label: 'MAX COMBO', value: `${data.maxCombo}`, color: '#ffe600' },
            {
                label: 'ACCURACY',
                value: `${accuracyVal}%`,
                color: accuracyVal > 90 ? '#00ff88' : '#ffffff',
            },
            {
                label: 'PERFECT',
                value: `${data.perfectHits}`,
                color: '#ff00ff',
            },
            { label: 'GREAT', value: `${data.greatHits}`, color: '#00aaff' },
        ];

        statsData.forEach((stat, index) => {
            const isLeft = index % 2 === 0;
            const isTop = index < 2;
            const xPos = isLeft ? -cardWidth * 0.22 : cardWidth * 0.22;
            const yPos = isTop ? -statsCardHeight * 0.2 : statsCardHeight * 0.2;
            const label = this.scene.add
                .text(xPos, yPos - statsCardHeight * 0.12, stat.label, {
                    fontFamily: 'Arial',
                    fontSize: `${statLabelFontSize}px`,
                    color: '#999999',
                })
                .setOrigin(0.5);
            const val = this.scene.add
                .text(xPos, yPos + statsCardHeight * 0.1, stat.value, {
                    fontFamily: 'Arial Black',
                    fontSize: `${statValueFontSize}px`,
                    color: stat.color,
                })
                .setOrigin(0.5);
            statsContainer.add([label, val]);
        });

        this.uiElements.push(statsContainer);
        currentY += statsCardHeight + GAP;

        // LEADERBOARD
        if (data.leaderboard && data.leaderboard.length > 0) {
            const lbCardHeight = height * (isMobile ? 0.3 : 0.26);

            const lbContainer = this.scene.add
                .container(centerX, currentY + lbCardHeight / 2)
                .setDepth(101);
            const lbBg = this.scene.add.graphics();
            lbBg.lineStyle(4, 0xbd00ff, 1).fillStyle(0x000000, 0.85);
            lbBg.fillRoundedRect(
                -cardWidth / 2,
                -lbCardHeight / 2,
                cardWidth,
                lbCardHeight,
                12
            );
            lbBg.strokeRoundedRect(
                -cardWidth / 2,
                -lbCardHeight / 2,
                cardWidth,
                lbCardHeight,
                12
            );
            lbContainer.add(lbBg);

            const lbTitle = this.scene.add
                .text(
                    0,
                    -lbCardHeight / 2 + lbCardHeight * 0.1,
                    '🏆 TOP PLAYERS',
                    {
                        fontFamily: 'Arial Black',
                        fontSize: `${lbTitleFontSize}px`,
                        color: '#00ffff',
                    }
                )
                .setOrigin(0.5);
            lbContainer.add(lbTitle);

            const rowSpacing = lbCardHeight * 0.15;
            data.leaderboard.forEach((player, index) => {
                const rowY =
                    -lbCardHeight / 2 +
                    lbCardHeight * 0.25 +
                    index * rowSpacing;
                const isMe = player.name === data.playerName;
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

                const medals = ['🥇', '🥈', '🥉', '4', '5'];
                const medal = this.scene.add
                    .text(-cardWidth * 0.38, rowY, medals[index] || '•', {
                        fontSize: `${lbRowFontSize}px`,
                    })
                    .setOrigin(0.5);

                const countryCode = (player.country || 'UNKNOWN').toUpperCase();
                const flagKey = `flag_${countryCode}`;
                const flagImg = this.scene.add.image(
                    isMobile ? -cardWidth * 0.2 : -cardWidth * 0.15,
                    rowY,
                    this.scene.textures.exists(flagKey) ? flagKey : 'flag_UNKNOWN'
                );
                const flagSize = height * (isMobile ? 0.022 : 0.02);
                flagImg.setDisplaySize(flagSize * 1.5, flagSize);

                const name = this.scene.add
                    .text(
                        isMobile ? -cardWidth * 0.1 : -cardWidth * 0.05,
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

            this.uiElements.push(lbContainer);
            currentY += lbCardHeight + GAP;
        }

        // RANK CARD
        const rankContainer = this.scene.add
            .container(centerX, currentY + rankCardHeight / 2)
            .setDepth(101);
        const rankBg = this.scene.add.graphics();
        rankBg.fillStyle(0x1a1a2e, 0.95).lineStyle(4, 0x00ffff, 1);
        rankBg.fillRoundedRect(
            -cardWidth / 2,
            -rankCardHeight / 2,
            cardWidth,
            rankCardHeight,
            12
        );
        rankBg.strokeRoundedRect(
            -cardWidth / 2,
            -rankCardHeight / 2,
            cardWidth,
            rankCardHeight,
            12
        );
        rankContainer.add(rankBg);

        const rankLabel = this.scene.add
            .text(-cardWidth * 0.25, -rankCardHeight * 0.25, 'YOUR RANK', {
                fontFamily: 'Arial Black',
                fontSize: `${rankLabelFontSize}px`,
                color: '#ffffff',
            })
            .setOrigin(0.5);

        let rankDisplay = data.myRank > 0 ? `#${data.myRank}` : '-';
        if (rankChange > 0) {
            rankDisplay += ` ↑${rankChange}`;
        } else if (rankChange < 0) {
            rankDisplay += ` ↓${Math.abs(rankChange)}`;
        }

        const rankValue = this.scene.add
            .text(-cardWidth * 0.25, rankCardHeight * 0.2, rankDisplay, {
                fontFamily: 'Arial Black',
                fontSize: `${rankValueFontSize}px`,
                color: '#ffffff',
            })
            .setOrigin(0.5);

        const myFlagKey = `flag_${data.countryCode.toUpperCase()}`;
        const myFlag = this.scene.add.image(
            0,
            0,
            this.scene.textures.exists(myFlagKey) ? myFlagKey : 'flag_UNKNOWN'
        );
        const myFlagSize = height * (isMobile ? 0.055 : 0.06);
        myFlag.setDisplaySize(myFlagSize * 1.5, myFlagSize);

        const myScoreValue = this.scene.add
            .text(
                cardWidth * 0.25,
                rankCardHeight * 0.2,
                data.score.toLocaleString(),
                {
                    fontFamily: 'Arial Black',
                    fontSize: `${Math.floor(rankValueFontSize * 0.8)}px`,
                    color: '#00ffff',
                }
            )
            .setOrigin(0.5);

        const myScoreLabel = this.scene.add
            .text(cardWidth * 0.25, -rankCardHeight * 0.25, 'FINAL SCORE', {
                fontFamily: 'Arial',
                fontSize: `${Math.floor(rankLabelFontSize * 0.9)}px`,
                color: '#888888',
            })
            .setOrigin(0.5);

        rankContainer.add([
            rankLabel,
            rankValue,
            myFlag,
            myScoreLabel,
            myScoreValue,
        ]);
        this.uiElements.push(rankContainer);
        currentY += rankCardHeight + GAP;

        // PLAY AGAIN BUTTON
        const btnY = height * 0.92;
        const btnContainer = this.scene.add
            .container(centerX, btnY)
            .setDepth(101);

        const btnWidth = width * (isMobile ? 0.8 : 0.35);

        const playBtn = this.scene.add
            .rectangle(0, 0, btnWidth, btnHeight, 0x00ff88)
            .setStrokeStyle(4, 0xffffff)
            .setInteractive({ useHandCursor: true });

        const playText = this.scene.add
            .text(0, 0, 'PLAY AGAIN', {
                fontFamily: 'Arial Black',
                fontSize: `${btnFontSize}px`,
                color: '#000000',
            })
            .setOrigin(0.5);

        btnContainer.add([playBtn, playText]);
        this.uiElements.push(btnContainer);

        playBtn.on('pointerover', () => {
            playBtn.setFillStyle(0x00ffaa);
            playBtn.setStrokeStyle(4, 0x00ffff);
            this.scene.tweens.add({
                targets: [playBtn, playText],
                scale: 1.05,
                duration: 100,
            });
        });

        playBtn.on('pointerout', () => {
            playBtn.setFillStyle(0x00ff88);
            playBtn.setStrokeStyle(4, 0xffffff);
            this.scene.tweens.add({
                targets: [playBtn, playText],
                scale: 1,
                duration: 100,
            });
        });

        playBtn.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: this.uiElements,
                alpha: 0,
                y: '+=50',
                duration: 200,
                onComplete: () => {
                    this.destroy();
                    if (this.onPlayAgainClicked) this.onPlayAgainClicked();
                },
            });
        });

        // ANIMATE IN
        this.uiElements.forEach((el, index) => {
            el.setAlpha(0);
            el.y += 50;
            this.scene.tweens.add({
                targets: el,
                alpha: 1,
                y: '-=50',
                duration: 500,
                delay: index * 100,
                ease: 'Back.out',
            });
        });

        if (data.isRealNewRecord) {
            this.scene.tweens.add({
                targets: titleText,
                scale: 1.15,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut',
            });
            this.scene.cameras.main.flash(500, 255, 215, 0);
        }
    }

    public destroy(): void {
        if (this.overlay && this.overlay.scene) {
            this.overlay.destroy();
            this.overlay = null;
        }
        this.uiElements.forEach((el) => {
            if (el && el.scene) el.destroy(true);
        });
        this.uiElements = [];
    }
}
