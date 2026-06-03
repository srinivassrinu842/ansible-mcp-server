# Ansible MCP Server

A production-grade Model Context Protocol (MCP) server that connects to Red Hat Ansible Automation Platform (AAP) or AWX controller instances. This server allows AI clients (like Claude Desktop, Cursor, Continue, etc.) to securely manage resources, orchestrate infrastructure, and launch automation workflows using natural language.

## Key Features & Tool Coverage

This server implements comprehensive API endpoints supporting the following scopes:
- **Projects**: List, create, get details, update, delete, and sync SCM projects.
- **Inventories**: List, create, retrieve, and delete inventories.
- **Job Templates**: List, create, retrieve, update, delete, and launch templates (with extra variables, limits, etc.).
- **Hosts & Groups**: List, create, group assignments, and configure systems.
- **Credentials**: List and create credentials, plus list and create custom credential types.
- **User & Team Administration**: List, create, update, and delete users and teams, manage team memberships.
- **Jobs & Status Tracking**: List run history, query job status, retrieve standard stdout console output/events, and relaunch jobs.
- **System Settings & Configuration**: Retrieve platform status (ping), view execution environments, review audit logs via activity streams, and fetch/modify global controller settings.

---

## Configuration & Environment Variables

The server communicates with the Ansible controller API and requires the following environment variables to run:

| Variable | Description | Example |
|---|---|---|
| `AAP_BASE_URL` | **Required**. Base URL of the controller instance. | `https://aap.example.com` |
| `AAP_API_PREFIX` | Optional API prefix path. Defaults to `/api/controller/v2`. | `/api/v2` or `/api/controller/v2` |
| `AAP_TOKEN` | Bearer token for authentication. | `s0m3S3cr3tT0k3n...` |
| `AAP_USERNAME` | Username (used if `AAP_TOKEN` is not provided). | `admin` |
| `AAP_PASSWORD` | Password (used if `AAP_TOKEN` is not provided). | `password123` |
| `AAP_INSECURE` | Set to `true` to ignore self-signed SSL certificate errors. | `true` |

---

## Running with Docker or Podman

You can run the server in a containerized environment. Standard Input/Output (`stdio`) is used for communication.

### 1. Build the Image
```bash
docker build -t ansible-mcp-server .
# Or using Podman:
podman build -t ansible-mcp-server .
```

### 2. Run the Container
Pass the required environment variables:
```bash
docker run -i --rm \
  -e AAP_BASE_URL="https://your-controller-url" \
  -e AAP_TOKEN="your-token" \
  -e AAP_INSECURE="true" \
  ansible-mcp-server
```

---

## Client Integration Configurations

Below are setup examples for configuring the server in various MCP clients.

### Claude Desktop
Add this config block to your Claude Desktop configuration file:
* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### Using Node directly:
```json
{
  "mcpServers": {
    "ansible": {
      "command": "node",
      "args": ["/absolute/path/to/ansible-mcp/dist/index.js"],
      "env": {
        "AAP_BASE_URL": "https://aap.example.com",
        "AAP_TOKEN": "your-token-here",
        "AAP_INSECURE": "true"
      }
    }
  }
}
```

#### Using Docker:
```json
{
  "mcpServers": {
    "ansible-docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "AAP_BASE_URL=https://aap.example.com",
        "-e", "AAP_TOKEN=your-token-here",
        "-e", "AAP_INSECURE=true",
        "ansible-mcp-server:latest"
      ]
    }
  }
}
```

### Cursor
1. Go to **Settings** > **Features** > **MCP**.
2. Click **+ Add New MCP Server**.
3. Fill in the fields:
   - **Name**: `ansible`
   - **Type**: `command`
   - **Command**:
     ```bash
     env AAP_BASE_URL="https://aap.example.com" AAP_TOKEN="your-token" AAP_INSECURE="true" node /absolute/path/to/ansible-mcp/dist/index.js
     ```

### Continue
Add this to your `.continue/config.json` under `contextProviders`:
```json
{
  "mcp": {
    "ansible": {
      "command": "node",
      "args": ["/absolute/path/to/ansible-mcp/dist/index.js"],
      "env": {
        "AAP_BASE_URL": "https://aap.example.com",
        "AAP_TOKEN": "your-token",
        "AAP_INSECURE": "true"
      }
    }
  }
}
```

---

## Local Development & Compilation

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Build TypeScript**:
   ```bash
   npm run build
   ```
3. **Run in Watch/Development Mode**:
   ```bash
   npm run dev
   ```
4. **Inspect & Test with MCP Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```
