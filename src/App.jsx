import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate, Outlet, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import StudyDetails from "./pages/StudyDetails";
import PublicUser from "./pages/PublicUser";
import Researcher from "./pages/Researcher";
import PolicyMaker from "./pages/PolicyMaker";
import GovAgency from "./pages/GovAgency";
import Institution from "./pages/Institution";
import IndustryExpert from "./pages/IndustryExpert";
import Admin from "./pages/Admin";
import BhoomiAI from "./components/BhoomiAI";
import { ROLES } from "./roles";

function RootLayout() {
  const location = useLocation();
  const segment = location.pathname.replace(/^\//, "").split("/")[0];
  const role = ROLES[segment] ? segment : "public";

  return (
    <>
      <Outlet />
      <BhoomiAI key={role} role={role} />
    </>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="" element={<LandingPage />} />
      <Route path="study/:id" element={<StudyDetails />} />
      <Route path="public" element={<PublicUser />} />
      <Route path="researcher" element={<Researcher />} />
      <Route path="policymaker" element={<PolicyMaker />} />
      <Route path="agency" element={<GovAgency />} />
      <Route path="academic" element={<Institution />} />
      <Route path="industry" element={<IndustryExpert />} />
      <Route path="admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}