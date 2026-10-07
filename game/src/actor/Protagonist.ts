import { ContainerX } from '../core/ContainerX';
import { SpineX } from '../animation/SpineX';
import { SceneX } from '../core/SceneX';
import { EventX } from '../core/BaseComponent';
import { TransButton } from '../ui/TransButton';
import { TrackEntry } from '@esotericsoftware/spine-phaser-v3';
import EVT from 'src/EVT';

export enum Character {
    BEORI = 'beori',
    DEUMI = 'deumi',
    DOGI = 'dogi',
    DOGI_CHEF = 'dogi_chef',
    TORI = 'tori',
    NYANGI = 'nyangi',
    NONE = 'none',
}

export enum State {
    ENTRY = 'entry', // 들어오기
    EXIT = 'exit', // 나가기
    EXIT_AND_PEEK = 'exit_and_peek', // 나갔다 들어오기
    PEEK = 'peek', // 엿보기
    EMBARRASS = 'embarrass', // 당황하기
    LOOP = 'loop', // 루프 애니메이션 상태 (나와서 서있는 상태)
    NOT_IT = 'not_it', // 잘못된 x
    SMILE_SIDE = 'smile_side', // 측면에서 웃기
    SEE_TELESCOPE = 'see_telescope', // 망원경으로 관찰
    JOY = 'joy', // 손들면서 환호
}

export class Protagonist extends ContainerX {
    private ch: SpineX;
    private _action: string;
    private _actionFinish: boolean;
    private _callBackObj: Object;
    private _disabled: boolean = false;
    private btn: TransButton;

    constructor($scene: SceneX) {
        super($scene, 0, 0);
        this.scene = $scene;

        this._actionFinish = true;

        this._callBackObj = {};

        if (this.scene.game.gameState.mainCharacter === Character.NONE) {
            this.visible = false;
            return;
        }

        this.ch = new SpineX($scene, this.scene.game.gameState.mainCharacter);
        this.ch.loop = false;
        this.ch.animationState.removeListener(this.ch._listener);
        this.ch.scale = 1;

        // this.ch.alphaX = 0.5;

        this.ch.x = 140;
        this.ch.y = 836;
        this.ch.setTimeScale(0);
        this.setAllMix();
        // this.ch.setMix('idle_2', 'idle_3', 0.5);
        // this.ch.setMix('idle_3', 'idle_2', 0.5);
        // this.setSmile();
        this.add(this.ch);

        // 버튼 기능 구현
        this.btn = new TransButton(this.scene, 260, 260, 0);
        this.btn.y = (this.scene.game.config.height as number) - 260;
        this.btn.addEventListenerX(EVT.CLICK, 'onClick', this);
        this.add(this.btn);

        this.scene.add.existing(this);
    }

    // 모든 애니메이션끼리 mix 처리한다.
    private setAllMix() {
        const list = this.ch.getAnimationNames();
        const len = list.length;
        for (let i = 0; i < len; i++) {
            const stAnim = list[i];
            for (let j = 0; j < len; j++) {
                const edAnim = list[j];
                if (stAnim != edAnim) {
                    this.ch.setMix(stAnim, edAnim, 0.1);
                }
            }
        }
    }

    // 화면 왼쪽 밖에서 안으로 들어온다.
    public aSetEntry(): Promise<void> {
        return new Promise((resolve) => {
            this.btn.x = 0;
            this._action = State.ENTRY;
            this._actionFinish = false;
            this.ch.loop = false;
            this.ch.x = 140;
            this.ch.setSkin('mouth_smile');
            this.ch.setAnim('play_2');
            this.ch.setTimeScale(1);

            const listener = {
                complete: (entry: TrackEntry) => {
                    this.ch.animationState.removeListener(listener);
                    this._actionFinish = true;
                    resolve();
                },
            };
            this.ch.animationState.addListener(listener);
        });
    }

    // 화면 왼쪽으로 나가기
    public aSetExit(): Promise<void> {
        return new Promise((resolve) => {
            this.btn.x = -260;
            this._action = State.EXIT;
            this._actionFinish = false;
            this.ch.x = 140;
            this.ch.loop = false;
            this.ch.setSkin('mouth_still');
            this.ch.setAnim('play_3');
            this.ch.setTimeScale(1);

            const listener = {
                complete: (entry: TrackEntry) => {
                    this.ch.animationState.removeListener(listener);
                    this._actionFinish = true;
                    resolve();
                },
            };
            this.ch.animationState.addListener(listener);
        });
    }

    // 화면 왼쪽으로 나가서 엿보기
    public aSetExitAndPeeking(): Promise<void> {
        return new Promise((resolve) => {
            this.btn.x = -100;
            this._action = State.EXIT_AND_PEEK;
            this._actionFinish = false;
            this.ch.x = 140;
            this.ch.loop = false;
            this.ch.setSkin('mouth_still');
            this.ch.setAnim('play_3');
            this.ch.setTimeScale(1);

            const listener = {
                complete: (entry: TrackEntry) => {
                    this.ch.animationState.removeListener(listener);
                    this.ch.loop = true;
                    this.ch.setAnim('idle_1');
                    this.scene.tweens.add({
                        targets: this.ch,
                        x: 180,
                        duration: 500,
                        onComplete: () => {
                            this._actionFinish = true;
                            resolve();
                        },
                    });
                },
            };
            this.ch.animationState.addListener(listener);
        });
    }

