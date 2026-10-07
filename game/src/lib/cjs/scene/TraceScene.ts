/**
 * [밀크T아이] 획긋기용 씬베이스
 * Author: 김태신
 * Date: 2024-09-12
 */

import CJS_SceneX from '../core/CJS_SceneX';
import { LibraryManager } from '../manager/LibraryManager';
import { Trace } from './Trace';
import EVT from '../../../EVT';
import { EventX } from 'src/core/BaseComponent';

interface StrokeStep {
    strokeIndex: number;
    step: number;
}

export class TraceScene extends CJS_SceneX {
    public index: number;
    private currentTrace: number;
    public total: number;
    private color: number;
    protected radius: Array<any>;
    protected d_radius: number;
    private d_value: number;
    private value: Object;
    public belt: Object;
    public strokeArr: Array<StrokeStep>;

    //
    private contents: createjs.MovieClip;
    public mHand: createjs.MovieClip;
    private mDrager: createjs.MovieClip;

    private mField: createjs.MovieClip;
    // private mLine: createjs.MovieClip;
    private mBg: createjs.MovieClip;

    private bounds: createjs.Rectangle;

    constructor() {
        super();
        this.currentTrace = 0;
        this.total = 0;
        this.color = 0;
        this.index = 0;
        this.strokeArr = [];
        this.radius = [];
        this.d_radius = 40; // 브러쉬 크기
        this.belt = false;
        this.d_value = 60;
        this.value = {};
    }

    async preload() {
        this.contents = LibraryManager.Handle.getLibrary(
            'Contents',
            'Contents'
        );
        this.contents['mEdge'].gotoAndStop(this.index);

        this.contents['mEdge'].visible = false;

        this.addChild(this.contents);

        this.mDrager = this.contents['mDrager'];
        this.mField = this.contents['mField'];

        this.mHand = this.contents['mHand'];
        this.mHand.visible = false;

        // this.mLine = this.contents['mLine'];
        this.mBg = this.contents['mFillBg'];
        // this.mLine.gotoAndStop(this.index);
        this.mBg.gotoAndStop(this.index);

        //캐싱
        this.bounds = this.mBg.getBounds();
        const bgChild = this.mBg.getChildAt(0);
        this.mBg.cache(
            0,
            0,
            this.bounds.width + bgChild.x,
            this.bounds.height + bgChild.y
        );

        this.x = 0;
        this.y = 0;

        // this.mField.x = 8;
        // this.mField.y = 8;

        // 수평, 수직 가운데 배치
        // this.x += this.bounds.width / 2;
        // this.y += this.bounds.height / 2;
        // this.x += ((800 - this.bounds.width) / 2) >> 0;
        // this.y += ((600 - this.bounds.height) / 2) >> 0;

        const deep_copy = [...this.strokeArr];

        const radius_clone = [...this.radius];

        for (let i = 0; i < this.total; i++) {
            const props = {
                id: i,
                lib: 'Contents',
                link: `Trace_${this.index}_${i}`,
                stroke: deep_copy,
                belt: this.belt,
                d_radius: this.d_radius,
                radius: radius_clone[i],
                d_value: this.d_value,
                value: this.value,
            };
            const trace = (this['trace_' + i] = new Trace(props));
            trace.addEventListenerX(EVT.COMPLETE, 'onComplete', this);
            trace.addEventListenerX(EVT.UP, 'onUp', this);
            trace.addEventListenerX(EVT.MOVE, 'onMove', this);
            trace.addEventListenerX(EVT.VALID_MOVE, 'onValidMove', this);
            trace.addEventListenerX(EVT.DOWN, 'onDown', this);
            this.mField.addChild(trace);
        }

        this.dispatchEventX({ type: EVT.SEND, total: this.total });
        this.currentTrace = 0;
        this.reset();
    }

    async create() {
        this.showTrace(this.currentTrace);
        this.show();
        this.contents.x = 20;
        this.contents.y = 20;
    }

    /// ---------------------------------------------------------------------------------
    public setInputEnable($bool: boolean): void {
        for (let i = 0; i < this.total; i++) {
            const trace = this['trace_' + i] as Trace;
            trace.setInputEnable($bool);
        }
    }

