import Phaser from 'phaser';

export class InputController {
    private scene: Phaser.Scene;
    private isMobile: boolean;

    private isLocked: boolean = false;
    private isEnabled: boolean = false;

    public onActionTriggered?: () => void;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;
    }

    public attach(): void {
        this.isEnabled = true;
        this.isLocked = false;

        this.scene.input.on('pointerdown', this.handleInput, this);
        if (!this.isMobile && this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown-SPACE', this.handleInput, this);
        }
    }

    public detach(): void {
        this.isEnabled = false;
        this.scene.input.off('pointerdown', this.handleInput, this);
        if (!this.isMobile && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keydown-SPACE', this.handleInput, this);
        }
    }

    public lock(): void {
        this.isLocked = true;
    }

    public unlock(): void {
        this.isLocked = false;
    }

    public getIsLocked(): boolean {
        return this.isLocked;
    }

    private handleInput(): void {
        if (!this.isEnabled || this.isLocked) return;
        if (this.onActionTriggered) {
            this.onActionTriggered();
        }
    }

    public destroy(): void {
        this.detach();
    }
}
