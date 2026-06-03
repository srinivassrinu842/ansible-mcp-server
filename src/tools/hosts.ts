import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRequest, postRequest } from "../client.js";
import { Host, Group, PaginatedResponse } from "../types.js";

export function registerHostTools(server: McpServer) {
  // 1. List Hosts
  server.registerTool(
    "ansible_list_hosts",
    {
      title: "List Hosts",
      description: "Retrieve a list of all hosts configured on the Ansible Automation Platform controller.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        inventory: z.number().int().optional().describe("Filter hosts by specific inventory ID"),
        search: z.string().optional().describe("Search string to filter hosts by name")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, inventory, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (inventory) params.inventory = inventory;
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<Host>>("/api/v2/hosts/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 2. Create Host
  server.registerTool(
    "ansible_create_host",
    {
      title: "Create Host",
      description: "Add a new host to a specific inventory.",
      inputSchema: z.object({
        name: z.string().describe("Hostname or IP address of the target machine"),
        description: z.string().default("").describe("Optional description of the host"),
        inventory: z.number().int().describe("The ID of the inventory to associate the host with"),
        variables: z.string().default("").describe("Host-specific variables in YAML or JSON format"),
        enabled: z.boolean().default(true).describe("Set the host status as enabled/active")
      }),
      annotations: { destructiveHint: false }
    },
    async (params) => {
      const data = await postRequest<Host>("/api/v2/hosts/", params);
      return {
        content: [{ type: "text", text: `Successfully created host: ${data.name} (ID: ${data.id}) in Inventory ID: ${data.inventory}` }],
        structuredContent: data
      };
    }
  );

  // 3. List Groups
  server.registerTool(
    "ansible_list_groups",
    {
      title: "List Groups",
      description: "Retrieve a list of all host groups configured on the Ansible Automation Platform controller.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        inventory: z.number().int().optional().describe("Filter groups by specific inventory ID"),
        search: z.string().optional().describe("Search string to filter groups by name")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, inventory, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (inventory) params.inventory = inventory;
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<Group>>("/api/v2/groups/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 4. Create Group
  server.registerTool(
    "ansible_create_group",
    {
      title: "Create Group",
      description: "Create a new host group inside an inventory.",
      inputSchema: z.object({
        name: z.string().describe("Name of the host group"),
        description: z.string().default("").describe("Optional description of the group"),
        inventory: z.number().int().describe("The ID of the inventory to create the group in"),
        variables: z.string().default("").describe("Group-specific variables in YAML or JSON format")
      }),
      annotations: { destructiveHint: false }
    },
    async (params) => {
      const data = await postRequest<Group>("/api/v2/groups/", params);
      return {
        content: [{ type: "text", text: `Successfully created group: ${data.name} (ID: ${data.id}) in Inventory ID: ${data.inventory}` }],
        structuredContent: data
      };
    }
  );

  // 5. Add Host to Group
  server.registerTool(
    "ansible_add_host_to_group",
    {
      title: "Add Host to Group",
      description: "Associate a host to a host group inside an inventory.",
      inputSchema: z.object({
        group_id: z.number().int().describe("The ID of the host group"),
        host_id: z.number().int().describe("The ID of the host to add")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ group_id, host_id }) => {
      const data = await postRequest<any>(`/api/v2/groups/${group_id}/hosts/`, { id: host_id });
      return {
        content: [{ type: "text", text: `Successfully added Host ID: ${host_id} to Group ID: ${group_id}` }],
        structuredContent: data
      };
    }
  );
}
