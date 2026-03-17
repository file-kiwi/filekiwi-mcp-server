---
name: filekiwi
description: Upload local files to file.kiwi and get an instant shareable download link
---

When the user wants to upload a file and get a download link, run:

```bash
npx -y @file-kiwi/filekiwi-mcp-server <absolute-file-path>
```

The command will open a browser window, upload the file, and print the share URL to stdout.
Return that URL to the user.

Important:
- Use the absolute file path on the user's machine
- The link is available immediately — the upload may still be in progress in the background
- Do NOT tell the user the upload is complete when sharing the link
- Do NOT close the browser window until the user confirms the download is ready
