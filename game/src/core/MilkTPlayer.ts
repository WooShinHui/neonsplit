import { BaseComponent } from './BaseComponent';
import { ZIndex } from 'src/Config';
import EVT from '../EVT';

export class MilkTPlayer extends BaseComponent {
    private player: any;
    private zIndex: number = 0;
    constructor($player: any) {
        super();
        this.player = $player;

        // 이벤트 추가
        this.player.addEventListener('onInit', ($e: Event) => {
            this.onInitMovie($e);
        });
        this.player.addEventListener('onEnded', () => {
            this.onEndMovie();
        });

        this.player.addEventListener('onPlaying', ($e: Event) => {
            // console.log($e);
        });

        this.player.addEventListener('onTimeupdate', ($e: Event) => {
            // const bPlay = $e['isPlaying'];
            // const curretTime: number = this.player.getCurrentTime();
        });
    }

    /**
     * 비디오를 재생한다
     * @param {string} $key 동영상 키
     * @param {boolean} $bBringTop 재생시 뎁스를 자동으로 올릴지 여부
     */
    public playVideo($key: string, $bBringTop: boolean = true): void {
        // this.player.stopVideo();
        this.player.loadMp4(`assets/video/${$key.toLocaleLowerCase()}.mp4`);
        this.player.pauseVideo();
        if ($bBringTop) this.setZIndex(ZIndex.MILKT_PLAYER_PLAY);
    }

    // 비디오를 멈추고 화면에서 안보이게 한다.
    public stopVideo() {
        this.player.pauseVideo();
        this.setZIndex(ZIndex.MILKT_PLAYER_STOP);
    }

    private onInitMovie($e: Event): void {
        console.log('onInitMovie');
        this.delayAndPlay();
    }

    private onEndMovie(): void {
        this.dispatchEventX({ type: EVT.VIDEO_COMPLETE });
    }

    private async delayAndPlay(): Promise<void> {
        await this.aDelay(500);
        this.player.playVideo();
        this.setZIndex(ZIndex.MILKT_PLAYER_PLAY);
        this.dispatchEventX({ type: EVT.LOADED });
    }

    /**
     * 밀크티 동영상 플레이어 zIndex 값을 변경한다.
     * @param {number} $n
     */
    public setZIndex($n: number): void {
        this.zIndex = $n;
        this.player.setZIndex(this.zIndex);
    }

    /**
     * 딜레이를 준다.
     * @param {number} $ms // 1000 = 1초
     */
    public aDelay($ms: number): Promise<unknown> {
        return new Promise((resolve) => setTimeout(resolve, $ms));
    }
}
