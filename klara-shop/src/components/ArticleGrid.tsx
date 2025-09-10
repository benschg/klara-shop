import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
} from "@mui/material";
import { ArticleCard } from "./ArticleCard";
import { ApiService } from "../services/apiService";

// Inline type to avoid import issues
type GetArticlesParams = {
  limit?: number;
  offset?: number;
  productType?: {
    id?: string;
    name?: string;
  };
  sellInOnlineShop?: boolean;
  categoryId?: string;
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

const ITEMS_PER_PAGE = 12;

export const ArticleGrid: React.FC = () => {
  const [allArticles, setAllArticles] = useState<any[]>([]); // All fetched articles
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]); // Filtered articles
  const [displayedArticles, setDisplayedArticles] = useState<any[]>([]); // Current page articles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [onlineShopOnly, setOnlineShopOnly] = useState(true);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all articles (or a large number)
      const fetchParams = {
        limit: 1000, // Fetch a large number to get all articles
        offset: 0,
      };

      // Use regular articles endpoint (has images)
      const fetchedArticles = await ApiService.getArticles(fetchParams);


      setAllArticles(fetchedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  // Filter articles based on selected category and online shop setting
  const filterArticles = () => {
    let filtered = allArticles;

    // Apply online shop filter
    if (onlineShopOnly) {
      filtered = filtered.filter(
        (article) =>
          article.onlineShopCategories &&
          article.onlineShopCategories.length > 0
      );
    }

    // Apply category filter using accountingTags
    if (selectedCategoryId) {
      filtered = filtered.filter(
        (article) =>
          article.accountingTags &&
          article.accountingTags.includes(selectedCategoryId)
      );
    }

    setFilteredArticles(filtered);

    // Update pagination
    const totalItems = filtered.length;
    const pages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    setTotalPages(pages);

    // Update displayed articles for current page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedArticles(filtered.slice(startIndex, endIndex));
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const fetchedCategories = await ApiService.getArticleCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Create categories based on unique accountingTags from articles
  const availableCategories = useMemo(() => {
    if (allArticles.length === 0) return [];

    // Get articles to check based on online shop filter
    let articlesToCheck = allArticles;
    if (onlineShopOnly) {
      articlesToCheck = allArticles.filter(
        (article) =>
          article.onlineShopCategories &&
          article.onlineShopCategories.length > 0
      );
    }

    // Collect all unique accountingTags
    const uniqueTags = new Set<string>();
    articlesToCheck.forEach((article) => {
      if (article.accountingTags && article.accountingTags.length > 0) {
        article.accountingTags.forEach((tag) => uniqueTags.add(tag));
      }
    });

    // Convert to category objects
    return Array.from(uniqueTags).map((tag) => ({
      id: tag,
      name: tag,
      nameEN: tag,
      nameDE: tag,
    }));
  }, [allArticles, onlineShopOnly]);

  // Load categories and articles on mount
  useEffect(() => {
    loadCategories();
    loadArticles();
  }, []);

  // Filter articles when category changes, online shop setting changes, or when articles are loaded
  useEffect(() => {
    if (allArticles.length > 0) {
      filterArticles();
    }
  }, [allArticles, selectedCategoryId, onlineShopOnly, currentPage]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOnlineShopToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOnlineShopOnly(event.target.checked);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleCategoryChange = (event: any) => {
    setSelectedCategoryId(event.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getCategoryDisplayName = (category: ArticleCategory) => {
    return (
      category.nameEN || category.nameDE || category.name || "Unnamed Category"
    );
  };

  // Get article count for a specific accountingTag (respecting online shop filter)
  const getCategoryArticleCount = (categoryId: string) => {
    // Get articles to check based on online shop filter
    let articlesToCount = allArticles;
    if (onlineShopOnly) {
      articlesToCount = allArticles.filter(
        (article) =>
          article.onlineShopCategories &&
          article.onlineShopCategories.length > 0
      );
    }

    // Count articles that have this accountingTag
    return articlesToCount.filter(
      (article) =>
        article.accountingTags && article.accountingTags.includes(categoryId)
    ).length;
  };

  const handleImageError = (imageUrl: string) => {
    // Image failed to load
  };

  if (loading && displayedArticles.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={onlineShopOnly}
                onChange={handleOnlineShopToggle}
                color="primary"
              />
            }
            label="Show only online shop articles"
          />

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={selectedCategoryId}
              label="Category"
              onChange={handleCategoryChange}
              disabled={categoriesLoading}
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {availableCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {getCategoryDisplayName(category)} (
                  {getCategoryArticleCount(category.id!)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {categoriesLoading && <CircularProgress size={20} />}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {displayedArticles.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No articles found {selectedCategoryId ? "in this category" : ""}.{" "}
          {!import.meta.env.VITE_KLARA_API_KEY &&
            "Make sure to add your API key to the .env file."}
        </Alert>
      )}

      <Grid container spacing={3}>
        {displayedArticles.map((article) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            key={article.id || article.articleNumber}
          >
            <ArticleCard article={article} onImageError={handleImageError} />
          </Grid>
        ))}
      </Grid>

      {/* Loading indicator for additional pages */}
      {loading && displayedArticles.length > 0 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Results info */}
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mt: 2 }}
      >
        Page {currentPage} of {totalPages} • Showing {displayedArticles.length}{" "}
        of {filteredArticles.length} articles
        {selectedCategoryId && ` in selected category`}
      </Typography>
    </Container>
  );
};
