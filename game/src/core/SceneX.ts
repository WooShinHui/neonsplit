/**
 * SceneX
 * Author: Kim tae shin
 */

import Phaser from 'phaser';
import html2canvas from 'html2canvas';
import { BaseComponent, mixin } from '../core/BaseComponent';

export class SceneX extends Phaser.Scene {
    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    /**
     * 딜레이를 준다.
     * @param {number} $ms // 1000 = 1초
     */
    public aDelay($ms: number): Promise<unknown> {
        return new Promise((resolve) => setTimeout(resolve, $ms));
    }

    /**
     * 스파인을 로드 한다.
     * @param {string} $key
     */
    public loadSpine($key: string): void {
        this.load.spineBinary(
            `${$key}_data`,
            `assets/spine/${$key}/${$key}.skel`
        );
        this.load.spineAtlas(
            `${$key}_atlas`,
            `assets/spine/${$key}/${$key}.atlas`
        );
    }

    /**
     * 이미지를 로드 한다.
     * @param {string} $key
     */
    public loadImage($key: string, $fileExtension: string = 'png'): void {
        this.load.image(`${$key}`, `assets/image/${$key}.${$fileExtension}`);
    }

    /**
     * 사운드를 로드 한다.
     * @param {string} $key
     */
    public loadAudio($key: string, $fileExtension: string = 'mp3'): void {
        this.load.audio(`${$key}`, `assets/sound/${$key}.${$fileExtension}`);
    }
}

export interface SceneX extends BaseComponent {}
mixin(SceneX, BaseComponent);
