# Klara Shop - Product Catalog Viewer

A minimal React application for displaying articles from the Klara API.

## Features

- ✅ **Product Display**: Browse articles with images, descriptions, and pricing
- ✅ **Filtering**: Filter articles for online shop availability
- ✅ **Pagination**: Navigate through large product catalogs
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **TypeScript**: Full type safety for better development experience

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Klara API key:
```env
VITE_KLARA_API_KEY=your_actual_api_key_here
VITE_KLARA_API_BASE_URL=https://api.klara.ch
```

### 3. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Integration

This application uses the following Klara API endpoints:

- `GET /core/latest/articles` - Fetch articles with pagination and filtering
- `GET /core/latest/articles/{article-id}/images/{image-id}` - Fetch article images

### Authentication

The app uses API key authentication. Add your API key to the `.env` file as shown above.

## Technical Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **Axios** for HTTP requests
- **Vite** for fast development and building

## Project Structure

```
src/
├── components/
│   ├── ArticleCard.tsx      # Individual product card
│   └── ArticleGrid.tsx      # Main grid with filtering and pagination
├── services/
│   └── apiService.ts        # Klara API integration
├── types/
│   └── api.ts              # TypeScript type definitions
└── App.tsx                 # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- This is a read-only application - it only fetches and displays data
- Images are loaded directly from the Klara API
- The application includes error handling for API failures
- Pagination is estimated based on the number of returned items
