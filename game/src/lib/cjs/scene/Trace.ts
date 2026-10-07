import CJS_ContainerX from '../core/CJS_ContainerX.js';
import { LibraryManager } from '../manager/LibraryManager.js';
import EVT from '../../../EVT';

interface StrokeStep {
    strokeIndex: number;
    step: number;
}

export class Trace extends CJS_ContainerX {
    private lib: createjs.MovieClip;
    private mHand: createjs.MovieClip;
    private mDrager: createjs.MovieClip;
    private mPoint: createjs.MovieClip;
    private mTxt: createjs.MovieClip;
    private mShape: createjs.MovieClip;

    private mRect: createjs.MovieClip;

    private mDumy: createjs.MovieClip;

    private bDumy: boolean = false;

    private startIndex: number = 0;

    private strokeArr: Array<StrokeStep>;
    private copy_strokeArr: Array<StrokeStep>;
    private strokeCnt: number;

    private totalPoint: number;
    private bAction: boolean;
    private curretnPoint: number;
    private colorIndex: number;
    private mColorIndex: number;

    private bPress: boolean;

    //
    private d_value: number;
    private value: number;
    private belt: object;
    private radius: object;

    private d_radius: number;

    private pressX: number;
    private pressY: number;

    private startX: number;
    private startY: number;

    private lastX: number;
    private lastY: number;

    private maskShape: createjs.Shape;

    private bInput: boolean = false;

    private afCnt: number;

    constructor($option: any) {
        super();

        const {
            id,
            lib,
            link,
            radius,
            d_radius,
            stroke,
            belt,
            value,
            d_value,
        } = $option;

        this.lib = LibraryManager.Handle.getLibrary(lib, link);
        this.mDrager = this.lib['mDrager'];
        this.mPoint = this.lib['mPoint'];
        this.mTxt = this.lib['mTxt'];
        this.mShape = this.lib['mShape'] ? this.lib['mShape'] : null;
        if (this.mShape) this.mShape.visible = false;
        this.addChild(this.lib);

        this.mDumy = this.lib['mDumy'];
        if (this.mDumy) this.mDumy.visible = false;

        if (this.lib['mRect']) this.mRect = this.lib['mRect'];

        if (this.lib['mRect']) this.mRect.alpha = 0.5;

        this.strokeArr = stroke;
        this.copy_strokeArr = [...this.strokeArr];
        this.strokeCnt = 0;

        this.id = id;
        this.totalPoint = this.mPoint.numChildren;
        this.bAction = false;
        this.bPress = false;
        this.curretnPoint = 0;
        this.colorIndex = 0;

        this.d_value = d_value;

        this.value = value[this.id] ? value[this.id] : this.d_value;
        this.belt = belt[this.id] ? belt[this.id] : false;
        // this.radius = radius[this.id] ? radius[this.id] : d_radius;

        this.d_radius = d_radius;
        this.radius = radius ? radius[id] : {};

        console.log(this.radius);

        // 클릭시 좌표
        this.pressX;
        this.pressY;

        this.startX = this.mPoint['g0'].x;
        this.startY = this.mPoint['g0'].y;

        this.lastX = this.mPoint['g' + (this.totalPoint - 2)].x;
        this.lastY = this.mPoint['g' + (this.totalPoint - 2)].y;

        this.maskShape = new createjs.Shape();
        this.maskShape.visible = false;
        this.addChild(this.maskShape);

        //드래거 영역 크게.
        //this.mDrager.mImage.visible = false;
        const hitArea = new createjs.Shape();
        hitArea.graphics.beginFill('000').drawCircle(0, 0, 60);
        hitArea.alpha = 0;
        hitArea.hitArea = new createjs.Shape();
        hitArea.hitArea['graphics'].beginFill('#000').drawCircle(-30, 30, 60);
        this.mDrager.addChild(hitArea);
        this.addEvent();
        this.reset();
    }

    addEvent() {
        this.mDrager.on('mousedown', ($e) => {
            this.onDown($e);
        });

        this.on('pressmove', ($e) => {
            this.onMove($e);
        });

        this.on('pressup', ($e) => {
            this.onUp($e);
        });

        this.mDrager.visible = true;
    }