    // 엿보기
    public aSetPeeking(): Promise<void> {
        return new Promise((resolve) => {
            this.btn.x = -100;
            this._action = State.PEEK;
            this._actionFinish = false;
            this.ch.x = 0;
            this.ch.loop = true;
            this.ch.setAnim('idle_1');
            this.ch.setTimeScale(1);

            this.scene.tweens.add({
                targets: this.ch,
                x: 180,
                duration: 500,
                onComplete: () => {
                    this._actionFinish = true;
                    resolve();
                },
            });
        });
    }

    // 당황하기
    public aSetEmbarrass($action?: Function): Promise<void> {
        return new Promise((resolve) => {
            this.btn.x = 0;
            this._action = State.EMBARRASS;
            this._actionFinish = false;
            this.ch.x = 140;
            this.ch.loop = false;
            this.ch.setAnim('idle_5');
            this.ch.setTimeScale(1);

            if ($action) $action();

            const listener = {
                complete: (entry: TrackEntry) => {
                    this.ch.animationState.removeListener(listener);
                    this._actionFinish = true;
                    resolve();
                },
            };
            this.ch.animationState.addListener(listener);
        });
    }

    // 거절, 이건 아니지(X)
    public aSetNotIt($action?: Function): Promise<void> {
        return new Promise((resolve) => {
            this.btn.x = 0;
            this._action = State.NOT_IT;
            this._actionFinish = false;
            this.ch.x = 140;
            this.ch.loop = false;
            this.ch.setAnim('ex_1');
            this.ch.setTimeScale(1);

            if ($action) $action();

            const listener = {
                complete: (entry: TrackEntry) => {
                    this.ch.animationState.removeListener(listener);
                    this._actionFinish = true;
                    resolve();
                },
            };
            this.ch.animationState.addListener(listener);
        });
    }

    // 측면 웃기
    public aSetSmileSide($action?: Function): Promise<void> {
        return new Promise((resolve) => {
            this.btn.x = 0;
            this._action = State.SMILE_SIDE;
            this._actionFinish = false;
            this.ch.x = 140;
            this.ch.loop = false;
            this.ch.setAnim('ex_2');
            this.ch.setTimeScale(1);

            if ($action) $action();

            const listener = {
                complete: (entry: TrackEntry) => {
                    this.ch.animationState.removeListener(listener);
                    this._actionFinish = true;
                    resolve();
                },
            };
            this.ch.animationState.addListener(listener);
        });
    }

    // 망원경 관찰하기
    public aSetTelescopte($action?: Function): Promise<void> {
        return new Promise((resolve) => {
            this.btn.x = 0;
            this._action = State.SEE_TELESCOPE;
            this._actionFinish = false;
            this.ch.x = 140;
            this.ch.loop = false;
            this.ch.setAnim('ex_3');
            this.ch.setTimeScale(1);

            if ($action) $action();

            const listener = {
                complete: (entry: TrackEntry) => {
                    this.ch.animationState.removeListener(listener);
                    this._actionFinish = true;
                    resolve();
                },
            };
            this.ch.animationState.addListener(listener);
        });
    }

    // 환호 하기
    public aSetJoy($action?: Function): Promise<void> {
        return new Promise((resolve) => {
            this.btn.x = 0;
            this._action = State.JOY;
            this._actionFinish = false;
            this.ch.x = 140;
            this.ch.loop = false;
            this.ch.setAnim('idle_4');
            this.ch.setTimeScale(1);

            if ($action) $action();

            const listener = {
                complete: (entry: TrackEntry) => {
                    this.ch.animationState.removeListener(listener);
                    this._actionFinish = true;
                    resolve();
                },
            };
            this.ch.animationState.addListener(listener);
        });
    }

    // 말하기
    public setTalk(): void {
        this.ch.setSkin('mouth_talk');
    }

    // 웃기
    public setSmile(): void {
        this.ch.loop = false;
        this.ch.setSkin('mouth_smile');
    }

    // 닥치기
    public setShutup(): void {
        this.ch.setSkin('mouth_still');
    }

    // 진입후 루프 애니메이션
    public setLoopAction($type: number, $action?: Function): void {
        this.ch.x = 140;
        this.ch.loop = true;

        this._action = State.LOOP;
        this._actionFinish = true;

        let anim = 'idle_2';

        switch ($type) {
            case 1:
                anim = 'idle_3';
                break;
            default:
                break;
        }

        this.ch.setAnim(anim);
        this.ch.setTimeScale(1);

        if ($action) $action();
    }

    public clearTracks(): void {
        this.ch.clearTracks();
    }

    // 현 상태 가져오기
    // ENUM State 가져가서 사용.
    public getState(): string {
        return this._action;
    }

    // 전환 완료 여부
    public getActionFinish(): boolean {
        return this._actionFinish;
    }

    // 스파인 가져오기
    public getSpine(): SpineX {
        return this.ch;
    }

    private onClick(): void {
        console.log(this._actionFinish);
        if (this._actionFinish && !this._disabled) {
            console.log('onClick');
            this.dispatchEventX({ type: EVT.CLICK });
        }
    }

    // 버튼 사용 가능 여부
    set disabled($bool: boolean) {
        this._disabled = $bool;
    }

    get disabled(): boolean {
        return this._disabled;
    }
}
