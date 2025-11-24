import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionService } from '@/services/submissionService';
import { Submission, SubmissionStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Timeline from '@/components/submission/Timeline';
import InfoSection from '@/components/ui/InfoSection';
import InfoField from '@/components/ui/InfoField';
import StatusCard from '@/components/ui/StatusCard';
import SubmissionProgress from '@/components/submission/SubmissionProgress';
import { FileText, Download, AlertTriangle, CheckCircle, File, Clock, User, Shield } from 'lucide-react';

const SubmissionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'reviews' | 'history' | 'reports'>('overview');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSubmission();
    }
  }, [id]);

  const loadSubmission = async () => {
    try {
      const data = await submissionService.getSubmission(id!);
      setSubmission(data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    if (!id) return;

    setDownloadError(null);
    try {
      await submissionService.downloadFile(id, fileId);
    } catch (error) {
      console.error('Failed to download file:', error);
      setDownloadError('Failed to download file. Please try again.');
    }
  };

  const getStatusBadgeVariant = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.SUBMITTED:
      case SubmissionStatus.INITIAL_REVIEW:
        return 'info';
      case SubmissionStatus.UNDER_REVIEW:
        return 'warning';
      case SubmissionStatus.REVISION_REQUIRED:
        return 'warning';
      case SubmissionStatus.ACCEPTED:
        return 'success';
      case SubmissionStatus.PUBLISHED:
        return 'success';
      case SubmissionStatus.REJECTED:
        return 'error';
      default:
        return 'neutral';
    }
  };

  const formatStatus = (status: SubmissionStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusDescription = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.SUBMITTED:
        return 'Your manuscript has been submitted and is awaiting initial review by the editor.';
      case SubmissionStatus.RETURNED_FOR_FORMATTING:
        return 'Your manuscript has been returned for formatting corrections. Please address the issues and resubmit.';
      case SubmissionStatus.INITIAL_REVIEW:
        return 'The editor is conducting an initial review to check formatting, scope, and plagiarism.';
      case SubmissionStatus.UNDER_REVIEW:
        return 'Your manuscript is currently under peer review. Reviewers are evaluating your work.';
      case SubmissionStatus.REVISION_REQUIRED:
        return 'Reviewers have requested revisions. Please address their comments and resubmit.';
      case SubmissionStatus.ACCEPTED:
        return 'Congratulations! Your manuscript has been accepted for publication. Please proceed with payment if required.';
      case SubmissionStatus.PAYMENT_PENDING:
        return 'Your manuscript is accepted! Please complete the payment to proceed with publication.';
      case SubmissionStatus.PUBLISHED:
        return 'Your manuscript has been published and is now available online.';
      case SubmissionStatus.REJECTED:
        return 'Unfortunately, your manuscript was not accepted for publication.';
      default:
        return 'Status information not available.';
    }
  };

  // ... existing useEffect and loadSubmission ...

  // ... existing handleDownload ...

  // ... existing helper functions ...

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-secondary-600 mt-2">Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="error" title="Error">
          {error || 'Submission not found'}
        </Alert>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Clean Academic Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 -ml-2"
            size="sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight break-words">
                {submission.title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {getStatusDescription(submission.status)}
              </p>
            </div>
            <div className="flex-shrink-0 self-start">
              <Badge
                variant={getStatusBadgeVariant(submission.status)}
                className="text-sm px-4 py-1.5"
              >
                {formatStatus(submission.status)}
              </Badge>
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="mt-8">
            <SubmissionProgress status={submission.status} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {downloadError && (
          <Alert variant="error" title="Download Error" className="mb-6" onClose={() => setDownloadError(null)}>
            {downloadError}
          </Alert>
        )}

        {/* Status Actions */}
        {(submission.status === SubmissionStatus.REVISION_REQUIRED ||
          submission.status === SubmissionStatus.ACCEPTED ||
          submission.status === SubmissionStatus.PAYMENT_PENDING ||
          (submission.status === SubmissionStatus.PUBLISHED && submission.doi)) && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                {submission.status === SubmissionStatus.REVISION_REQUIRED && (
                  <Button
                    onClick={() => navigate(`/author/submissions/${submission.id}/revise`)}
                  >
                    Submit Revision
                  </Button>
                )}
                {(submission.status === SubmissionStatus.ACCEPTED || submission.status === SubmissionStatus.PAYMENT_PENDING) && (
                  <Button
                    onClick={() => navigate(`/author/submissions/${submission.id}/payment`)}
                  >
                    Pay Publication Fee
                  </Button>
                )}
                {submission.status === SubmissionStatus.PUBLISHED && (submission.article?.id || submission.doi) && (
                  <Button
                    onClick={() => navigate(`/article/${submission.article?.id || submission.doi}`)}
                    variant="outline"
                  >
                    View Published Article
                  </Button>
                )}
              </div>
            </div>
          )}

        {/* Editor Decision Section */}
        {submission.decisionComments && (
          <div className="mb-8 bg-white border border-l-4 border-l-primary-600 rounded-r-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Editor Decision
              </h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {submission.decisionComments}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 min-w-max px-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`${activeTab === 'files'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`${activeTab === 'reviews'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Peer Reviews
              {submission.reviews && submission.reviews.length > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'reviews' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                  {submission.reviews.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              History
            </button>
            {(submission.plagiarismChecks?.length || submission.qualityAssessments?.length || submission.grammarChecks?.length) ? (
              <button
                onClick={() => setActiveTab('reports')}
                className={`${activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Reports
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-blue-100 text-blue-600">New</span>
              </button>
            ) : null}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <InfoSection
                  title="Abstract"
                  subtitle="Research summary and key findings"
                >
                  <p className="text-foreground leading-relaxed prose-academic">{submission.abstract}</p>
                </InfoSection>

                <InfoSection
                  title="Manuscript Information"
                  subtitle="Key details about your submission"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                      label="Type"
                      value={submission.manuscriptType}
                    />
                    <InfoField
                      label="Keywords"
                      value={
                        <div className="flex flex-wrap gap-2 mt-2">
                          {submission.keywords.map((keyword, index) => (
                            <span key={index} className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md text-xs font-medium border border-primary-100">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      }
                    />
                    <InfoField
                      label="Submitted"
                      value={new Date(submission.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                    {submission.doi && (
                      <InfoField
                        label="DOI"
                        value={<code className="text-sm font-mono break-all bg-gray-50 px-2 py-1 rounded">{submission.doi}</code>}
                      />
                    )}
                  </div>
                </InfoSection>
              </div>

              <div className="space-y-6">
                <InfoSection
                  title="Authors"
                  subtitle="Research team"
                  accent
                >
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-primary-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                        <p className="font-semibold text-foreground">
                          {submission.author.firstName} {submission.author.lastName}
                        </p>
                      </div>
                      <div className="ml-4 space-y-1">
                        <span className="inline-block text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-medium mb-1">
                          Corresponding Author
                        </span>
                        <p className="text-sm text-muted-foreground">{submission.author.email}</p>
                        {submission.author.affiliation && (
                          <p className="text-sm text-muted-foreground">{submission.author.affiliation}</p>
                        )}
                      </div>
                    </div>
                    {submission.coAuthors.map((author, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <p className="font-semibold text-foreground">
                            {author.firstName} {author.lastName}
                          </p>
                        </div>
                        <div className="ml-4 space-y-1">
                          {author.isCorresponding && (
                            <span className="inline-block text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-medium mb-1">
                              Corresponding Author
                            </span>
                          )}
                          <p className="text-sm text-muted-foreground">{author.email}</p>
                          {author.affiliation && (
                            <p className="text-sm text-muted-foreground">{author.affiliation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </InfoSection>
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <InfoSection
              title="Submission Files"
              subtitle="Manuscript and supporting documents"
            >
              {submission.files && submission.files.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {submission.files.map((file) => (
                    <div key={file.id} className="group flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 mb-1">{file.originalName}</p>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="uppercase font-semibold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{file.fileType}</span>
                            <span>•</span>
                            <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          {file.description && (
                            <p className="text-sm text-slate-500 mt-1 italic">{file.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.id)}
                        className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <File className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">No files uploaded</h3>
                  <p className="text-slate-500 mt-1">This submission has no attached files.</p>
                </div>
              )}
            </InfoSection>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <InfoSection
              title="Peer Reviews"
              subtitle="Feedback from reviewers"
            >
              {submission.reviews && submission.reviews.length > 0 ? (
                <div className="space-y-6">
                  {submission.reviews.map((review, index) => (
                    <div key={review.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shadow-sm">
                            #{index + 1}
                          </span>
                          Reviewer Feedback
                        </h3>
                        <Badge variant={review.status === 'COMPLETED' ? 'success' : 'warning'}>
                          {review.status}
                        </Badge>
                      </div>
                      <div className="p-6 space-y-6">
                        {review.recommendation && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommendation</h4>
                            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                              {review.recommendation.replace(/_/g, ' ')}
                            </div>
                          </div>
                        )}

                        {review.authorComments ? (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Comments for Author</h4>
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {review.authorComments}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500 italic flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            No written comments provided.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <User className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">No Reviews Yet</h3>
                  <p className="text-slate-500 mt-1 max-w-sm mx-auto">Peer reviews will appear here once reviewers have completed their evaluation of your manuscript.</p>
                </div>
              )}
            </InfoSection>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <InfoSection
              title="Submission History"
              subtitle="Timeline of events"
            >
              {submission.timeline && submission.timeline.length > 0 ? (
                <Timeline events={submission.timeline} />
              ) : (
                <div className="text-center py-8 text-slate-500">No history available</div>
              )}
            </InfoSection>
          )}
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <InfoSection
              title="Automated Check Reports"
              subtitle="Reports shared by reviewers"
            >
              <div className="space-y-6">
                {submission.plagiarismChecks && submission.plagiarismChecks.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-blue-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Plagiarism Check Report</h3>
                    </div>
                    <div className="p-6">
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-600 font-medium">Similarity Score</span>
                          <span className={`text-2xl font-bold ${submission.plagiarismChecks[0].similarity > 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {submission.plagiarismChecks[0].similarity.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${submission.plagiarismChecks[0].similarity > 20 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(submission.plagiarismChecks[0].similarity, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                          {submission.plagiarismChecks[0].similarity > 20
                            ? 'High similarity detected. Please review citations.'
                            : 'Similarity score is within acceptable limits.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {submission.qualityAssessments && submission.qualityAssessments.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-purple-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Quality Assessment Report</h3>
                    </div>
                    <div className="p-6">
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-600 font-medium">Overall Score</span>
                          <span className="text-2xl font-bold text-purple-600">
                            {submission.qualityAssessments[0].score}/100
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(submission.qualityAssessments[0].score, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {submission.grammarChecks && submission.grammarChecks.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-emerald-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Grammar & Spelling Report</h3>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-600 font-medium">Grammar Score</span>
                          <span className="text-2xl font-bold text-emerald-600">
                            {submission.grammarChecks[0].score}/100
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(submission.grammarChecks[0].score, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-slate-700">{submission.grammarChecks[0].summary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(!submission.plagiarismChecks?.length && !submission.qualityAssessments?.length && !submission.grammarChecks?.length) && (
                  <div className="text-center py-16 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Shield className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No Reports Available</h3>
                    <p className="text-slate-500 mt-1">No automated check reports have been shared with you yet.</p>
                  </div>
                )}
              </div>
            </InfoSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
