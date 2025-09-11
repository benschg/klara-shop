import axios from "axios";
// import { Article, ProductType } from '../types/api';

// Inline types to avoid import issues
type Article = {
  id?: string;
  nameDE: string;
  nameEN?: string;
  descriptionDE?: string;
  descriptionEN?: string;
  unitDE: string;
  unitEN?: string;
  barcode?: string;
  pricePeriods?: Array<{
    validFrom?: string;
    validTo?: string;
    price?: number;
    currency?: string;
  }>;
  imageHrefs?: string[];
  isArticleSet?: boolean;
  articleNumber: string;
  hasVariant?: boolean;
  productType?: {
    id?: string;
    name?: string;
  };
  accountingTags: string[];
  options?: Array<{
    name: string;
    values: string[];
  }>;
};

type ProductType = {
  id?: string;
  name?: string;
};

type ArticleCategory = {
  id?: string;
  href?: string;
  name?: string;
  nameDE?: string;
  nameEN?: string;
  nameFR?: string;
  nameIT?: string;
  order?: number;
};

type ArticleAndVariant = {
  id?: string;
  name?: string;
  description?: string;
  extendedDescription?: string;
  unit?: string;
  barcode?: string;
  defaultQuantity?: number;
  accountingTags?: string[];
  articleNumber?: string;
  productType?: ProductType;
  priceIncludeVat?: number;
  priceExcludeVat?: number;
  hasInventory?: boolean;
  quantityInStock?: number;
  optionValues?: string[];
  ableToOrderOutOfStock?: boolean;
  imageHrefs?: string[]; // Adding this to test if variants have images
};

type Variant = {
  id?: string;
  barcode?: string;
  nameDE?: string;
  nameEN?: string;
  active?: boolean;
  pricePeriods?: Array<{
    validFrom?: string;
    validTo?: string;
    price?: number;
    currency?: string;
  }>;
  variantOptionValues?: any[];
};

// const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_KLARA_API_BASE_URL || 'https://api.klara.ch');
const API_BASE_URL = "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export type GetArticlesParams = {
  limit?: number;
  offset?: number;
  productType?: ProductType;
  sellInOnlineShop?: boolean;
  categoryId?: string;
};

export { type Variant };

export class ApiService {
  static async getArticles(params: GetArticlesParams = {}): Promise<Article[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.limit) queryParams.set("limit", params.limit.toString());
      if (params.offset) queryParams.set("offset", params.offset.toString());
      if (params.productType?.id)
        queryParams.set("product-type", params.productType.id);
      if (params.sellInOnlineShop !== undefined) {
        queryParams.set(
          "sell-in-online-shop",
          params.sellInOnlineShop.toString()
        );
      }
      // Note: category filtering is done client-side since API doesn't support it

      const url = `/core/latest/articles${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await apiClient.get(url);

      return response.data;
    } catch (error) {
      console.error("Error fetching articles:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      }
      throw new Error(
        `Failed to fetch articles: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getArticleImage(
    articleId: string,
    imageId: string
  ): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `/core/latest/articles/${articleId}/images/${imageId}`,
        { responseType: "blob" }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching article image:", error);
      throw new Error("Failed to fetch article image");
    }
  }

  static async getArticleCategories(): Promise<ArticleCategory[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("active-status", "true"); // Only get active categories

      const url = `/core/latest/article-categories?${queryParams.toString()}`;

      const response = await apiClient.get(url);

      return response.data;
    } catch (error) {
      console.error("Error fetching article categories:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      }
      throw new Error(
        `Failed to fetch article categories: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getArticleVariants(articleId: string): Promise<Variant[]> {
    try {
      const url = `/core/latest/articles/${articleId}/variants`;

      const response = await apiClient.get(url);

      return response.data;
    } catch (error) {
      console.error("Error fetching article variants:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      }
      throw new Error(
        `Failed to fetch article variants: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getArticlesAndVariants(
    params: GetArticlesParams = {}
  ): Promise<ArticleAndVariant[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.limit) queryParams.set("limit", params.limit.toString());
      if (params.offset) queryParams.set("offset", params.offset.toString());
      if (params.sellInOnlineShop !== undefined) {
        queryParams.set(
          "sell-in-online-shop",
          params.sellInOnlineShop.toString()
        );
      }

      const url = `/core/latest/articles/article-and-variants${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await apiClient.get(url);

      return response.data;
    } catch (error) {
      console.error("Error fetching articles and variants:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      }
      throw new Error(
        `Failed to fetch articles and variants: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
