var external;
(function (p) {
  /*
    익스터널로 구동되는 웹뷰 페이지 명령들 입니다
    coypright (c) 2016- 2020 NOD.
    */
  if (location.href == parent.location.href) {
    p.interface = window.nod_android || {};
  } else {
    window.external = parent.window.external;
    // console.log("external set!", location.href);
  }

  external.createMoviePlayer = (x, y, width, heigth) => {};
})((external = external || {}));
