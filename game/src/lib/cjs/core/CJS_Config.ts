import CJS_SceneX from './CJS_SceneX';

export interface AppConfig {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    scene: (typeof CJS_SceneX)[];
}

export default AppConfig;
