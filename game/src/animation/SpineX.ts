import { ContainerX } from '../core/ContainerX';
import {
    SpineGameObject,
    SkeletonData,
    Event,
    AnimationStateData,
    SpinePlugin,
    SlotData,
    TrackEntry,
    Skin,
    Skeleton,
    AnimationState,
    AnimationStateListener,
} from '@esotericsoftware/spine-phaser-v3';
import * as spine from '@esotericsoftware/spine-phaser-v3';
import { Animation, EventTimeline } from '@esotericsoftware/spine-core';
import { SpineManager } from 'src/manager/SpineManager';
import EVT from 'src/EVT';

export interface SpineOption {
    skin?: string | number;
    anim?: string;
    loop?: boolean;
    scale?: number;
}

export class SpineX extends ContainerX {
    public ani: SpineGameObject;
    private _skeletonData: SkeletonData;

    //--------------
    private _loop: boolean;
    private _skin: string | number;
    private _anim: string;

    private _key: string; // SpineManager에서 접급하는 키값

    private _alpha: number;

    public _listener: AnimationStateListener;

    //단일제어 루프제어
    private currentOneShotTrack: TrackEntry | null = null;
    private currentLoopTrack: TrackEntry | null = null;

    constructor($scene: Phaser.Scene, $key: string, $option?: SpineOption) {
        super($scene, 0, 0);
        this.scene = $scene;

        const spineData = `${$key}_data`;
        const spineAtlas = `${$key}_atlas`;

        this.ani = $scene.add.spine(0, 0, spineData, spineAtlas);
        this._skeletonData = this.ani.skeleton.data;
        this._skin = this.ani.animationState.data.skeletonData.skins[0].name;
        this._anim =
            this.ani.animationState.data.skeletonData.animations[0].name;
        this._loop = true;
        // this.setAllMix();   전체 스파인 믹스 시 사용
        if ($option) {
            if ($option.skin) this._skin = $option.skin;
            if ($option.anim) this._anim = $option.anim;
            if ($option.loop) this._loop = $option.loop;
        }

        this._listener = {
            start: (track) => {
                // console.log("Spine animation started:", track.animation.name);
            },
            interrupt: (track) => {
                // console.log("Spine animation interrupted:", track.animation.name);
            },
            end: (track) => {
                //console.log("Spine animation ended:", track.animation?.name);
            },
            dispose: (track) => {
                // console.log("Spine animation disposed:", track.animation.name);
            },
            complete: (track) => {
                this.onComplete();
            },
            event: (track, event) => {
                this.onCustomEvent(event, track.animation.name);
            },
        };

        this.ani.animationState.addListener(this._listener);

        this.add(this.ani);
        this.scene.add.existing(this);

        // console.log(this._skin);
        // console.log(this._anim);
        // console.log(this.skeletonData);

        this.setSkin(this._skin);
        this.ani.animationState.setAnimation(0, this._anim, this._loop);

        // alpha 속성 오버라이딩
        Object.defineProperty(this, 'alpha', {
            set($n: number) {
                if ($n > 1) $n = 1;
                this._alpha = $n;
                this.ani.skeleton.color.a = $n;
                Phaser.GameObjects.Components['Alpha']._alpha = $n;
            },
            get(): number {
                return this._alpha;
            },
        });

        SpineManager.Handle.addSpine(this);
    }

    // 초단위 1초 = 1
    public gotoAndStop($anim: string, $time: number) {
        this._anim = $anim;
        this.ani.animationState.setAnimation(0, this._anim, this._loop);
        this.ani.animationState.update($time);
        this.ani.animationState.apply(this.ani.skeleton); // 해당 시간대에 맞는 스켈레톤 상태 적용
        // this.ani.skeleton.updateWorldTransform();
        this.ani.animationState.clearTrack(0);
        //this.ani.animationState.clearTracks();
    }

    public gotoAndPlay($anim: string, $time: number) {
        this._anim = $anim;
        this.ani.animationState.update($time);
        this.ani.animationState.apply(this.ani.skeleton); // 해당 시간대에 맞는 스켈레톤 상태 적용
        this.ani.animationState.clearTrack(0);
        this.ani.animationState.setAnimation(0, this._anim, this._loop);
        this.ani.animationState.tracks[0].trackTime = $time;
    }

