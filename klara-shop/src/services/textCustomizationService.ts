import productCustomizationData from '../data/productCustomization.json';

export interface TextCustomizationConfig {
  enabled: boolean;
  label: string;
  placeholder: string;
  maxLength: number;
  required: boolean;
}

export class TextCustomizationService {
  /**
   * Check if an article supports text customization based on its category or name
   */
  static getCustomizationConfig(article: {
    nameDE: string;
    accountingTags?: string[];
  }): TextCustomizationConfig | null {
    // First check by specific article name
    const articleConfig = this.getArticleCustomization(article.nameDE);
    if (articleConfig) {
      return articleConfig;
    }

    // Then check by category (accountingTags)
    if (article.accountingTags) {
      for (const tag of article.accountingTags) {
        const categoryConfig = this.getCategoryCustomization(tag);
        if (categoryConfig) {
          return categoryConfig;
        }
      }
    }

    return null;
  }

  /**
   * Get customization config by article name
   */
  private static getArticleCustomization(articleName: string): TextCustomizationConfig | null {
    const articles = productCustomizationData.textCustomization.articles;
    const normalizedName = articleName.toLowerCase();

    for (const [configName, config] of Object.entries(articles)) {
      if (normalizedName.includes(configName.toLowerCase()) || 
          configName.toLowerCase().includes(normalizedName)) {
        return config;
      }
    }

    return null;
  }

  /**
   * Get customization config by category (accounting tag)
   */
  private static getCategoryCustomization(category: string): TextCustomizationConfig | null {
    const categories = productCustomizationData.textCustomization.categories;
    
    // Direct match
    if (categories[category as keyof typeof categories]) {
      return categories[category as keyof typeof categories];
    }

    // Partial match
    const normalizedCategory = category.toLowerCase();
    for (const [configCategory, config] of Object.entries(categories)) {
      if (normalizedCategory.includes(configCategory.toLowerCase()) || 
          configCategory.toLowerCase().includes(normalizedCategory)) {
        return config;
      }
    }

    return null;
  }

  /**
   * Validate custom text against the configuration
   */
  static validateCustomText(text: string, config: TextCustomizationConfig): {
    isValid: boolean;
    error?: string;
  } {
    if (config.required && (!text || text.trim().length === 0)) {
      return {
        isValid: false,
        error: `${config.label} ist erforderlich`
      };
    }

    if (text && text.length > config.maxLength) {
      return {
        isValid: false,
        error: `${config.label} darf maximal ${config.maxLength} Zeichen lang sein`
      };
    }

    return { isValid: true };
  }

  /**
   * Get rules for text customization display
   */
  static getRules() {
    return productCustomizationData.textCustomization.rules;
  }
}