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
import { GuestRoute, PrivateRoute } from "./wrappers";
import { ProfileScreen } from "../components/Profile";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomeScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <PrivateRoute>
            <ProfileScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginScreen />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignupScreen />
          </GuestRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

export const Navigation = () => {
  return <RouterProvider router={router} />;
};
