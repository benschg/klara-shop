export type Article = {
  id?: string;
  nameDE: string;
  nameEN?: string;
  nameFR?: string;
  nameIT?: string;
  descriptionDE?: string;
  descriptionEN?: string;
  descriptionFR?: string;
  descriptionIT?: string;
  extendedDescriptionDE?: string;
  extendedDescriptionEN?: string;
  extendedDescriptionFR?: string;
  extendedDescriptionIT?: string;
  unitDE: string;
  unitEN?: string;
  unitFR?: string;
  unitIT?: string;
  barcode?: string;
  usePos?: boolean;
  pricePeriods?: PricePeriod[];
  imageHrefs?: string[];
  isArticleSet?: boolean;
  articleSetName?: string;
  defaultQuantity?: number;
  accountingTags: string[];
  articleNumber: string;
  hasVariant?: boolean;
  productType: ProductType;
  onlineShopCategories?: ArticleCategoryRef[];
  onlineShopFilters?: ArticleFilterRef[];
}

export interface PricePeriod {
  validFrom?: string;
  validTo?: string;
  price?: number;
  currency?: string;
}

export interface ProductType {
  id?: string;
  name?: string;
}

export interface ArticleCategoryRef {
  id?: string;
  href?: string;
  name?: string;
}

export interface ArticleFilterRef {
  id?: string;
  href?: string;
  name?: string;
}

export interface ArticlesResponse {
  articles: Article[];
  total?: number;
}

export interface ApiError {
  message: string;
  code?: string;
}