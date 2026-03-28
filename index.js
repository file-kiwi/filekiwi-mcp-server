#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createWebFolder, startUpload } from "@file-kiwi/node";

const server = new McpServer({
  name: "filekiwi-mcp-server",
  version: "2.0.0",
});

server.registerTool(
  "upload_to_kiwi",
  "Upload files to file.kiwi and return the share URL. IMPORTANT: Only real file system paths work (e.g. C:\\Users\\username\\Desktop\\file.png). Paths like /mnt/user-data/uploads/ or /home/claude/ are virtual and will fail. Ask the user for the actual local file path on their computer.",
  { filePaths: z.array(z.string()).describe("Absolute local file system paths on the user's computer (e.g. C:\\Users\\username\\file.png). Do NOT use virtual paths like /mnt/user-data/uploads/ — ask the user for the real path.") },
  async ({ filePaths }) => {
    try {
      const webfolder = await createWebFolder({
        files: filePaths.map((fp) => ({ filepath: fp })),
      });

      // Start upload in background
      startUpload(webfolder).catch((err) => {
        console.error(`Upload error: ${err.message}`);
      });

      return {
        content: [{ type: "text", text: `Share link: ${webfolder.webfolderUrl}\n\nUpload is in progress. The link works immediately — recipients can download files as chunks complete.` }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${error.message}` }],
      };
    }
  }
);

// CLI mode: node index.js <file1> [file2] ...
const args = process.argv.slice(2);
if (args.length > 0) {
  try {
    const webfolder = await createWebFolder({
      files: args.map((fp) => ({ filepath: fp })),
    });

    console.log(`Share link: ${webfolder.webfolderUrl}`);
    console.log(`Uploading ${webfolder.files.length} file(s)...`);

    await startUpload(webfolder, {
      onFileComplete: (file) => {
        console.log(`  ✓ ${file.fid} complete`);
      },
    });

    console.log("Upload complete.");
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
