import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LibraryPage } from './pages/LibraryPage';
import { ArticlePage } from './pages/ArticlePage';
import { DashboardPage } from './pages/DashboardPage';
import { TrackerPage } from './pages/TrackerPage';
import { SymptomsPage } from './pages/SymptomsPage';
import { AssistantPage } from './pages/AssistantPage';
import { CommunityPage } from './pages/CommunityPage';
import { FindCarePage } from './pages/FindCarePage';
import { PregnancyPage } from './pages/PregnancyPage';
import { InsightsPage } from './pages/InsightsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MedsTrackerPage } from './pages/MedsTrackerPage';
import { SharingPage } from './pages/SharingPage';
import { TeenModePage } from './pages/TeenModePage';
import { DoctorSummaryPage } from './pages/DoctorSummaryPage';
import { ShareViewPage } from './pages/ShareViewPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/share/:shareId" element={<ShareViewPage />} />
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/library/:articleId" element={<ArticlePage />} />
              </Route>

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Authenticated */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tracker" element={<TrackerPage />} />
                <Route path="/tracker/symptoms" element={<SymptomsPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/care/find" element={<FindCarePage />} />
                <Route path="/pregnancy" element={<PregnancyPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/meds" element={<MedsTrackerPage />} />
                <Route path="/sharing" element={<SharingPage />} />
                <Route path="/teen" element={<TeenModePage />} />
                <Route path="/doctor-summary" element={<DoctorSummaryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
