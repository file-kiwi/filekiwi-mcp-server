# filekiwi-mcp-server

Model Context Protocol (MCP) server for simple and instant file sharing.  
**Input**: file name → **Output**: download link in **Seconds** even for **large file**

## Features

- `upload_to_kiwi` tool: Uploads files to [file.kiwi](https://file.kiwi) and returns a shareable URL.
- Automated upload via headless Chrome powered by Playwright.
- No file size limit
- Download link available immediately after file input (downloads proceed even while upload is still in progress)
- Free download period with automatic file deletion [details](https://file.kiwi/price)

## Usage

Once the MCP server is connected, you can ask the AI assistant to share files:

- "Share this file: C:\Users\me\report.pdf"
- "Upload /home/user/photo.png to file.kiwi"
- "Generate a download link for ./presentation.pptx"

The tool will upload the file and return a shareable link like `https://file.kiwi/abcdef12#hashashahshashhashhash`.


## Setup

### Test before use

```bash
npx -y @file-kiwi/filekiwi-mcp-server "C:\User\your_file.ext"
```

### Claude Code (CLI)

```bash
claude mcp add filekiwi -- npx -y @file-kiwi/filekiwi-mcp-server
```

### Claude Desktop / Other MCP Clients

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

### File Access

Some environments (e.g. Claude Desktop) restrict local file system access by default. In that case, the AI may not be able to read file paths on your machine. To enable it, add the [filesystem MCP server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem):

```json
{
  "mcpServers": {
    "filekiwi": {
      "command": "npx",
      "args": ["-y", "@file-kiwi/filekiwi-mcp-server"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/Users/username"]
    }
  }
}
```

### FAQ

#### Why not headless mode?
If the upload fails, this is to allow the user to retry directly in the browser. file.kiwi supports resumable uploads.

#### NO AUTHENTICATION or API KEY required?
No. Not at all. 

#### File deletion
Files are automatically deleted in 90 hours after upload.

#### Is it free?
Yes, it is free for any size of files. But, There is free download period for each file. [details](https://file.kiwi/price)
