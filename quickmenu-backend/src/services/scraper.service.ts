// src/services/scraper.service.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedRecipe {
    title: string;
    duration: string;
    ingredients: string;
    steps: string;
    imageUrl?: string;
    source: 'Instagram' | 'TikTok' | 'Youtube' | 'Web';
    originalUrl: string;
}

const detectPlatform = (url: string): ScrapedRecipe['source'] => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('instagram.com')) return 'Instagram';
    if (lowerUrl.includes('tiktok.com')) return 'TikTok';
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'Youtube';
    return 'Web';
};

const extractDuration = (text: string): string => {
    const patterns = [
        /(\d+)\s*(menit|min|minute|minutes)/i,
        /(\d+)\s*(jam|hour|hours)/i,
        /(\d+)-(\d+)\s*(menit|min)/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            if (match[2]?.toLowerCase().includes('jam') || match[2]?.toLowerCase().includes('hour')) {
                return `${parseInt(match[1]) * 60}`;
            }
            return match[1];
        }
    }
    return '30';
};

const arrayToHtmlList = (items: string[], ordered: boolean = false): string => {
    if (!items || items.length === 0) return '';
    
    const tag = ordered ? 'ol' : 'ul';
    const listItems = items
        .filter(item => item.trim())
        .map(item => `<li>${item.trim()}</li>`)
        .join('\n');
    
    return `<${tag}>\n${listItems}\n</${tag}>`;
};

// ==================== WEB SCRAPER ====================
export const scrapeWebRecipe = async (url: string): Promise<ScrapedRecipe> => {
    try {
        console.log('🔍 Scraping:', url);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 20000,
            maxRedirects: 5
        });
        
        const $ = cheerio.load(response.data);
        
        // Strategy 1: JSON-LD Schema
        const jsonLdScripts = $('script[type="application/ld+json"]');
        
        for (let i = 0; i < jsonLdScripts.length; i++) {
            try {
                const jsonLd = $(jsonLdScripts[i]).html();
                if (!jsonLd) continue;
                
                const data = JSON.parse(jsonLd);
                const recipe = Array.isArray(data) 
                    ? data.find((item: any) => item['@type'] === 'Recipe')
                    : data['@type'] === 'Recipe' ? data : null;
                
                if (recipe) {
                    console.log('✅ Found recipe in JSON-LD');
                    
                    const ingredients = recipe.recipeIngredient || [];
                    const instructions = recipe.recipeInstructions || [];
                    
                    // Parse instructions (bisa array of string atau array of objects)
                    const steps = instructions.map((step: any) => {
                        if (typeof step === 'string') return step;
                        if (step.text) return step.text;
                        if (step.name) return step.name;
                        return '';
                    }).filter((s: string) => s.trim());
                    
                    return {
                        title: recipe.name || 'Untitled Recipe',
                        duration: extractDuration(recipe.totalTime || recipe.prepTime || recipe.cookTime || '30 min'),
                        ingredients: arrayToHtmlList(ingredients, false),
                        steps: arrayToHtmlList(steps, true),
                        imageUrl: recipe.image?.url || recipe.image || undefined,
                        source: 'Web',
                        originalUrl: url
                    };
                }
            } catch (e) {
                console.log('⚠️ Failed to parse JSON-LD:', e);
            }
        }
        
        // Strategy 2: HTML Parsing (Fallback)
        console.log('⚠️ No JSON-LD found, trying HTML parsing...');
        
        const title = $('h1').first().text().trim() || 
                      $('meta[property="og:title"]').attr('content') ||
                      $('title').text().trim() || 
                      'Untitled Recipe';
        
        // Find ingredients
        const ingredientSelectors = [
            '.ingredients li, .ingredient-list li',
            '[class*="ingredient"] li',
            '[itemprop="recipeIngredient"]',
            'ul:has(li:contains("sendok")) li',
            'ul:has(li:contains("gram")) li',
            'ul:has(li:contains("buah")) li'
        ];
        
        let ingredients: string[] = [];
        for (const selector of ingredientSelectors) {
            const items = $(selector);
            if (items.length > 2) { // At least 3 items
                ingredients = items.map((i, el) => $(el).text().trim()).get();
                break;
            }
        }
        
        // Find steps
        const stepsSelectors = [
            '.instructions li, .steps li',
            '[class*="instruction"] li',
            '[class*="step"] li',
            '[itemprop="recipeInstructions"] li',
            'ol li'
        ];
        
        let steps: string[] = [];
        for (const selector of stepsSelectors) {
            const items = $(selector);
            if (items.length > 2) { // At least 3 steps
                steps = items.map((i, el) => $(el).text().trim()).get();
                break;
            }
        }
        
        // Extract duration
        const pageText = $('body').text();
        const duration = extractDuration(pageText);
        
        // Get image
        const imageUrl = $('meta[property="og:image"]').attr('content') ||
                        $('img[src*="recipe"]').first().attr('src') ||
                        $('img[src*="food"]').first().attr('src');
        
        if (ingredients.length === 0 || steps.length === 0) {
            throw new Error('Tidak dapat menemukan bahan atau langkah resep di halaman ini');
        }
        
        return {
            title: title.substring(0, 150),
            duration,
            ingredients: arrayToHtmlList(ingredients, false),
            steps: arrayToHtmlList(steps, true),
            imageUrl,
            source: 'Web',
            originalUrl: url
        };
        
    } catch (error: any) {
        console.error('❌ Scraping error:', error.message);
        throw new Error(`Gagal mengambil resep: ${error.message}`);
    }
};

