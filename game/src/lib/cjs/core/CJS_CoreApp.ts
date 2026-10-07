import { BaseComponent } from 'src/core/BaseComponent';
import AppConfig from './CJS_Config';

class CoreApp extends BaseComponent {
    private _canvas: HTMLCanvasElement;
    private _stage: createjs.Stage;
    private _config: AppConfig;

    constructor($config: AppConfig) {
        super();
        // 캔버스 할당 및 크긱 설정
        this._canvas = $config.canvas;
        this._canvas.style.position = 'absolute';
        // this._canvas.width = $config.width;
        // this._canvas.height = $config.height;
        this._canvas.width = 1280;
        this._canvas.height = 768;


        // 설정 할당
        this._config = { ...$config };

        // 스테이지 생성 및 설정
        this._stage = new createjs.Stage(this._canvas);
        this._stage.mouseMoveOutside = true;
        createjs.MotionGuidePlugin.install();
        createjs.Touch.enable(this._stage, true, false);
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.addEventListener('tick', ($e) => {
            this.tick($e);
        });
    }

    private tick($e: createjs.Ticker): void {
        this._stage.update($e);
    }

    // 스테이지 리턴
    get stage(): createjs.Stage {
        return this._stage;
    }

    // 설정 리턴
    get config(): AppConfig {
        return this._config;
    }
}

export default CoreApp;
