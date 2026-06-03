import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRequest, patchRequest } from "../client.js";
import { PlatformPing, PaginatedResponse } from "../types.js";

export function registerPlatformTools(server: McpServer) {
  // 1. Get Platform Ping Status
  server.registerTool(
    "ansible_get_platform_status",
    {
      title: "Get Platform Status",
      description: "Query the Ansible Automation Platform ping status and component health checks.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true }
    },
    async () => {
      const data = await getRequest<PlatformPing>("/api/v2/ping/");
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 2. List Execution Environments
  server.registerTool(
    "ansible_list_execution_environments",
    {
      title: "List Execution Environments",
      description: "List the execution environments (EE containers) available on the controller for running automation.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        search: z.string().optional().describe("Search string to filter execution environments by name")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<any>>("/api/v2/execution_environments/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 3. List Activity Stream
  server.registerTool(
    "ansible_list_activity_stream",
    {
      title: "List Activity Stream",
      description: "Retrieve a paginated list of audit events and user activity configurations from the controller.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        search: z.string().optional().describe("Search string to filter logs"),
        operation: z.enum(["create", "update", "delete", "associate", "disassociate"]).optional().describe("Filter logs by operation type")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, search, operation }) => {
      const params: Record<string, any> = { page, page_size };
      if (search) params.search = search;
      if (operation) params.operation = operation;

      const data = await getRequest<PaginatedResponse<any>>("/api/v2/activity_stream/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 4. Get System Settings
  server.registerTool(
    "ansible_get_system_settings",
    {
      title: "Get System Settings",
      description: "Retrieve global system configuration settings for the Ansible controller.",
      inputSchema: z.object({
        category: z.enum(["all", "system", "jobs", "ui", "auth"]).default("all").describe("Specify the settings category to query")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ category }) => {
      const endpoint = category === "all" ? "/api/v2/settings/all/" : `/api/v2/settings/${category}/`;
      const data = await getRequest<Record<string, any>>(endpoint);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 5. Update System Settings
  server.registerTool(
    "ansible_update_system_settings",
    {
      title: "Update System Settings",
      description: "Modify one or more global configuration settings on the Ansible controller.",
      inputSchema: z.object({
        category: z.enum(["system", "jobs", "ui", "auth"]).describe("Specify the category of settings to modify"),
        settings: z.record(z.any()).describe("Key-value map of configuration changes to apply")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ category, settings }) => {
      const data = await patchRequest<Record<string, any>>(`/api/v2/settings/${category}/`, settings);
      return {
        content: [{ type: "text", text: `Successfully updated settings category '${category}'.\nResponse:\n${JSON.stringify(data, null, 2)}` }],
        structuredContent: data
      };
    }
  );
}
