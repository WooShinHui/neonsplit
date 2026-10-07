import { SpineX } from 'src/animation/SpineX';

export class SpineManager {
    private static _handle: SpineManager;
    static get Handle(): SpineManager {
        if (SpineManager._handle === undefined) {
            SpineManager._handle = new SpineManager();
        }
        return SpineManager._handle;
    }

    private list: { [key: string]: SpineX };
    private cnt: number;

    constructor() {
        this.list = {};
        this.cnt = 0;
    }

    // 스파인을 리스트에 추가한다.
    public addSpine($spine: SpineX): void {
        const key = `spine_${this.cnt}`;
        $spine.setKey(key);
        this.list[key] = $spine;
        this.cnt++;
    }

    // 스파인을 리스트에 삭제한다.
    public removeSpine($spine: SpineX): void {
        const key = $spine.getKey();
        delete this.list[key];
    }

    // 리스트에 등록된 모든 스파인을 정지시킨다.
    public allStop(): void {
        for (const key in this.list) {
            const spine = this.list[key];
            spine.setTimeScale(0);
        }
    }
}
