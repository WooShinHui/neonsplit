import { StageInfo } from '../model/StageModel';

export class BackgroundView {
    private scene: Phaser.Scene;
    private isMobile: boolean;

    private bgImage: Phaser.GameObjects.Image | null = null;
    private backgroundGrid: Phaser.GameObjects.TileSprite | null = null;
    private ambientElements: Phaser.GameObjects.GameObject[] = [];
    private ambientTweens: Phaser.Tweens.Tween[] = [];
    private ambientTimer: number = 0;
    private splitLines: Phaser.GameObjects.Graphics[] = [];
    private neonLines: Phaser.GameObjects.Graphics | null = null;
    private glowGraphics: Phaser.GameObjects.Graphics | null = null;
    private backgroundParticles: Phaser.GameObjects.Image[] = [];

    private currentStageId: number = 0;

    constructor(scene: Phaser.Scene, isMobile: boolean) {
        this.scene = scene;
        this.isMobile = isMobile;
    }

    public init(): void {
        const { width, height } = this.scene.cameras.main;

        if (!this.scene.textures.exists('bg_gradient')) {
            const canvas = this.scene.textures.createCanvas(
                'bg_gradient',
                width,
                height
            );
            const ctx = canvas.context;
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#0a0520');
            gradient.addColorStop(0.5, '#1a0a3e');
            gradient.addColorStop(1, '#2d1b69');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            canvas.refresh();
        }

        this.bgImage = this.scene.add
            .image(width / 2, height / 2, 'bg_gradient')
            .setDepth(-11);

        if (!this.scene.textures.exists('neon_grid')) {
            const gridCanvas = this.scene.textures.createCanvas(
                'neon_grid',
                100,
                100
            );
            const gctx = gridCanvas.context;
            gctx.strokeStyle = '#00ffff';
            gctx.lineWidth = 2;
            gctx.shadowBlur = 15;
            gctx.shadowColor = '#00ffff';

            gctx.beginPath();
            gctx.moveTo(0, 0);
            gctx.lineTo(100, 0);
            gctx.stroke();

            gctx.beginPath();
            gctx.moveTo(0, 0);
            gctx.lineTo(0, 100);
            gctx.stroke();

            gridCanvas.refresh();
        }

        this.backgroundGrid = this.scene.add.tileSprite(
            width / 2,
            height / 2,
            width,
            height,
            'neon_grid'
        );
        this.backgroundGrid.setAlpha(0.25).setDepth(-10);

        this.scene.tweens.add({
            targets: this.backgroundGrid,
            tilePositionY: 200,
            duration: 4000,
            repeat: -1,
            ease: 'Linear',
        });

        this.recreateBackgroundDecorations(0);
    }

    public bumpTilePositionY(amount: number): void {
        if (this.backgroundGrid) {
            this.backgroundGrid.tilePositionY += amount;
        }
    }

    public setGridTint(tint: number): void {
        if (this.backgroundGrid) {
            this.backgroundGrid.setTint(tint);
        }
    }

    public update(_score: number, delta: number): void {
        this.ambientTimer += delta;
        if (this.ambientTimer >= 100) {
            this.ambientTimer = 0;
            this.updateAmbientEffects();
        }
    }

    public transitionToStage(stage: StageInfo): void {
        this.currentStageId = stage.id;
        this.recreateBackgroundGradient(stage.id);
        this.applyBackground(stage.id, true);
        this.recreateBackgroundDecorations(stage.id);
        this.startAmbientEffects(stage.id);
        this.createScreenSplitEffect(stage.id);
    }

    private recreateBackgroundGradient(stageId: number): void {
        if (!this.bgImage || !this.bgImage.scene) return;

        const { width, height } = this.scene.cameras.main;

        const gradientConfigs = [
            { top: '#0a0520', mid: '#1a0a3e', bot: '#2d1b69' },
            { top: '#000000', mid: '#1a0a00', bot: '#331400' },
            { top: '#001a40', mid: '#00668c', bot: '#00b3d9' },
            { top: '#330033', mid: '#660066', bot: '#cc00cc' },
            { top: '#4d4d66', mid: '#9999b3', bot: '#e6e6ff' },
            { top: '#1a1400', mid: '#4d4000', bot: '#806600' },
        ];

        const config = gradientConfigs[stageId] || gradientConfigs[0];
        const texKey = `bg_gradient_${stageId}`;

        if (!this.scene.textures.exists(texKey)) {
            const canvas = this.scene.textures.createCanvas(
                texKey,
                width,
                height
            );
            const ctx = canvas.context;

            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, config.top);
            gradient.addColorStop(0.5, config.mid);
            gradient.addColorStop(1, config.bot);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            canvas.refresh();
        }

