import { Routes, Route } from 'react-router-dom';
import PublicSite from './pages/PublicSite';
import AdminPage from './pages/AdminPage';
import { SetupBanner } from './components/SetupBanner';

export default function App() {
  return (
    <>
      <SetupBanner />
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </>
  );
}
