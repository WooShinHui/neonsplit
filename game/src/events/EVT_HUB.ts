class _EVT_HUB extends Phaser.Events.EventEmitter {
    private static _instance: _EVT_HUB;

    private constructor() {
        super();
    }

    public static get Instance(): _EVT_HUB {
        if (!this._instance) {
            this._instance = new _EVT_HUB();
        }
        return this._instance;
    }
}

export const G_EVT = {
    CLASS: {
        START: 'CLASS_START',
        END: 'CLASS_END',
    },
} as const;

export const EVT_HUB = _EVT_HUB.Instance;
