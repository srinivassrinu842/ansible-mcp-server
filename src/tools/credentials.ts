import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getRequest, postRequest, deleteRequest } from "../client.js";
import { Credential, CredentialType, PaginatedResponse } from "../types.js";

export function registerCredentialTools(server: McpServer) {
  // 1. List Credentials
  server.registerTool(
    "ansible_list_credentials",
    {
      title: "List Credentials",
      description: "Retrieve a list of credentials configured on the Ansible Automation Platform controller.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        search: z.string().optional().describe("Search string to filter credentials by name")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<Credential>>("/api/v2/credentials/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 2. Create Credential
  server.registerTool(
    "ansible_create_credential",
    {
      title: "Create Credential",
      description: "Create a new credential to be used in jobs/templates.",
      inputSchema: z.object({
        name: z.string().describe("Name of the credential"),
        description: z.string().default("").describe("Optional description"),
        credential_type: z.number().int().describe("The ID of the credential type (e.g. 1 for Machine, 2 for Source Control, etc.)"),
        organization: z.number().int().describe("Organization ID this credential belongs to"),
        inputs: z.record(z.any()).default({}).describe("Credential inputs (e.g. username, password, ssh key) specific to the credential type schema")
      }),
      annotations: { destructiveHint: false }
    },
    async (params) => {
      const data = await postRequest<Credential>("/api/v2/credentials/", params);
      return {
        content: [{ type: "text", text: `Successfully created credential: ${data.name} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );

  // 3. Delete Credential
  server.registerTool(
    "ansible_delete_credential",
    {
      title: "Delete Credential",
      description: "Remove/delete a credential from the Ansible Automation Platform controller.",
      inputSchema: z.object({
        id: z.number().int().describe("The unique ID of the credential to delete")
      }),
      annotations: { destructiveHint: true }
    },
    async ({ id }) => {
      await deleteRequest(`/api/v2/credentials/${id}/`);
      return {
        content: [{ type: "text", text: `Successfully deleted credential ID: ${id}` }]
      };
    }
  );

  // 4. List Credential Types
  server.registerTool(
    "ansible_list_credential_types",
    {
      title: "List Credential Types",
      description: "Retrieve a list of available credential types.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1).describe("Page number for pagination"),
        page_size: z.number().int().min(1).max(100).default(20).describe("Number of items per page"),
        search: z.string().optional().describe("Search string to filter credential types by name")
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ page, page_size, search }) => {
      const params: Record<string, any> = { page, page_size };
      if (search) params.search = search;

      const data = await getRequest<PaginatedResponse<CredentialType>>("/api/v2/credential_types/", params);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data
      };
    }
  );

  // 5. Create Custom Credential Type
  server.registerTool(
    "ansible_create_credential_type",
    {
      title: "Create Credential Type",
      description: "Create a custom credential type by specifying schemas for input fields and injector rules.",
      inputSchema: z.object({
        name: z.string().describe("Name of the custom credential type"),
        description: z.string().default("").describe("Optional description"),
        inputs: z.record(z.any()).describe("JSON schema outlining credential fields (username, private key, token, etc.)"),
        injectors: z.record(z.any()).describe("Environment or file injectors configuring how the fields are mapped to Ansible runs")
      }),
      annotations: { destructiveHint: false }
    },
    async (params) => {
      const data = await postRequest<CredentialType>("/api/v2/credential_types/", { ...params, kind: "custom" });
      return {
        content: [{ type: "text", text: `Successfully created custom credential type: ${data.name} (ID: ${data.id})` }],
        structuredContent: data
      };
    }
  );
}
