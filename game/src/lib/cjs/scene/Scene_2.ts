import { EventX } from 'src/core/BaseComponent';
import { TraceScene } from './TraceScene';

class Scene_2 extends TraceScene {
    constructor() {
        super();
        this.name = 'scene_2';
        this.index = 2;
        this.total = 1;

        // this.strokeArr = [{ strokeIndex: 0, step: 5 }, {strokeIndex: 1, step: 11 }, {strokeIndex: 2, step: 28 }, {strokeIndex: 3, step: 34 }];
        this.strokeArr = [
            { strokeIndex: 0, step: 23 }, // 점 0 ~ 4
            { strokeIndex: 0, step: 27 }, // 점 5 ~ 10
            { strokeIndex: 0, step: 50 }, // 점 11 ~ 27
            { strokeIndex: 0, step: 55 }, // 점 28 ~ 33
            { strokeIndex: 0, step: 61 }, // 점 34 ~ 43 (마지막 획) ✅ 꼭 필요
        ];

        // this.radius = { 7: 30 };
        this.d_radius = 33;
        // this.radius = [[{ 2: 30, 11: 40 }]];
        this.radius = [[{ 1: 65 }]];
    }
    public onValidMove($e: EventX): void {
        // console.log($e);
        const cp = $e.currentPoint;
        console.log('현재 점 위치 : ', cp);

        this.dispatchEventX($e);
    }
}

export default Scene_2;
