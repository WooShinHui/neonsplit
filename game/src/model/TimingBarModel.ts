import Phaser from 'phaser';

export type BarType = 'normal' | 'speed' | 'slow' | 'tiny' | 'bonus';

export type HitJudgmentType =
    | 'FLAWLESS'
    | 'PERFECT'
    | 'GREAT'
    | 'GOOD'
    | 'MISS'
    | 'FAKE';

export interface SpeedTrapZone {
    start: number;
    end: number;
    multiplier: number;
}

export interface BarConfig {
    type: BarType;
    width: number;
    height: number;
    speedMultiplier: number;
    isBonus: boolean;
    color: number;
    targetOffset: number;
    cursorStartsLeft: boolean;
    hasFakeTarget: boolean;
    fakeTargetX: number;
    hasFakeTarget2: boolean;
    fakeTargetX2: number;
    speedTrapZones: SpeedTrapZone[];
    hasTeleportZone: boolean;
    teleportZoneX: number;
    teleportWidth: number;
    cursorDuration: number;
}

export interface JudgmentResult {
    judgment: HitJudgmentType;
    feedbackText: string;
    accuracy: number;
    points: number;
    timeBonus: number;
    freezeTime: number;
    colorNum: number;
    colorHex: string;
    isHit: boolean;
    isPerfectHit: boolean;
    hitFakeTarget: boolean;
}

export class TimingBarModel {
    public readonly BASE_CURSOR_SPEED: number = 1700;
    public readonly PERFECT_THRESHOLD: number = 90;
    public readonly GREAT_THRESHOLD: number = 85;
    public readonly GOOD_THRESHOLD: number = 70;
    public readonly TARGET_OFFSET_RANGE: number = 0.2;
    public readonly SPEED_INCREASE_PER_1000_SCORE: number = 0.01;

    public currentBarConfig: BarConfig | null = null;

    public determineBarType(combo: number): BarType {
        const rand = Math.random();
        const chaosLevel = Math.min(combo * 0.02, 0.4);

        if (rand < 0.04 + chaosLevel * 0.5) return 'bonus';
        if (rand < 0.15 + chaosLevel) return 'tiny';
        if (rand < 0.3 + chaosLevel) return 'speed';
        if (rand < 0.45 + chaosLevel) return 'slow';
        return 'normal';
    }

    public generateBar(
        isMobile: boolean,
        combo: number,
        score: number,
        themeHue: number
    ): BarConfig {
        const barType = this.determineBarType(combo);
        const mobileSizeMultiplier = isMobile ? 2.0 : 1;

        let barWidth: number;
        let speedMultiplier = 1;
        let isBonus = false;
        let barColor: number;

        switch (barType) {
            case 'bonus':
                barWidth = Phaser.Math.Between(180, 280) * mobileSizeMultiplier;
                speedMultiplier = 1.4;
                isBonus = true;
                barColor = 0xffd700;
                break;
            case 'tiny':
                barWidth = Phaser.Math.Between(250, 350) * mobileSizeMultiplier;
                speedMultiplier = 1.1;
                barColor = 0xff00ff;
                break;
            case 'speed':
                barWidth = Phaser.Math.Between(400, 550) * mobileSizeMultiplier;
                speedMultiplier = 1.5;
                barColor = 0xff0055;
                break;
            case 'slow':
                barWidth = Phaser.Math.Between(500, 650) * mobileSizeMultiplier;
                speedMultiplier = 0.7;
                barColor = 0x00ff88;
                break;
            default:
                barWidth = Phaser.Math.Between(350, 550) * mobileSizeMultiplier;
                speedMultiplier = 1;
                barColor = Phaser.Display.Color.HSLToColor(
                    themeHue / 360,
                    0.9,
                    0.55
                ).color;
        }

        const barHeight = isMobile ? 112 : 56;
        const targetOffset = Phaser.Math.FloatBetween(
            -this.TARGET_OFFSET_RANGE,
            this.TARGET_OFFSET_RANGE
        );

        const hasFakeTarget = Math.random() < 0.18;
        let fakeTargetX = 0;
        let hasFakeTarget2 = false;
        let fakeTargetX2 = 0;

        const targetX = barWidth * targetOffset;

        if (hasFakeTarget) {
            let offset: number;
            do {
                offset = Phaser.Math.Between(
                    (-barWidth / 2) * 0.7,
                    (barWidth / 2) * 0.7
                );
            } while (Math.abs(offset - targetX) < 80 * mobileSizeMultiplier);
            fakeTargetX = offset;

            if (Math.random() < 0.4) {
                hasFakeTarget2 = true;
                let offset2: number;
                let attempts = 0;
                do {
                    offset2 = Phaser.Math.Between(
                        (-barWidth / 2) * 0.7,
                        (barWidth / 2) * 0.7
                    );
                    attempts++;
                } while (
                    (Math.abs(offset2 - targetX) < 80 * mobileSizeMultiplier ||
                        Math.abs(offset2 - fakeTargetX) < 60 * mobileSizeMultiplier) &&
                    attempts < 10
                );
                fakeTargetX2 = offset2;
            }
        }

        // 속도 함정 존
        const speedTrapZones: SpeedTrapZone[] = [];
        if (Math.random() < 0.3 && !isBonus) {
            const trapCount = Phaser.Math.Between(1, 2);
            for (let i = 0; i < trapCount; i++) {
                const trapWidth = Phaser.Math.Between(60, 100) * mobileSizeMultiplier;
                const trapStart = Phaser.Math.Between(
                    -barWidth / 2 + 50 * mobileSizeMultiplier,
                    barWidth / 2 - trapWidth - 50 * mobileSizeMultiplier
                );
                speedTrapZones.push({
                    start: trapStart,
                    end: trapStart + trapWidth,
                    multiplier: Math.random() < 0.5 ? 2.0 : 0.5,
                });
            }
        }

        const cursorStartsLeft = Math.random() < 0.5;

        // 텔레포트 존
        const teleportProbability = Math.min(0.1 + combo * 0.003, 0.25);
        const hasTeleportZone = Math.random() < teleportProbability;
        const teleportWidth = 30 * mobileSizeMultiplier;
        let teleportZoneX = 0;
        if (hasTeleportZone) {
            teleportZoneX = Phaser.Math.Between(
                (-barWidth / 2) * 0.6,
                (barWidth / 2) * 0.6
            );
        }

        // 커서 이동 시간 계산
        const scoreSpeedBonus =
            (score / 1000) * this.SPEED_INCREASE_PER_1000_SCORE;
        const totalMultiplier = speedMultiplier * (1 + scoreSpeedBonus);
        const cursorDuration = this.BASE_CURSOR_SPEED / totalMultiplier;

        const config: BarConfig = {
            type: barType,
            width: barWidth,
            height: barHeight,
            speedMultiplier,
            isBonus,
            color: barColor,
            targetOffset,
            cursorStartsLeft,
            hasFakeTarget,
            fakeTargetX,
            hasFakeTarget2,
            fakeTargetX2,
            speedTrapZones,
            hasTeleportZone,
            teleportZoneX,
            teleportWidth,
            cursorDuration,
        };

        this.currentBarConfig = config;
        return config;
    }

