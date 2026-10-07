/**
 * ContainerX
 * Author: Kim tae shin
 */

import { BaseComponent, mixin } from 'src/core/BaseComponent';
import { BaseInteraction } from '../core/BaseInteraction';

type AudioTypes =
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;

export class ContainerX extends Phaser.GameObjects.Container {
    constructor($scene: Phaser.Scene, $x?: number, $y?: number) {
        super($scene, $x, $y);
    }

    /**
     * 등록된 키값으로 사운드를 재생한다.
     * 재생 후 호출되는 콜백 함수를 넘겨 줄수 있다.
     * @param {string} $key
     * @param {Function} $callback
     */
    public playAudio($key: string, $callback?: Function): void {
        (this.scene as BaseInteraction)?.playAudio($key, $callback);
    }

    /**
     * 등록된 키값으로 사운드 재생 (Promise)
     * 재생 후 호출되는 콜백 함수를 넘겨 줄수 있다.
     * @param {string} $key
     * @param {Function} $callback
     * @return Promise<void>
     */
    public async aPlayAudio($key: string, $callback?: Function): Promise<void> {
        return await (this.scene as BaseInteraction)?.aPlayAudio(
            $key,
            $callback
        );
    }

    /**
     * 그룹번호에 포함되는 사운드를 모두 종료한다.
     * @param {number} $groupIndex
     */
    public stopAudioGroup($groupIndex: number): void {
        (this.scene as BaseInteraction)?.stopAudioGroup($groupIndex);
    }

    /**
     * 해당 그룹번호 키값들을 리턴한다.
     * @return Array<string> | null
     */
    public getAudioGroup($groupIndex: number): Array<string> | null {
        return (this.scene as BaseInteraction)?.getAudioGroup($groupIndex);
    }

    /**
     * Scene의 오디오 객체를 리턴한다.
     */
    get audios(): Record<string, AudioTypes> {
        const audio = (this.scene as BaseInteraction)?.audios;
        return audio;
    }

    /**
     * 딜레이를 준다.
     * @param {number} $ms // 1000 = 1초
     */
    public async aDelay($ms: number): Promise<unknown> {
        return await (this.scene as BaseInteraction)?.aDelay($ms);
    }
}

export interface ContainerX extends BaseComponent {}
mixin(ContainerX, BaseComponent);
