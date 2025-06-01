import React, { useState } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, User, Mail, AtSign, Lock, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { palette } from "../../config";
import { platform } from "os";

interface SignupFormValues {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "Il nome completo deve contenere almeno 2 caratteri")
    .max(50, "Il nome completo deve contenere meno di 50 caratteri")
    .required("Il nome completo è richiesto"),
  username: Yup.string()
    .min(3, "Il nome utente deve contenere almeno 3 caratteri")
    .max(30, "Il nome utente deve contenere meno di 30 caratteri")
    .matches(
      /^[a-zA-Z0-9._]+$/,
      "Il nome utente può contenere solo lettere, numeri, punti e underscore"
    )
    .required("Il nome utente è richiesto"),
  email: Yup.string()
    .email("Inserisci un indirizzo email valido")
    .required("L'email è richiesta"),
  password: Yup.string()
    .min(8, "La password deve contenere almeno 8 caratteri")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La password deve contenere almeno una lettera maiuscola, una minuscola e un numero"
    )
    .required("La password è richiesta"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Le password devono corrispondere")
    .required("Conferma la tua password"),
});

export const SignupScreen: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues: SignupFormValues = {
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = (values: SignupFormValues, { setSubmitting }: any) => {
    // TODO
    setTimeout(() => {
      console.log("Modulo di registrazione inviato:", values);
      alert("Account creato con successo! (Questa è una demo)");
      setSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <main
        className="min-vh-100 d-flex align-items-center justify-content-center py-4"
        style={{ backgroundColor: "#fafafa" }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-8 col-md-6 col-lg-5">
              <section className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="d-flex justify-content-center align-items-center mb-3">
                      <h1 className="h3 mb-0 fw-bold">Instagram</h1>
                    </div>
                    <p className="text-muted mb-0 px-3">
                      Iscriviti per vedere foto e video dai tuoi amici.
                    </p>
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
                        {/* Campo Nome Completo */}
                        <div className="mb-3">
                          <div className="position-relative">
                            <User
                              size={18}
                              className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                            />
                            <Field
                              type="text"
                              id="fullName"
                              name="fullName"
                              className={`form-control ps-5 ${
                                errors.fullName && touched.fullName
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Nome Completo"
                              aria-label="Nome Completo"
                              style={{
                                backgroundColor: "#fafafa",
                                border: "1px solid #dbdbdb",
                                fontSize: "14px",
                              }}
                            />
                          </div>
                          <ErrorMessage
                            name="fullName"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>

                        <div className="mb-3">
                          <div className="position-relative">
                            <AtSign
                              size={18}
                              className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                            />
                            <Field
                              type="text"
                              id="username"
                              name="username"
                              className={`form-control ps-5 ${
                                errors.username && touched.username
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Nome Utente"
                              aria-label="Nome Utente"
                              style={{
                                backgroundColor: "#fafafa",
                                border: "1px solid #dbdbdb",
                                fontSize: "14px",
                              }}
                            />
                          </div>
                          <ErrorMessage
                            name="username"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>

                        {/* Campo Email */}
                        <div className="mb-3">
                          <div className="position-relative">
                            <Mail
                              size={18}
                              className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                            />
                            <Field
                              type="email"
                              id="email"
                              name="email"
                              className={`form-control ps-5 ${
                                errors.email && touched.email
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Indirizzo Email"
                              aria-label="Indirizzo Email"
                              style={{
                                backgroundColor: "#fafafa",
                                border: "1px solid #dbdbdb",
                                fontSize: "14px",
                              }}
                            />
                          </div>
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>

                        <div className="mb-3">
                          <div className="position-relative">
                            <Lock
                              size={18}
                              className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                            />
                            <Field
                              type={showPassword ? "text" : "password"}
                              id="password"
                              name="password"
                              className={`form-control ps-5 pe-5 ${
                                errors.password && touched.password
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Password"
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
                            className="invalid-feedback d-block"
                          />
                        </div>

                        <div className="mb-3">
                          <div className="position-relative">
                            <Lock
                              size={18}
                              className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                            />
                            <Field
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              name="confirmPassword"
                              className={`form-control ps-5 pe-5 ${
                                errors.confirmPassword &&
                                touched.confirmPassword
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Conferma Password"
                              aria-label="Conferma Password"
                              style={{
                                backgroundColor: "#fafafa",
                                border: "1px solid #dbdbdb",
                                fontSize: "14px",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 border-0"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              aria-label={
                                showConfirmPassword
                                  ? "Nascondi conferma password"
                                  : "Mostra conferma password"
                              }
                              style={{ zIndex: 10 }}
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={18} color={palette.primary} />
                              ) : (
                                <Eye size={18} color={palette.primary} />
                              )}
                            </button>
                          </div>
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="invalid-feedback d-block"
                          />
                        </div>

                        <div className="mb-3">
                          <p className="small text-muted text-center">
                            Iscrivendoti, accetti i nostri{" "}
                            <a
                              href="#"
                              className="text-decoration-none"
                              style={{ color: palette.primary }}
                            >
                              Termini
                            </a>
                            ,{" "}
                            <a
                              href="#"
                              className="text-decoration-none"
                              style={{ color: palette.primary }}
                            >
                              Normativa sui dati
                            </a>{" "}
                            e{" "}
                            <a
                              href="#"
                              className="text-decoration-none"
                              style={{ color: palette.primary }}
                            >
                              Normativa sui cookie
                            </a>
                            .
                          </p>
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
                              Creazione Account...
                            </>
                          ) : (
                            "Iscriviti"
                          )}
                        </button>
                      </form>
                    )}
                  </Formik>
                </div>
              </section>

              <section className="card border-0 shadow-sm mt-3">
                <div className="card-body p-3 text-center">
                  <span className="small text-muted">Hai già un account? </span>
                  <Link
                    to={"/login"}
                    className="text-decoration-none small fw-semibold"
                    style={{ color: palette.primary }}
                  >
                    Accedi
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
