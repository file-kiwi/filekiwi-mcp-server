# filekiwi-mcp-server

Model Context Protocol (MCP) server for simple and instant file sharing.  
**Input**: file path → **Output**: download link

## Features

- `upload_to_kiwi` tool: file.kiwi에 파일을 업로드하고 공유 URL을 반환합니다.
- Playwright 기반 headless Chrome으로 자동 업로드

## Setup

```bash
npm install
npx playwright install chromium
```

## Usage

### Claude Desktop / MCP Client 설정

`claude_desktop_config.json`에 추가:

```json
{
  "mcpServers": {
    "filekiwi": {
      "command": "node",
      "args": ["/absolute/path/to/index.js"]
    }
  }
}
```

### npx로 사용 (npm 배포 후)

```json
{
  "mcpServers": {
    "filekiwi": {
      "command": "npx",
      "args": ["-y", "filekiwi-mcp-server"]
    }
  }
}
```