    reset() {
        this.maskShape.graphics.clear();
        for (let i = 0; i < this.totalPoint; i++) {
            // console.log(`${this.id} / ${i}`);
            const guide = this.mPoint['g' + i];

            // console.log(`id : ${this.id}  i : ${i}`);
            guide.active = false;
            guide.alpha = 0;
        }
        this.curretnPoint = 0;
        this.mDrager.x = this.startX;
        this.mDrager.y = this.startY;
        this.mTxt.visible = false;
        this.mTxt.uncache();
        this.maskShape.uncache();
        // this.setColor(this.colorIndex);
        this.strokeCnt = 0;
        this.strokeArr = [...this.copy_strokeArr];
    }

    getColor($n) {
        let r, g, b;

        switch ($n) {
            case 0:
                r = 255;
                g = 0;
                b = 0;
                break;
            case 1:
                r = 255;
                g = 87;
                b = 194;
                break;
            case 2:
                r = 0;
                g = 201;
                b = 0;
                break;
            case 3:
                r = 0;
                g = 118;
                b = 226;
                break;
            case 4:
                r = 186;
                g = 41;
                b = 255;
                break;
            default:
                r = 255;
                g = 0;
                b = 0;
                break;
        }

        return { r: r, g: g, b: b };
    }

    /**
     * 입력 가능 여부
     * @param {boolean} $bool
     */
    public setInputEnable($bool: boolean): void {
        console.log(`setInputEnable bool : ${$bool}`);
        this.bInput = $bool;
    }

    /**
     * 해당 획을 어포던스 한다.
     */

    public playAffordance(): void {
        this.afCnt = this.curretnPoint === 0 ? 0 : this.curretnPoint - 1;

        const guide = this.mPoint['g' + this.afCnt];

        const hand = this.parent.parent['mHand'] as createjs.MovieClip;
        hand.x = guide.x;
        hand.y = guide.y;
        hand.alpha = 0;
        hand.visible = true;

        createjs.Tween.get(hand)
            .to({ alpha: 1 }, 200)
            .call(() => {
                this.drawGuide();
            });
    }

    public stopAffordance(): void {
        this.afCnt = -1;
        const hand = this.parent.parent['mHand'] as createjs.MovieClip;
        createjs.Tween.removeTweens(hand);
        hand.visible = false;
    }

    public drawGuide(): void {
        if (this.afCnt === -1) return;

        const hand = this.parent.parent['mHand'] as createjs.MovieClip;

        const guide = this.mPoint['g' + this.afCnt];
        let speed = (this.totalPoint - this.afCnt) * 0.2 - 0.1;

        if (speed > 4) speed = 1;

        createjs.Tween.get(hand)
            .to({ x: guide.x, y: guide.y }, speed)
            .call(() => {
                if (this.afCnt < this.totalPoint - 1) {
                    this.afCnt++;
                    if (speed === 1) this.afCnt++;
                    if (this.afCnt >= this.totalPoint)
                        this.afCnt = this.totalPoint - 1;
                    this.drawGuide();
                } else {
                    createjs.Tween.get(hand)
                        .wait(500)
                        .to(
                            {
                                alpha: 0,
                                x: guide.x + 30,
                                y: guide.y + 30,
                            },
                            200
                        )
                        .call(() => {
                            hand.visible = false;
                        });
                }
            });
    }

    public playAffordanceX(): void {
        const guide = this.mPoint['g' + this.curretnPoint];
        const next = this.mPoint['g' + (this.curretnPoint + 1)];
        guide.active = true;

        if (next)
            createjs.Tween.get(this.mDrager).to({ x: guide.x, y: guide.y }, 80);

        if (this.strokeArr.length > 0) {
            const len = this.strokeArr.length;
            for (let i = 0; i < len; i++) {
                const value = this.strokeArr[i];
                if (this.id == value.strokeIndex) {
                    if (this.curretnPoint === value.step) {
                        this.strokeCnt++;
                        this.mTxt.uncache();
                        this.mTxt.gotoAndStop(this.strokeCnt);
                        const bounds = this.mTxt.getBounds();
                        if (this.mDumy) {
                            this.startIndex = value.step - 1;
                            this.mDumy.visible = true;
                            this.mTxt.visible = false;
                        }

                        this.mTxt.cache(
                            0,
                            0,
                            bounds.width + 40,
                            bounds.height + 40
                        );
                        break;
                    }
                }
            }
        }

        this.darwMask();

        this.curretnPoint++;

        setTimeout(() => {
            if (this.curretnPoint === this.totalPoint) {
                this.reset();
                if (this.mDumy) this.mDumy.visible = false;
            } else {
                this.playAffordance();
            }
        }, 80);
    }

