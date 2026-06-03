import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRequest, postRequest } from "../client.js";
import { Job, JobEvent, PaginatedResponse } from "../types.js";

export function registerJobTools(server: McpServer) {
  // 1. List Jobs
  server.registerTool(
    "ansible_list_jobs",
    {
      title: "List Jobs",
      description: "Retrieve job execution history and status.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        status: z.enum(["new", "pending", "waiting", "running", "successful", "failed", "error", "canceled"]).optional().describe("Filter jobs by execution status")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, status }) => {
      const params: Record<string, any> = { page, page_size };
      if (status) params.status = status;

      const data = await getRequest<PaginatedResponse<Job>>("/api/v2/jobs/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 2. Get Job Status
  server.registerTool(
    "ansible_get_job_status",
    {
      title: "Get Job Status",
      description: "Retrieve real-time execution status and parameters of a specific job run.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the job execution")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ id }) => {
      const data = await getRequest<Job>(`/api/v2/jobs/${id}/`);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 3. Get Job Events / Console stdout Logs
  server.registerTool(
    "ansible_get_job_events",
    {
      title: "Get Job Events (Stdout)",
      description: "Retrieve standard terminal stdout output logs and execution events of a specific job run.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the job execution"),
        page: z.number().int().min(1).default(1).describe("Page number for stdout logs pagination"),
        page_size: z.number().int().min(1).max(100).default(50).describe("Number of stdout lines/events per page")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ id, page, page_size }) => {
      const params = { page, page_size, order_by: "start_line" };
      const data = await getRequest<PaginatedResponse<JobEvent>>(`/api/v2/jobs/${id}/job_events/`, params);
      
      // Map stdout line entries into a readable terminal-like text structure
      const stdoutLogs = data.results
        .filter(event => event.stdout)
        .map(event => event.stdout)
        .join("");

      return {
        content: [
          { 
            type: "text", 
            text: stdoutLogs || "No stdout logs captured yet for this job." 
          }
        ],
        structuredContent: data
      };
    }
  );

  // 4. Relaunch Job
  server.registerTool(
    "ansible_relaunch_job",
    {
      title: "Relaunch Job",
      description: "Relaunch/restart a previously executed job.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the job run to relaunch")
      }),
      annotations: { destructiveHint: false }
    },
    async ({ id }) => {
      const data = await postRequest<Job>(`/api/v2/jobs/${id}/relaunch/`);
      return {
        content: [{ type: "text", text: `Successfully triggered job relaunch. New Job ID: ${data.id}. Status: ${data.status}` }],
        structuredContent: data
      };
    }
  );
}
