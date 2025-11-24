import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { editorService } from '@/services/editorService';
import { Submission } from '@/types';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';

const SubmissionChecks: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [plagiarismResult, setPlagiarismResult] = useState<any>(null);
    const [qualityResult, setQualityResult] = useState<any>(null);
    const [grammarResult, setGrammarResult] = useState<any>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'plagiarism' | 'quality' | 'grammar'>('plagiarism');

    useEffect(() => {
        if (id) {
            loadSubmission();
        }
    }, [id]);

    const loadSubmission = async () => {
        try {
            const data = await editorService.getSubmissionForEditor(id!);
            setSubmission(data);
            // Initialize results if they exist in the submission data
            // Note: The API might need to be updated to return these or we fetch them separately
            // For now, we'll assume they might be passed or we re-run/fetch them
            // In a real implementation, we should fetch existing check results
        } catch (error) {
            console.error('Failed to load submission:', error);
            setMessage({ text: 'Failed to load submission', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const runPlagiarismCheck = async () => {
        if (!id) return;
        setProcessing(true);
        try {
            const result = await editorService.runPlagiarismCheck(id);
            setPlagiarismResult(result);
            setMessage({ text: 'Plagiarism check completed', type: 'success' });
        } catch (error) {
            console.error('Plagiarism check failed:', error);
            setMessage({ text: 'Plagiarism check failed', type: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const runQualityCheck = async () => {
        if (!id) return;
        setProcessing(true);
        try {
            const result = await editorService.performQualityCheck(id);
            setQualityResult(result);
            setMessage({ text: 'Quality check completed', type: 'success' });
        } catch (error) {
            console.error('Quality check failed:', error);
            setMessage({ text: 'Quality check failed', type: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const runGrammarCheck = async () => {
        if (!id) return;
        setProcessing(true);
        try {
            const result = await editorService.runGrammarCheck(id);
            setGrammarResult(result);
            setMessage({ text: 'Grammar check completed', type: 'success' });
        } catch (error) {
            console.error('Grammar check failed:', error);
            setMessage({ text: 'Grammar check failed', type: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="min-h-screen bg-secondary-50 p-8">
                <Alert variant="error" title="Error">Submission not found</Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="bg-white border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 -ml-2" size="sm">
                                ← Back
                            </Button>
                            <h1 className="text-2xl font-bold text-secondary-900">Submission Checks</h1>
                            <p className="text-secondary-600">{submission.title}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {message && (
                    <Alert
                        variant={message.type === 'success' ? 'success' : 'error'}
                        title={message.type === 'success' ? 'Success' : 'Error'}
                        className="mb-6"
                        onClose={() => setMessage(null)}
                    >
                        {message.text}
                    </Alert>
                )}

                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-secondary-200">
                        <nav className="-mb-px flex" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('plagiarism')}
                                className={`${activeTab === 'plagiarism'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                                    } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                            >
                                Plagiarism Check
                            </button>
                            <button
                                onClick={() => setActiveTab('quality')}
                                className={`${activeTab === 'quality'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                                    } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                            >
                                Quality Assessment
                            </button>
                            <button
                                onClick={() => setActiveTab('grammar')}
                                className={`${activeTab === 'grammar'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                                    } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                            >
                                Grammar & Spelling
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'plagiarism' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-secondary-900">Plagiarism Report</h2>
                                    <Button onClick={runPlagiarismCheck} disabled={processing}>
                                        {plagiarismResult ? 'Re-run Check' : 'Run Check'}
                                    </Button>
                                </div>

                                {plagiarismResult ? (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-blue-900">Similarity Score</span>
                                                <span className={`text-2xl font-bold ${plagiarismResult.similarity > 20 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {plagiarismResult.similarity.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        {/* Detailed results would go here */}
                                        {plagiarismResult.matchedSources?.length > 0 && (
                                            <div className="border rounded-lg overflow-hidden">
                                                <table className="min-w-full divide-y divide-secondary-200">
                                                    <thead className="bg-secondary-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Source</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Similarity</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-secondary-200">
                                                        {plagiarismResult.matchedSources.map((source: any, idx: number) => (
                                                            <tr key={idx}>
                                                                <td className="px-6 py-4 text-sm text-secondary-900">{source.source}</td>
                                                                <td className="px-6 py-4 text-sm text-secondary-500">{source.similarity.toFixed(1)}%</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-secondary-500">
                                        No plagiarism check results available. Run a check to see the report.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'quality' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-secondary-900">Quality Assessment Report</h2>
                                    <Button onClick={runQualityCheck} disabled={processing}>
                                        {qualityResult ? 'Re-run Assessment' : 'Run Assessment'}
                                    </Button>
                                </div>

                                {qualityResult ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <div className="text-sm text-purple-900 font-medium">Overall Score</div>
                                                <div className="text-2xl font-bold text-purple-700">{qualityResult.score}/100</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="text-sm text-secondary-700 font-medium">Structure</div>
                                                <div className="text-xl font-semibold text-secondary-900">{qualityResult.metrics?.structure}/100</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="text-sm text-secondary-700 font-medium">Formatting</div>
                                                <div className="text-xl font-semibold text-secondary-900">{qualityResult.metrics?.formatting}/100</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="text-sm text-secondary-700 font-medium">Readability</div>
                                                <div className="text-xl font-semibold text-secondary-900">{qualityResult.metrics?.readability}/100</div>
                                            </div>
                                        </div>

                                        {qualityResult.issues?.length > 0 && (
                                            <div>
                                                <h3 className="font-medium text-secondary-900 mb-3">Identified Issues</h3>
                                                <div className="space-y-2">
                                                    {qualityResult.issues.map((issue: any, idx: number) => (
                                                        <div key={idx} className="flex items-start p-3 bg-red-50 rounded text-sm">
                                                            <span className="mr-2">⚠️</span>
                                                            <span className="text-red-800">{issue.message}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-secondary-500">
                                        No quality assessment results available. Run an assessment to see the report.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'grammar' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-secondary-900">Grammar & Spelling Report</h2>
                                    <Button onClick={runGrammarCheck} disabled={processing}>
                                        {grammarResult ? 'Re-run Check' : 'Run Check'}
                                    </Button>
                                </div>

                                {grammarResult ? (
                                    <div className="space-y-6">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-green-900">Grammar Score</span>
                                                <span className="text-2xl font-bold text-green-700">{grammarResult.score}/100</span>
                                            </div>
                                            <p className="text-green-800 text-sm">{grammarResult.summary}</p>
                                        </div>

                                        {grammarResult.errorBreakdown && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="border p-3 rounded text-center">
                                                    <div className="text-2xl font-bold text-secondary-900">{grammarResult.errorBreakdown.grammar}</div>
                                                    <div className="text-xs text-secondary-500 uppercase">Grammar</div>
                                                </div>
                                                <div className="border p-3 rounded text-center">
                                                    <div className="text-2xl font-bold text-secondary-900">{grammarResult.errorBreakdown.spelling}</div>
                                                    <div className="text-xs text-secondary-500 uppercase">Spelling</div>
                                                </div>
                                                <div className="border p-3 rounded text-center">
                                                    <div className="text-2xl font-bold text-secondary-900">{grammarResult.errorBreakdown.punctuation}</div>
                                                    <div className="text-xs text-secondary-500 uppercase">Punctuation</div>
                                                </div>
                                                <div className="border p-3 rounded text-center">
                                                    <div className="text-2xl font-bold text-secondary-900">{grammarResult.errorBreakdown.style}</div>
                                                    <div className="text-xs text-secondary-500 uppercase">Style</div>
                                                </div>
                                            </div>
                                        )}

                                        {grammarResult.errors?.length > 0 && (
                                            <div>
                                                <h3 className="font-medium text-secondary-900 mb-3">Detailed Errors</h3>
                                                <div className="space-y-3">
                                                    {grammarResult.errors.map((error: any, idx: number) => (
                                                        <div key={idx} className="border border-yellow-200 rounded p-3 hover:bg-yellow-50 transition-colors">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="text-xs font-bold text-yellow-800 uppercase tracking-wide">{error.category}</span>
                                                            </div>
                                                            <p className="text-secondary-800 text-sm mb-2">{error.message}</p>
                                                            <div className="flex items-center gap-3 text-sm">
                                                                <span className="text-red-600 line-through decoration-red-600/50">{error.bad}</span>
                                                                <span className="text-secondary-400">→</span>
                                                                <span className="text-green-600 font-medium">{error.suggestions?.join(', ')}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-secondary-500">
                                        No grammar check results available. Run a check to see the report.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionChecks;
