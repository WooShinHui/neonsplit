import CoreApp from './CJS_CoreApp';
import AppConfig from './CJS_Config';
import CJS_SceneX from './CJS_SceneX';
import { LIBRARY_LIST } from '../manager/Manifest';
import { LibraryManager } from '../manager/LibraryManager';
import EVT from '../../../EVT';
import { TraceScene } from '../scene/TraceScene';

class CJS_App extends CoreApp {
    private _sceneArray: Array<CJS_SceneX>;
    private _currentScenName: string;

    constructor($config: AppConfig) {
        super($config);
        this.onInit();
    }

    private async onInit() {
        this.createScene();
        await this.loadLibrary();
        this.startFirstScene();
        this.dispatchEventX({ type: EVT.LOADED });
    }

    // 씬을 동적으로 생성한다.
    private createScene(): void {
        this._sceneArray = [];
        const scenes: (typeof CJS_SceneX)[] = [...this.config.scene];
        scenes.map((SceneClass) => {
            const scene = new SceneClass();
            scene.config = this.config;
            this._sceneArray.push(scene);
        });
    }

    // 라이브러리 Link 로드.
    private async loadLibrary(): Promise<void> {
        try {
            await LibraryManager.Handle.loadLibrary('common', LIBRARY_LIST);
        } catch ($err: unknown) {
            console.error(
                `[Error] 라이브러리 로드에 실패 했습니다. msg:${$err}`
            );
        }
    }

    // 최초 씬을 렌더링 한다.
    private startFirstScene(): void {
        if (this._sceneArray.length === 0) {
            console.log('생성된 Scene이 없습니다.');
            return;
        }

        const sceneName = this._sceneArray[0].name;
        this.start(sceneName);
    }

    public async start($sceneName: string) {
        let isValid: boolean = false; // 유효성 체크

        console.log($sceneName);

        for (const scene of this._sceneArray) {
            if ($sceneName === scene.name) {
                isValid = true;
                this._currentScenName = $sceneName;
                this.removeScean();
                this.stage.removeAllChildren();
                scene.addEventListenerX(EVT.SEND, 'dispatchEventX', this);
                scene.addEventListenerX(EVT.DOWN, 'dispatchEventX', this);
                scene.addEventListenerX(EVT.VALID_MOVE, 'dispatchEventX', this);
                scene.addEventListenerX(EVT.UP, 'dispatchEventX', this);
                scene.addEventListenerX(EVT.COMPLETE, 'dispatchEventX', this);
                this.stage.addChild(scene);
                await scene.preload();
                await scene.create();
            }
        }

        if (!isValid)
            console.error(
                `[Error] ${$sceneName} 이란 이름의 씬이 존재하지 않습니다.`
            );
    }

    public setInputEnable($bool: boolean): void {
        for (const scene of this._sceneArray) {
            if (this._currentScenName === scene.name) {
                (scene as TraceScene).setInputEnable($bool);
            }
        }
    }

    public playAffordance(): void {
        for (const scene of this._sceneArray) {
            if (this._currentScenName === scene.name) {
                (scene as TraceScene).playAffordance();
            }
        }
    }

    public stopAffordance(): void {
        for (const scene of this._sceneArray) {
            if (this._currentScenName === scene.name) {
                (scene as TraceScene).stopAffordance();
            }
        }
    }

    public playGrow(): void {
        for (const scene of this._sceneArray) {
            if (this._currentScenName === scene.name) {
                (scene as TraceScene).playGrow();
            }
        }
    }

    public stopGrow(): void {
        for (const scene of this._sceneArray) {
            if (this._currentScenName === scene.name) {
                (scene as TraceScene).stopGrow();
            }
        }
    }

    private removeScean() {
        if (this.stage.children.length > 0) {
            this.stage.children.forEach((child) => {
                if (child instanceof CJS_SceneX) {
                    child.onUnmounted();
                    this.stage.removeChild(child);
                }
            });
        }
    }
}

export default CJS_App;
