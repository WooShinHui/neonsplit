import Phaser from 'phaser';
import { MainModel } from '../model/MainModel';
import { MainView } from '../view/MainView';
import { InputController } from './InputController';
import { GameFlowController } from './GameFlowController';

export class MainController {
    private scene: Phaser.Scene;
    private isMobile: boolean;

    public model: MainModel;
    public view: MainView;
    public inputController: InputController;
    public flowController: GameFlowController;

    private isResultShowing: boolean = false;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;

        this.model = new MainModel();
        this.view = new MainView(scene, isMobile);
        this.inputController = new InputController(scene, isMobile);
        this.flowController = new GameFlowController(scene);

        this.bindEvents();
    }

    private bindEvents(): void {
        this.inputController.onActionTriggered = () => {
            this.handlePlayerAction();
        };

        this.view.startScreen.onStartClicked = () => {
            this.startGame();
        };

        this.view.resultScreen.onPlayAgainClicked = () => {
            this.restartGame();
        };

        this.view.timingBar.onGhostModeTriggered = (cursorX: number) => {
            const barPos = this.view.timingBar.getBarPosition();
            if (barPos) {
                this.view.fx.explodeParticles(
                    barPos.x + cursorX,
                    barPos.y,
                    0x9900ff,
                    20
                );
            }
        };
    }

    public async init(): Promise<void> {
        this.view.init();

        // 플레이어 정보 초기화
        if (typeof window.CrazyGames !== 'undefined') {
            try {
                await window.CrazyGames.SDK.init();
                const user = await window.CrazyGames.SDK.user.getUser();
                this.model.gameState.countryCode =
                    await this.model.leaderboard.detectCountryCode();

                if (user?.username) {
                    this.model.gameState.playerName = user.username;
                } else {
                    const shortId = this.model.gameState.uniquePlayerId.substring(
                        0,
                        8
                    );
                    this.model.gameState.playerName = `Guest_${shortId}`;
                }
            } catch (e) {
                console.error('CrazyGames SDK user fetch error:', e);
                this.model.gameState.countryCode = 'UNKNOWN';
                const shortId = this.model.gameState.uniquePlayerId.substring(
                    0,
                    8
                );
                this.model.gameState.playerName = `Guest_${shortId}`;
            }
        } else {
            this.model.gameState.countryCode =
                await this.model.leaderboard.detectCountryCode();
            const shortId = this.model.gameState.uniquePlayerId.substring(0, 8);
            this.model.gameState.playerName = `Guest_${shortId}`;
        }

        // 시작 화면 표시
        const topPlayersPromise = this.model.leaderboard.fetchTopPlayers(3);
        this.view.startScreen.show(
            this.model.gameState.sessionBest,
            this.model.gameState.playerName,
            topPlayersPromise
        );
    }

    public startGame(): void {
        this.model.resetGame();
        this.model.gameState.isPlaying = true;
        this.isResultShowing = false;

        this.flowController.reset();
        this.flowController.playBGM('bgm');
        this.flowController.startCrazyGamesGameplay();

        this.spawnBar();
        this.refreshNextRankTarget();

        this.inputController.attach();

        if (!this.view.tutorial.hasSeenTutorial()) {
            this.view.tutorial.showHint(() => {
                // 튜토리얼 종료 처리
            });
        }
    }

    private spawnBar(): void {
        if (!this.model.gameState.isPlaying) return;

        const config = this.model.generateNextBar(this.isMobile);
        this.view.timingBar.renderBar(config);
        this.view.background.setGridTint(config.color);
    }

    private handlePlayerAction(): void {
        if (!this.model.gameState.isPlaying) return;
        if (this.inputController.getIsLocked()) return;

        // 튜토리얼이 켜져있다면 숨김
        this.view.tutorial.hide();

        // 커서 멈춤 및 입력 잠금
        this.inputController.lock();
        this.view.timingBar.pauseCursor();

        const cursorX = this.view.timingBar.getCursorX();
        const barPos = this.view.timingBar.getBarPosition() || {
            x: this.scene.cameras.main.centerX,
            y: this.scene.cameras.main.centerY,
        };
        const globalX = barPos.x + cursorX;
        const globalY = barPos.y;

        // Model에 판정 요청 ("판단하는 Model")
        const result = this.model.judgePlayerHit(cursorX);
        const barConfig = this.model.timingBar.currentBarConfig;
        const barColor = barConfig ? barConfig.color : 0x00ffff;

        // 사운드 및 View 연출 ("보여주는 연출 따로")
        if (result.hitFakeTarget) {
            this.flowController.playAudio('miss');
            this.view.hud.hideMultiplier();
            this.view.fx.triggerShake(300, 0.015);
        } else if (
            result.judgment === 'PERFECT' ||
            result.judgment === 'FLAWLESS'
        ) {
            this.flowController.playAudio('hit1');
            this.flowController.playAudio('clap');
            this.view.fx.triggerImpactEffects(true);
            this.view.background.bumpTilePositionY(25);

            if (this.model.gameState.consecutivePerfects % 3 === 0) {
                this.view.hud.updateMultiplier(this.model.gameState.multiplier);
                this.view.fx.triggerFlash(200, 255, 0, 255);
            }
        } else if (result.judgment === 'GREAT') {
            this.flowController.playAudio('hit2');
            this.view.fx.triggerImpactEffects(false);
            this.view.background.bumpTilePositionY(12);
        } else if (result.judgment === 'GOOD') {
            this.flowController.playAudio('hit3');
        } else {
            this.flowController.playAudio('miss');
            this.view.hud.hideMultiplier();
            this.view.fx.triggerShake(250, 0.012);
        }

        // HUD 업데이트
        this.view.hud.updateScore(this.model.gameState.score);
        this.view.hud.updateCombo(this.model.gameState.combo);
        this.view.hud.updateTimeDisplay(
            this.model.gameState.timeLeft,
            this.model.gameState.MAX_TIME
        );

        if (result.timeBonus > 0) {
            this.view.fx.showTimeBonus(result.timeBonus);
            this.view.fx.triggerFlash(100, 0, 255, 0);
        } else if (result.timeBonus < 0) {
            this.view.fx.showTimeBonus(result.timeBonus);
        }

        // 팝업 및 파티클 연출
        this.view.fx.showPopup(
            globalX,
            globalY,
            result.feedbackText,
            result.colorHex,
            result.points
        );
        this.view.fx.explodeParticles(
            globalX,
            globalY,
            result.colorNum,
            result.judgment === 'FLAWLESS'
                ? 50
                : result.judgment === 'PERFECT'
                ? 35
                : 18
        );

        // 스테이지 전환 체크
        const stageTransition = this.model.stage.checkStageTransition(
            this.model.gameState.score
        );
        if (stageTransition) {
            this.view.background.transitionToStage(stageTransition.newStage);
            this.view.fx.showStageNotification(stageTransition.newStage);
        }

        // 랭크 타깃 텍스트 업데이트
        this.view.hud.updateNextRankUI(
            this.model.gameState.score,
            this.model.gameState.nextRankScore,
            () => {
                this.scene.time.delayedCall(2000, () => {
                    if (this.model.gameState.isPlaying) {
                        this.refreshNextRankTarget();
                    }
                });
            }
        );

        // 프리즈 타임 처리 후 라운드 완료
        if (result.freezeTime > 0 && !result.hitFakeTarget) {
            this.scene.time.delayedCall(result.freezeTime, () => {
                this.finalizeRound(cursorX, barColor);
            });
        } else {
            this.finalizeRound(cursorX, barColor);
        }
    }

    private finalizeRound(cursorX: number, barColor: number): void {
        this.view.timingBar.createSplitEffect(cursorX, barColor);
        this.view.timingBar.cleanupPreviousBar();

        this.scene.time.delayedCall(180, () => {
            this.inputController.unlock();
            if (this.model.gameState.isPlaying) {
                this.spawnBar();
            }
        });
    }

    public update(time: number, delta: number): void {
        if (!this.model.gameState.isPlaying) return;

        // View 업데이트 (배경 애니메이션, 커서 이동 및 속도 함정/고스트 체크)
        this.view.update(this.model.gameState.score, delta);

        // 시간 감소
        const deltaSeconds = delta / 1000;
        this.model.gameState.deductTime(deltaSeconds);

        // 카운트다운 사운드
        this.flowController.checkCountdownAudio(this.model.gameState.timeLeft);

        // HUD 시간 갱신
        this.view.hud.updateTimeDisplay(
            this.model.gameState.timeLeft,
            this.model.gameState.MAX_TIME
        );

        // 타임 오버 체크
        if (this.model.gameState.timeLeft <= 0) {
            this.endGame();
        }
    }

    private async refreshNextRankTarget(): Promise<void> {
        const nextScore = await this.model.leaderboard.fetchNextRankScore(
            this.model.gameState.score
        );
        if (nextScore !== null) {
            this.model.gameState.nextRankScore = nextScore;
            this.view.hud.updateNextRankUI(
                this.model.gameState.score,
                this.model.gameState.nextRankScore
            );
        }
    }

    public async endGame(): Promise<void> {
        if (!this.model.gameState.isPlaying) return;
        this.model.gameState.isPlaying = false;
        this.inputController.detach();
        this.view.timingBar.stopCursor();
        this.flowController.stopBGM('bgm');

        this.model.gameState.gamesPlayed++;

        // 광고 처리
        if (this.model.gameState.gamesPlayed % 2 === 0) {
            await this.flowController.showMidgameAd();
        }

        this.model.gameState.previousRank =
            await this.model.leaderboard.fetchMyRank(
                this.model.gameState.score
            );

        const isRealNewRecord = await this.model.leaderboard.submitScore(
            this.model.gameState.playerName,
            this.model.gameState.score,
            this.model.gameState.countryCode,
            this.model.gameState.uniquePlayerId
        );

        const { isSessionBest } = this.model.gameState.updateSessionBest();

        if (isRealNewRecord) {
            this.flowController.triggerHappyTime();
        }

        const leaderboard = await this.model.leaderboard.fetchTopPlayers(5);
        const myRank = await this.model.leaderboard.fetchMyRank(
            this.model.gameState.score
        );

        const currentStage = this.model.stage.getCurrentStage();
        const nextStage = this.model.stage.getNextStage();
        const stageProgress = this.model.stage.getProgress(
            this.model.gameState.score
        );

        this.isResultShowing = true;
        this.view.resultScreen.show({
            score: this.model.gameState.score,
            maxCombo: this.model.gameState.maxCombo,
            totalHits: this.model.gameState.totalHits,
            perfectHits: this.model.gameState.perfectHits,
            greatHits: this.model.gameState.greatHits,
            isRealNewRecord,
            isSessionBest,
            myRank,
            previousRank: this.model.gameState.previousRank,
            playerName: this.model.gameState.playerName,
            countryCode: this.model.gameState.countryCode,
            nextRankScore: this.model.gameState.nextRankScore,
            currentStage,
            nextStage,
            stageProgress,
            leaderboard,
        });
    }

    public restartGame(): void {
        this.view.destroy();
        this.scene.scene.restart();
    }

    public destroy(): void {
        this.inputController.destroy();
        this.view.destroy();
    }
}

export * from './InputController';
export * from './GameFlowController';
