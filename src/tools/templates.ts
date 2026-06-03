import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRequest, postRequest, putRequest, deleteRequest } from "../client.js";
import { JobTemplate, PaginatedResponse, Job } from "../types.js";

export function registerTemplateTools(server: McpServer) {
  // 1. List Job Templates
  server.registerTool(
    "ansible_list_job_templates",
    {
      title: "List Job Templates",
      description: "Retrieve a list of all job templates configured on the Ansible Automation Platform controller.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        search: z.string().optional().describe("Search string to filter templates by name or description")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<JobTemplate>>("/api/v2/job_templates/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 2. Create Job Template
  server.registerTool(
    "ansible_create_job_template",
    {
      title: "Create Job Template",
      description: "Create a new job template linking to a project, inventory, and playbook.",
      inputSchema: z.object({
        name: z.string().describe("Name of the job template"),
        description: z.string().default("").describe("Optional description of the template"),
        job_type: z.enum(["run", "check"]).default("run").describe("Execution type ('run' for actual execution, 'check' for dry run)"),
        inventory: z.number().int().describe("The ID of the inventory to use"),
        project: z.number().int().describe("The ID of the project containing the playbook"),
        playbook: z.string().describe("Path to the playbook file inside the project (e.g. 'playbooks/deploy.yml')"),
        extra_vars: z.string().default("").describe("Extra variables in YAML or JSON format"),
        ask_variables_on_launch: z.boolean().default(false).describe("Prompt user for extra variables when launching"),
        ask_limit_on_launch: z.boolean().default(false).describe("Prompt user for limit parameter when launching")
      }),
      annotations: { destructiveHint: false }
    },
    async (params) => {
      const data = await postRequest<JobTemplate>("/api/v2/job_templates/", params);
      return {
        content: [{ type: "text", text: `Successfully created job template: ${data.name} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );

  // 3. Get Job Template details
  server.registerTool(
    "ansible_get_job_template",
    {
      title: "Get Job Template Details",
      description: "Retrieve details of a specific job template by its unique ID.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the job template")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ id }) => {
      const data = await getRequest<JobTemplate>(`/api/v2/job_templates/${id}/`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 4. Update Job Template
  server.registerTool(
    "ansible_update_job_template",
    {
      title: "Update Job Template",
      description: "Update the configuration details of an existing job template.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the job template to update"),
        name: z.string().optional().describe("Updated name"),
        description: z.string().optional().describe("Updated description"),
        job_type: z.enum(["run", "check"]).optional().describe("Execution type"),
        inventory: z.number().int().optional().describe("Updated inventory ID"),
        project: z.number().int().optional().describe("Updated project ID"),
        playbook: z.string().optional().describe("Updated playbook path"),
        extra_vars: z.string().optional().describe("Updated extra vars (YAML or JSON)"),
        ask_variables_on_launch: z.boolean().optional().describe("Prompt for extra variables"),
        ask_limit_on_launch: z.boolean().optional().describe("Prompt for limit")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ id, ...updateParams }) => {
      const data = await putRequest<JobTemplate>(`/api/v2/job_templates/${id}/`, updateParams);
      return {
        content: [{ type: "text", text: `Successfully updated job template: ${data.name} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );

  // 5. Delete Job Template
  server.registerTool(
    "ansible_delete_job_template",
    {
      title: "Delete Job Template",
      description: "Remove/delete a job template from the Ansible Automation Platform controller.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the job template to delete")
      }),
      annotations: { destructiveHint: true }
    },
    async ({ id }) => {
      await deleteRequest(`/api/v2/job_templates/${id}/`);
      return {
        content: [{ type: "text", text: `Successfully deleted job template ID: ${id}` }]
      };
    }
  );

  // 6. Launch Job Template
  server.registerTool(
    "ansible_launch_job_template",
    {
      title: "Launch Job Template",
      description: "Trigger/run a job template to execute playbooks on target systems.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the job template to launch"),
        extra_vars: z.record(z.any()).optional().describe("Optional key-value parameters/variables to pass directly to the job run"),
        limit: z.string().optional().describe("Optional host limit pattern (e.g. 'webservers,database')"),
        inventory: z.number().int().optional().describe("Optional inventory ID override if configured to ask on launch")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ id, extra_vars, limit, inventory }) => {
      const payload: Record<string, any> = {};
      if (extra_vars) payload.extra_vars = extra_vars;
      if (limit) payload.limit = limit;
      if (inventory) payload.inventory = inventory;

      const data = await postRequest<Job>(`/api/v2/job_templates/${id}/launch/`, payload);
      return {
        content: [{ type: "text", text: `Successfully launched Job ID: ${data.id}. Status: ${data.status}` }],
        structuredContent: data
      };
    }
  );
}