    public gotoAndLoop($anim: string, startEvent: string, endEvent: string) {
        this._anim = $anim;

        let startTime = 0;
        let endTime = 0;
        let initialEntry: TrackEntry;

        // 이벤트 리스너
        const listener = {
            event: (entry: TrackEntry, event: any) => {
                if (entry === initialEntry) {
                    if (event.data.name === startEvent) {
                        startTime = event.time;
                    } else if (event.data.name === endEvent) {
                        endTime = event.time;
                    }
                }
            },
            complete: (entry: TrackEntry) => {
                if (entry === initialEntry) {
                    const loopEntry = this.ani.animationState.setAnimation(
                        0,
                        $anim,
                        true
                    );
                    loopEntry.animationStart = startTime;
                    loopEntry.animationEnd = endTime;

                    this.ani.animationState.removeListener(listener);
                }
            },
        };

        // 리스너 추가
        this.ani.animationState.addListener(listener);

        // 초기 1회 재생
        initialEntry = this.ani.animationState.setAnimation(0, $anim, false);
    }
    public setMix($anim0: string, $anim1: string, $time: number): void {
        this.ani.animationState.data.setMix($anim0, $anim1, $time);
    }
    // 전체 스파인 믹스
    private setAllMix() {
        const list = this.getAnimationNames();
        const len = list.length;
        for (let i = 0; i < len; i++) {
            const stAnim = list[i];
            for (let j = 0; j < len; j++) {
                const edAnim = list[j];
                if (stAnim != edAnim) {
                    this.setMix(stAnim, edAnim, 1);
                }
            }
        }
    }
    public setAnim($anim: string, $callBack?: Function): TrackEntry {
        try {
            this._anim = $anim;
            const trackEntry: TrackEntry = this.ani.animationState.setAnimation(
                0,
                this._anim,
                this._loop
            );
            // this.ani.skeleton.setToSetupPose();
            // this.ani.animationState.apply(this.ani.skeleton);

            if ($callBack) {
                const listener = {
                    complete: (entry: TrackEntry) => {
                        $callBack(entry.animation.name);
                        this.ani.animationState.removeListener(listener);
                    },
                };
                this.ani.animationState.addListener(listener);
            }

            return trackEntry;
        } catch {
            console.error(`애니메이션(${$anim}) 찾을 수 없습니다.`);

            return null;
        }
    }

    public getAnim(): string {
        return this._anim;
    }

    public setSlotAlpha($slot: SlotData, $alpha: number): void {
        if ($alpha > 1) $alpha = 1;
        if ($alpha < 0) $alpha = 0;
        $slot.color.a = $alpha;
        this.ani.skeleton.setToSetupPose();
        this.ani.animationState.apply(this.ani.skeleton);
    }

    public getSlot($name: string): SlotData | null {
        const len = this.ani.skeleton.data.slots.length;
        let slot: SlotData | null = null;
        for (let i = 0; i < len; i++) {
            slot = this.ani.skeleton.data.slots[i];
            if (slot.name === $name) break;
        }
        return slot;
    }

    // 해당 스파인에 들어있는 모든 애니메이션명을 리턴한다.
    public getAnimationNames(): Array<string> {
        const animations = this.ani.animationStateData.skeletonData.animations;
        const returnAry = new Array<string>();

        for (const ani of animations) {
            returnAry.push(ani.name);
        }

        return returnAry;
    }

    public setTimeScale($n: number) {
        this.ani.animationState.timeScale = $n;
    }

    /**
     * 해당 슬롯에 스킨을 적용한다.
     * @param {string} $slotName 변경할 슬롯명
     * @param {string} $getSkinName 적용할 스킨명
     */
    public setSlotSkin($slotName: string, $getSkinName: string): void {
        const slotName = $slotName; // 변경할 슬롯 이름
        const getSkinName = $getSkinName; // 추출해야 하는 스킨명
        const findSlot = this.ani.skeleton.findSlot(slotName);

        if (findSlot === null) return;

        const slotIndex = findSlot.data.index;
        const skin = this.ani.skeleton.data.findSkin(getSkinName);

        if (skin) {
            const attachment = skin.getAttachment(slotIndex, slotName);
            // console.log(attachment);
            if (attachment) {
                findSlot.setAttachment(attachment);
            }
        }
    }

