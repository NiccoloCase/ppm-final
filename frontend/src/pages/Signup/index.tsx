import React, { useState } from "react";
import { useFormik } from "formik"; // Import useFormik
import * as Yup from "yup";
import { Eye, EyeOff, User, Mail, AtSign, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { palette } from "../../config";
import { useStore } from "../../store";
import { enqueueSnackbar } from "notistack";

interface SignupFormValues {
  bio: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  bio: Yup.string()
    .max(150, "La biografia deve contenere meno di 150 caratteri")
    .required("La biografia è richiesta"),

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
  const register = useStore((state) => state.register);

  const formik = useFormik<SignupFormValues>({
    initialValues: {
      bio: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const res = await register(
          values.email,
          values.password,
          values.confirmPassword,
          values.username,
          values.bio
        );
        if (!res.success) {
          if (res.usernameAlreadyExists) {
            enqueueSnackbar("Il nome utente è già in uso.", {
              variant: "error",
              autoHideDuration: 3000,
            });
          } else if (res.emailAlreadyExists) {
            enqueueSnackbar("L'email è già in uso.", {
              variant: "error",
              autoHideDuration: 3000,
            });
          } else {
            enqueueSnackbar("Registrazione fallita. Riprova.", {
              variant: "error",
              autoHideDuration: 3000,
            });
          }
        }
      } catch (error) {
        console.error("Errore durante la registrazione:", error);
        enqueueSnackbar(
          "Si è verificato un errore durante la registrazione. Riprova più tardi.",
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
      }
    },
  });

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
                      <h1 className="h3 mb-0 fw-bold">MySocial</h1>
                    </div>
                    <p className="text-muted mb-0 px-3">
                      Iscriviti per restare connesso con i tuoi amici
                    </p>
                  </div>

                  <form onSubmit={formik.handleSubmit} noValidate>
                    {/* Campo Nome Utente */}
                    <div className="mb-3">
                      <div className="position-relative">
                        <AtSign
                          size={18}
                          className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                        />
                        <input
                          type="text"
                          id="username"
                          name="username"
                          className={`form-control ps-5 ${
                            formik.errors.username && formik.touched.username
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
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.username}
                        />
                      </div>
                      {formik.errors.username && formik.touched.username ? (
                        <div className="invalid-feedback d-block">
                          {formik.errors.username}
                        </div>
                      ) : null}
                    </div>

                    {/* Campo Email */}
                    <div className="mb-3">
                      <div className="position-relative">
                        <Mail
                          size={18}
                          className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                        />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className={`form-control ps-5 ${
                            formik.errors.email && formik.touched.email
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
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.email}
                        />
                      </div>
                      {formik.errors.email && formik.touched.email ? (
                        <div className="invalid-feedback d-block">
                          {formik.errors.email}
                        </div>
                      ) : null}
                    </div>

                    {/* Campo Password */}
                    <div className="mb-3">
                      <div className="position-relative">
                        <Lock
                          size={18}
                          className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          className={`form-control ps-5 pe-5 ${
                            formik.errors.password && formik.touched.password
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
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.password}
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
                      {formik.errors.password && formik.touched.password ? (
                        <div className="invalid-feedback d-block">
                          {formik.errors.password}
                        </div>
                      ) : null}
                    </div>

                    {/* Campo Conferma Password */}
                    <div className="mb-3">
                      <div className="position-relative">
                        <Lock
                          size={18}
                          className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                        />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          className={`form-control ps-5 pe-5 ${
                            formik.errors.confirmPassword &&
                            formik.touched.confirmPassword
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
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.confirmPassword}
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
                      {formik.errors.confirmPassword &&
                      formik.touched.confirmPassword ? (
                        <div className="invalid-feedback d-block">
                          {formik.errors.confirmPassword}
                        </div>
                      ) : null}
                    </div>

                    {/* Campo Biografia */}
                    <div className="mb-3">
                      <div className="position-relative">
                        <User
                          size={18}
                          className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                        />
                        <input
                          type="text"
                          id="bio"
                          name="bio"
                          className={`form-control ps-5 ${
                            formik.errors.bio && formik.touched.bio
                              ? "is-invalid"
                              : ""
                          }`}
                          placeholder="Biografia"
                          aria-label="Biografia"
                          style={{
                            backgroundColor: "#fafafa",
                            border: "1px solid #dbdbdb",
                            fontSize: "14px",
                          }}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.bio}
                        />
                      </div>
                      {formik.errors.bio && formik.touched.bio ? (
                        <div className="invalid-feedback d-block">
                          {formik.errors.bio}
                        </div>
                      ) : null}
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
                      disabled={formik.isSubmitting}
                      style={{
                        backgroundColor: "#0095f6",
                        border: "none",
                        borderRadius: "8px",
                      }}
                    >
                      {formik.isSubmitting ? (
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
