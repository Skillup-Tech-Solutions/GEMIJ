import axios from 'axios';
import { plagiarismService } from './plagiarismService';

interface GrammarError {
    id: string;
    offset: number;
    length: number;
    type: string;
    description: {
        en: string;
    };
    bad: string;
    better: string[];
    category?: string;
}

interface TextGearResponse {
    status: boolean;
    response: {
        errors: GrammarError[];
    };
}

interface GrammarCheckResult {
    totalErrors: number;
    grammarErrors: number;
    spellingErrors: number;
    punctuationErrors: number;
    styleErrors: number;
    overallScore: number;
    errors: Array<{
        type: string;
        category: string;
        message: string;
        offset: number;
        length: number;
        bad: string;
        suggestions: string[];
    }>;
    status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
    errorMessage?: string;
}

/**
 * TextGear Grammar and Spell Checking Service
 * Integrates with TextGear API for comprehensive grammar analysis
 */
class TextGearService {
    private apiKey: string;
    private apiUrl: string = 'https://api.textgears.com/grammar';

    constructor() {
        this.apiKey = process.env.TEXTGEAR_API_KEY || 'textgearsapi';
    }

    /**
     * Check text for grammar and spelling errors using TextGear API
     */
    async checkGrammar(text: string): Promise<GrammarCheckResult> {
        try {
            if (!text || text.trim().length < 10) {
                return {
                    totalErrors: 0,
                    grammarErrors: 0,
                    spellingErrors: 0,
                    punctuationErrors: 0,
                    styleErrors: 0,
                    overallScore: 100,
                    errors: [],
                    status: 'FAILED',
                    errorMessage: 'Insufficient text content for grammar check'
                };
            }

            // Call TextGear API - using GET request as per API documentation
            const response = await axios.get<TextGearResponse>(
                this.apiUrl,
                {
                    params: {
                        text: text,
                        language: 'en-US',
                        key: this.apiKey
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            if (!response.data.status) {
                const errorMsg = (response.data as any).description || 'TextGear API returned unsuccessful status';
                throw new Error(errorMsg);
            }

            // Process and categorize errors
            const errors = response.data.response.errors || [];
            const categorizedErrors = this.categorizeErrors(errors);

            // Calculate overall score based on error count and text length
            const overallScore = this.calculateScore(text, errors.length);

            return {
                totalErrors: errors.length,
                grammarErrors: categorizedErrors.grammar,
                spellingErrors: categorizedErrors.spelling,
                punctuationErrors: categorizedErrors.punctuation,
                styleErrors: categorizedErrors.style,
                overallScore,
                errors: errors.map(error => ({
                    type: error.type || 'unknown',
                    category: this.getErrorCategory(error.type),
                    message: error.description?.en || 'Grammar or spelling issue detected',
                    offset: error.offset,
                    length: error.length,
                    bad: error.bad,
                    suggestions: error.better || []
                })),
                status: 'COMPLETED'
            };
        } catch (error) {
            console.error('TextGear API error:', error);

            // Return a graceful fallback result
            return {
                totalErrors: 0,
                grammarErrors: 0,
                spellingErrors: 0,
                punctuationErrors: 0,
                styleErrors: 0,
                overallScore: 0,
                errors: [],
                status: 'FAILED',
                errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Check grammar for a PDF file
     */
    async checkGrammarFromPDF(filePath: string): Promise<GrammarCheckResult> {
        try {
            // Extract text from PDF using plagiarismService
            const text = await plagiarismService.extractTextFromPDF(filePath);

            if (!text || text.trim().length < 10) {
                return {
                    totalErrors: 0,
                    grammarErrors: 0,
                    spellingErrors: 0,
                    punctuationErrors: 0,
                    styleErrors: 0,
                    overallScore: 100,
                    errors: [],
                    status: 'FAILED',
                    errorMessage: 'Could not extract sufficient text from PDF'
                };
            }

            // Check grammar on extracted text
            return await this.checkGrammar(text);
        } catch (error) {
            console.error('PDF grammar check error:', error);
            return {
                totalErrors: 0,
                grammarErrors: 0,
                spellingErrors: 0,
                punctuationErrors: 0,
                styleErrors: 0,
                overallScore: 0,
                errors: [],
                status: 'FAILED',
                errorMessage: error instanceof Error ? error.message : 'Failed to process PDF'
            };
        }
    }

    /**
     * Categorize errors by type
     */
    private categorizeErrors(errors: GrammarError[]): {
        grammar: number;
        spelling: number;
        punctuation: number;
        style: number;
    } {
        const counts = {
            grammar: 0,
            spelling: 0,
            punctuation: 0,
            style: 0
        };

        errors.forEach(error => {
            const category = this.getErrorCategory(error.type);
            if (category in counts) {
                counts[category as keyof typeof counts]++;
            }
        });

        return counts;
    }

    /**
     * Map TextGear error types to categories
     */
    private getErrorCategory(type: string): string {
        const lowerType = (type || '').toLowerCase();

        if (lowerType.includes('spell') || lowerType.includes('typo')) {
            return 'spelling';
        } else if (lowerType.includes('punct') || lowerType.includes('comma')) {
            return 'punctuation';
        } else if (lowerType.includes('style') || lowerType.includes('redundan')) {
            return 'style';
        } else {
            return 'grammar';
        }
    }

    /**
     * Calculate overall score based on error density
     */
    private calculateScore(text: string, errorCount: number): number {
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

        if (wordCount === 0) {
            return 100;
        }

        // Calculate errors per 100 words
        const errorsPer100Words = (errorCount / wordCount) * 100;

        // Score calculation:
        // 0-1 errors per 100 words: 95-100
        // 1-2 errors per 100 words: 85-95
        // 2-3 errors per 100 words: 75-85
        // 3-5 errors per 100 words: 60-75
        // 5+ errors per 100 words: 0-60

        let score = 100;

        if (errorsPer100Words > 5) {
            score = Math.max(0, 60 - (errorsPer100Words - 5) * 5);
        } else if (errorsPer100Words > 3) {
            score = 75 - (errorsPer100Words - 3) * 7.5;
        } else if (errorsPer100Words > 2) {
            score = 85 - (errorsPer100Words - 2) * 10;
        } else if (errorsPer100Words > 1) {
            score = 95 - (errorsPer100Words - 1) * 10;
        } else if (errorsPer100Words > 0) {
            score = 100 - errorsPer100Words * 5;
        }

        return Math.round(Math.max(0, Math.min(100, score)));
    }

    /**
     * Get summary statistics for a grammar check
     */
    getSummary(result: GrammarCheckResult): string {
        if (result.status === 'FAILED') {
            return result.errorMessage || 'Grammar check failed';
        }

        const parts: string[] = [];

        if (result.totalErrors === 0) {
            return 'No grammar or spelling errors detected. Excellent!';
        }

        parts.push(`Found ${result.totalErrors} issue${result.totalErrors !== 1 ? 's' : ''}`);

        const details: string[] = [];
        if (result.grammarErrors > 0) details.push(`${result.grammarErrors} grammar`);
        if (result.spellingErrors > 0) details.push(`${result.spellingErrors} spelling`);
        if (result.punctuationErrors > 0) details.push(`${result.punctuationErrors} punctuation`);
        if (result.styleErrors > 0) details.push(`${result.styleErrors} style`);

        if (details.length > 0) {
            parts.push(`(${details.join(', ')})`);
        }

        parts.push(`Score: ${result.overallScore}/100`);

        return parts.join(' - ');
    }
}

export const textgearService = new TextGearService();
export default textgearService;