    setColor($n) {
        this.colorIndex = $n;
        this.mColorIndex = $n;
        const color = this.getColor($n);
        this.mTxt.uncache();
        this.mTxt.filters = [
            new createjs.ColorFilter(0, 0, 0, 1, color.r, color.g, color.b, 0),
        ];
        const bounds = this.mTxt.getBounds();

        if (bounds)
            this.mTxt.cache(0, 0, bounds.width + 40, bounds.height + 40);
    }

    onDown($e) {
        if (!this.bInput) return;
        this.bAction = true;
        const globalX = $e.stageX;
        const globalY = $e.stageY;
        const pt = this.globalToLocal(globalX, globalY);
        this.pressX = pt.x;
        this.pressY = pt.y;
        this.bPress = true;
        this.dispatchEventX({ type: EVT.DOWN, id: this.id });
    }

    onUp($e) {
        if (!this.bInput) return;
        this.bAction = false;
        this.bPress = false;
        if (
            this.curretnPoint === this.totalPoint ||
            this.curretnPoint === this.totalPoint - 1
        ) {
            this.setComplete();
            this.dispatchEventX({ type: EVT.COMPLETE, id: this.id });
        } else {
            if (this.curretnPoint === 0) this.reset();
            const per =
                ((this.curretnPoint / (this.totalPoint - 1)) * 100) >> 0;
            this.dispatchEventX({ type: EVT.UP, id: this.id, per: per });
        }
    }

    onMove($e) {
        if (!this.bInput) return;
        if (!this.bAction) return;
        const globalX = $e.stageX;
        const globalY = $e.stageY;
        const pt = this.globalToLocal(globalX, globalY);

        if (this.curretnPoint < this.totalPoint - 1) {
            const cGuide = this.mPoint['g' + this.curretnPoint];
            const nGuide = this.mPoint['g' + (this.curretnPoint + 1)];

            let way = false;

            const pointToPress = this.checkDistance(
                nGuide.x,
                nGuide.y,
                this.pressX,
                this.pressY
            );
            const pointToNextPoint = this.checkDistance(
                nGuide.x,
                nGuide.y,
                pt.x,
                pt.y
            );

            if (pointToPress < pointToNextPoint) {
                way = false;
            } else {
                way = true;
            }

            if (this.bPress) {
                this.bPress = false;
                return;
            }

            if (!way) return;

            const dis = this.checkDistance(pt.x, pt.y, nGuide.x, nGuide.y);
            // const value = this.mShape === null ? 50 : 80;

            const value = this.value;

            if (dis < value && !cGuide.active && way) {
                cGuide.active = true;
                if (this.mShape === null) {
                    this.darwMask();
                } else {
                    this.setShapeMask();
                }
                this.curretnPoint++;

                // console.log(this.curretnPoint);

                if (this.strokeArr.length > 0) {
                    const len = this.strokeArr.length;
                    for (let i = 0; i < len; i++) {
                        const value = this.strokeArr[i];
                        // console.log(this.id);
                        if (this.id == value.strokeIndex) {
                            if (this.curretnPoint === value.step) {
                                this.strokeCnt++;
                                this.mTxt.uncache();
                                this.mTxt.gotoAndStop(this.strokeCnt);

                                const bounds = this.mTxt.getBounds();

                                if (this.mDumy && !this.bDumy) {
                                    this.startIndex = value.step - 1;
                                    this.mDumy.visible = true;
                                    this.mTxt.visible = false;
                                }

                                this.mTxt.cache(
                                    0,
                                    0,
                                    bounds.width + bounds.x,
                                    bounds.height + bounds.y
                                );
                                this.strokeArr.shift();
                                break;
                            }
                        }
                    }
                }

                // 원형 글씨 강제 보정
                if (this.mShape != null) {
                    // 퍼센트가 80 이상이고 마지막 포인트와 차이가 설정값 이하라면 완료 처리.
                    const per =
                        ((this.curretnPoint / (this.totalPoint - 1)) * 100) >>
                        0;
                    const lastPoint = this.mPoint['g' + (this.totalPoint - 1)];
                    const pToLastPoint = this.checkDistance(
                        pt.x,
                        pt.y,
                        lastPoint.x,
                        lastPoint.y
                    );
                    if (per >= 90 && pToLastPoint < 100) {
                        this.curretnPoint = this.totalPoint - 1;
                        this.setShapeMask();
                    }
                }
            }
        }

        this.setDragerPos();
    }

