import Phaser from 'phaser';
import { BootLoader } from './scene/BootLoader';
import { Interaction } from './scene/Interaction';
import Config, { ZIndex } from 'src/Config';
import 'reset-css';

interface CrazyGamesUser {
    countryCode?: string;
    username?: string;
    profilePictureUrl?: string;
}

interface CrazyGamesSDK {
    init: () => Promise<void>;
    user: {
        getUser: () => Promise<CrazyGamesUser | null>;
    };
    game: {
        showInviteButton: (options: { roomId: string }) => Promise<void>;
        gameplayStart: () => void;
        gameplayStop: () => void;
        happytime: () => void;
    };
    ad: {
        requestAd: (type: 'midgame' | 'rewarded') => Promise<void>;
    };
}

declare global {
    interface Window {
        CrazyGames?: {
            SDK: CrazyGamesSDK;
        };
    }
}

export class GameState {
    public bMilkT: boolean;
    public endingParticleValue: number;

    constructor() {
        this.bMilkT = false;
        this.endingParticleValue = 0;
    }
}

declare module 'phaser' {
    interface Game {
        gameState: GameState;
    }
}

export class Main {
    private game: Phaser.Game;

    constructor() {
        // navigator 접근 시 에러 방지를 위해 window 객체 확인
        const checkMobile =
            typeof window !== 'undefined' &&
            /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        const calculatedHeight = Math.floor(
            window.innerHeight * (1280 / window.innerWidth),
        );

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.WEBGL,
            parent: 'contents',
            backgroundColor: '#000000',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 1280,
                height: checkMobile ? calculatedHeight : 768,
            },
            input: {
                activePointers: 3,
            },
            dom: {
                createContainer: true,
            },
            scene: [BootLoader, Interaction],
        };

        this.game = new Phaser.Game(config);
        (window as any).__game = this.game;
        this.game.gameState = new GameState();

        if (this.game.canvas) {
            this.game.canvas.style.zIndex = `${ZIndex.PHASER}`;
            Config.CANVAS = this.game.canvas;
        }
    }
}

// 2. window.onload 로직을 가장 안전한 방식으로 변경
const initGame = async () => {
    if (window.CrazyGames?.SDK) {
        try {
            await window.CrazyGames.SDK.init();
            console.log('CrazyGames SDK Initialized');
        } catch (e) {
            console.warn('SDK Init failed', e);
        }
    }
    // Main 클래스가 정의된 후 인스턴스화
    new Main();
};

if (document.readyState === 'complete') {
    // window.addEventListener(
    //     'pointerdown',
    //     (event) => {
    //         const target = event.target as HTMLElement;
    //         console.log('--- Touch/Click Detected ---');
    //         console.log('Target Element:', target); // 내가 누른 실제 HTML 태그
    //         console.log('Target ID:', target.id || 'No ID');
    //         console.log('Target Class:', target.className || 'No Class');
    //         console.log(
    //             'Coordinates:',
    //             `X: ${event.clientX}, Y: ${event.clientY}`,
    //         );

    //         // 만약 타겟이 캔버스가 아니라면, 무엇이 가로막고 있는지 경고
    //         if (target.tagName !== 'CANVAS') {
    //             console.warn(
    //                 '⚠️ 터치가 게임(CANVAS)이 아닌 다른 요소에 가로막혔습니다!',
    //             );
    //             // 가로막고 있는 요소의 스타일 확인 (투명도 등)
    //             console.log(
    //                 'Target Style:',
    //                 window.getComputedStyle(target).cssText,
    //             );
    //         }
    //     },
    //     true,
    // );
    initGame();
} else {
    window.addEventListener('load', initGame);
}
