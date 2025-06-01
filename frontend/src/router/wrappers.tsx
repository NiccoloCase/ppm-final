import { Navigate } from "react-router-dom";
import React, { useEffect } from "react";
import { useStore } from "../store";
import { Container } from "react-bootstrap";
import PulseLoader from "react-spinners/PulseLoader";
import { palette } from "../config";

/**
 * Wrapper per le rotte che devono essere disponibili solo agli utenti non autenticati
 */
export const GuestRoute: React.FC<any> = ({ children }) => {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

/**
 * Wrapper per le rotte che devono essere disponibili solo agli utenti autenticati
 */
export const PrivateRoute: React.FC<any> = ({ children }) => {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const isLoading = useStore((s) => s.isLoading);

  useEffect(() => {
    console.log("[PrivateRoute] Stato isAuthenticated cambiato:", {
      isAuthenticated,
      isLoading,
    });
  }, [isAuthenticated, isLoading]);

  return isLoading && !isAuthenticated ? (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <PulseLoader color={palette.darkGrey} loading={true} size={15} />
    </Container>
  ) : isAuthenticated === false ? (
    <Navigate to={`/login`} replace />
  ) : (
    children
  );
};
