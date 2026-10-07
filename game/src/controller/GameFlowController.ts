import Phaser from 'phaser';

export class GameFlowController {
    private scene: Phaser.Scene;
    private isBgmPlaying: boolean = false;
    private lastSecondFloor: number = -1;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public playBGM(key: string = 'bgm'): void {
        if (!this.isBgmPlaying) {
            if (typeof (this.scene as any).playBGM === 'function') {
                (this.scene as any).playBGM(key);
            } else {
                this.scene.sound.play(key, { loop: true, volume: 1 });
            }
            this.isBgmPlaying = true;
        }
    }

    public stopBGM(key: string = 'bgm'): void {
        if (typeof (this.scene as any).stopBgm === 'function') {
            (this.scene as any).stopBgm();
        }
        this.scene.sound.stopByKey(key);
        this.isBgmPlaying = false;
    }

    public playAudio(key: string, volume: number = 1): void {
        if (typeof (this.scene as any).playAudio === 'function') {
            (this.scene as any).playAudio(key);
        } else {
            this.scene.sound.play(key, { volume });
        }
    }

    public startCrazyGamesGameplay(): void {
        if (window.CrazyGames?.SDK?.game) {
            window.CrazyGames.SDK.game.gameplayStart();
        }
    }

    public stopCrazyGamesGameplay(): void {
        if (window.CrazyGames?.SDK?.game) {
            window.CrazyGames.SDK.game.gameplayStop();
        }
    }

    public triggerHappyTime(): void {
        if (window.CrazyGames?.SDK?.game) {
            window.CrazyGames.SDK.game.happytime();
        }
    }

    public async showMidgameAd(): Promise<void> {
        if (window.CrazyGames?.SDK?.ad) {
            this.stopCrazyGamesGameplay();
            try {
                this.scene.sound.pauseAll();
                await window.CrazyGames.SDK.ad.requestAd('midgame');
            } catch (e) {
                console.warn('Ad error or skipped:', e);
            } finally {
                this.scene.sound.resumeAll();
                this.startCrazyGamesGameplay();
            }
        }
    }

    public checkCountdownAudio(timeLeft: number): void {
        if (timeLeft <= 5 && timeLeft > 0) {
            const currentFloor = Math.floor(timeLeft);
            if (currentFloor !== this.lastSecondFloor) {
                this.lastSecondFloor = currentFloor;
                this.playAudio('count');
            }
        } else {
            this.lastSecondFloor = -1;
        }
    }

    public reset(): void {
        this.lastSecondFloor = -1;
    }
}
