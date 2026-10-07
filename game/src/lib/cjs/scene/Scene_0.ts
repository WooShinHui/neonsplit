import { TraceScene } from './TraceScene';
import { EventX } from 'src/core/BaseComponent';

class Scene_0 extends TraceScene {
    constructor() {
        super();
        this.name = 'scene_0';
        this.index = 0;
        this.total = 1;

        // this.strokeArr = [{ strokeIndex: 0, step: 27 }, {strokeIndex: 1, step: 39 }];
        this.strokeArr = [
            // { strokeIndex: 0, step: 27 },  // 첫 번째 획: 0 ~ 26
            // { strokeIndex: 0, step: 40 },  // 두 번째 획: 27 ~ 38
            { strokeIndex: 0, step: 57 }, // 세 번째 획: 39 ~ 42 (마지막 획)
        ];
    }
    public onValidMove($e: EventX): void {
        // console.log($e);
        const cp = $e.currentPoint;
        console.log('현재 점 위치 : ', cp);

        this.dispatchEventX($e);
    }
}

export default Scene_0;