// ==================== YOUTUBE PARSER ====================
export const scrapeYoutubeRecipe = async (url: string): Promise<ScrapedRecipe> => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        const title = $('meta[property="og:title"]').attr('content') || 
                     $('title').text().replace(' - YouTube', '').trim();
        
        const description = $('meta[property="og:description"]').attr('content') || '';
        
        const lines = description.split('\n').filter(line => line.trim());
        
        const ingredients: string[] = [];
        const steps: string[] = [];
        let isIngredients = false;
        let isSteps = false;
        
        lines.forEach(line => {
            const lower = line.toLowerCase();
            
            if (lower.includes('bahan') || lower.includes('ingredient')) {
                isIngredients = true;
                isSteps = false;
                return;
            }
            
            if (lower.includes('cara') || lower.includes('langkah') || lower.includes('step')) {
                isSteps = true;
                isIngredients = false;
                return;
            }
            
            if (isIngredients && line.trim()) {
                ingredients.push(line.trim());
            }
            
            if (isSteps && line.trim()) {
                steps.push(line.trim());
            }
        });
        
        const imageUrl = $('meta[property="og:image"]').attr('content');
        
        return {
            title: title.substring(0, 150),
            duration: extractDuration(description),
            ingredients: arrayToHtmlList(ingredients, false) || '<ul><li>Lihat video untuk bahan-bahan</li></ul>',
            steps: arrayToHtmlList(steps, true) || '<ol><li>Lihat video untuk langkah-langkah</li></ol>',
            imageUrl,
            source: 'Youtube',
            originalUrl: url
        };
        
    } catch (error: any) {
        throw new Error(`Gagal mengambil resep YouTube: ${error.message}`);
    }
};

// ==================== MAIN SCRAPER ====================
export const scrapeRecipe = async (url: string): Promise<ScrapedRecipe> => {
    const platform = detectPlatform(url);
    
    console.log(`🎯 Platform detected: ${platform}`);
    
    if (platform === 'Instagram' || platform === 'TikTok') {
        throw new Error(`${platform} memerlukan copy-paste manual. Silakan gunakan fitur Import Manual.`);
    }
    
    if (platform === 'Youtube') {
        return scrapeYoutubeRecipe(url);
    }
    
    return scrapeWebRecipe(url);
};