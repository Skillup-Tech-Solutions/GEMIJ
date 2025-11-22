import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import os from 'os';

interface PlagiarismResult {
    similarityScore: number;
    matchedSources: Array<{
        source: string;
        similarity: number;
        matchedText: string;
    }>;
    status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
    errorMessage?: string;
}

/**
 * Plagiarism Detection Service
 * Implements text similarity checking using cosine similarity and TF-IDF
 */
class PlagiarismService {
    /**
     * Extract text content from a PDF file (supports both local paths and URLs)
     */
    async extractTextFromPDF(filePath: string): Promise<string> {
        try {
            let dataBuffer: Buffer;

            // Check if filePath is a URL
            if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
                // Download file from URL
                const response = await axios.get(filePath, {
                    responseType: 'arraybuffer',
                    timeout: 30000 // 30 second timeout
                });
                dataBuffer = Buffer.from(response.data);
            } else {
                // Read from local file system
                dataBuffer = await fs.readFile(filePath);
            }

            const data = await pdfParse(dataBuffer);
            return data.text;
        } catch (error) {
            console.error('PDF text extraction error:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    /**
     * Calculate cosine similarity between two text strings
     * Uses TF-IDF (Term Frequency-Inverse Document Frequency) approach
     */
    private calculateCosineSimilarity(text1: string, text2: string): number {
        // Tokenize and normalize texts
        const tokens1 = this.tokenize(text1);
        const tokens2 = this.tokenize(text2);

        // Create vocabulary (unique words from both texts)
        const vocabulary = new Set([...tokens1, ...tokens2]);

        // Calculate term frequency vectors
        const vector1 = this.createTFVector(tokens1, vocabulary);
        const vector2 = this.createTFVector(tokens2, vocabulary);

        // Calculate cosine similarity
        return this.cosineSimilarity(vector1, vector2);
    }

    /**
     * Tokenize text into words (lowercase, remove punctuation)
     */
    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2); // Filter out very short words
    }

    /**
     * Create term frequency vector
     */
    private createTFVector(tokens: string[], vocabulary: Set<string>): number[] {
        const vector: number[] = [];
        const tokenCounts = new Map<string, number>();

        // Count token frequencies
        tokens.forEach(token => {
            tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
        });

        // Create vector based on vocabulary
        vocabulary.forEach(word => {
            vector.push(tokenCounts.get(word) || 0);
        });

        return vector;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(vector1: number[], vector2: number[]): number {
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;

        for (let i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i];
            magnitude1 += vector1[i] * vector1[i];
            magnitude2 += vector2[i] * vector2[i];
        }

        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);

        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }

        return (dotProduct / (magnitude1 * magnitude2)) * 100;
    }

    /**
     * Check for plagiarism by comparing against sample texts
     * In a production environment, this would check against a database of papers
     * or use an external API like Copyscape
     */
    async checkPlagiarism(
        filePath: string,
        submissionText?: string
    ): Promise<PlagiarismResult> {
        try {
            // Extract text from PDF if not provided
            const text = submissionText || await this.extractTextFromPDF(filePath);

            if (!text || text.trim().length < 100) {
                return {
                    similarityScore: 0,
                    matchedSources: [],
                    status: 'FAILED',
                    errorMessage: 'Insufficient text content for plagiarism check'
                };
            }

            // In a real implementation, you would:
            // 1. Check against a database of existing papers
            // 2. Use external APIs (Copyscape, Turnitin, etc.)
            // 3. Check against web content

            // For now, we'll do a basic self-similarity check and common phrase detection
            const matchedSources = await this.detectCommonPhrases(text);

            // Calculate overall similarity score
            const similarityScore = matchedSources.length > 0
                ? Math.max(...matchedSources.map(s => s.similarity))
                : this.calculateBaseSimilarity(text);

            return {
                similarityScore: Math.min(similarityScore, 100),
                matchedSources,
                status: 'COMPLETED'
            };
        } catch (error) {
            console.error('Plagiarism check error:', error);
            return {
                similarityScore: 0,
                matchedSources: [],
                status: 'FAILED',
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Detect common phrases that might indicate plagiarism
     */
    private async detectCommonPhrases(text: string): Promise<Array<{
        source: string;
        similarity: number;
        matchedText: string;
    }>> {
        const matches: Array<{
            source: string;
            similarity: number;
            matchedText: string;
        }> = [];

        // Common academic phrases that shouldn't count as plagiarism
        const commonPhrases = [
            'in this paper',
            'this study',
            'our results',
            'we found that',
            'it was observed',
            'the results show',
            'in conclusion'
        ];

        // Check for excessive use of common phrases (potential indicator)
        const lowerText = text.toLowerCase();
        let commonPhraseCount = 0;

        commonPhrases.forEach(phrase => {
            const regex = new RegExp(phrase, 'gi');
            const matches = lowerText.match(regex);
            if (matches) {
                commonPhraseCount += matches.length;
            }
        });

        // If there are too many common phrases, flag it
        const wordCount = text.split(/\s+/).length;
        const phraseRatio = (commonPhraseCount / wordCount) * 100;

        if (phraseRatio > 5) {
            matches.push({
                source: 'Common Academic Phrases',
                similarity: Math.min(phraseRatio * 2, 30),
                matchedText: `Detected ${commonPhraseCount} instances of common phrases`
            });
        }

        return matches;
    }

    /**
     * Calculate base similarity score based on text characteristics
     */
    private calculateBaseSimilarity(text: string): number {
        // Simple heuristic: check for repetitive patterns
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

        if (sentences.length < 5) {
            return 0;
        }

        let maxSimilarity = 0;

        // Compare each sentence with others
        for (let i = 0; i < Math.min(sentences.length, 20); i++) {
            for (let j = i + 1; j < Math.min(sentences.length, 20); j++) {
                const similarity = this.calculateCosineSimilarity(
                    sentences[i],
                    sentences[j]
                );
                maxSimilarity = Math.max(maxSimilarity, similarity);
            }
        }

        // Return a conservative estimate
        return Math.min(maxSimilarity * 0.3, 15);
    }

    /**
     * Check plagiarism using external API (Copyscape)
     * This is a placeholder for future implementation
     */
    async checkWithCopyscape(text: string, apiKey: string): Promise<PlagiarismResult> {
        // TODO: Implement Copyscape API integration
        throw new Error('Copyscape integration not yet implemented');
    }

    /**
     * Check plagiarism using Turnitin API
     * This is a placeholder for future implementation
     */
    async checkWithTurnitin(fileId: string, apiKey: string): Promise<PlagiarismResult> {
        // TODO: Implement Turnitin API integration
        throw new Error('Turnitin integration not yet implemented');
    }
}

export const plagiarismService = new PlagiarismService();
export default plagiarismService;