    public setSkin($skin: string | number) {
        if ($skin === this._skin) return;

        const len = this._skeletonData.skins.length;

        if (len === 0) return;

        let skin = this._skeletonData.skins[0];

        if (typeof $skin === 'string') {
            for (let i = 0; i < len; i++) {
                if (this._skeletonData.skins[i].name === $skin) {
                    skin = this._skeletonData.skins[i];
                    break;
                }
            }
        } else if (typeof $skin === 'number') {
            if (this._skeletonData.skins[$skin])
                skin = this._skeletonData.skins[$skin];
        }

        this._skin = skin.name;

        this.ani.skeleton.setSkin(skin);
        this.ani.skeleton.setToSetupPose();
        this.ani.animationState.apply(this.ani.skeleton);
    }

    public getSkin(): string | number {
        return this._skin;
    }

    public clearTracks() {
        this.ani.animationState.clearTracks();
    }

    public removeAllSpineListener(): void {
        this.ani.animationState.removeListener(this._listener);
        console.log('삭제');
    }

    // SpineManager에서만 사용하는 전용 함수 ---------------------------------
    public setKey($key: string) {
        this._key = $key;
    }

    public getKey(): string {
        return this._key;
    }
    // ----------------------------------------------------------------------

    set loop($bool: boolean) {
        this._loop = $bool;
    }

    get loop(): boolean {
        return this._loop;
    }

    get skeleton(): Skeleton {
        return this.ani.skeleton;
    }

    get skeletonData(): SkeletonData {
        return this.ani.skeleton.data;
    }

    get animationState(): AnimationState {
        return this.ani.animationState;
    }

    private onComplete(): void {
        this.dispatchEventX({
            type: EVT.ANI_COMPLETE,
            anim: this._anim,
        });
    }

    private onCustomEvent($e: Event, $animName: string = ''): void {
        const animName = $animName;
        const evtName = $e.data.name;
        this.receiveAniEvent(animName, evtName);
        this.dispatchEventX({
            type: EVT.ANI_EVENT,
            animName: animName,
            evtName: evtName,
        });
    }

    /**
     * Spine 애니메이션의 특정 구간을 한 번만 재생합니다.
     * @param $anim 애니메이션 이름 (예: 'play_1')
     * @param startEvent 시작 이벤트 이름 (예: 'lp_end0')
     * @param endEvent 종료 이벤트 이름 (예: 'lp_start1')
     * @param callback 재생 완료 시 호출될 콜백 함수
     */
    public setPlay($anim: string, startEvent: string, endEvent: string) {
        this._anim = $anim;

        const animation = this.ani.skeleton.data.findAnimation($anim);
        if (!animation) {
            console.error(`애니메이션 ${$anim}을 찾을 수 없습니다.`);
            return;
        }

        let startTime = 0;
        let endTime = 0;
        let foundStart = false;
        let foundEnd = false;

        for (const timeline of animation.timelines) {
            if (timeline instanceof EventTimeline) {
                const eventTimeline = timeline as EventTimeline;
                for (const event of eventTimeline.events) {
                    if (event.data.name === startEvent) {
                        startTime = event.time;
                        foundStart = true;
                    }
                    if (event.data.name === endEvent) {
                        endTime = event.time;
                        foundEnd = true;
                    }
                    if (foundStart && foundEnd) break;
                }
            }
            if (foundStart && foundEnd) break;
        }

        if (!foundStart) {
            console.error(
                `시작 이벤트 '${startEvent}'를 애니메이션 ${$anim}에서 찾을 수 없습니다.`
            );
            return;
        }
        if (!foundEnd) {
            console.error(
                `종료 이벤트 '${endEvent}'를 애니메이션 ${$anim}에서 찾을 수 없습니다.`
            );
            return;
        }

        if (startTime >= endTime) {
            console.error(
                `이벤트 시간 설정이 잘못되었습니다: ${startEvent}(${startTime}s) >= ${endEvent}(${endTime}s)`
            );
            return;
        }

        const playEntry = this.ani.animationState.setAnimation(0, $anim, false);
        playEntry.animationStart = startTime;
        playEntry.animationEnd = endTime;
        playEntry.trackEnd = endTime; // 이 시간 이후에는 재생 종료
    }

