import CJS_ContainerX from './CJS_ContainerX';
import AppConfig from './CJS_Config';

class CJS_SceneX extends CJS_ContainerX {
    private _config: AppConfig;

    constructor() {
        super();
    }

    reset() {
        this.removeAllEventListeners();
        this.removeAllChildren();
        this.hide();
    }

    show() {
        this.visible = true;
    }
    hide() {
        this.visible = false;
    }

    // override ----------------------------------------
    async preload() {
        //
    }
    async create() {
        //
    }
    onUnmounted() {
        this.removeAllEventListenerX();
        this.removeAllEventListeners();
        this.removeAllChildren();
    }

    public goScene($sceneName: string): void {}

    set config($config: AppConfig) {
        this._config = { ...$config };
    }

    get config(): AppConfig {
        return this._config;
    }
}

export default CJS_SceneX;
