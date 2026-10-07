export interface PlayerInfo {
    playerName: string;
    countryCode: string;
    uniquePlayerId: string;
}

export class GameStateModel {
    public readonly INITIAL_TIME: number = 20;
    public readonly MAX_TIME: number = 20;
    public readonly TIME_PERFECT: number = 3;
    public readonly TIME_GREAT: number = 2;
    public readonly TIME_GOOD: number = 1;
    public readonly TIME_MISS: number = -3;

    public isPlaying: boolean = false;
    public isInputLocked: boolean = false;
    public score: number = 0;
    public combo: number = 0;
    public maxCombo: number = 0;
    public timeLeft: number = 20;
    public multiplier: number = 1;
    public consecutivePerfects: number = 0;

    // 통계 수치
    public totalHits: number = 0;
    public perfectHits: number = 0;
    public greatHits: number = 0;
    public goodHits: number = 0;
    public missHits: number = 0;

    // 세션 기록
    public sessionBest: number = 0;
    public sessionBestCombo: number = 0;
    public gamesPlayed: number = 0;

    // 테마 색상 (Hue)
    public themeHue: number = 200;

    // 플레이어 정보
    public playerName: string = 'Guest';
    public countryCode: string = 'UNKNOWN';
    public uniquePlayerId: string = '';

    // 다음 랭크 점수
    public nextRankScore: number = 0;
    public previousRank: number = 0;

    constructor() {
        this.uniquePlayerId = this.getOrCreatePlayerId();
        this.timeLeft = this.INITIAL_TIME;
    }

    public resetRoundState(): void {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = this.INITIAL_TIME;
        this.multiplier = 1;
        this.consecutivePerfects = 0;

        this.totalHits = 0;
        this.perfectHits = 0;
        this.greatHits = 0;
        this.goodHits = 0;
        this.missHits = 0;

        this.themeHue = 200;
        this.isPlaying = false;
        this.isInputLocked = false;
    }

    public addTime(seconds: number): number {
        this.timeLeft += seconds;
        this.timeLeft = Math.min(this.timeLeft, this.MAX_TIME);
        return this.timeLeft;
    }

    public deductTime(deltaSeconds: number): number {
        this.timeLeft = Math.max(0, this.timeLeft - deltaSeconds);
        return this.timeLeft;
    }

    public addScore(points: number): number {
        this.score += points;
        return this.score;
    }

    public updateThemeHue(): number {
        this.themeHue = Math.max(0, 200 - this.combo * 3.5);
        return this.themeHue;
    }

    public updateSessionBest(): { isSessionBest: boolean } {
        const isSessionBest = this.score > this.sessionBest;
        if (isSessionBest) {
            this.sessionBest = this.score;
            this.sessionBestCombo = this.maxCombo;
        }
        return { isSessionBest };
    }

    private getOrCreatePlayerId(): string {
        const STORAGE_KEY = 'neon_split_player_id';
        let playerId = localStorage.getItem(STORAGE_KEY);
        if (!playerId) {
            playerId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
            localStorage.setItem(STORAGE_KEY, playerId);
        }
        return playerId;
    }
}
