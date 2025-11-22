interface QualityMetrics {
    overallScore: number;
    structureScore: number;
    formattingScore: number;
    readabilityScore: number;
    completenessScore: number;
    wordCount: number;
    abstractLength: number;
    referenceCount: number;
    figureCount: number;
    tableCount: number;
    issues: Array<{
        severity: 'critical' | 'moderate' | 'minor';
        category: string;
        message: string;
    }>;
    recommendations: Array<{
        priority: 'high' | 'medium' | 'low';
        category: string;
        suggestion: string;
    }>;
}

/**
 * Quality Assessment Service
 * Analyzes manuscript quality based on structure, formatting, and content
 */
class QualityService {
    /**
     * Perform comprehensive quality assessment on a manuscript
     */
    async assessQuality(text: string, abstract: string): Promise<QualityMetrics> {
        const issues: QualityMetrics['issues'] = [];
        const recommendations: QualityMetrics['recommendations'] = [];

        // Analyze text content
        const wordCount = this.countWords(text);
        const abstractLength = this.countWords(abstract);
        const referenceCount = this.countReferences(text);
        const figureCount = this.countFigures(text);
        const tableCount = this.countTables(text);

        // Calculate individual scores
        const structureScore = this.assessStructure(text, issues, recommendations);
        const formattingScore = this.assessFormatting(text, wordCount, issues, recommendations);
        const readabilityScore = this.assessReadability(text, issues, recommendations);
        const completenessScore = this.assessCompleteness(
            text,
            abstractLength,
            referenceCount,
            issues,
            recommendations
        );

        // Calculate overall score (weighted average)
        const overallScore = Math.round(
            structureScore * 0.25 +
            formattingScore * 0.20 +
            readabilityScore * 0.30 +
            completenessScore * 0.25
        );

        return {
            overallScore,
            structureScore,
            formattingScore,
            readabilityScore,
            completenessScore,
            wordCount,
            abstractLength,
            referenceCount,
            figureCount,
            tableCount,
            issues,
            recommendations
        };
    }

