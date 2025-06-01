import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { HomeScreen } from "../pages/Home";
import { NotFoundPage } from "../pages/NotFound";
import { Layout } from "./Layout";
import { LoginScreen } from "../pages/Login";
import { SignupScreen } from "../pages/Signup";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

export const Navigation = () => {
  return <RouterProvider router={router} />;
};
