import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRequest, postRequest, putRequest, deleteRequest } from "../client.js";
import { User, Team, PaginatedResponse } from "../types.js";

export function registerUserTools(server: McpServer) {
  // 1. List Users
  server.registerTool(
    "ansible_list_users",
    {
      title: "List Users",
      description: "Retrieve a list of platform users configured on the Ansible Automation Platform controller.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        search: z.string().optional().describe("Search string to filter users by username or email")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<User>>("/api/v2/users/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 2. Create User
  server.registerTool(
    "ansible_create_user",
    {
      title: "Create User",
      description: "Create a new user account in the Ansible Automation Platform controller.",
      inputSchema: z.object({
        username: z.string().describe("Unique username for the account"),
        password: z.string().describe("Initial password for the user"),
        email: z.string().email().describe("Primary email address"),
        first_name: z.string().default("").describe("Optional first name"),
        last_name: z.string().default("").describe("Optional last name"),
        is_superuser: z.boolean().default(false).describe("Grant system administrator permissions"),
        is_system_auditor: z.boolean().default(false).describe("Grant system auditor permissions")
      }),
      annotations: { destructiveHint: false }
    },
    async (params) => {
      const data = await postRequest<User>("/api/v2/users/", params);
      return {
        content: [{ type: "text", text: `Successfully created user: ${data.username} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );

  // 3. Update User
  server.registerTool(
    "ansible_update_user",
    {
      title: "Update User",
      description: "Update the configuration details of an existing user.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the user to update"),
        email: z.string().email().optional().describe("Updated email"),
        first_name: z.string().optional().describe("Updated first name"),
        last_name: z.string().optional().describe("Updated last name"),
        is_superuser: z.boolean().optional().describe("Set superuser status"),
        is_system_auditor: z.boolean().optional().describe("Set system auditor status")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ id, ...updateParams }) => {
      const data = await putRequest<User>(`/api/v2/users/${id}/`, updateParams);
      return {
        content: [{ type: "text", text: `Successfully updated user: ${data.username} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );

  // 4. Delete User
  server.registerTool(
    "ansible_delete_user",
    {
      title: "Delete User",
      description: "Remove/delete a user account from the Ansible Automation Platform controller.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the user to delete")
      }),
      annotations: { destructiveHint: true }
    },
    async ({ id }) => {
      await deleteRequest(`/api/v2/users/${id}/`);
      return {
        content: [{ type: "text", text: `Successfully deleted user ID: ${id}` }]
      };
    }
  );

  // 5. List Teams
  server.registerTool(
    "ansible_list_teams",
    {
      title: "List Teams",
      description: "Retrieve a list of teams configured in the organization directory.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        search: z.string().optional().describe("Search string to filter teams by name")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<Team>>("/api/v2/teams/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 6. Create Team
  server.registerTool(
    "ansible_create_team",
    {
      title: "Create Team",
      description: "Create a new team inside an organization.",
      inputSchema: z.object({
        name: z.string().describe("Name of the team"),
        description: z.string().default("").describe("Optional description of the team"),
        organization: z.number().int().describe("Organization ID this team belongs to")
      }),
      annotations: { destructiveHint: false }
    },
    async (params) => {
      const data = await postRequest<Team>("/api/v2/teams/", params);
      return {
        content: [{ type: "text", text: `Successfully created team: ${data.name} (ID: ${data.id}) in Organization: ${data.organization}` }],
        structuredContent: data
      };
    }
  );

  // 7. Update Team
  server.registerTool(
    "ansible_update_team",
    {
      title: "Update Team",
      description: "Update the configuration details of an existing team.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the team to update"),
        name: z.string().optional().describe("Updated name"),
        description: z.string().optional().describe("Updated description")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ id, ...updateParams }) => {
      const data = await putRequest<Team>(`/api/v2/teams/${id}/`, updateParams);
      return {
        content: [{ type: "text", text: `Successfully updated team: ${data.name} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );

  // 8. Delete Team
  server.registerTool(
    "ansible_delete_team",
    {
      title: "Delete Team",
      description: "Remove/delete a team from the Ansible Automation Platform controller.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the team to delete")
      }),
      annotations: { destructiveHint: true }
    },
    async ({ id }) => {
      await deleteRequest(`/api/v2/teams/${id}/`);
      return {
        content: [{ type: "text", text: `Successfully deleted team ID: ${id}` }]
      };
    }
  );

  // 9. Add User to Team
  server.registerTool(
    "ansible_add_user_to_team",
    {
      title: "Add User to Team",
      description: "Associate/join a user account with a team.",
      inputSchema: z.object({
        team_id: z.number().int().describe("The ID of the team"),
        user_id: z.number().int().describe("The ID of the user to add")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ team_id, user_id }) => {
      const data = await postRequest<any>(`/api/v2/teams/${team_id}/users/`, { id: user_id });
      return {
        content: [{ type: "text", text: `Successfully added User ID: ${user_id} to Team ID: ${team_id}` }],
        structuredContent: data
      };
    }
  );
}