    /**
     * Count words in text
     */
    private countWords(text: string): number {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Count references in the text
     */
    private countReferences(text: string): number {
        // Look for common reference patterns
        const patterns = [
            /\[\d+\]/g,                    // [1], [2], etc.
            /\(\d{4}\)/g,                  // (2023), (2024), etc.
            /et al\./gi,                   // et al.
            /References|Bibliography/i     // References section
        ];

        let count = 0;
        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                count += matches.length;
            }
        });

        // Estimate based on patterns found
        return Math.min(Math.floor(count / 2), 100); // Cap at 100
    }

    /**
     * Count figures mentioned in text
     */
    private countFigures(text: string): number {
        const figurePattern = /Figure\s+\d+|Fig\.\s+\d+/gi;
        const matches = text.match(figurePattern);
        return matches ? new Set(matches.map(m => m.toLowerCase())).size : 0;
    }

    /**
     * Count tables mentioned in text
     */
    private countTables(text: string): number {
        const tablePattern = /Table\s+\d+/gi;
        const matches = text.match(tablePattern);
        return matches ? new Set(matches.map(m => m.toLowerCase())).size : 0;
    }

    /**
     * Assess document structure
     */
    private assessStructure(
        text: string,
        issues: QualityMetrics['issues'],
        recommendations: QualityMetrics['recommendations']
    ): number {
        let score = 100;
        const lowerText = text.toLowerCase();

        // Check for essential sections
        const sections = {
            introduction: /introduction|background/i,
            methodology: /method|methodology|materials and methods/i,
            results: /results|findings/i,
            discussion: /discussion/i,
            conclusion: /conclusion/i
        };

        const missingSections: string[] = [];
        Object.entries(sections).forEach(([section, pattern]) => {
            if (!pattern.test(lowerText)) {
                missingSections.push(section);
                score -= 15;
            }
        });

        if (missingSections.length > 0) {
            issues.push({
                severity: 'critical',
                category: 'Structure',
                message: `Missing essential sections: ${missingSections.join(', ')}`
            });
            recommendations.push({
                priority: 'high',
                category: 'Structure',
                suggestion: `Add the following sections: ${missingSections.join(', ')}`
            });
        }

        // Check for logical flow
        const hasIntroBeforeMethod = lowerText.indexOf('introduction') < lowerText.indexOf('method');
        const hasMethodBeforeResults = lowerText.indexOf('method') < lowerText.indexOf('results');

        if (!hasIntroBeforeMethod || !hasMethodBeforeResults) {
            score -= 10;
            issues.push({
                severity: 'moderate',
                category: 'Structure',
                message: 'Sections may not be in logical order'
            });
        }

        return Math.max(score, 0);
    }

    /**
     * Assess formatting quality
     */
    private assessFormatting(
        text: string,
        wordCount: number,
        issues: QualityMetrics['issues'],
        recommendations: QualityMetrics['recommendations']
    ): number {
        let score = 100;

        // Check word count (typical research paper: 3000-8000 words)
        if (wordCount < 2000) {
            score -= 30;
            issues.push({
                severity: 'critical',
                category: 'Formatting',
                message: `Word count (${wordCount}) is below minimum recommended length`
            });
            recommendations.push({
                priority: 'high',
                category: 'Content',
                suggestion: 'Expand the manuscript to at least 3000 words'
            });
        } else if (wordCount < 3000) {
            score -= 15;
            issues.push({
                severity: 'moderate',
                category: 'Formatting',
                message: `Word count (${wordCount}) is below typical length for research papers`
            });
        } else if (wordCount > 10000) {
            score -= 10;
            issues.push({
                severity: 'minor',
                category: 'Formatting',
                message: `Word count (${wordCount}) is quite long; consider condensing`
            });
            recommendations.push({
                priority: 'medium',
                category: 'Content',
                suggestion: 'Consider reducing length to improve readability'
            });
        }

        // Check for proper paragraph structure
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
        const avgParagraphLength = wordCount / paragraphs.length;

        if (avgParagraphLength > 200) {
            score -= 10;
            issues.push({
                severity: 'minor',
                category: 'Formatting',
                message: 'Paragraphs are too long on average'
            });
            recommendations.push({
                priority: 'low',
                category: 'Formatting',
                suggestion: 'Break long paragraphs into smaller, more digestible sections'
            });
        }

        return Math.max(score, 0);
    }

    /**
     * Assess readability
     */
    private assessReadability(
        text: string,
        issues: QualityMetrics['issues'],
        recommendations: QualityMetrics['recommendations']
    ): number {
        let score = 100;

        // Calculate average sentence length
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const avgSentenceLength = words.length / sentences.length;

        // Check sentence complexity
        if (avgSentenceLength > 30) {
            score -= 20;
            issues.push({
                severity: 'moderate',
                category: 'Readability',
                message: 'Average sentence length is too long, affecting readability'
            });
            recommendations.push({
                priority: 'medium',
                category: 'Writing',
                suggestion: 'Reduce average sentence length to improve clarity'
            });
        } else if (avgSentenceLength > 25) {
            score -= 10;
            recommendations.push({
                priority: 'low',
                category: 'Writing',
                suggestion: 'Consider shortening some longer sentences'
            });
        }

        // Check for passive voice (simple heuristic)
        const passiveIndicators = text.match(/\b(was|were|been|being)\s+\w+ed\b/gi);
        const passiveRatio = passiveIndicators ? (passiveIndicators.length / sentences.length) * 100 : 0;

        if (passiveRatio > 30) {
            score -= 15;
            issues.push({
                severity: 'moderate',
                category: 'Readability',
                message: 'Excessive use of passive voice detected'
            });
            recommendations.push({
                priority: 'medium',
                category: 'Writing',
                suggestion: 'Use more active voice to improve clarity and engagement'
            });
        }

        // Check for jargon density (words > 12 characters)
        const longWords = words.filter(w => w.length > 12);
        const jargonRatio = (longWords.length / words.length) * 100;

        if (jargonRatio > 15) {
            score -= 10;
            recommendations.push({
                priority: 'low',
                category: 'Writing',
                suggestion: 'Consider simplifying technical terminology where possible'
            });
        }

        return Math.max(score, 0);
    }

    /**
     * Assess completeness
     */
    private assessCompleteness(
        text: string,
        abstractLength: number,
        referenceCount: number,
        issues: QualityMetrics['issues'],
        recommendations: QualityMetrics['recommendations']
    ): number {
        let score = 100;

        // Check abstract length (typical: 150-250 words)
        if (abstractLength < 100) {
            score -= 25;
            issues.push({
                severity: 'critical',
                category: 'Completeness',
                message: `Abstract is too short (${abstractLength} words)`
            });
            recommendations.push({
                priority: 'high',
                category: 'Abstract',
                suggestion: 'Expand abstract to 150-250 words'
            });
        } else if (abstractLength > 300) {
            score -= 10;
            issues.push({
                severity: 'minor',
                category: 'Completeness',
                message: `Abstract is too long (${abstractLength} words)`
            });
            recommendations.push({
                priority: 'medium',
                category: 'Abstract',
                suggestion: 'Condense abstract to 150-250 words'
            });
        }

        // Check reference count
        if (referenceCount < 10) {
            score -= 20;
            issues.push({
                severity: 'moderate',
                category: 'Completeness',
                message: `Insufficient references (${referenceCount} detected)`
            });
            recommendations.push({
                priority: 'high',
                category: 'References',
                suggestion: 'Add more references to support your claims (aim for 20-40)'
            });
        } else if (referenceCount < 15) {
            score -= 10;
            recommendations.push({
                priority: 'medium',
                category: 'References',
                suggestion: 'Consider adding more references to strengthen your literature review'
            });
        }

        // Check for acknowledgments
        if (!/acknowledgment|acknowledgement/i.test(text)) {
            score -= 5;
            recommendations.push({
                priority: 'low',
                category: 'Completeness',
                suggestion: 'Consider adding an acknowledgments section'
            });
        }

        return Math.max(score, 0);
    }
}

export const qualityService = new QualityService();
export default qualityService;
