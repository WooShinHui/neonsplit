export interface StageInfo {
    id: number;
    name: string;
    displayName: string;
    subtitle: string;
    minScore: number;
    accentColor: number;
    emoji: string;
}

export class StageModel {
    public static readonly STAGES: StageInfo[] = [
        {
            id: 0,
            name: 'outer_shell',
            displayName: 'OUTER SHELL',
            subtitle: 'Dormant circuits',
            minScore: 0,
            accentColor: 0x00ffff,
            emoji: '🔌',
        },
        {
            id: 1,
            name: 'beyond',
            displayName: 'THE VOID',
            subtitle: 'Beyond existence',
            minScore: 6000,
            accentColor: 0xff6600,
            emoji: '🌌',
        },
        {
            id: 2,
            name: 'data_stream',
            displayName: 'DATA STREAM',
            subtitle: 'Network pulse detected',
            minScore: 24000,
            accentColor: 0x00ff88,
            emoji: '📡',
        },
        {
            id: 3,
            name: 'core_pulse',
            displayName: 'CORE BREACH',
            subtitle: 'System overload imminent',
            minScore: 50000,
            accentColor: 0xff00ff,
            emoji: '💓',
        },
        {
            id: 4,
            name: 'singularity',
            displayName: 'SINGULARITY',
            subtitle: 'Reality fracturing',
            minScore: 80000,
            accentColor: 0xffffff,
            emoji: '✨',
        },
        {
            id: 5,
            name: 'ascension',
            displayName: 'ASCENSION',
            subtitle: 'Beyond comprehension',
            minScore: 120000,
            accentColor: 0xffdd00,
            emoji: '👁️',
        },
    ];

    public currentStageId: number = 0;

    public reset(): void {
        this.currentStageId = 0;
    }

    public getCurrentStage(): StageInfo {
        return (
            StageModel.STAGES.find((s) => s.id === this.currentStageId) ||
            StageModel.STAGES[0]
        );
    }

    public getNextStage(): StageInfo | null {
        return (
            StageModel.STAGES.find((s) => s.id === this.currentStageId + 1) ||
            null
        );
    }

    public getProgress(score: number): number {
        const current = this.getCurrentStage();
        const next = this.getNextStage();
        if (!next) return 1;

        const range = next.minScore - current.minScore;
        const progress = (score - current.minScore) / range;
        return Math.max(0, Math.min(1, progress));
    }

    public checkStageTransition(score: number): {
        transitioned: boolean;
        previousStage: StageInfo;
        newStage: StageInfo;
    } | null {
        let newStageId = 0;
        for (let i = StageModel.STAGES.length - 1; i >= 0; i--) {
            if (score >= StageModel.STAGES[i].minScore) {
                newStageId = StageModel.STAGES[i].id;
                break;
            }
        }

        if (newStageId !== this.currentStageId) {
            const previousStage = this.getCurrentStage();
            this.currentStageId = newStageId;
            const newStage = this.getCurrentStage();
            return {
                transitioned: true,
                previousStage,
                newStage,
            };
        }

        return null;
    }
}