        this.bgImage.setTexture(texKey);
    }

    private recreateBackgroundDecorations(stageId: number): void {
        this.cleanupBackgroundDecorations();

        const { width, height } = this.scene.cameras.main;

        const lineConfigs = [
            {
                colors: [0x00ffff, 0xff00ff],
                count: 3,
                alpha: 0.2,
                thickness: 2,
            },
            {
                colors: [0xff6600, 0xff3300],
                count: 8,
                alpha: 0.25,
                thickness: 4,
            },
            {
                colors: [0x00ffff, 0x00ff88],
                count: 10,
                alpha: 0.45,
                thickness: 3,
            },
            {
                colors: [0xff00ff, 0xff0088],
                count: 6,
                alpha: 0.35,
                thickness: 3,
            },
            {
                colors: [0xffffff, 0xccccff],
                count: 12,
                alpha: 0.5,
                thickness: 2,
            },
            {
                colors: [0xffdd00, 0xff8800],
                count: 14,
                alpha: 0.55,
                thickness: 3,
            },
        ];

        const lConfig = lineConfigs[stageId] || lineConfigs[0];

        this.neonLines = this.scene.add.graphics().setDepth(-8);
        for (let i = 0; i < lConfig.count; i++) {
            const y = (height / (lConfig.count + 1)) * (i + 1);
            const color = lConfig.colors[i % lConfig.colors.length];

            this.neonLines.lineStyle(lConfig.thickness, color, lConfig.alpha);
            this.neonLines.lineBetween(0, y, width, y);

            this.neonLines.lineStyle(
                lConfig.thickness * 2.5,
                color,
                lConfig.alpha * 0.25
            );
            this.neonLines.lineBetween(0, y, width, y);
        }

        this.scene.tweens.add({
            targets: this.neonLines,
            alpha: { from: 0.4, to: 0.9 },
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        const glowConfigs = [
            {
                c1: 0x00ffff,
                c2: 0xff00ff,
                r1: 150,
                r2: 200,
                a: 0.12,
                pos1: { x: 0.2, y: 0.3 },
                pos2: { x: 0.8, y: 0.7 },
            },
            {
                c1: 0xff6600,
                c2: 0xff2200,
                r1: 180,
                r2: 240,
                a: 0.18,
                pos1: { x: 0.3, y: 0.4 },
                pos2: { x: 0.7, y: 0.6 },
            },
            {
                c1: 0x00ffff,
                c2: 0x00ff88,
                r1: 160,
                r2: 220,
                a: 0.2,
                pos1: { x: 0.25, y: 0.35 },
                pos2: { x: 0.75, y: 0.65 },
            },
            {
                c1: 0xff00ff,
                c2: 0x9900ff,
                r1: 220,
                r2: 280,
                a: 0.25,
                pos1: { x: 0.5, y: 0.5 },
                pos2: { x: 0.5, y: 0.5 },
            },
            {
                c1: 0xffffff,
                c2: 0x8888ff,
                r1: 300,
                r2: 400,
                a: 0.3,
                pos1: { x: 0.5, y: 0.5 },
                pos2: { x: 0.5, y: 0.5 },
            },
            {
                c1: 0xffdd00,
                c2: 0xff8800,
                r1: 350,
                r2: 450,
                a: 0.35,
                pos1: { x: 0.5, y: 0.5 },
                pos2: { x: 0.5, y: 0.5 },
            },
        ];

        const gConfig = glowConfigs[stageId] || glowConfigs[0];

        this.glowGraphics = this.scene.add.graphics().setDepth(-9);
        this.glowGraphics.fillStyle(gConfig.c1, gConfig.a);
        this.glowGraphics.fillCircle(
            width * gConfig.pos1.x,
            height * gConfig.pos1.y,
            gConfig.r1
        );
        this.glowGraphics.fillStyle(gConfig.c2, gConfig.a * 0.8);
        this.glowGraphics.fillCircle(
            width * gConfig.pos2.x,
            height * gConfig.pos2.y,
            gConfig.r2
        );

        this.scene.tweens.add({
            targets: this.glowGraphics,
            alpha: { from: 0.5, to: 1 },
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        if (!this.scene.textures.exists('neon_particle')) {
            const pCanvas = this.scene.textures.createCanvas(
                'neon_particle',
                20,
                20
            );
            const pctx = pCanvas.context;
            pctx.shadowBlur = 10;
            pctx.shadowColor = '#ff00ff';
            pctx.fillStyle = '#ff00ff';
            pctx.beginPath();
            pctx.arc(10, 10, 4, 0, Math.PI * 2);
            pctx.fill();
            pCanvas.refresh();
        }

        const particleCount = 20 + stageId * 8;
        const particlePalette = [
            [0x00ffff, 0xff00ff, 0xffff00],
            [0xff6600, 0xff3300, 0xffaa00],
            [0x00ffff, 0x00ff88, 0x0088ff],
            [0xff00ff, 0xff0088, 0xaa00ff],
            [0xffffff, 0xaaaaff, 0x6666ff],
            [0xffdd00, 0xff8800, 0xffffff],
        ][stageId] || [0x00ffff, 0xff00ff];

        for (let i = 0; i < particleCount; i++) {
            const p = this.scene.add
                .image(
                    Phaser.Math.Between(0, width),
                    Phaser.Math.Between(0, height),
                    'neon_particle'
                )
                .setDepth(-9)
                .setAlpha(Phaser.Math.FloatBetween(0.2, 0.7))
                .setScale(Phaser.Math.FloatBetween(0.5, 1.4))
                .setTint(Phaser.Utils.Array.GetRandom(particlePalette));

            this.scene.tweens.add({
                targets: p,
                y: p.y + Phaser.Math.Between(-40, 40),
                x: p.x + Phaser.Math.Between(-25, 25),
                alpha: Phaser.Math.FloatBetween(0.1, 0.9),
                duration: Phaser.Math.Between(2500, 5000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });

            this.backgroundParticles.push(p);
        }
    }

    private cleanupBackgroundDecorations(): void {
        if (this.neonLines && this.neonLines.scene) {
            this.neonLines.destroy();
            this.neonLines = null;
        }
        if (this.glowGraphics && this.glowGraphics.scene) {
            this.glowGraphics.destroy();
            this.glowGraphics = null;
        }
        this.backgroundParticles.forEach((p) => {
            if (p && p.scene) p.destroy();
        });
        this.backgroundParticles = [];
    }

    private applyBackground(stageId: number, animate: boolean): void {
        const bgConfigs = [
            { gridAlpha: 0.15, gridTint: 0x00ffff, gridSpeed: 5000 },
            { gridAlpha: 0.2, gridTint: 0xff6600, gridSpeed: 4500 },
            { gridAlpha: 0.5, gridTint: 0x00ff88, gridSpeed: 1800 },
            { gridAlpha: 0.35, gridTint: 0xff00ff, gridSpeed: 3500 },
            { gridAlpha: 0.45, gridTint: 0xffffff, gridSpeed: 2500 },
            { gridAlpha: 0.55, gridTint: 0xffdd00, gridSpeed: 1500 },
        ];

        const config = bgConfigs[stageId] || bgConfigs[0];
        if (!this.backgroundGrid) return;

        if (animate) {
            const gridRef = this.backgroundGrid;
            this.scene.tweens.add({
                targets: gridRef,
                alpha: config.gridAlpha,
                duration: 800,
                ease: 'Cubic.inOut',
                onComplete: () => {
                    if (gridRef && gridRef.scene) {
                        gridRef.setTint(config.gridTint);
                        this.scene.tweens.killTweensOf(gridRef);
                        this.scene.tweens.add({
                            targets: gridRef,
                            tilePositionY: 200,
                            duration: config.gridSpeed,
                            repeat: -1,
                            ease: 'Linear',
                        });
                    }
                },
            });
        } else {
            this.backgroundGrid.setAlpha(config.gridAlpha);
            this.backgroundGrid.setTint(config.gridTint);
        }
    }

    private createScreenSplitEffect(stageId: number): void {
        this.cleanupSplitLines();
        const { width, height } = this.scene.cameras.main;
        const lineCount = Math.min(stageId * 2 + 3, 15);

        for (let i = 0; i < lineCount; i++) {
            const line = this.scene.add.graphics().setDepth(150);
            const isVertical = Math.random() > 0.5;
            const thickness = 2 + stageId * 0.5;

            if (isVertical) {
                const x = (width / (lineCount + 1)) * (i + 1);
                line.lineStyle(thickness, 0xffffff, 0);
                line.lineBetween(x, 0, x, height);
            } else {
                const y = (height / (lineCount + 1)) * (i + 1);
                line.lineStyle(thickness, 0xffffff, 0);
                line.lineBetween(0, y, width, y);
            }

            this.splitLines.push(line);

            this.scene.tweens.add({
                targets: line,
                alpha: 0.9,
                duration: 80,
                yoyo: true,
                repeat: 4 + stageId,
                onComplete: () => {
                    if (line && line.scene) {
                        line.destroy();
                    }
                },
            });
        }

        this.scene.cameras.main.shake(400, 0.008 * (stageId + 1));
    }

    private cleanupSplitLines(): void {
        this.splitLines.forEach((l) => {
            if (l && l.scene) l.destroy();
        });
        this.splitLines = [];
    }

    private startAmbientEffects(stageId: number): void {
        this.cleanupAmbientEffects();
        switch (stageId) {
            case 2:
                this.createDataStreamAmbient();
                break;
            case 3:
                this.createOverloadAmbient();
                break;
            default:
                break;
        }
    }

    private createDataStreamAmbient(): void {
        const { width, height } = this.scene.cameras.main;
        const streamCount = this.isMobile ? 6 : 12;

        for (let i = 0; i < streamCount; i++) {
            const x = (width / (streamCount + 1)) * (i + 1);
            const stream = this.scene.add.graphics().setDepth(-5);
            stream.lineStyle(2, 0x00ff88, 0.35);
            stream.lineBetween(x, 0, x, height);
            this.ambientElements.push(stream);

            const tween = this.scene.tweens.add({
                targets: stream,
                alpha: { from: 0.1, to: 0.7 },
                duration: Phaser.Math.Between(400, 900),
                yoyo: true,
                repeat: -1,
                delay: i * 80,
            });
            this.ambientTweens.push(tween);
        }
    }

    private createOverloadAmbient(): void {
        const { width, height } = this.scene.cameras.main;
        const flashGraphic = this.scene.add.graphics().setDepth(-6);
        flashGraphic.fillStyle(0xff00ff, 0.08);
        flashGraphic.fillRect(0, 0, width, height);
        this.ambientElements.push(flashGraphic);

        const tween = this.scene.tweens.add({
            targets: flashGraphic,
            alpha: { from: 0.02, to: 0.2 },
            duration: 180,
            yoyo: true,
            repeat: -1,
            ease: 'Stepped',
        });
        this.ambientTweens.push(tween);
    }

    private updateAmbientEffects(): void {
        switch (this.currentStageId) {
            case 1:
                if (Math.random() < 0.2) this.emitBeyondBurst();
                break;
            case 4:
                if (Math.random() < 0.35) this.emitSingularityConverge();
                break;
            case 5:
                if (Math.random() < 0.3) this.emitAscensionPulse();
                break;
        }
    }

    private emitBeyondBurst(): void {
        const { width, height } = this.scene.cameras.main;
        const burst = this.scene.add.graphics().setDepth(-6);
        const bx = Phaser.Math.Between(width * 0.2, width * 0.8);
        const by = Phaser.Math.Between(height * 0.2, height * 0.8);

        burst.lineStyle(2, 0xff6600, 0.8);
        burst.strokeCircle(bx, by, 5);

        this.scene.tweens.add({
            targets: burst,
            alpha: 0,
            duration: 700,
            ease: 'Quad.out',
            onUpdate: (tw) => {
                const r = 5 + tw.progress * 80;
                burst.clear();
                burst.lineStyle(2 * (1 - tw.progress), 0xff6600, 0.8 * (1 - tw.progress));
                burst.strokeCircle(bx, by, r);
            },
            onComplete: () => burst.destroy(),
        });
    }

    private emitSingularityConverge(): void {
        const { width, height } = this.scene.cameras.main;
        const cx = width / 2;
        const cy = height / 2;
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const dist = Phaser.Math.Between(200, 450);
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;

        const particle = this.scene.add.graphics().setDepth(-4);
        particle.fillStyle(0xffffff, 0.9);
        particle.fillCircle(sx, sy, 3);

        this.scene.tweens.add({
            targets: particle,
            x: cx - sx,
            y: cy - sy,
            alpha: { from: 0.9, to: 0.1 },
            duration: Phaser.Math.Between(600, 1100),
            ease: 'Cubic.in',
            onComplete: () => particle.destroy(),
        });
    }

    private emitAscensionPulse(): void {
        const { width, height } = this.scene.cameras.main;
        const ring = this.scene.add.graphics().setDepth(-4);
        const cx = width / 2;
        const cy = height / 2;
        const startR = 40;
        const maxR = Math.max(width, height) * 0.7;

        this.scene.tweens.add({
            targets: ring,
            duration: 1200,
            ease: 'Cubic.out',
            onUpdate: (tw) => {
                const r = startR + (maxR - startR) * tw.progress;
                const a = (1 - tw.progress) * 0.6;
                ring.clear();
                ring.lineStyle(3, 0xffdd00, a);
                ring.strokeCircle(cx, cy, r);
            },
            onComplete: () => ring.destroy(),
        });
    }

    private cleanupAmbientEffects(): void {
        this.ambientTweens.forEach((t) => t.stop());
        this.ambientTweens = [];
        this.ambientElements.forEach((el) => {
            if (el && el.scene) el.destroy();
        });
        this.ambientElements = [];
    }

    public destroy(): void {
        this.cleanupSplitLines();
        this.cleanupAmbientEffects();
        this.cleanupBackgroundDecorations();
        if (this.bgImage && this.bgImage.scene) this.bgImage.destroy();
        if (this.backgroundGrid && this.backgroundGrid.scene)
            this.backgroundGrid.destroy();
    }
}