    // 근본적인 해결책은 X, onMove함수 수정한 버전
    // onMove($e) {
    //     if (!this.bInput) return;
    //     if (!this.bAction) return;
    //     const globalX = $e.stageX;
    //     const globalY = $e.stageY;
    //     const pt = this.globalToLocal(globalX, globalY);

    //     if (this.curretnPoint < this.totalPoint - 1) {
    //         const cGuide = this.mPoint['g' + this.curretnPoint];
    //         const nGuide = this.mPoint['g' + (this.curretnPoint + 1)];

    //         let way = false;

    //         const pointToPress = this.checkDistance(
    //             nGuide.x,
    //             nGuide.y,
    //             this.pressX,
    //             this.pressY
    //         );
    //         const pointToNextPoint = this.checkDistance(
    //             nGuide.x,
    //             nGuide.y,
    //             pt.x,
    //             pt.y
    //         );

    //         if (pointToPress < pointToNextPoint) {
    //             way = false;
    //         } else {
    //             way = true;
    //         }

    //         if (this.bPress) {
    //             this.bPress = false;
    //             return;
    //         }

    //         if (!way) return;

    //         const dis = this.checkDistance(pt.x, pt.y, nGuide.x, nGuide.y);
    //         // const value = this.mShape === null ? 50 : 80;

    //         const value = this.value;

    //         if (dis < value && !cGuide.active && way) {
    //             cGuide.active = true;
    //             if (this.mShape === null) {
    //                 this.darwMask();
    //             } else {
    //                 this.setShapeMask();
    //             }
    //             this.curretnPoint++;

    //             if (this.strokeArr.length > 0) {
    //                 const value = this.strokeArr[0]; // 항상 맨 앞만 본다
    //                 this.id = value.strokeIndex;
    //                 console.log(this.curretnPoint, value.step);

    //                 if (
    //                     this.id === value.strokeIndex &&
    //                     this.curretnPoint === value.step
    //                 ) {
    //                     this.strokeCnt++;
    //                     console.log(this.strokeCnt);
    //                     this.mTxt.uncache();
    //                     this.mTxt.gotoAndStop(this.strokeCnt);
    //                     console.log(this.strokeCnt);
    //                     const bounds = this.mTxt.getBounds();
    //                     if (this.mDumy && !this.bDumy) {
    //                         this.startIndex = value.step - 1;
    //                         this.mDumy.visible = true;
    //                         this.mTxt.visible = false;
    //                         this.bDumy = true; // ✅ 한번만 실행하도록 플래그 설정
    //                     }

    //                     this.mTxt.cache(
    //                         0,
    //                         0,
    //                         bounds.width + 40,
    //                         bounds.height + 40
    //                     );

    //                     this.strokeArr.shift(); // ✅ 조건 만족하면 다음 value로 넘어감
    //                 }
    //             }

    //             // 원형 글씨 강제 보정
    //             if (this.mShape != null) {
    //                 // 퍼센트가 80 이상이고 마지막 포인트와 차이가 설정값 이하라면 완료 처리.
    //                 const per =
    //                     ((this.curretnPoint / (this.totalPoint - 1)) * 100) >>
    //                     0;
    //                 const lastPoint = this.mPoint['g' + (this.totalPoint - 1)];
    //                 const pToLastPoint = this.checkDistance(
    //                     pt.x,
    //                     pt.y,
    //                     lastPoint.x,
    //                     lastPoint.y
    //                 );
    //                 if (per >= 90 && pToLastPoint < 100) {
    //                     this.curretnPoint = this.totalPoint - 1;
    //                     this.setShapeMask();
    //                 }
    //             }
    //         }
    //     }

    //     this.setDragerPos();
    // }

