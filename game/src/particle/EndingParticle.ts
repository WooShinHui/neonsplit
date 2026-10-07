/**
 * EndingParticle
 * Author: Kim tae shin
 */

import bodymovin, { AnimationItem, BMEnterFrameEvent } from 'lottie-web';
import { Interaction } from '../scene/Interaction';
import { DomX } from '../core/DomX';
import EVT from '../EVT';

export class EndingParticle extends DomX {
    private anim: AnimationItem | null = null;

    /**
     * 엔딩 파티클 생성자
     * @param {SceneX} $scene 재생 되는 씬
     * @param {number} $index 파티클 순서 1 ~ 20
     */
    constructor($scene: Phaser.Scene, $index: number) {
        super($scene);

        const character = this.getCharacter($index);
        const jsonName = this.getJsonName($index);
        const path = `assets/lottie/${character}/${jsonName}`;

        const modal = document.createElement('div');
        modal.style.position = 'absolute';
        modal.style.width = '1280px';
        modal.style.height = '768px';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';

        const ending = document.createElement('div');
        ending.style.position = 'absolute';
        ending.style.width = '1280px';
        ending.style.height = '768px';

        const div = document.createElement('div');
        div.style.position = 'absolute';
        // div.style.width = '100%';
        // div.style.height = '100%';
        div.append(modal, ending);

        this.anim = bodymovin.loadAnimation({
            container: ending,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: path,
        });

        this.anim?.addEventListener('enterFrame', (event) => {
            this.onEnter(event);
        });

        this.setOrigin(0, 0);
        this.setElement(div);
        this.scene.add.existing(this);
        this.visible = false;
    }

    play() {
        this.anim?.stop();
        this.visible = true;
        this.anim?.play();
        (this.scene as Interaction).playAudio('ending');
    }

    stop() {
        this.anim?.stop();
    }

    pause() {
        this.anim?.pause();
    }

    private onEnter($e: BMEnterFrameEvent): void {
        const currentFrame = this.anim?.currentFrame;
        const totalFrames = this.anim?.totalFrames;
        const duration = this.anim?.getDuration(false);

        // 현재 진행된 시간 계산
        const elapsedTime = (currentFrame / totalFrames) * duration;

        if (elapsedTime) {
            // 2초 이상이면 멈추고 완료 처리
            if (elapsedTime >= 2) {
                this.anim?.pause();
                this.dispatchEventX({ type: EVT.ANI_COMPLETE });
            }
        }
    }

    private getCharacter($n: number): string {
        const index = Math.floor(($n - 1) / 4);

        let character = 'beori';
        switch (index) {
            case 0:
                character = 'nyangi';
                break;
            case 1:
                character = 'deumi';
                break;
            case 2:
                character = 'dogi';
                break;
            case 3:
                character = 'tori';
                break;
            case 4:
                character = 'beori';
                break;
            default:
                break;
        }

        return character;
    }

    private getJsonName($n: number): string {
        let jsonFile: string;
        let index = $n % 4;
        if (index === 0) index = 4;
        jsonFile = `ending_particle${index}.json`;
        return jsonFile;
    }
}
