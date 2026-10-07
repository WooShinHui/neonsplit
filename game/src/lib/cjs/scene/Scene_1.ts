import { TraceScene } from './TraceScene';
import { EventX } from '../../../core/BaseComponent';

class Scene_1 extends TraceScene {
    constructor() {
        super();
        this.name = 'scene_1';
        this.index = 1;
        this.total = 1;

        // this.strokeArr = [{ strokeIndex: 0, step: 13 }, {strokeIndex: 1, step: 25 }];
        this.strokeArr = [
            { strokeIndex: 0, step: 24 }, //
            // { strokeIndex: 0, step: 27 },
            // { strokeIndex: 0, step: 47 },
            // { strokeIndex: 0, step: 50 }, // 점 25 ~ 42 (마지막 획) ✅ 꼭 필요
            // { strokeIndex: 0, step: 55 }, // 점 25 ~ 42 (마지막 획) ✅ 꼭 필요
        ];

        // this.radius = { 7: 30 };
        this.d_radius = 33;
        // this.radius = [[{ 2: 30, 11: 40 }]];
        // this.radius = [[{1: 65, 2: 40, 3: 40, 6: 30 ,7: 30, 8: 30, 9: 30, 10: 30, 27: 50, 30: 35, 31:35, 32: 35, 33: 35, 34: 35, 35: 35, 36: 35}]]; // 점 마다 반지름 크기
    }
    public onValidMove($e: EventX): void {
        // console.log($e);
        const cp = $e.currentPoint;
        console.log('현재 점 위치 : ', cp);

        this.dispatchEventX($e);
    }
}

export default Scene_1;
