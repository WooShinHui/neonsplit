interface AppConfig {
    WIDTH: number;
    HEIGHT: number;
    CANVAS: HTMLCanvasElement | null;
}

const config: AppConfig = {
    WIDTH: 1280,
    HEIGHT: 768,
    CANVAS: null,
};

//
export enum ZIndex {
    DOM = 0,
    CAPTURE = -1,
    MILKT_PLAYER_PLAY = -2,
    PHASER = -3,
    MILKT_PLAYER_STOP = -4,
}

export default config;
