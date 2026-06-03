import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRequest, postRequest, deleteRequest } from "../client.js";
import { Inventory, PaginatedResponse } from "../types.js";

export function registerInventoryTools(server: McpServer) {
  // 1. List Inventories
  server.registerTool(
    "ansible_list_inventories",
    {
      title: "List Inventories",
      description: "Retrieve a list of all inventories configured on the Ansible Automation Platform controller.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        search: z.string().optional().describe("Search string to filter inventories by name or description")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<Inventory>>("/api/v2/inventories/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 2. Create Inventory
  server.registerTool(
    "ansible_create_inventory",
    {
      title: "Create Inventory",
      description: "Create a new inventory in the Ansible Automation Platform controller.",
      inputSchema: z.object({
        name: z.string().describe("Name of the inventory"),
        description: z.string().default("").describe("Optional description of the inventory"),
        organization: z.number().int().describe("Organization ID this inventory belongs to"),
        variables: z.string().default("").describe("Optional inventory variables in YAML/JSON format")
      }),
      annotations: { destructiveHint: false }
    },
    async (params) => {
      const data = await postRequest<Inventory>("/api/v2/inventories/", params);
      return {
        content: [{ type: "text", text: `Successfully created inventory: ${data.name} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );

  // 3. Get Inventory details
  server.registerTool(
    "ansible_get_inventory",
    {
      title: "Get Inventory Details",
      description: "Retrieve details of a specific inventory by its unique ID.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the inventory")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ id }) => {
      const data = await getRequest<Inventory>(`/api/v2/inventories/${id}/`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 4. Delete Inventory
  server.registerTool(
    "ansible_delete_inventory",
    {
      title: "Delete Inventory",
      description: "Remove/delete an inventory from the Ansible Automation Platform controller.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the inventory to delete")
      }),
      annotations: { destructiveHint: true }
    },
    async ({ id }) => {
      await deleteRequest(`/api/v2/inventories/${id}/`);
      return {
        content: [{ type: "text", text: `Successfully deleted inventory ID: ${id}` }]
      };
    }
  );
}
