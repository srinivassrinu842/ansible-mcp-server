import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRequest, postRequest, putRequest, deleteRequest } from "../client.js";
import { Project, PaginatedResponse } from "../types.js";

export function registerProjectTools(server: McpServer) {
  // 1. List Projects
  server.registerTool(
    "ansible_list_projects",
    {
      title: "List Projects",
      description: "Retrieve a list of all SCM projects configured on the Ansible Automation Platform controller.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        search: z.string().optional().describe("Search string to filter projects by name or description")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<Project>>("/api/v2/projects/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 2. Create Project
  server.registerTool(
    "ansible_create_project",
    {
      title: "Create Project",
      description: "Create a new SCM project in the Ansible Automation Platform controller.",
      inputSchema: z.object({
        name: z.string().describe("Name of the project"),
        description: z.string().default("").describe("Optional description of the project"),
        scm_type: z.enum(["git", "svn", "archive", "insights"]).describe("Type of SCM (e.g. 'git')"),
        scm_url: z.string().describe("The URL of the SCM repository"),
        scm_branch: z.string().default("").describe("Optional SCM branch, tag, or commit to checkout"),
        organization: z.number().int().describe("Organization ID this project belongs to"),
        scm_clean: z.boolean().default(false).describe("Discard local changes before syncing"),
        scm_delete_on_update: z.boolean().default(false).describe("Delete local repository path before syncing"),
        scm_update_on_launch: z.boolean().default(false).describe("Update repository on job launch")
      }),
      annotations: { destructiveHint: false }
    },
    async (params) => {
      const payload: Record<string, any> = { ...params };
      if (!payload.scm_branch) delete payload.scm_branch;

      const data = await postRequest<Project>("/api/v2/projects/", payload);
      return {
        content: [{ type: "text", text: `Successfully created project: ${data.name} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );

  // 3. Get Project details
  server.registerTool(
    "ansible_get_project",
    {
      title: "Get Project Details",
      description: "Retrieve details of a specific project by its unique ID.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the project")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ id }) => {
      const data = await getRequest<Project>(`/api/v2/projects/${id}/`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 4. Update Project
  server.registerTool(
    "ansible_update_project",
    {
      title: "Update Project",
      description: "Update the configuration details of an existing project.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the project to update"),
        name: z.string().optional().describe("Updated name of the project"),
        description: z.string().optional().describe("Updated description"),
        scm_type: z.enum(["git", "svn", "archive", "insights"]).optional().describe("Updated SCM type"),
        scm_url: z.string().optional().describe("Updated repository URL"),
        scm_branch: z.string().optional().describe("Updated SCM branch, tag or commit"),
        scm_clean: z.boolean().optional().describe("Discard local changes"),
        scm_delete_on_update: z.boolean().optional().describe("Delete local repository path on update"),
        scm_update_on_launch: z.boolean().optional().describe("Update repository on job launch")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ id, ...updateParams }) => {
      const data = await putRequest<Project>(`/api/v2/projects/${id}/`, updateParams);
      return {
        content: [{ type: "text", text: `Successfully updated project: ${data.name} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );

  // 5. Delete Project
  server.registerTool(
    "ansible_delete_project",
    {
      title: "Delete Project",
      description: "Remove/delete a project from the Ansible Automation Platform controller.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the project to delete")
      }),
      annotations: { destructiveHint: true }
    },
    async ({ id }) => {
      await deleteRequest(`/api/v2/projects/${id}/`);
      return {
        content: [{ type: "text", text: `Successfully deleted project ID: ${id}` }]
      };
    }
  );

  // 6. Sync Project SCM
  server.registerTool(
    "ansible_sync_project",
    {
      title: "Sync Project",
      description: "Trigger an SCM sync/update operation for a specific project.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the project to sync")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ id }) => {
      const data = await postRequest<any>(`/api/v2/projects/${id}/update/`);
      return {
        content: [{ type: "text", text: `Successfully triggered project sync. Job ID: ${data.project_update || data.id}` }],
        structuredContent: data
      };
    }
  );
}
