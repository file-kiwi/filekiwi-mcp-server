#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { chromium } from "playwright";

const server = new McpServer({
  name: "filekiwi-mcp-server",
  version: "1.0.0",
});

server.tool(
  "upload_to_kiwi",
  "Upload files to file.kiwi and return the share URL. IMPORTANT: Only real file system paths work (e.g. C:\\Users\\username\\Desktop\\file.png). Paths like /mnt/user-data/uploads/ or /home/claude/ are virtual and will fail. Ask the user for the actual local file path on their computer.The download link is provided immediately, even before the upload is complete. So, do not tell the user that the upload is complete when providing the link.",
  { filePaths: z.array(z.string()).describe("Absolute local file system paths on the user's computer (e.g. C:\\Users\\username\\file.png). Do NOT use virtual paths like /mnt/user-data/uploads/ — ask the user for the real path.") },
  async ({ filePaths }) => {
    const browser = await chromium.launch({channel: 'chrome', headless: false});
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto("https://file.kiwi/#cli", { waitUntil: "networkidle" });

      // Wait for SvelteKit hydration, then inject file into hidden input
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.waitFor({ state: 'attached', timeout: 15000 });
      await fileInput.setInputFiles(filePaths);

      // Return share link immediately once it appears
      const shareLinkEl = await page.waitForSelector('#share_link', { timeout: 60000 });
      const shareLink = await shareLinkEl.textContent();

      // Continue watching in background: navigate to share link when upload completes
      page.waitForSelector('text=Upload Complete', { timeout: 120000 })
        .then(() => page.goto(shareLink.trim()))
        .catch(() => {});

      return {
        content: [{ type: "text", text: `Share link ready: ${shareLink.trim()}` }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${error.message}` }],
      };
    } finally {
      // Browser stays open, navigated to share link
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
