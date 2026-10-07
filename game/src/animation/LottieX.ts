import bodymovin, { AnimationItem, BMEnterFrameEvent } from 'lottie-web';
import { BaseComponent } from 'src/core/BaseComponent';
import EVT from '../EVT';
import Config from 'src/Config';

interface Marker {
    tm: number; // 마커의 시간 (프레임 단위)
    cm: string; // 마커의 이름
    dr: number; // 마커의 지속 시간
}

interface AnimationData {
    markers: Marker[];
    w: number;
    fr: number;
    ip: number;
    op: number;
}

interface AnimationItemWithMarkers extends AnimationItem {
    animationData?: AnimationData;
}

export class LottieX extends BaseComponent {
    private el: HTMLDivElement;
    private anim: AnimationItemWithMarkers | null = null;

    private _interval: number;
    private _ticker: number;

    private _stopTime: number;

    private _id: string;
    private _x: number;
    private _y: number;
    private _scale: number;
    private _tempScale: number | null = null;
    private bLoaded: boolean;

    constructor($json: string, $stopTime?: number) {
        super();
        this._id = '';

        this._stopTime = $stopTime ? $stopTime : 1;
        this.el = document.createElement('div');
        this.el.style.position = 'absolute';
        this.el.style.pointerEvents = 'none'; // 상호 작용 금지

        this.el.style.zIndex = '50';
        this.el.style.top = `${Config.CANVAS?.offsetTop}px`;
        this.el.style.left = `${Config.CANVAS?.offsetLeft}px`;

        this.bLoaded = false;

        document.body.append(this.el);
        this.el.style.display = 'none';
        this._interval = 1000 / 60;

        this.anim = bodymovin.loadAnimation({
            container: this.el,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: $json,
        });

        // console.log(this.anim);

        this.anim.addEventListener('data_ready', function () {
            // console.log("Animation data loaded and ready!");
        });

        this.anim.addEventListener('data_failed', function () {
            // console.error("Failed to load animation data.");
        });

        this.anim.addEventListener('DOMLoaded', () => {
            clearInterval(this._ticker);
            this._ticker = setInterval(() => {
                if (Config.CANVAS) {
                    if (this._tempScale === null) {
                        this.scale = Number(
                            (Config.CANVAS.clientWidth / Config.WIDTH).toFixed(
                                2
                            )
                        );
                    } else {
                        this.scale = this._tempScale;
                    }

                    this.dispatchEventX({ type: EVT.LOADED, id: this._id });
                    clearInterval(this._ticker);
                    this.bLoaded = true;
                }
            }, this._interval);
        });

        this.anim.addEventListener('destroy', function () {
            // console.log("Lottie animation destroyed!");
        });

        this.anim?.addEventListener('complete', () => {
            this.dispatchEventX({ type: EVT.ANI_COMPLETE });
        });

        this.anim?.addEventListener('loopComplete', function () {
            // console.log("One loop completed!");
        });

        this.anim?.addEventListener('enterFrame', (event) => {
            this.onEnter(event);
        });
    }

    play($name?: string) {
        this.anim?.stop();
        this.el.style.display = 'block';
        this.x = this._x;
        this.y = this._y;
        this.anim?.play($name);
    }

    stop() {
        this.anim?.stop();
    }

    pause() {
        this.anim?.pause();
    }

    goToAndStop($value: number | string, $isFrame?: boolean, $name?: string) {
        this.anim?.goToAndStop($value, $isFrame, $name);
    }

    goToAndPlay($value: number | string, $isFrame?: boolean, $name?: string) {
        this.anim?.goToAndPlay($value, $isFrame, $name);
    }

    setSpeed($speed: number) {
        this.anim?.setSpeed($speed);
    }

    setLoop($isLooping: boolean) {
        this.anim?.setLoop($isLooping);
    }

    destory() {
        this.anim?.destroy();
    }

    private onEnter($e: BMEnterFrameEvent): void {
        const currentFrame = this.anim?.currentFrame;
        const totalFrames = this.anim?.totalFrames;
        const duration = this.anim?.getDuration(false);

        // 현재 진행된 시간 계산
        const elapsedTime = (currentFrame / totalFrames) * duration;

        if (elapsedTime) {
            if (elapsedTime >= this._stopTime) {
                this.anim?.pause();
                this.dispatchEventX({ type: EVT.ANI_COMPLETE });
            }
        }
    }

    set id($id: string) {
        this._id = $id;
    }
    get id(): string {
        return this._id;
    }

    set x($n: number) {
        this._x = $n;
        const canvasBounds = Config.CANVAS.getBoundingClientRect();
        const px = canvasBounds.left + $n;
        if (Config.CANVAS) this.el.style.left = `${px}px`;
    }
    get x(): number {
        return this._x;
    }

    set y($n: number) {
        this._y = $n;
        const canvasBounds = Config.CANVAS.getBoundingClientRect();
        const py = canvasBounds.top + $n;
        if (Config.CANVAS) this.el.style.top = `${py}px`;
    }
    get y(): number {
        return this._y;
    }

    set scale($n: number) {
        if (!this.bLoaded) this._tempScale = $n;

        this._scale = $n;
        const w = this.anim['animationData'].w;
        const width = (this._scale * w) >> 0;
        this.el.style.width = `${width}px`;
        this.el.style.transform = 'translate(-50%, -50%)';
    }

    get scale(): number {
        return this._scale;
    }
}
