import Phaser from 'phaser';
import { BackgroundView } from './BackgroundView';
import { TimingBarView } from './TimingBarView';
import { HUDView } from './HUDView';
import { FXView } from './FXView';
import { StartScreenView } from './StartScreenView';
import { ResultScreenView } from './ResultScreenView';
import { TutorialView } from './TutorialView';

export class MainView {
    public scene: Phaser.Scene;
    public isMobile: boolean;

    public background: BackgroundView;
    public timingBar: TimingBarView;
    public hud: HUDView;
    public fx: FXView;
    public startScreen: StartScreenView;
    public resultScreen: ResultScreenView;
    public tutorial: TutorialView;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;

        this.background = new BackgroundView(scene, isMobile);
        this.timingBar = new TimingBarView(scene, isMobile);
        this.hud = new HUDView(scene, isMobile);
        this.fx = new FXView(scene, isMobile);
        this.startScreen = new StartScreenView(scene, isMobile);
        this.resultScreen = new ResultScreenView(scene, isMobile);
        this.tutorial = new TutorialView(scene, isMobile);
    }

    public init(): void {
        this.background.init();
        this.fx.init();
        this.hud.init();
    }

    public update(score: number, delta: number): void {
        this.background.update(score, delta);
        this.timingBar.updateCursorMovement();
    }

    public destroy(): void {
        this.background.destroy();
        this.timingBar.destroy();
        this.hud.destroy();
        this.fx.destroy();
        this.resultScreen.destroy();
        this.tutorial.destroy();
    }
}

export * from './BackgroundView';
export * from './TimingBarView';
export * from './HUDView';
export * from './FXView';
export * from './StartScreenView';
export * from './ResultScreenView';
export * from './TutorialView';
