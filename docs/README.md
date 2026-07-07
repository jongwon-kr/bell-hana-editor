# 문서 / 백업

## Cursor 대화 기록

| 파일 | 설명 |
| --- | --- |
| `cursor-chat-refactor-2026-07-07.jsonl` | 기상 특화 편집기 → React + Fabric 7 범용 캔버스 편집기 리팩토링 작업 시 Cursor Agent 대화 원본 (JSONL) |

JSONL은 한 줄에 JSON 이벤트 하나씩 들어 있는 형식입니다. Cursor에서 내보낸 채팅 로그와 동일한 구조입니다.

### 다시 읽는 방법

- **Cursor**: 같은 워크스pace의 agent-transcripts와 동일 형식
- **텍스트 에디터**: 줄 단위 JSON — `type`, `message` 등 필드 확인
- **요약**: 프로젝트 루트 `README.md`에 스택·구조·기능 요약 참고
