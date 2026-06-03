#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool registration functions
import { registerProjectTools } from "./tools/projects.js";
import { registerInventoryTools } from "./tools/inventories.js";
import { registerTemplateTools } from "./tools/templates.js";
import { registerHostTools } from "./tools/hosts.js";
import { registerCredentialTools } from "./tools/credentials.js";
import { registerUserTools } from "./tools/users.js";
import { registerPlatformTools } from "./tools/platform.js";
import { registerJobTools } from "./tools/jobs.js";

// Initialize the MCP Server instance
const server = new McpServer({
  name: "ansible-mcp-server",
  version: "1.0.0",
});

// Register all modular tools
registerProjectTools(server);
registerInventoryTools(server);
registerTemplateTools(server);
registerHostTools(server);
registerCredentialTools(server);
registerUserTools(server);
registerPlatformTools(server);
registerJobTools(server);

// Start the server using standard input/output (stdio) transport
async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Ansible MCP server running via stdio");
}

startServer().catch((error) => {
  console.error("Fatal error starting Ansible MCP server:", error);
  process.exit(1);
});
