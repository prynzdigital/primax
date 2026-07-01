import { Routes, Route } from 'react-router-dom';
import PublicSite from './pages/PublicSite';
import GetQuotePage from './pages/GetQuotePage';
import AdminPage from './pages/AdminPage';
import { SetupBanner } from './components/SetupBanner';

export default function App() {
  return (
    <>
      <SetupBanner />
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/get-quote" element={<GetQuotePage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </>
  );
}