    public setLoop($anim: string, startEvent: string, endEvent: string) {
        this._anim = $anim;

        const animation = this.ani.skeleton.data.findAnimation($anim);
        if (!animation) {
            console.error(`애니메이션 ${$anim}을 찾을 수 없습니다.`);
            return;
        }

        let startTime = 0;
        let endTime = 0;
        let foundStart = false; // 시작 이벤트를 찾았는지 여부
        let foundEnd = false; // 종료 이벤트를 찾았는지 여부

        // animation.timelines를 순회하며 EventTimeline을 찾습니다.
        for (const timeline of animation.timelines) {
            // Spine 런타임 버전에 따라 instanceof 또는 특정 속성으로 타입 확인
            if (timeline instanceof EventTimeline) {
                // 또는 (timeline as any).events 가 존재한다면
                const eventTimeline = timeline as EventTimeline;
                for (const event of eventTimeline.events) {
                    // EventTimeline 내의 events 배열 순회
                    if (event.data.name === startEvent) {
                        startTime = event.time;
                        foundStart = true;
                    }
                    if (event.data.name === endEvent) {
                        endTime = event.time;
                        foundEnd = true;
                    }
                    // 두 이벤트를 모두 찾았다면 더 이상 순회할 필요 없음
                    if (foundStart && foundEnd) {
                        break; // 내부 이벤트 루프 종료
                    }
                }
            }
            if (foundStart && foundEnd) {
                break; // 외부 타임라인 루프 종료
            }
        }

        if (!foundStart) {
            console.error(
                `시작 이벤트 '${startEvent}'를 애니메이션 ${$anim}에서 찾을 수 없습니다.`
            );
            return;
        }
        if (!foundEnd) {
            console.error(
                `종료 이벤트 '${endEvent}'를 애니메이션 ${$anim}에서 찾을 수 없습니다.`
            );
            return;
        }

        if (startTime >= endTime) {
            console.error(
                `이벤트 시간 설정이 잘못되었습니다: ${startEvent}(${startTime}s) >= ${endEvent}(${endTime}s). 시작 시간이 종료 시간보다 크거나 같을 수 없습니다.`
            );
            return;
        }

        const loopEntry = this.ani.animationState.setAnimation(0, $anim, true);
        loopEntry.animationStart = startTime;
        loopEntry.animationEnd = endTime;
    }

    // 루핑 후 단일로 바꿀 땐 이 부분만 수정하여 사용⚡
    public setPlayThenLoop(
        animName: string,
        playStartEvent: string,
        playEndEvent: string,
        loopStartEvent: string,
        loopEndEvent: string
    ) {
        const animation = this.ani.skeleton.data.findAnimation(animName);
        if (!animation) {
            console.error(`애니메이션 ${animName}을 찾을 수 없습니다.`);
            return;
        }

        const getEventTimes = (startEvent: string, endEvent: string) => {
            let startTime = 0;
            let endTime = 0;
            let foundStart = false;
            let foundEnd = false;

            for (const timeline of animation.timelines) {
                if (timeline instanceof EventTimeline) {
                    for (const event of timeline.events) {
                        if (event.data.name === startEvent) {
                            startTime = event.time;
                            foundStart = true;
                        }
                        if (event.data.name === endEvent) {
                            endTime = event.time;
                            foundEnd = true;
                        }
                        if (foundStart && foundEnd) break;
                    }
                }
                if (foundStart && foundEnd) break;
            }

            if (!foundStart || !foundEnd || startTime >= endTime) {
                console.error(
                    `이벤트 범위가 잘못되었습니다: ${startEvent} ~ ${endEvent}`
                );
                return null;
            }

            return { startTime, endTime };
        };

        const playTimes = getEventTimes(playStartEvent, playEndEvent);
        const loopTimes = getEventTimes(loopStartEvent, loopEndEvent);
        if (!playTimes || !loopTimes) return;

        // 단일 재생
        const playEntry = this.ani.animationState.setAnimation(
            0,
            animName,
            false
        );
        playEntry.animationStart = playTimes.startTime;
        playEntry.animationEnd = playTimes.endTime;

        // 단일재생 완전히 끝난 후 0.05초 후에 루핑애니 시작
        playEntry.trackEnd = playTimes.endTime + 0.05;

        const onComplete = (entry: any) => {
            if (entry === playEntry) {
                // 반복 재생 설정
                const loopEntry = this.ani.animationState.setAnimation(
                    0,
                    animName,
                    true
                );
                loopEntry.animationStart = loopTimes.startTime;
                loopEntry.animationEnd = loopTimes.endTime;

                // 리스너 제거
                this.ani.animationState.removeListener({
                    complete: onComplete,
                });
            }
        };

        // 리스너 등록
        this.ani.animationState.addListener({
            complete: onComplete,
        });
    }

