import React, { useState } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { palette } from "../../config";

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Per favore, inserisci un indirizzo email valido")
    .required("L'email è richiesta"),
  password: Yup.string()
    .min(6, "La password deve contenere almeno 6 caratteri")
    .required("La password è richiesta"),
});

export const LoginScreen: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const handleSubmit = (values: LoginFormValues, { setSubmitting }: any) => {
    // TODO
    setTimeout(() => {
      console.log("Modulo di accesso inviato:", values);
      alert("Accesso effettuato con successo! (Questa è una demo)");
      setSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <main
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#fafafa" }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-8 col-md-6 col-lg-4">
              <section className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="d-flex justify-content-center align-items-center mb-3">
                      <h1 className="h3 mb-0 fw-bold">Instagram</h1>
                    </div>
                    <p className="text-muted mb-0">Accedi al tuo account</p>
                  </div>

                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({
                      isSubmitting,
                      errors,
                      touched,
                      handleSubmit: formikSubmit,
                    }) => (
                      <form onSubmit={formikSubmit} noValidate>
                        {/* Campo Email */}
                        <div className="mb-3">
                          <label
                            htmlFor="email"
                            className="form-label small fw-semibold"
                          >
                            Indirizzo Email
                          </label>
                          <Field
                            type="email"
                            id="email"
                            name="email"
                            className={`form-control ${
                              errors.email && touched.email ? "is-invalid" : ""
                            }`}
                            placeholder="Inserisci la tua email"
                            aria-label="Indirizzo Email"
                            style={{
                              backgroundColor: "#fafafa",
                              border: "1px solid #dbdbdb",
                              fontSize: "14px",
                            }}
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>

                        <div className="mb-3">
                          <label
                            htmlFor="password"
                            className="form-label small fw-semibold"
                          >
                            Password
                          </label>
                          <div className="position-relative">
                            <Field
                              type={showPassword ? "text" : "password"}
                              id="password"
                              name="password"
                              className={`form-control pe-5 ${
                                errors.password && touched.password
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Inserisci la tua password"
                              aria-label="Password"
                              style={{
                                backgroundColor: "#fafafa",
                                border: "1px solid #dbdbdb",
                                fontSize: "14px",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 border-0"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={
                                showPassword
                                  ? "Nascondi password"
                                  : "Mostra password"
                              }
                              style={{ zIndex: 10 }}
                            >
                              {showPassword ? (
                                <EyeOff size={18} color={palette.primary} />
                              ) : (
                                <Eye size={18} color={palette.primary} />
                              )}
                            </button>
                          </div>
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn btn-primary w-100 py-2 fw-semibold"
                          disabled={isSubmitting}
                          style={{
                            backgroundColor: "#0095f6",
                            border: "none",
                            borderRadius: "8px",
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Accesso in corso...
                            </>
                          ) : (
                            "Accedi"
                          )}
                        </button>

                        <div className="text-center mt-3">
                          <a
                            href="#"
                            className="text-decoration-none small"
                            style={{ color: palette.primary }}
                          >
                            Hai dimenticato la password?
                          </a>
                        </div>
                      </form>
                    )}
                  </Formik>
                </div>
              </section>

              <section className="card border-0 shadow-sm mt-3">
                <div className="card-body p-3 text-center">
                  <span className="small text-muted">Non hai un account? </span>
                  <Link
                    to={"/signup"}
                    className="text-decoration-none small fw-semibold"
                    style={{ color: palette.primary }}
                  >
                    Iscriviti
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
