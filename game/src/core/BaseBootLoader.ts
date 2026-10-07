/**
 * BaseBootLoader
 * Author: Kim tae shin
 */
import Phaser from 'phaser';
import { Character } from 'src/actor/Protagonist';
import { SceneX } from 'src/core/SceneX';

declare const external: any;

export class BaseBootLoader extends SceneX {
    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        this.onInit();

        const progressBar = document.getElementById('progress-bar');
        const percentVal = document.getElementById('percent-val');
        const loadingContainer = document.getElementById('loading-container');

        // 1. 로딩 진행률 연동
        this.load.on('progress', (value: number) => {
            const percent = Math.floor(value * 100);
            if (progressBar) {
                progressBar.style.width = percent + '%';
            }
            if (percentVal) {
                percentVal.innerText = percent + '%';
            }
        });

        // 2. 로딩 완료 시 HTML 제거
        this.load.on('complete', () => {
            if (loadingContainer) {
                loadingContainer.style.opacity = '0'; // 부드럽게 페이드 아웃
                setTimeout(() => {
                    loadingContainer.remove(); // DOM에서 완전히 삭제
                }, 500);
            }
        });
        this.loadAudios(); // 사운드 로드
        this.loadSpines(); // 스파인 로드
        this.loadImages(); // 이미지 로드
        this.loadVideos(); // 비디오 로드
    }

    create() {
        this.scene.start('Interaction');
    }

    public onInit(): void {}

    // BootLoader에서 오버라이딩.
    // 사운드 로드
    public loadAudios(): void {}
    // 스파인 로드
    public loadSpines(): void {}
    // 이미지 로드
    public loadImages(): void {}
    // 비디오 로드
    public loadVideos(): void {}
}