    public judgeHit(
        cursorX: number,
        combo: number,
        multiplier: number
    ): JudgmentResult {
        if (!this.currentBarConfig) {
            return {
                judgment: 'MISS',
                feedbackText: 'MISS',
                accuracy: 0,
                points: 0,
                timeBonus: -3,
                freezeTime: 0,
                colorNum: 0xff0055,
                colorHex: '#ff0055',
                isHit: false,
                isPerfectHit: false,
                hitFakeTarget: false,
            };
        }

        const config = this.currentBarConfig;

        // 가짜 타겟 적중 여부 체크
        let hitFakeTarget = false;
        if (config.hasFakeTarget) {
            const distanceToFake = Math.abs(cursorX - config.fakeTargetX);
            if (distanceToFake < 20) {
                hitFakeTarget = true;
            }
        }
        if (!hitFakeTarget && config.hasFakeTarget2) {
            const distanceToFake2 = Math.abs(cursorX - config.fakeTargetX2);
            if (distanceToFake2 < 20) {
                hitFakeTarget = true;
            }
        }

        const barWidth = config.width;
        const targetX = barWidth * config.targetOffset;
        const distanceFromTarget = Math.abs(cursorX - targetX);
        const accuracy = Math.max(
            0,
            (1 - distanceFromTarget / (barWidth / 2)) * 100
        );

        let judgment: HitJudgmentType = 'MISS';
        let feedbackText = 'MISS';
        let colorNum = 0xff0055;
        let freezeTime = 0;
        let basePoints = 0;
        let isPerfectHit = false;
        let timeBonus = 0;
        let isHit = false;

        if (hitFakeTarget) {
            judgment = 'FAKE';
            feedbackText = 'FAKE!';
            colorNum = 0xff0000;
            timeBonus = -3;
        } else if (accuracy >= this.PERFECT_THRESHOLD) {
            judgment = 'PERFECT';
            feedbackText = 'PERFECT!';
            colorNum = 0xffff00;
            basePoints = 300;
            timeBonus = 3;
            isPerfectHit = true;
            isHit = true;
            freezeTime = 110;
        } else if (accuracy >= this.GREAT_THRESHOLD) {
            judgment = 'GREAT';
            feedbackText = 'GREAT';
            colorNum = 0x00ff88;
            basePoints = 150;
            timeBonus = 2;
            isHit = true;
            freezeTime = 55;
        } else if (accuracy >= this.GOOD_THRESHOLD) {
            judgment = 'GOOD';
            feedbackText = 'GOOD';
            colorNum = 0x00aaff;
            basePoints = 50;
            timeBonus = 1;
            isHit = true;
        } else {
            judgment = 'MISS';
            feedbackText = 'MISS';
            colorNum = 0xff0055;
            timeBonus = -3;
        }

        let finalPoints = basePoints;
        if (basePoints > 0) {
            if (config.isBonus) {
                finalPoints *= 3;
            }
            const comboBonus = 1 + combo * 0.08;
            finalPoints *= comboBonus;
            finalPoints *= multiplier;

            if (accuracy >= 99 && isPerfectHit) {
                finalPoints *= 1.5;
                judgment = 'FLAWLESS';
                feedbackText = 'FLAWLESS!!';
            }
            finalPoints = Math.floor(finalPoints);
        }

        const colorHex = '#' + colorNum.toString(16).padStart(6, '0');

        return {
            judgment,
            feedbackText,
            accuracy,
            points: finalPoints,
            timeBonus,
            freezeTime,
            colorNum,
            colorHex,
            isHit,
            isPerfectHit,
            hitFakeTarget,
        };
    }
}
