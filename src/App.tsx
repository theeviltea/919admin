import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DialogProvider } from './components/dialogs';
import { StoreProvider } from './data/store';
import Shell from './layout/Shell';
import { EmployerChecks, VacancyChecks } from './pages/Checks';
import { CompanyDetail, RecruiterDetail, SeekerDetail, VacancyDetail } from './pages/Details';
import { Companies, Seekers, Vacancies } from './pages/Lists';
import Overview from './pages/Overview';
import { ReportPage, Reports } from './pages/Reports';

// The single-file preview runs inside the artifact viewer, which doesn't allow URL changes, so routing stays in memory.
const Router = import.meta.env.MODE === 'preview' ? MemoryRouter : BrowserRouter;

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <DialogProvider>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<Overview />} />
              <Route path="checks" element={<Navigate to="/checks/employers" replace />} />
              <Route path="checks/employers" element={<EmployerChecks />} />
              <Route path="checks/employers/:id" element={<CompanyDetail review />} />
              <Route path="checks/vacancies" element={<VacancyChecks />} />
              <Route path="checks/vacancies/:id" element={<VacancyDetail review />} />
              <Route path="seekers" element={<Seekers />} />
              <Route path="seekers/:id" element={<SeekerDetail />} />
              <Route path="companies" element={<Companies />} />
              <Route path="companies/:id" element={<CompanyDetail />} />
              <Route path="recruiters/:id" element={<RecruiterDetail />} />
              <Route path="vacancies" element={<Vacancies />} />
              <Route path="vacancies/:id" element={<VacancyDetail />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/:id" element={<ReportPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </DialogProvider>
      </Router>
    </StoreProvider>
  );
}
