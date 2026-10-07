/**
 * VideoX
 * Author: Kim tae shin
 */

import Phaser from 'phaser';
import { BaseComponent, mixin } from './BaseComponent';
import EVT from '../EVT';

export class VideoX extends Phaser.GameObjects.Video {
    constructor($scene: Phaser.Scene, $x?: number, $y?: number) {
        super($scene, $x, $y);

        // 비디오 추가
        const width = this.scene.sys.game.config.width as number;
        const height = this.scene.sys.game.config.height as number;
        this.scene.add.video(width / 2, height / 2);

        // 이벤트 추가
        this.on('complete', () => {
            this.onEndMovie();
        });

        this.scene.add.existing(this);
    }

    // 비디오를 재새한다.
    public playVideo($key: string) {
        this.load($key);
        // this.video.addEventListener('loadeddata', () => {
        // this.play();
        // this.visible = true;
        // });
        this.play();
        this.visible = true;
    }

    // 비디오를 멈추고 화면에서 안보이게 한다.
    public stopVideo() {
        this.stop();
        this.visible = false;
    }

    private onEndMovie() {
        this.dispatchEventX({ type: EVT.VIDEO_COMPLETE });
    }
}

export interface VideoX extends BaseComponent {}
mixin(VideoX, BaseComponent);
