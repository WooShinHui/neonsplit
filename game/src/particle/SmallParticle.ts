import bodymovin, { AnimationItem, BMEnterFrameEvent } from 'lottie-web';
import { Interaction } from '../scene/Interaction';
import { DomX } from '../core/DomX';
import EVT from '../EVT';

export class SmallParticle extends DomX {
    private anim: AnimationItem | null = null;

    constructor($scene: Phaser.Scene, $index: number = 1) {
        super($scene);

        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.width = '350px';
        div.style.height = '350px';
        div.style.transform = 'translate(-50%, -50%)';

        this.anim = bodymovin.loadAnimation({
            container: div,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: `assets/lottie/small_particle${$index}.json`,
        });

        this.anim?.addEventListener('complete', () => {
            this.visible = false;
            this.dispatchEventX({ type: EVT.ANI_COMPLETE });
        });

        // 중점을 가운데로.
        this.setOrigin(0.5, 0.5);

        this.setElement(div);
        this.scene.add.existing(this);
        this.visible = false;
    }

    play() {
        this.visible = true;
        this.anim?.stop();
        this.anim?.play();
        (this.scene as Interaction).playAudio('correct');
    }

    stop() {
        this.anim?.stop();
    }

    pause() {
        this.anim?.pause();
    }
}
