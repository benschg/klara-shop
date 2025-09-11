import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Define the API key as an environment parameter
// This will be set using: firebase functions:config:set klara.api_key="YOUR_API_KEY"
import { defineSecret } from "firebase-functions/params";
const klaraApiKey = defineSecret("KLARA_API_KEY");

export const klaraApi = onRequest(
  {
    cors: true,
    secrets: [klaraApiKey],
    region: "europe-west1", // Use European region for better performance
  },
  async (request, response) => {
    try {
      // Get the API key from environment
      const apiKey = klaraApiKey.value();

      if (!apiKey) {
        logger.error("KLARA_API_KEY not configured");
        response.status(500).json({ error: "API key not configured" });
        return;
      }

      // Extract the path from the request URL
      // Remove /api prefix if present since we're proxying
      let path = request.url;
      if (path.startsWith("/api")) {
        path = path.substring(4);
      }

      // Construct the full Klara API URL
      const klaraUrl = `https://api.klara.ch${path}`;

      logger.info(`Proxying request to: ${klaraUrl}`, {
        method: request.method,
        path: path,
        query: request.query,
      });

      // Prepare headers for the API request
      const headers: Record<string, string> = {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      // Copy relevant headers from the original request
      if (request.headers["accept-language"]) {
        headers["Accept-Language"] = request.headers[
          "accept-language"
        ] as string;
      }

      // Make the request to Klara API
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: headers,
      };

      // Add body for non-GET requests
      if (request.method !== "GET" && request.body) {
        fetchOptions.body = JSON.stringify(request.body);
      }

      const klaraResponse = await fetch(klaraUrl, fetchOptions);

      if (!klaraResponse.ok) {
        logger.error(
          `Klara API error: ${klaraResponse.status} ${klaraResponse.statusText}`,
          {
            url: klaraUrl,
            status: klaraResponse.status,
          }
        );
      }

      // Get response data
      const contentType = klaraResponse.headers.get("content-type");
      let responseData;

      if (contentType && contentType.includes("application/json")) {
        responseData = await klaraResponse.json();
      } else {
        responseData = await klaraResponse.text();
      }

      // Set appropriate headers and return the response
      response.status(klaraResponse.status);

      // Copy relevant response headers
      if (klaraResponse.headers.get("content-type")) {
        response.set(
          "Content-Type",
          klaraResponse.headers.get("content-type")!
        );
      }

      response.json(responseData);
    } catch (error) {
      logger.error("Error proxying request to Klara API", error);
      response.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
