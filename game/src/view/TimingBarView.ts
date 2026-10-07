import Phaser from 'phaser';
import { BarConfig } from '../model/TimingBarModel';

export class TimingBarView {
    private scene: Phaser.Scene;
    private isMobile: boolean;

    private currentBar: Phaser.GameObjects.Container | null = null;
    private cursor: Phaser.GameObjects.Rectangle | null = null;
    private cursorTween: Phaser.Tweens.Tween | null = null;
    private currentConfig: BarConfig | null = null;

    private hasTeleportZoneActive: boolean = false;

    // 콜백: 텔레포트/고스트 트리거 시
    public onGhostModeTriggered?: (cursorX: number) => void;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;
    }

    public getCursorX(): number {
        return this.cursor ? this.cursor.x : 0;
    }

    public getBarPosition(): { x: number; y: number } | null {
        if (!this.currentBar) return null;
        return { x: this.currentBar.x, y: this.currentBar.y };
    }

    public pauseCursor(): void {
        if (this.cursorTween) {
            this.cursorTween.pause();
        }
    }

    public resumeCursor(): void {
        if (this.cursorTween) {
            this.cursorTween.resume();
        }
    }

    public stopCursor(): void {
        if (this.cursorTween) {
            this.cursorTween.stop();
            this.cursorTween.remove();
            this.cursorTween = null;
        }
    }

    public renderBar(config: BarConfig): void {
        this.cleanupPreviousBar();
        this.currentConfig = config;
        this.hasTeleportZoneActive = config.hasTeleportZone;

        const { centerX, centerY } = this.scene.cameras.main;
        const barWidth = config.width;
        const barHeight = config.height;
        const glowPadding = this.isMobile ? 12 : 6;

        this.currentBar = this.scene.add.container(centerX, centerY);

        // 외곽 글로우
        const outerGlow = this.scene.add.graphics();
        outerGlow.fillStyle(config.color, config.isBonus ? 0.4 : 0.25);
        outerGlow.fillRoundedRect(
            -barWidth / 2 - glowPadding,
            -barHeight / 2 - 8,
            barWidth + glowPadding * 2,
            barHeight + 16,
            this.isMobile ? 16 : 8
        );
        this.currentBar.add(outerGlow);

        // 바 배경
        const barBg = this.scene.add.graphics();
        if (config.isBonus) {
            barBg.fillStyle(config.color, 1);
            barBg.fillRoundedRect(
                -barWidth / 2,
                -barHeight / 2,
                barWidth,
                barHeight,
                this.isMobile ? 12 : 6
            );
            this.scene.tweens.add({
                targets: outerGlow,
                alpha: 0.7,
                duration: 400,
                yoyo: true,
                repeat: -1,
            });
        } else {
            barBg.fillGradientStyle(
                config.color,
                config.color,
                0x000000,
                0x000000,
                0.9,
                1,
                1,
                1
            );
            barBg.fillRoundedRect(
                -barWidth / 2,
                -barHeight / 2,
                barWidth,
                barHeight,
                this.isMobile ? 12 : 6
            );
        }
        this.currentBar.add(barBg);

        // 속도 함정 표시
        for (const trap of config.speedTrapZones) {
            const trapGraphics = this.scene.add.graphics();
            trapGraphics.fillStyle(
                trap.multiplier > 1 ? 0xff0000 : 0x0088ff,
                0.25
            );
            trapGraphics.fillRect(
                trap.start,
                -barHeight / 2,
                trap.end - trap.start,
                barHeight
            );
            this.currentBar.add(trapGraphics);
        }

        // 가짜 타겟 표시
        if (config.hasFakeTarget) {
            this.renderFakeTarget(config.fakeTargetX, barHeight);
        }
        if (config.hasFakeTarget2) {
            this.renderFakeTarget(config.fakeTargetX2, barHeight);
        }

        // 텔레포트 존 표시
        if (config.hasTeleportZone) {
            const tpGraphics = this.scene.add.graphics();
            tpGraphics.fillStyle(0x9900ff, 0.4);
            tpGraphics.fillRect(
                config.teleportZoneX - config.teleportWidth / 2,
                -barHeight / 2,
                config.teleportWidth,
                barHeight
            );
            this.currentBar.add(tpGraphics);
        }

        // 목표 영역 (Target Zone)
        const targetX = barWidth * config.targetOffset;
        const targetWidth = this.isMobile ? 36 : 18;

        const targetGlow = this.scene.add.graphics();
        targetGlow.fillStyle(0xffffff, 0.3);
        targetGlow.fillRect(
            targetX - targetWidth / 2 - 4,
            -barHeight / 2 - 4,
            targetWidth + 8,
            barHeight + 8
        );
        this.currentBar.add(targetGlow);

        const target = this.scene.add.graphics();
        target.fillStyle(0xffffff, 0.95);
        target.fillRect(
            targetX - targetWidth / 2,
            -barHeight / 2,
            targetWidth,
            barHeight
        );
        this.currentBar.add(target);

        // 중앙 타겟 라인
        const centerLine = this.scene.add.graphics();
        centerLine.lineStyle(2, 0x00ffff, 0.8);
        centerLine.lineBetween(
            targetX,
            -barHeight / 2 - 6,
            targetX,
            barHeight / 2 + 6
        );
        this.currentBar.add(centerLine);

        // 커서 생성
        const cursorWidth = this.isMobile ? 16 : 8;
        const cursorHeight = barHeight + (this.isMobile ? 24 : 16);

        this.cursor = this.scene.add.rectangle(
            config.cursorStartsLeft ? -barWidth / 2 : barWidth / 2,
            0,
            cursorWidth,
            cursorHeight,
            0xffffff
        );
        this.cursor.setStrokeStyle(2, 0x00ffff);
        this.currentBar.add(this.cursor);

        // 커서 이동 애니메이션
        const startX = config.cursorStartsLeft ? -barWidth / 2 : barWidth / 2;
        const endX = config.cursorStartsLeft ? barWidth / 2 : -barWidth / 2;

        this.cursor.x = startX;

        this.cursorTween = this.scene.tweens.add({
            targets: this.cursor,
            x: endX,
            duration: config.cursorDuration,
            yoyo: true,
            repeat: -1,
            ease: 'Linear',
        });
    }

    private renderFakeTarget(fakeX: number, barHeight: number): void {
        if (!this.currentBar) return;
        const fakeWidth = this.isMobile ? 32 : 16;
        const fakeGlow = this.scene.add.graphics();
        fakeGlow.fillStyle(0xff0055, 0.4);
        fakeGlow.fillRect(
            fakeX - fakeWidth / 2 - 3,
            -barHeight / 2 - 3,
            fakeWidth + 6,
            barHeight + 6
        );
        this.currentBar.add(fakeGlow);

        const fakeTarget = this.scene.add.graphics();
        fakeTarget.fillStyle(0xff2222, 0.85);
        fakeTarget.fillRect(
            fakeX - fakeWidth / 2,
            -barHeight / 2,
            fakeWidth,
            barHeight
        );
        this.currentBar.add(fakeTarget);
    }

    public updateCursorMovement(): void {
        if (
            !this.cursorTween ||
            !this.cursor ||
            !this.currentBar ||
            !this.currentConfig
        )
            return;
        if (!this.cursor.scene) return;

        const cursorX = this.cursor.x;
        let newTimeScale = 1;

        for (const trap of this.currentConfig.speedTrapZones) {
            if (cursorX >= trap.start && cursorX <= trap.end) {
                newTimeScale = trap.multiplier;
                break;
            }
        }

        this.cursorTween.timeScale = newTimeScale;

        // 텔레포트 존 체크
        if (this.hasTeleportZoneActive && this.currentConfig.hasTeleportZone) {
            const tpStart =
                this.currentConfig.teleportZoneX -
                this.currentConfig.teleportWidth / 2;
            const tpEnd =
                this.currentConfig.teleportZoneX +
                this.currentConfig.teleportWidth / 2;

            if (cursorX >= tpStart && cursorX <= tpEnd) {
                this.hasTeleportZoneActive = false;
                this.executeGhostMode();
                if (this.onGhostModeTriggered) {
                    this.onGhostModeTriggered(cursorX);
                }
            }
        }
    }

    public executeGhostMode(): void {
        if (!this.cursor) return;

        this.scene.tweens.add({
            targets: this.cursor,
            alpha: 0.2,
            duration: 200,
            ease: 'Cubic.out',
        });

        this.scene.cameras.main.flash(100, 153, 0, 255, false);

        this.scene.time.delayedCall(1000, () => {
            if (!this.cursor || !this.currentBar) return;
            this.scene.tweens.add({
                targets: this.cursor,
                alpha: 1,
                duration: 200,
                ease: 'Cubic.in',
            });
        });
    }

    public createSplitEffect(cursorX: number, barColor: number): void {
        if (!this.currentBar || !this.currentConfig) return;

        const barX = this.currentBar.x;
        const barY = this.currentBar.y;
        const barW = this.currentConfig.width;
        const barH = 56;

        const leftWidth = barW / 2 + cursorX;
        const rightWidth = barW / 2 - cursorX;

        const left = this.scene.add.rectangle(
            barX - barW / 4 + cursorX / 2,
            barY,
            leftWidth,
            barH,
            barColor
        );

        const right = this.scene.add.rectangle(
            barX + barW / 4 + cursorX / 2,
            barY,
            rightWidth,
            barH,
            barColor
        );

        this.scene.tweens.add({
            targets: left,
            x: barX - barW / 2 - 100,
            y: barY + 200,
            angle: -25,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => left.destroy(),
        });

        this.scene.tweens.add({
            targets: right,
            x: barX + barW / 2 + 100,
            y: barY + 200,
            angle: 25,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => right.destroy(),
        });

        const flash = this.scene.add.rectangle(
            barX + cursorX,
            barY,
            4,
            barH * 3,
            0xffffff
        );

        this.scene.tweens.add({
            targets: flash,
            scaleY: 2,
            scaleX: 0,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => flash.destroy(),
        });
    }

    public cleanupPreviousBar(): void {
        this.stopCursor();
        if (this.currentBar) {
            this.currentBar.destroy(true);
            this.currentBar = null;
        }
        this.cursor = null;
        this.currentConfig = null;
    }

    public destroy(): void {
        this.cleanupPreviousBar();
    }
}
