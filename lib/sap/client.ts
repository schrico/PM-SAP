// /lib/sap/client.ts
// Server-side SAP TPM API client with OAuth 2.0 authentication

import type {
  SapProjectDTO,
  SapSubProjectInfo,
  SapInstructionDTO,
} from '@/types/sap';
import {
  SapApiError,
  SapConfigError,
  SapTokenError,
  parseSapError,
  isRetryableError,
} from './errors';

// API Configuration
const SAP_TOKEN_URL = 'https://lpxtpmsub.authentication.sap.hana.ondemand.com/oauth/token';
const SAP_API_BASE_URL = 'https://lpxtpmsub-tpm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Server-side SAP TPM API client
 * Uses OAuth 2.0 client_credentials grant for authentication
 */
export class SapTpmApiClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    const clientId = process.env.SAP_TPM_CLIENT_ID;
    const clientSecret = process.env.SAP_TPM_CLIENT_SECRET;

    if (!clientId) {
      throw new SapConfigError('SAP_TPM_CLIENT_ID');
    }
    if (!clientSecret) {
      throw new SapConfigError('SAP_TPM_CLIENT_SECRET');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Get OAuth access token (cached until expiry)
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const response = await fetch(SAP_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new SapTokenError(`Failed to obtain token: ${response.status} - ${errorText}`);
    }

    const data: TokenResponse = await response.json();

    if (!data.access_token) {
      throw new SapTokenError('Token response missing access_token');
    }

    this.accessToken = data.access_token;
    // Refresh 60 seconds before actual expiry to avoid edge cases
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return this.accessToken;
  }

  /**
   * Make authenticated API request with retry logic
   */
  private async request<T>(endpoint: string, retries = MAX_RETRIES): Promise<T> {
    const token = await this.getAccessToken();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${SAP_API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await parseSapError(response);

        // If auth error, invalidate token and retry once
        if (error.isAuthError && retries > 0) {
          this.accessToken = null;
          this.tokenExpiresAt = 0;
          return this.request<T>(endpoint, retries - 1);
        }

        throw error;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort/timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new SapApiError('Request timeout', 408);
      }

      // Retry transient errors
      if (isRetryableError(error) && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return this.request<T>(endpoint, retries - 1);
      }

      throw error;
    }
  }

  /**
   * GET /v1/suppliers/projects
   * List all projects and sub-projects for the supplier
   */
  async getProjects(): Promise<SapProjectDTO> {
    return this.request<SapProjectDTO>('/v1/suppliers/projects');
  }

  /**
   * GET /v1/suppliers/projects/{projectId}/subprojects/{subProjectId}
   * Get detailed sub-project info (steps, volumes, dates)
   */
  async getSubProjectDetails(
    projectId: number,
    subProjectId: string
  ): Promise<SapSubProjectInfo> {
    return this.request<SapSubProjectInfo>(
      `/v1/suppliers/projects/${projectId}/subprojects/${encodeURIComponent(subProjectId)}`
    );
  }

  /**
   * GET /v1/suppliers/projects/{projectId}/subprojects/{subProjectId}/instructions
   * Get instructions for a sub-project
   */
  async getInstructions(
    projectId: number,
    subProjectId: string
  ): Promise<SapInstructionDTO> {
    return this.request<SapInstructionDTO>(
      `/v1/suppliers/projects/${projectId}/subprojects/${encodeURIComponent(subProjectId)}/instructions`
    );
  }
}

// Singleton instance for reuse across requests
let clientInstance: SapTpmApiClient | null = null;

/**
 * Get or create the SAP API client singleton
 * Throws SapConfigError if credentials are not configured
 */
export function getSapClient(): SapTpmApiClient {
  if (!clientInstance) {
    clientInstance = new SapTpmApiClient();
  }
  return clientInstance;
}

/**
 * Reset the client (useful for testing or credential rotation)
 */
export function resetSapClient(): void {
  clientInstance = null;
}