    //override
    public receiveAniEvent($animName: string, $evtName: string): void {}
    /**
     * 특정 게임 오브젝트(RenderTexture 등)의 스냅샷을 찍어
     * 이 스파인 객체의 특정 슬롯 텍스처를 동적으로 업데이트합니다.
     * @param source 스냅샷을 찍을 원본 게임 오브젝트 (주로 RenderTexture)
     * @param slotName 텍스처를 적용할 스파인의 슬롯 이름
     * @returns Promise<void> 작업 완료를 나타내는 프로미스
     */
    public async textureSnapshot(
        source: Phaser.GameObjects.RenderTexture,
        slotName: string
    ): Promise<void> {
        const snapshotCanvas = await new Promise<HTMLCanvasElement>(
            (resolve) => {
                source.snapshot((img) => {
                    const canvas = this.scene.textures.createCanvas(
                        `spine-snapshot-temp-${Date.now()}`,
                        source.width,
                        source.height
                    );
                    if (canvas) {
                        canvas.getContext()?.drawImage(img as any, 0, 0);
                        resolve(canvas.getSourceImage() as HTMLCanvasElement);
                    }
                });
            }
        );

        const imageBitmap = await createImageBitmap(snapshotCanvas);
        this.updateTexture(slotName, imageBitmap);
    }

    /**
     * (내부용) 특정 슬롯의 텍스처를 주어진 ImageBitmap으로 교체하고 UV를 업데이트합니다.
     * @param slotName 교체할 슬롯 이름
     * @param imageBitmap 적용할 새 이미지 비트맵
     */
    private updateTexture(slotName: string, imageBitmap: ImageBitmap): void {
        const slot = this.skeleton.findSlot(slotName);
        if (!slot) {
            console.error(`[SpineX] Slot not found: ${slotName}`);
            return;
        }

        const attachment = slot.getAttachment() as spine.MeshAttachment;
        if (!attachment) {
            console.error(`[SpineX] Attachment not found in slot: ${slotName}`);
            return;
        }

        const oldRegion = attachment.region as spine.TextureAtlasRegion;
        const renderer = this.scene.game
            .renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        const newSpineTexture = new spine.GLTexture(renderer.gl, imageBitmap);

        oldRegion.texture = newSpineTexture;
        oldRegion.u = 0;
        oldRegion.v = 0;
        oldRegion.u2 = 1;
        oldRegion.v2 = 1;
        oldRegion.width = imageBitmap.width;
        oldRegion.height = imageBitmap.height;
        oldRegion.originalWidth = imageBitmap.width;
        oldRegion.originalHeight = imageBitmap.height;

        const oldUvs = new Float32Array(attachment.uvs);
        const oldUBase = oldRegion.u,
            oldVBase = oldRegion.v;
        const oldURange = oldRegion.u2 - oldUBase,
            oldVRange = oldRegion.v2 - oldVBase;
        const normalizedUvs = new Float32Array(oldUvs.length);

        for (let i = 0; i < oldUvs.length; i += 2) {
            normalizedUvs[i] = (oldUvs[i] - oldUBase) / oldURange;
            normalizedUvs[i + 1] = (oldUvs[i + 1] - oldVBase) / oldVRange;
        }

        attachment.uvs = normalizedUvs;
        this.skeleton.updateWorldTransform(spine.Physics.none);
    }
}
