import type {
  ApiErrorResponse,
  DeleteProjectResponse,
  HealthResponse,
  Project,
  ProjectCreatePayload,
} from './types';

export class ApiError extends Error {
  public status: number;
  public detail: string;
  public data?: unknown;

  constructor(status: number, detail: string, data?: unknown) {
    super(`API Error ${status}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.data = data;
  }
}

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, '');
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    throw new ApiError(
      0,
      networkErr instanceof Error ? networkErr.message : 'Network connection failed. Backend may be offline.',
      networkErr
    );
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let errorData: unknown;

    try {
      const errJson = (await response.json()) as ApiErrorResponse;
      errorData = errJson;
      if (typeof errJson.detail === 'string') {
        errorDetail = errJson.detail;
      } else if (Array.isArray(errJson.detail)) {
        errorDetail = errJson.detail.map((e) => e.msg).join(', ');
      }
    } catch {
      // Body not JSON, attempt text
      try {
        const text = await response.text();
        if (text) errorDetail = text;
      } catch {
        // ignore
      }
    }

    throw new ApiError(response.status, errorDetail, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  projects: {
    list: async (): Promise<Project[]> => {
      return request<Project[]>('/projects');
    },
    get: async (id: string): Promise<Project> => {
      return request<Project>(`/projects/${id}`);
    },
    create: async (payload: ProjectCreatePayload): Promise<Project> => {
      return request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    delete: async (id: string): Promise<DeleteProjectResponse> => {
      return request<DeleteProjectResponse>(`/projects/${id}`, {
        method: 'DELETE',
      });
    },
  },
  health: {
    check: async (): Promise<HealthResponse> => {
      return request<HealthResponse>('/health');
    },
  },
};