    public playAffordance(): void {
        const trace = this['trace_0'] as Trace;
        trace.playAffordance();
    }

    public stopAffordance(): void {
        const trace = this['trace_0'] as Trace;
        trace.stopAffordance();
    }

    public playGrow(): void {
        const grow = this.contents['mEdge'] as createjs.MovieClip;
        grow.alpha = 0;
        grow.visible = true;
        const ease = createjs.Ease.sineOut;
        createjs.Tween.get(grow)
            .to({ alpha: 1 }, 500, ease)
            .to({ alpha: 0 }, 500, ease)
            .wait(100)
            .to({ alpha: 1 }, 500, ease)
            .to({ alpha: 0 }, 500, ease)
            .call(() => {
                grow.visible = false;
            });
    }

    public stopGrow(): void {
        const grow = this.contents['mEdge'] as createjs.MovieClip;
        createjs.Tween.removeTweens(grow);
        grow.alpha = 0;
        grow.visible = false;
        // const ease = createjs.Ease.sineOut;
        // createjs.Tween.get(grow)
        //     .to({ alpha: 0 }, 500, ease)
        //     .call(() => {
        //         grow.visible = false;
        //     });
    }

    setColor($n) {
        this.color = $n;
        const trace = this['trace_' + this.currentTrace];
        // trace.setColor($n);
    }

    setRemoveAll() {
        for (let i = 0; i < this.total; i++) {
            const trace = this['trace_' + i];
            trace.removeAllEventListenerX();
            trace.addEventListenerX(EVT.COMPLETE, 'onComplete', this);
            trace.addEventListenerX(EVT.DOWN, 'onDown', this);
            trace.addEventListenerX(EVT.MOVE, 'onMove', this);
            trace.addEventListenerX(EVT.VALID_MOVE, 'dispatchEventX', this);
            trace.addEventListenerX(EVT.UP, 'onUp', this);
            trace.reset();
            trace.addEvent();
        }
        this.reset();
        this.currentTrace = 0;
        this.showTrace(this.currentTrace);
    }

    reset() {
        this.mDrager.visible = false;
        for (let i = 0; i < this.total; i++) {
            this['trace_' + i].visible = false;
            // const line = this.mLine.getChildAt(i);
            // line.visible = false;
        }
    }

    showTrace($n) {
        const trace = this['trace_' + this.currentTrace];
        // trace.setColor(this.color);
        this.mDrager.x = trace.mDrager.x;
        this.mDrager.y = trace.mDrager.y;
        this.mDrager.visible = true;

        // const line = this.mLine.getChildAt(this.currentTrace);
        // line.visible = true;

        if (this.currentTrace > 0) {
            // const prevLine = this.mLine.getChildAt(this.currentTrace - 1);
            // prevLine.visible = false;
        }

        this.mField.setChildIndex(trace, this.mField.numChildren - 1);
        trace.visible = true;
    }

    onUp($e) {
        this.dispatchEventX($e);
    }

    onDown($e) {
        this.dispatchEventX($e);
    }

    onMove($e) {
        this.mDrager.x = $e.x;
        this.mDrager.y = $e.y;
        this.dispatchEventX($e);
    }

    onComplete($e) {
        const endTrace = this['trace_' + this.currentTrace];

        this.mField.setChildIndex(endTrace, this.currentTrace);

        endTrace.removeEventListenerX(EVT.COMPLETE, 'onComplete', this);
        endTrace.removeEventListenerX(EVT.DOWN, 'onDown', this);
        endTrace.removeEventListenerX(EVT.UP, 'onUp', this);
        endTrace.removeEventListenerX(EVT.MOVE, 'onMove', this);
        endTrace.removeEventListenerX(EVT.VALID_MOVE, 'dispatchEventX', this);

        if (this.currentTrace != this.total - 1) {
            this.currentTrace++;
            // this.showTrace(this.currentTrace);
        } else {
            this.mDrager.visible = false;
            //console.log("모든 획 긋기 종료");
        }

        this.dispatchEventX($e);
    }

    public onValidMove($e: EventX): void {
        this.dispatchEventX($e);
    }
}
