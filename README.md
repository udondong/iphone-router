# 나라가족 5G Mobile Wi-Fi

iPhone 12를 핫스팟 전용기기로 쓸 때 필요한 Wi-Fi 접속 QR과 운영 체크를 보여주는 홈 화면 웹앱입니다.

## 바로 열기

GitHub Pages 주소:

```text
https://udondong.github.io/iphone-router/
```

iPhone 12 Safari에서 위 주소 접속 → 공유 버튼 → **홈 화면에 추가**.

## 개인정보 저장 방식

- GitHub에는 앱 껍데기만 올라갑니다.
- 실제 Wi-Fi 이름과 비밀번호는 GitHub에 넣지 않습니다.
- 사용자가 iPhone에서 입력한 값은 그 iPhone Safari의 `localStorage`에만 저장됩니다.

## 구성

- `index.html` — `나라가족_라우터.html`로 이동하는 진입점
- `나라가족_라우터.html` — 웹앱 본체
- `manifest.webmanifest` — 홈 화면 웹앱 메타데이터
- `sw.js` — 오프라인 재실행용 캐시 서비스워커

## 업데이트

같은 GitHub Pages 주소를 유지한 채 파일만 갱신하면, iPhone에 저장된 Wi-Fi 이름/비밀번호는 유지됩니다.
