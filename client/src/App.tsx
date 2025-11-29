import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingFallback from '@/components/ui/LoadingFallback';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public Pages
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const Invoice = lazy(() => import('@/pages/public/Invoice'));
const ReviewerCertificate = lazy(() => import('@/pages/public/ReviewerCertificate'));
const CurrentIssue = lazy(() => import('@/pages/CurrentIssue'));
const Archive = lazy(() => import('@/pages/Archive'));
const ArticlePage = lazy(() => import('@/pages/ArticlePage'));
const IssuePage = lazy(() => import('@/pages/IssuePage'));
const BrowseIssues = lazy(() => import('@/pages/BrowseIssues'));
const ArticleView = lazy(() => import('@/pages/ArticleView'));
const Search = lazy(() => import('@/pages/Search'));
const About = lazy(() => import('@/pages/About'));
const Mission = lazy(() => import('@/pages/Mission'));
const Vision = lazy(() => import('@/pages/Vision'));
const AimScope = lazy(() => import('@/pages/AimScope'));
const ProcessingCharge = lazy(() => import('@/pages/ProcessingCharge'));
const Indexing = lazy(() => import('@/pages/Indexing'));
const CallForPaper = lazy(() => import('@/pages/CallForPaper'));
const Contact = lazy(() => import('@/pages/Contact'));
const AuthorGuidelines = lazy(() => import('@/pages/AuthorGuidelines'));
const PeerReview = lazy(() => import('@/pages/PeerReview'));
const EditorialBoard = lazy(() => import('@/pages/EditorialBoard'));
const StyleGuide = lazy(() => import('@/pages/StyleGuide'));

// Protected Pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const Notifications = lazy(() => import('@/pages/Notifications'));

// Author Pages
const SubmitPaper = lazy(() => import('@/pages/author/SubmitPaper'));
const SubmissionDetails = lazy(() => import('@/pages/author/SubmissionDetails'));
const SubmitRevision = lazy(() => import('@/pages/author/SubmitRevision'));
const PaymentPage = lazy(() => import('@/pages/author/PaymentPage'));
const ProofReview = lazy(() => import('@/pages/author/ProofReview'));

// Editor Pages
const SubmissionScreening = lazy(() => import('@/pages/editor/SubmissionScreening'));
const SubmissionChecks = lazy(() => import('@/pages/editor/SubmissionChecks'));
const ReviewerAssignment = lazy(() => import('@/pages/editor/ReviewerAssignment'));
const ReviewTracking = lazy(() => import('@/pages/editor/ReviewTracking'));
const EditorialDecision = lazy(() => import('@/pages/editor/EditorialDecision'));
const RevisionHandling = lazy(() => import('@/pages/editor/RevisionHandling'));
const ProductionWorkflow = lazy(() => import('@/pages/editor/ProductionWorkflow'));
const EditorNotifications = lazy(() => import('@/pages/editor/EditorNotifications'));
const EditorReviewDetail = lazy(() => import('@/pages/editor/EditorReviewDetail'));

// Reviewer Pages
const ReviewInvitation = lazy(() => import('@/pages/reviewer/ReviewInvitation'));
const ReviewForm = lazy(() => import('@/pages/reviewer/ReviewForm'));
const ReviewConfirmation = lazy(() => import('@/pages/reviewer/ReviewConfirmation'));
const PendingInvitations = lazy(() => import('@/pages/reviewer/PendingInvitations'));

