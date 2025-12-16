// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeRecipe } from './services/scraper.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'QuickMenu Scraper API is running!',
        version: '1.0.0',
        endpoints: {
            scrape: 'POST /api/scrape',
            health: 'GET /api/health'
        }
    });
});

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Scrape Recipe Endpoint
app.post('/api/scrape', async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        
        // Validation
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }
        
        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format'
            });
        }
        
        console.log(`\n🔍 Scraping request received for: ${url}`);
        
        // Scrape recipe
        const recipe = await scrapeRecipe(url);
        
        console.log(`✅ Successfully scraped: ${recipe.title}\n`);
        
        res.json({
            success: true,
            data: recipe
        });
        
    } catch (error: any) {
        console.error(`❌ Scraping failed:`, error.message);
        
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to scrape recipe'
        });
    }
});

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   🍳 QuickMenu Scraper API               ║
║   🚀 Server running on port ${PORT}        ║
║   📡 http://localhost:${PORT}               ║
╚═══════════════════════════════════════════╝
    `);
});

export default app;