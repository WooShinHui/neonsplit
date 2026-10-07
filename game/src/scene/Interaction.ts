import { BaseInteraction } from '../core/BaseInteraction';
import { MainController } from '../controller/MainController';

export class Interaction extends BaseInteraction {
    private isMobile: boolean;
    private mainController: MainController | null = null;

    constructor() {
        super({ key: 'Interaction' });
        this.isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
        );
    }

    public onInit(): void {
        if (this.mainController) {
            this.mainController.destroy();
            this.mainController = null;
        }
    }

    public async onMounting(): Promise<void> {
        this.addAudioGroup();
        this.mainController = new MainController(this, this.isMobile);
        await this.mainController.init();
    }

    private addAudioGroup(): void {
        this.addAudio('bgm', 1);
        this.addAudio('hit1');
        this.addAudio('hit2');
        this.addAudio('hit3');
        this.addAudio('miss');
        this.addAudio('clap');
        this.addAudio('count');
    }

    public update(time: number, delta: number): void {
        if (this.mainController) {
            this.mainController.update(time, delta);
        }
    }
}
