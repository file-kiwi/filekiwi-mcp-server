# filekiwi-mcp-server

Model Context Protocol (MCP) server for simple and instant file sharing.  
**Input**: file path → **Output**: download link

## Features

- `upload_to_kiwi` tool: Uploads files to [file.kiwi](https://file.kiwi) and returns a shareable URL.
- Automated upload via headless Chrome powered by Playwright.
- No file size limit
- Download link available immediately after file input (downloads proceed even while upload is still in progress)
- Free download period with automatic file deletion [details](https://file.kiwi/price)


## Setup

```json
{
  "mcpServers": {
    "filekiwi": {
      "command": "npx",
      "args": ["-y", "@file-kiwi/filekiwi-mcp-server"]
    }
  }
}
```

## Usage

Once the MCP server is connected, you can ask the AI assistant to share files:

- "Share this file: C:\Users\me\report.pdf"
- "Upload /home/user/photo.png to file.kiwi"
- "Generate a download link for ./presentation.pptx"

The tool will upload the file and return a shareable link like `https://file.kiwi/abcdef12#hashashahshashhashhash`.


