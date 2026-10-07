import Phaser from 'phaser';
import html2canvas from 'html2canvas';
import { ZIndex } from '../Config';

export class Util {
    // 캡춰 관련 -------------------------------------
    // 캔버스와 돔 요소를 모두 하나의 이미지로 캡춰.
    public static captureAll($scene: Phaser.Scene): void {
        $scene.game.renderer.snapshot((image: HTMLImageElement) => {
            // 캔버스 WebGL 렌더링 영역을 이미지로 만들어서 contents 태그에 넣어준다.
            const imgElement = document.createElement('img');
            imgElement.src = image.src;
            imgElement.style.zIndex = `${ZIndex.CAPTURE}`;

            const contents = document.getElementById('contents');
            contents.append(imgElement);

            // 콘텐츠 태그를 html2cavnas 라이브러리를 사용해서 캡춰.
            html2canvas(contents, { width: 1280, height: 768 }).then(
                (canvas) => {
                    const img = canvas.toDataURL('image/png'); // base64 데이터 URI
                    const link = document.createElement('a');
                    link.href = img;
                    link.download = 'all-screenshot.png'; // 다운로드 파일 이름 설정
                    link.click(); // 이미지 다운로드

                    imgElement.remove();
                }
            );
        });
    }

    // 캔버스 WebGL 렌더링 영역을 캡춰 (Dom 요소는 캡춰 되지 않는다.)
    public static captureWebGl($scene: Phaser.Scene) {
        $scene.game.renderer.snapshot((image: HTMLImageElement) => {
            const link = document.createElement('a');
            link.href = image.src;
            link.download = 'phaser-screenshot.png';
            link.click();
        });
    }

    // 캔버스 WebGL 렌더링 일부 영역을 캡춰 (Dom 요소는 캡춰 되지 않는다.)
    public static captureWebGlArea(
        $scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        $scene.game.renderer.snapshotArea(
            x,
            y,
            width,
            height,
            (image: HTMLImageElement) => {
                const link = document.createElement('a');
                link.href = image.src;
                link.download = 'area-screenshot.png';
                link.click();
            }
        );
    }
}
