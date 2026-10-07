/**
 * BootLoader
 * Author: Kim tae shin
 */
import { BaseBootLoader } from 'src/core/BaseBootLoader';

declare const external: any;

export class BootLoader extends BaseBootLoader {
    constructor() {
        super({ key: 'BootLoader' });
    }
    //
    public onInit(): void {
        // 엔딩 파티클 종류
        this.game.gameState.endingParticleValue = 17;
    }

    // 사운드 로드
    public loadAudios(): void {
        this.loadAudio('bgm', `ogg`);
        this.loadAudio('hit1', `mp3`);
        this.loadAudio('hit2', `mp3`);
        this.loadAudio('hit3', `mp3`);
        this.loadAudio('clap', `mp3`);
        this.loadAudio('miss', `mp3`);
        this.loadAudio('count', `mp3`);
        // this.loadAudio('wrong');
    }

    // 스파인 로드
    public loadSpines(): void {}

    // 이미지 로드
    public loadImages(): void {
        const countryCodes = [
            'US',
            'KR',
            'JP',
            'CN',
            'GB',
            'FR',
            'DE',
            'IT',
            'ES',
            'BR',
            'CA',
            'AU',
            'RU',
            'IN',
            'MX',
            'AR',
            'NL',
            'SE',
            'NO',
            'DK',
            'FI',
            'PL',
            'TR',
            'SA',
            'AE',
            'TH',
            'VN',
            'ID',
            'PH',
            'SG',
            'MY',
            'TW',
            'HK',
            'NZ',
            'ZA',
            'EG',
            'NG',
            'KE',
            'CL',
            'CO',
            'PE',
            'VE',
            'UA',
            'RO',
            'GR',
            'PT',
            'CZ',
            'HU',
            'AT',
            'CH',
            'BE',
            'IE',
            'IL',
            'PK',
            'BD',
            'LK',
        ];
        countryCodes.forEach((code) => {
            // flagcdn 서비스를 이용해 40px 너비의 png를 가져옵니다.
            this.load.image(
                `flag_${code}`,
                `https://flagcdn.com/w40/${code.toLowerCase()}.png`,
            );
            this.load.image('flag_UNKNOWN', 'https://flagcdn.com/w40/un.png');
        });
    }

    // 비디오 로드 (인트로, 아웃트로는 사용 여부 상관 없이 loadVideos에서 처리하지 않는다.)
    public loadVideos(): void {}
}