    setDragerPos() {
        let index = this.curretnPoint;

        if (index <= 0) index = 1;

        const mPointTarget =
            this.curretnPoint === this.totalPoint - 1
                ? this.mPoint['g' + index]
                : this.mPoint['g' + (index - 1)];

        // this.mDrager.x = this.mPoint["g" + (index - 1)].x;
        // this.mDrager.y = this.mPoint["g" + (index - 1)].y;

        this.mDrager.x = mPointTarget.x;
        this.mDrager.y = mPointTarget.y;

        if (this.curretnPoint === this.totalPoint - 1) {
            if (this.mShape === null) {
                this.darwMask();
            } else {
                this.setShapeMask();
            }
        }

        this.dispatchEventX({
            type: EVT.MOVE,
            x: this.mDrager.x,
            y: this.mDrager.y,
        });
    }

    setShapeMask() {
        let index;

        if (this.curretnPoint === 0) {
            index = 0;
        } else if (this.curretnPoint === this.totalPoint - 1) {
            index = this.curretnPoint;
        } else {
            index = this.curretnPoint - 1;
        }

        this.mShape.gotoAndStop(index);
        const shape = this.mShape.getChildAt(0) as createjs.Shape;
        const bounds = this.mShape.getBounds();
        //shape.cache( minY, totalWidth, totalHeight);;

        this.mTxt.mask = shape;
        this.mTxt.visible = true;

        //획이 그려진 경우에만 사운드 재생을 위한 이벤트 보내기
        if (index < this.totalPoint - 1 && this.curretnPoint > 0)
            this.dispatchEventX({ type: EVT.VALID_MOVE });
    }

    darwMask() {
        //획이 그려진 경우에만 사운드 재생을 위한 이벤트 보내기
        if (this.curretnPoint < this.totalPoint - 1 && this.curretnPoint > 0)
            this.dispatchEventX({
                type: EVT.VALID_MOVE,
                currentPoint: this.curretnPoint,
            });

        let minX = Infinity,
            minY = Infinity;
        let maxX = -Infinity,
            maxY = -Infinity;

        this.maskShape.uncache();
        this.maskShape.graphics.clear();
        this.maskShape.graphics.beginFill('#ffbf00');

        let bActive = false;

        // console.log('---------------------------------------');
        for (let i = this.startIndex; i < this.totalPoint; i++) {
            const guide = this.mPoint['g' + i];

            const radius =
                this.curretnPoint === this.totalPoint - 1
                    ? this.getRadius(i) * 2
                    : this.getRadius(i);

            if (guide.active && i < this.curretnPoint) {
                // 원의 경계를 계산합니다.

                // console.log(`i:${i}`);
                const left = guide.x - radius;
                const right = guide.x + radius;
                const top = guide.y - radius;
                const bottom = guide.y + radius;

                // 전체 경계를 업데이트합니다.
                if (left < minX) minX = left;
                if (right > maxX) maxX = right;
                if (top < minY) minY = top;
                if (bottom > maxY) maxY = bottom;

                let r = radius;
                let cx = guide.x;
                let cy = guide.y;

                r = radius;
                this.maskShape.graphics.drawCircle(cx, cy, r);

                // this.maskShape.graphics.drawCircle(cx, cy, r);

                this.maskShape.graphics.closePath();

                bActive = true;
            }
        }

        // 총 width와 height 계산 후 캐싱 적용
        if (bActive) {
            const totalWidth = maxX - minX;
            const totalHeight = maxY - minY;
            this.maskShape.cache(minX, minY, totalWidth, totalHeight);

            this.mTxt.mask = this.maskShape;
            this.mTxt.visible = true;
        }
    }

    getRadius($n: number): number {
        let radius = this.d_radius;

        if (this.radius[$n]) {
            radius = this.radius[$n];
        }

        return radius;
    }

    // 획을 다 그은 경우
    setComplete() {
        this.mDrager.removeAllEventListeners();
        this.mDrager.visible = false;
        this.maskShape.graphics.clear();
        this.maskShape.uncache();
        this.mTxt.visible = true;
    }

    // 두 점 사이의 거리 반환
    checkDistance(x0, y0, x1, y1) {
        const dx = x1 - x0;
        const dy = y1 - y0;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
