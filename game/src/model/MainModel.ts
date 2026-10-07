import { GameStateModel } from './GameStateModel';
import { TimingBarModel, BarConfig, JudgmentResult } from './TimingBarModel';
import { StageModel } from './StageModel';
import { LeaderboardModel } from './LeaderboardModel';

export class MainModel {
    public gameState: GameStateModel;
    public timingBar: TimingBarModel;
    public stage: StageModel;
    public leaderboard: LeaderboardModel;

    constructor() {
        this.gameState = new GameStateModel();
        this.timingBar = new TimingBarModel();
        this.stage = new StageModel();
        this.leaderboard = new LeaderboardModel();
    }

    public resetGame(): void {
        this.gameState.resetRoundState();
        this.stage.reset();
        this.timingBar.currentBarConfig = null;
    }

    public generateNextBar(isMobile: boolean): BarConfig {
        const themeHue = this.gameState.updateThemeHue();
        return this.timingBar.generateBar(
            isMobile,
            this.gameState.combo,
            this.gameState.score,
            themeHue
        );
    }

    public judgePlayerHit(cursorX: number): JudgmentResult {
        const result = this.timingBar.judgeHit(
            cursorX,
            this.gameState.combo,
            this.gameState.multiplier
        );

        this.gameState.totalHits++;

        if (result.hitFakeTarget) {
            this.gameState.combo = Math.max(0, this.gameState.combo - 5);
            this.gameState.consecutivePerfects = 0;
            this.gameState.missHits++;
        } else if (result.judgment === 'PERFECT' || result.judgment === 'FLAWLESS') {
            this.gameState.combo++;
            this.gameState.perfectHits++;
            this.gameState.consecutivePerfects++;

            if (this.gameState.consecutivePerfects % 3 === 0) {
                this.gameState.multiplier = Math.min(
                    5,
                    this.gameState.multiplier + 0.5
                );
            }
        } else if (result.judgment === 'GREAT') {
            this.gameState.combo++;
            this.gameState.greatHits++;
            this.gameState.consecutivePerfects = 0;
        } else if (result.judgment === 'GOOD') {
            this.gameState.goodHits++;
            this.gameState.combo = Math.max(0, this.gameState.combo - 1);
            this.gameState.consecutivePerfects = 0;
            this.gameState.multiplier = Math.max(
                1,
                this.gameState.multiplier - 0.2
            );
        } else {
            this.gameState.missHits++;
            this.gameState.combo = 0;
            this.gameState.consecutivePerfects = 0;
            this.gameState.multiplier = 1;
        }

        if (this.gameState.combo > this.gameState.maxCombo) {
            this.gameState.maxCombo = this.gameState.combo;
        }

        this.gameState.addTime(result.timeBonus);
        this.gameState.addScore(result.points);

        return result;
    }
}

export * from './GameStateModel';
export * from './TimingBarModel';
export * from './StageModel';
export * from './LeaderboardModel';
