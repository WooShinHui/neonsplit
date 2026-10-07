export interface LeaderboardEntry {
    name: string;
    score: number;
    country: string;
    timestamp: number;
    playerId: string;
}

export class LeaderboardModel {
    private readonly FIREBASE_URL: string =
        'https://neonsplit-319a7-default-rtdb.firebaseio.com';
    private readonly LOCAL_STORAGE_KEY: string = 'leaderboard_global';

    public async detectCountryCode(): Promise<string> {
        try {
            const response = await fetch(
                'https://www.cloudflare.com/cdn-cgi/trace'
            );
            const data = await response.text();
            const countryMatch = data.match(/loc=([A-Z]{2})/);
            return countryMatch ? countryMatch[1] : 'UNKNOWN';
        } catch (error) {
            console.error('Country detection failed:', error);
            return 'UNKNOWN';
        }
    }

    public async submitScore(
        playerName: string,
        score: number,
        countryCode: string,
        playerId: string
    ): Promise<boolean> {
        try {
            const scoreData: LeaderboardEntry = {
                name: playerName,
                score: score,
                country: countryCode,
                timestamp: Date.now(),
                playerId: playerId,
            };

            const url = `${this.FIREBASE_URL}/leaderboard/${encodeURIComponent(
                playerId
            )}.json`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scoreData),
            });

            if (response.ok) {
                return true;
            } else {
                this.saveToLocalStorage(scoreData);
                return false;
            }
        } catch (error) {
            console.error('❌ Firebase submit failed:', error);
            this.saveToLocalStorage({
                name: playerName,
                score: score,
                country: countryCode,
                timestamp: Date.now(),
                playerId: playerId,
            });
            return false;
        }
    }

    public async fetchTopPlayers(limit: number = 3): Promise<LeaderboardEntry[]> {
        try {
            const response = await fetch(
                `${this.FIREBASE_URL}/leaderboard.json?orderBy="score"&limitToLast=${limit}`
            );
            const data = await response.json();

            if (!data) return this.getLocalTopPlayers(limit);

            const players: LeaderboardEntry[] = Object.values(data)
                .map((e: any) => e as LeaderboardEntry)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            return players;
        } catch (error) {
            console.error('Firebase fetch failed:', error);
            return this.getLocalTopPlayers(limit);
        }
    }

    public async fetchMyRank(currentScore: number): Promise<number> {
        try {
            const response = await fetch(
                `${this.FIREBASE_URL}/leaderboard.json?orderBy="score"`
            );
            const data = await response.json();

            if (!data) return 999;

            const allScores = Object.values(data)
                .map((entry: any) => entry.score as number)
                .sort((a, b) => b - a);

            return allScores.filter((s) => s > currentScore).length + 1;
        } catch (error) {
            return 999;
        }
    }

    public async fetchNextRankScore(
        currentScore: number
    ): Promise<number | null> {
        try {
            const response = await fetch(
                `${this.FIREBASE_URL}/leaderboard.json?orderBy="score"&limitToLast=20`
            );
            const data = await response.json();

            if (!data) return null;

            const allScores = Object.values(data)
                .map((entry: any) => entry.score as number)
                .sort((a, b) => b - a);

            const nextScore = allScores.find((s) => s > currentScore);
            return nextScore !== undefined ? nextScore : null;
        } catch (error) {
            console.error('Next rank fetch failed:', error);
            return null;
        }
    }

    public saveToLocalStorage(entry: LeaderboardEntry): void {
        const local = this.getLocalTopPlayers(100);
        local.push(entry);
        local.sort((a, b) => b.score - a.score);
        localStorage.setItem(
            this.LOCAL_STORAGE_KEY,
            JSON.stringify(local.slice(0, 100))
        );
    }

    public getLocalTopPlayers(limit: number): LeaderboardEntry[] {
        try {
            const raw = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            return raw ? JSON.parse(raw).slice(0, limit) : [];
        } catch (e) {
            return [];
        }
    }
}
