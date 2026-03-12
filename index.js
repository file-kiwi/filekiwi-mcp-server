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
  "Upload files to file.kiwi and return the share URL.",
  { filePaths: z.array(z.string()).describe("Absolute paths of files to upload (no folders)") },
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

      // Wait for share link to appear
      const shareLinkEl = await page.waitForSelector('#share_link', { timeout: 60000 });
      const shareLink = await shareLinkEl.textContent();

      // Wait for "Upload Complete" then navigate to the share link
      await page.waitForSelector('text=Upload Complete', { timeout: 120000 });
      await page.goto(shareLink.trim());

      return {
        content: [{ type: "text", text: `Success! Share link: ${shareLink.trim()}` }],
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
