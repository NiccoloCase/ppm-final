import React, { useState, useRef } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Camera, X, MapPin, Tag, Smile } from "lucide-react";
import { Link } from "react-router-dom";
import { palette } from "../../../config";

interface CreatePostFormValues {
  caption: string;
  location: string;
}

const validationSchema = Yup.object({
  caption: Yup.string()
    .max(2200, "La didascalia non può superare i 2200 caratteri")
    .required("La didascalia è richiesta"),
  location: Yup.string().max(
    100,
    "La posizione non può superare i 100 caratteri"
  ),
});

export const CreatePostScreen: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialValues: CreatePostFormValues = {
    caption: "",
    location: "",
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limit to 10 images like Instagram
    const newFiles = [...selectedImages, ...files].slice(0, 10);
    setSelectedImages(newFiles);

    // Create preview URLs
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => {
      // Clean up old URLs
      prev.forEach((url) => URL.revokeObjectURL(url));
      return newPreviewUrls;
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    // Clean up the removed URL
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = (
    values: CreatePostFormValues,
    { setSubmitting }: any
  ) => {
    if (selectedImages.length === 0) {
      alert("Per favore, seleziona almeno un'immagine");
      setSubmitting(false);
      return;
    }

    // TODO: Upload images and create post
    setTimeout(() => {
      console.log("Nuovo post creato:", {
        images: selectedImages,
        caption: values.caption,
        location: values.location,
      });
      alert("Post pubblicato con successo! (Questa è una demo)");
      setSubmitting(false);

      // Reset form
      setSelectedImages([]);
      setPreviewUrls((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
    }, 1500);
  };

  return (
    <div className="min-vh-100 " style={{ paddingTop: "2rem" }}>
      <div className="row justify-content-center">
        <div className="col-11">
          <section
            className="card border-0 mb-3"
            style={{ backgroundColor: "transparent", boxShadow: "none" }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-center">
                <h1 className="h5 mb-0 fw-bold text-center">Crea nuovo post</h1>
              </div>
            </div>
          </section>

          {/* Image Upload Section */}
          <section className="card border-0 shadow-sm mb-3">
            <div className="card-body p-4">
              {selectedImages.length === 0 ? (
                <div
                  className="text-center py-5"
                  style={{
                    borderRadius: "12px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <Camera
                    size={48}
                    className="mb-3"
                    style={{ color: "#8e8e8e" }}
                  />
                  <h3 className="h5 mb-2" style={{ color: "#262626" }}>
                    Condividi le tue foto
                  </h3>
                  <p className="text-muted mb-3 small">
                    Seleziona le foto dal tuo dispositivo
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      backgroundColor: "#0095f6",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  >
                    Seleziona foto
                  </button>
                </div>
              ) : (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="mb-0 fw-semibold">
                      {selectedImages.length} foto selezionate
                    </h6>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        borderColor: "#0095f6",
                        color: "#0095f6",
                        borderRadius: "6px",
                      }}
                    >
                      Aggiungi altre
                    </button>
                  </div>
                  <div className="row g-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="col-4">
                        <div className="position-relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-100 rounded"
                            style={{
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm position-absolute top-0 end-0 m-1"
                            onClick={() => removeImage(index)}
                            style={{
                              backgroundColor: "rgba(0,0,0,0.6)",
                              border: "none",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <X size={12} color="white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="d-none"
              />
            </div>
          </section>

          <section className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({
                  isSubmitting,
                  errors,
                  touched,
                  values,
                  handleSubmit: formikSubmit,
                }) => (
                  <form onSubmit={formikSubmit} noValidate>
                    {/* Caption Field */}
                    <div className="mb-4">
                      <label
                        htmlFor="caption"
                        className="form-label small fw-semibold d-flex align-items-center"
                      >
                        Didascalia
                      </label>
                      <Field
                        as="textarea"
                        id="caption"
                        name="caption"
                        rows={4}
                        className={`form-control ${
                          errors.caption && touched.caption ? "is-invalid" : ""
                        }`}
                        placeholder="Scrivi una didascalia..."
                        aria-label="Didascalia del post"
                        style={{
                          backgroundColor: "#fafafa",
                          border: "1px solid #dbdbdb",
                          fontSize: "14px",
                          resize: "none",
                        }}
                      />
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <ErrorMessage
                          name="caption"
                          component="div"
                          className="invalid-feedback d-block"
                        />
                        <small
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          {values.caption.length}/2200
                        </small>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-semibold"
                      disabled={isSubmitting || selectedImages.length === 0}
                      style={{
                        backgroundColor:
                          selectedImages.length === 0 ? "#b2dffc" : "#0095f6",
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
                          Pubblicazione in corso...
                        </>
                      ) : (
                        "Condividi"
                      )}
                    </button>
                  </form>
                )}
              </Formik>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
