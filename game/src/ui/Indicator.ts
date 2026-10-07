import { ContainerX } from '../core/ContainerX';
import { Step } from './Step';

export class Indicator extends ContainerX {
    private step0: Step;
    private step1: Step;
    private step2: Step;
    private step3: Step;
    private step4: Step;

    private currentIndex: number;
    private total: number;

    /**
     * 인디케이터 생성
     * @param {SceneX} $scene 재생 되는 씬
     */
    constructor($scene: Phaser.Scene) {
        super($scene, 0, 0);
        this.scene = $scene;

        this.currentIndex = 0;
        this.total = this.scene.game.gameState.indicatorTotal;
        const sDistance = this.scene.game.gameState.indicatorDistance;
        const sX = this.scene.game.gameState.indicatorStX;
        const sY = this.scene.game.gameState.indicatorStY;

        let px = sX - (this.total - 1) * sDistance;

        for (let i = 0; i < this.total; i++) {
            this['step' + i] = new Step(this.scene, px, sY);
            this.add(this['step' + i]);
            px += sDistance;
        }
        this.scene.add.existing(this);
    }

    public nextStep(): void {
        const step: Step = this['step' + this.currentIndex];
        if (step) {
            step.setFill(true);
            this.playAudio('indicator');
            this.currentIndex++;
        }

        //if (this.currentIndex >= this.total) this.currentIndex = this.total - 1;
    }

    public setFill($n: number) {
        let sndPlay: boolean = false;
        this.currentIndex = $n - 1;
        for (let i = 0; i < this.total; i++) {
            const step: Step = this['step' + i];
            step.setFill(false);
            if (i < $n) {
                step.setFill(true);
                sndPlay = true;
            } else {
                step.setFill(false);
            }
        }

        if (sndPlay) this.playAudio('indicator');
    }
}
