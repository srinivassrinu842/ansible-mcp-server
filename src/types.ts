export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  [key: string]: any;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  scm_type: string;
  scm_url: string;
  scm_branch: string;
  organization: number;
  created: string;
  modified: string;
  [key: string]: any;
}

export interface Inventory {
  id: number;
  name: string;
  description: string;
  organization: number;
  kind: string;
  host_filter: string | null;
  variables: string;
  created: string;
  modified: string;
  [key: string]: any;
}

export interface JobTemplate {
  id: number;
  name: string;
  description: string;
  job_type: string;
  inventory: number;
  project: number;
  playbook: string;
  ask_variables_on_launch: boolean;
  ask_limit_on_launch: boolean;
  extra_vars: string;
  created: string;
  modified: string;
  [key: string]: any;
}

export interface Host {
  id: number;
  name: string;
  description: string;
  inventory: number;
  enabled: boolean;
  variables: string;
  created: string;
  modified: string;
  [key: string]: any;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  inventory: number;
  variables: string;
  created: string;
  modified: string;
  [key: string]: any;
}

export interface Credential {
  id: number;
  name: string;
  description: string;
  credential_type: number;
  organization: number;
  created: string;
  modified: string;
  [key: string]: any;
}

export interface CredentialType {
  id: number;
  name: string;
  description: string;
  kind: string;
  inputs: Record<string, any>;
  injectors: Record<string, any>;
  [key: string]: any;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_superuser: boolean;
  is_system_auditor: boolean;
  [key: string]: any;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  organization: number;
  [key: string]: any;
}

export interface Job {
  id: number;
  name: string;
  status: string;
  failed: boolean;
  started: string | null;
  finished: string | null;
  job_template: number | null;
  project: number | null;
  inventory: number | null;
  extra_vars: string;
  [key: string]: any;
}

export interface JobEvent {
  id: number;
  event: string;
  created: string;
  stdout: string;
  start_line: number;
  end_line: number;
  [key: string]: any;
}

export interface PlatformPing {
  version: string;
  active_node: string;
  instances: any[];
  services: any[];
  [key: string]: any;
}