// Admin Pages
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const SystemSettings = lazy(() => import('@/pages/admin/SystemSettings'));
const IssueManagement = lazy(() => import('@/pages/admin/IssueManagement'));
const PaymentManagement = lazy(() => import('@/pages/admin/PaymentManagement'));
const PaymentDetails = lazy(() => import('@/pages/admin/PaymentDetails'));
const PaymentSettings = lazy(() => import('@/pages/admin/PaymentSettings'));
const SystemMonitoring = lazy(() => import('@/pages/admin/SystemMonitoring'));
const ComplaintHandling = lazy(() => import('@/pages/admin/ComplaintHandling'));
const ReportGeneration = lazy(() => import('@/pages/admin/ReportGeneration'));
const SubmissionAnalytics = lazy(() => import('@/pages/admin/SubmissionAnalytics'));
const AdminSubmissionDetails = lazy(() => import('@/pages/admin/AdminSubmissionDetails'));
const LandingPageEditor = lazy(() => import('@/pages/admin/LandingPageEditor'));
const PageContentEditor = lazy(() => import('@/pages/admin/PageContentEditor'));
const PublicationDashboard = lazy(() => import('@/pages/admin/PublicationDashboard'));
const ConferenceManagement = lazy(() => import('@/pages/admin/ConferenceManagement'));
const BackupManagement = lazy(() => import('@/pages/admin/BackupManagement'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Separate component to use hooks that depend on Router context
const AppContent: React.FC = () => {
  // Initialize Google Analytics and track page views
  useGoogleAnalytics();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main id="main-content" role="main" className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/invoice/:paymentId" element={<Invoice />} />
            <Route path="/certificate/:reviewId" element={<ReviewerCertificate />} />
            <Route path="/current-issue" element={<CurrentIssue />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/issue/:id" element={<IssuePage />} />
            <Route path="/browse" element={<BrowseIssues />} />
            <Route path="/article-view/:id" element={<ArticleView />} />
            <Route path="/search" element={<Search />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/mission" element={<Mission />} />
            <Route path="/about/vision" element={<Vision />} />
            <Route path="/aim-scope" element={<AimScope />} />
            <Route path="/processing-charge" element={<ProcessingCharge />} />
            <Route path="/indexing" element={<Indexing />} />
            <Route path="/call-for-paper" element={<CallForPaper />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/author-guidelines" element={<AuthorGuidelines />} />
            <Route path="/peer-review" element={<PeerReview />} />
            <Route path="/editorial-board" element={<EditorialBoard />} />
            <Route path="/style-guide" element={<StyleGuide />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-paper"
              element={
                <ProtectedRoute>
                  <SubmitPaper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-paper/:id"
              element={
                <ProtectedRoute>
                  <SubmitPaper />
                </ProtectedRoute>
              }
            />
            {/* Author Routes */}
            <Route
              path="/submission/:id"
              element={
                <ProtectedRoute>
                  <SubmissionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/author/submissions/:id"
              element={
                <ProtectedRoute>
                  <SubmissionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submission/:id/revise"
              element={
                <ProtectedRoute>
                  <SubmitRevision />
                </ProtectedRoute>
              }
            />
            <Route
              path="/author/submissions/:id/revise"
              element={
                <ProtectedRoute>
                  <SubmitRevision />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submission/:id/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/author/submissions/:id/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submission/:id/proof"
              element={
                <ProtectedRoute>
                  <ProofReview />
                </ProtectedRoute>
              }
            />

            {/* Editor Routes */}
            <Route
              path="/editor/submission/:id/screen"
              element={
                <ProtectedRoute>
                  <SubmissionScreening />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/submission/:id/checks"
              element={
                <ProtectedRoute>
                  <SubmissionChecks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/submission/:id/assign-reviewers"
              element={
                <ProtectedRoute>
                  <ReviewerAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/submission/:id/reviews"
              element={
                <ProtectedRoute>
                  <ReviewTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/submission/:id/decision"
              element={
                <ProtectedRoute>
                  <EditorialDecision />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/submission/:id/revision"
              element={
                <ProtectedRoute>
                  <RevisionHandling />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/production"
              element={
                <ProtectedRoute>
                  <ProductionWorkflow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/decisions"
              element={
                <ProtectedRoute>
                  <ReviewTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/submissions"
              element={
                <ProtectedRoute>
                  <ReviewTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/submission/:id/notifications"
              element={
                <ProtectedRoute>
                  <EditorNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/submissions/new"
              element={
                <ProtectedRoute>
                  <SubmissionScreening />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/reviewers"
              element={
                <ProtectedRoute>
                  <ReviewerAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/review/:id"
              element={
                <ProtectedRoute>
                  <EditorReviewDetail />
                </ProtectedRoute>
              }
            />

            {/* Reviewer Routes */}
            <Route
              path="/reviewer/invitations"
              element={
                <ProtectedRoute>
                  <PendingInvitations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/:reviewId"
              element={
                <ProtectedRoute>
                  <ReviewForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/:reviewId/confirmation"
              element={
                <ProtectedRoute>
                  <ReviewConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review-invitation/:reviewId"
              element={
                <ProtectedRoute>
                  <ReviewInvitation />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <SystemSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/issues"
              element={
                <ProtectedRoute>
                  <IssueManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute>
                  <PaymentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments/settings"
              element={
                <ProtectedRoute>
                  <PaymentSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments/:id"
              element={
                <ProtectedRoute>
                  <PaymentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/monitoring"
              element={
                <ProtectedRoute>
                  <SystemMonitoring />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute>
                  <ComplaintHandling />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <ReportGeneration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/submissions"
              element={
                <ProtectedRoute>
                  <SubmissionAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/submission/:id/details"
              element={
                <ProtectedRoute>
                  <AdminSubmissionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/landing-page"
              element={
                <ProtectedRoute>
                  <LandingPageEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/publications"
              element={
                <ProtectedRoute>
                  <PublicationDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/issues"
              element={
                <ProtectedRoute>
                  <IssueManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/conferences"
              element={
                <ProtectedRoute>
                  <ConferenceManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/page-content"
              element={
                <ProtectedRoute>
                  <PageContentEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/backups"
              element={
                <ProtectedRoute>
                  <BackupManagement />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div >
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider >
  );
}

const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-secondary-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-secondary-900 mb-4">404</h1>
      <p className="text-xl text-secondary-600 mb-8">Page not found</p>
      <a
        href="/"
        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Go back home
      </a>
    </div>
  </div>
);

export default App;