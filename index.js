#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { chromium } from "playwright";

const server = new Server({
  name: "filekiwi-mcp-server",
  version: "1.0.0",
}, {
  capabilities: { tools: {} },
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "upload_to_kiwi",
    description: "사용자가 파일 링크 생성이나 공유를 요청할 때 실행합니다. file.kiwi에 파일을 업로드하고 공유 URL을 반환합니다.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "업로드할 파일의 절대 경로" },
      },
      required: ["filePath"],
    },
  }],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "upload_to_kiwi") throw new Error("Unknown tool");

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://file.kiwi/");

    // 파일 업로드 (input 태그에 경로 주입)
    await page.setInputFiles('input[type="file"]', request.params.arguments.filePath);

    // 업로드 완료 대기 (URL에 고유 해시 코드가 생길 때까지 대기)
    await page.waitForURL(url => url.hash.length > 5, { timeout: 60000 });

    return {
      content: [{ type: "text", text: `성공! 파일 링크: ${page.url()}` }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `오류 발생: ${error.message}` }],
    };
  } finally {
    await browser.close();
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
