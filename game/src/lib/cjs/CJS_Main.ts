import { DomX } from 'src/core/DomX';
import CJS_App from './core/CJS_App';
import AppConfig from './core/CJS_Config';
import Scene_0 from './scene/Scene_0';
import Scene_1 from './scene/Scene_1';
import Scene_2 from './scene/Scene_2';
import { EventX } from '../../core/BaseComponent';
import EVT from '../../EVT';

class CJS_Main extends DomX {
    private _app: CJS_App;

    constructor($scene: Phaser.Scene) {
        super($scene);

        const cvs = document.createElement('canvas') as HTMLCanvasElement;
        cvs.style.zIndex = '20';
        cvs.style.position = 'absolute';
        // cvs.style.background = 'red';

        const parent = document.getElementById('contents');
        parent.appendChild(cvs);

        const config: AppConfig = {
            canvas: cvs,
            width: 1280,
            height: 800,
            scene: [Scene_0, Scene_1, Scene_2],
        };

        this._app = new CJS_App(config);
        this._app.addEventListenerX(EVT.LOADED, 'dispatchEventX', this);
        this._app.addEventListenerX(EVT.SEND, 'dispatchEventX', this);
        this._app.addEventListenerX(EVT.DOWN, 'dispatchEventX', this);
        this._app.addEventListenerX(EVT.VALID_MOVE, 'dispatchEventX', this);
        this._app.addEventListenerX(EVT.UP, 'dispatchEventX', this);
        this._app.addEventListenerX(EVT.COMPLETE, 'dispatchEventX', this);

        this.setElement(cvs);
        this.scene.add.existing(this);
        this.visible = false;
    }

    public setPhase($n: number): void {
        const sceneName = `scene_${$n}`;
        this._app.start(sceneName);
    }

    public setInputEnable($bool: boolean): void {
        this._app.setInputEnable($bool);
    }

    public playAffordance(): void {
        this._app.playAffordance();
    }

    public stopAffordance(): void {
        this._app.stopAffordance();
    }

    public playGrow(): void {
        this._app.playGrow();
    }

    public stopGrow(): void {
        this._app.stopGrow();
    }

    get app(): CJS_App {
        return this._app;
    }
}

export default CJS_Main;
