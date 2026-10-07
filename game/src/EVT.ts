/**
 * 커스텀 이벤트 기반으로 사용하는 이벤트 리스너명
 * Author: 김태신
 * Date: 2024-08-23
 */
export default {
    // 마우스 인터렉션용
    UP: 'up',
    DOWN: 'down',
    CLICK: 'click',
    MOVE: 'move',
    DRAG_START: 'drag_start',
    DRAG_MOVE: 'drag_move',
    DRAG_END: 'drag_end',
    // 공용 이벤트
    COMPLETE: 'complete',
    LOADED: 'loaded',
    // 애니 이벤트
    ANI_START: 'ani_start',
    ANI_END: 'ani_end',
    ANI_COMPLETE: 'ani_complete',
    ANI_EVENT: 'ani_event',
    // 사운드
    SOUND_COMPLETE: 'snd_complete',
    // 비디오
    VIDEO_COMPLETE: 'video_complete',

    // 애니메이트CC용
    VALID_MOVE: 'valid_move',
    SEND: 'send',
};
