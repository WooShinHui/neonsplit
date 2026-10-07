/**
 * EndingParticle
 * Author: Kim tae shin
 */

import { BaseComponent } from 'src/core/BaseComponent';
import { Interaction } from 'src/scene/Interaction';
import { SceneX } from 'src/core/SceneX';
import { LottieX } from 'src/animation/LottieX';
import EVENT from 'src/EVT';
import Config from 'src/Config';

export class Ending extends BaseComponent {
    private scene: Interaction;
    private modal: HTMLDivElement;
    private endParticle: LottieX;

    /**
     * 엔딩 파티클 생성자
     * @param {SceneX} $scene 재생 되는 씬
     * @param {number} $enum 파티클 순서 1 ~ 20
     */

    constructor($scene: SceneX, $enum: number) {
        super();

        this.scene = $scene as Interaction;

        const character = this.getCharacter($enum);
        const jsonName = this.getJsonName($enum);
        const path = `assets/lottie/${character}/${jsonName}`;

        this.modal = document.createElement('div');
        this.modal.style.cssText =
            'margin: 0; padding: 0; border: none; top: 0; left: 0; transform: none;';
        this.modal.style.position = 'absolute';
        this.modal.style.zIndex = '49';
        this.modal.style.width = `${Config.WIDTH}px`;
        this.modal.style.height = `${Config.HEIGHT}px`;
        this.modal.style.backgroundColor = 'rgba(0,0,0,0.8)';

        this.modal.style.display = 'none';
        document.body.append(this.modal);

        this.endParticle = new LottieX(path, 2);
        this.endParticle.addEventListenerX(
            EVENT.ANI_COMPLETE,
            this.onEndParticleComplete,
            this
        );
    }

    public play(): void {
        this.modal.style.top = `${Config.CANVAS?.offsetTop}px`;
        this.modal.style.left = `${Config.CANVAS?.offsetLeft}px`;
        this.modal.style.display = 'block';

        this.endParticle.x = Config.WIDTH / 2;
        this.endParticle.y = Config.HEIGHT / 2;
        this.endParticle.play();

        this.scene.playAudio('ending');
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

    private onEndParticleComplete() {
        this.dispatchEventX({ type: EVENT.ANI_COMPLETE });
    }
}
