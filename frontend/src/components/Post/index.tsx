import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Trash, X, Edit3 } from "lucide-react";
import { Post } from "../../store/models/post";
import { useStore } from "../../store";
import { enqueueSnackbar } from "notistack";
import { api } from "../../api";
import { User } from "../../store/models/user";
import { PulseLoader } from "react-spinners";
import { getProfilePicture } from "../../utils";

interface Comment {
  author: User;
  content: string;
  created_at: string;
  id: number;
  post: number;
  updated_at: string;
}

export const PostCard: React.FC<{
  post: Post;
  del?: boolean;
  edit?: boolean;
  onDelete?: (id: number) => void;
  onUpdate?: (id: number, post: Post) => void;
}> = ({ post, del, edit, onDelete, onUpdate }) => {
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [editContent, setEditContent] = useState(post.content);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const execLike = useStore((state) => state.likePost);
  const execUnlike = useStore((state) => state.unlikePost);
  const updatePostFunc = useStore((state) => state.updatePost);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const deletePostFunc = useStore((s) => s.deletePost);
  const [isLiked, setIsLiked] = useState(post.is_liked);

  useEffect(() => {
    setIsLiked(post.is_liked);
  }, [post.is_liked]);

  useEffect(() => {
    api.getPostComments(post.id).then((data) => {
      if (data.data) {
        setComments(data.data);
      }
    });
  }, []);

  const deletePost = (id: number) => {
    deletePostFunc(id)
      .then((data) => {
        if (data.success) {
          enqueueSnackbar({ message: "Post eliminato", variant: "success" });
          if (onDelete) onDelete(id);
        } else
          enqueueSnackbar({
            message: "Si è verificato un errore",
            variant: "error",
          });
      })
      .catch((e) =>
        enqueueSnackbar({
          message: "Si è verificato un errore",
          variant: "error",
        })
      );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) {
      enqueueSnackbar({
        message: "Il contenuto del post non può essere vuoto",
        variant: "error",
      });
      return;
    }

    setIsUpdatingPost(true);
    updatePostFunc(post.id, editContent, editImage || undefined)
      .then((data) => {
        if (data.success) {
          enqueueSnackbar({
            message: "Post aggiornato con successo!",
            variant: "success",
          });
          setShowEditModal(false);
          setEditImage(null);
          if (editImageInputRef.current) {
            editImageInputRef.current.value = "";
          }
          if (onUpdate)
            onUpdate(post.id, {
              ...post,
              ...data.data,
            });
        } else {
          enqueueSnackbar({
            message: data.error || "Errore durante l'aggiornamento del post",
            variant: "error",
          });
        }
      })
      .catch((error) => {
        console.error("Error updating post:", error);
        enqueueSnackbar({
          message: "Si è verificato un errore",
          variant: "error",
        });
      })
      .finally(() => {
        setIsUpdatingPost(false);
      });
  };

  const toggleLike = (postId: number) => {
    console.log(`Toggling like for post ${postId}`);
    if (post.is_liked) {
      setIsLiked(false);
      execUnlike(postId)
        .then(() => {
          console.log(`Post ${postId} unliked successfully`);
          enqueueSnackbar({ message: "Like rimosso", variant: "success" });
        })
        .catch((error) => {
          console.error(`Error unliking post ${postId}:`, error);
          enqueueSnackbar(
            `Errore durante la rimozione del mi piace al post ${postId}`,
            {
              variant: "error",
            }
          );
        });
    } else {
      setIsLiked(true);
      execLike(postId)
        .then(() => {
          console.log(`Post ${postId} liked successfully`);
          enqueueSnackbar({ message: "Like aggiunto", variant: "success" });
        })
        .catch((error) => {
          console.error(`Error liking post ${postId}:`, error);
          enqueueSnackbar(
            `Errore durante l'aggiunta del mi piace al post ${postId}`,
            {
              variant: "error",
            }
          );
        });
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showCommentsPopover) {
          setShowCommentsPopover(false);
        }
        if (showAddCommentForm) {
          setShowAddCommentForm(false);
        }
        if (showEditModal) {
          setShowEditModal(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showCommentsPopover, showAddCommentForm, showEditModal]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      console.log(`Adding comment for post ${post.id}: "${newCommentText}"`);
      setIsSubmittingComment(true);
      api
        .createComment(post.id, newCommentText)
        .then((data) => {
          setNewCommentText("");
          setShowAddCommentForm(false);
          enqueueSnackbar({
            message: "Commento aggiunto con successo!",
            variant: "success",
          });
          setComments((s) => [...s, data.data]);
        })
        .finally(() => setIsSubmittingComment(false));
    }
  };

  const numberOfLikes = () => {
    let base = Number(post.likes_count) || 0;
    return base > 0 ? base : 0;
  };

  return (
    <>
      <article
        className="card mb-4 border-0 shadow-sm"
        style={{ maxWidth: "500px" }}
      >
        <header className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center justify-content-between">
            <img
              src={getProfilePicture(post.author)}
              alt={`Profilo di ${post.author.username}`}
              className="rounded-circle me-3"
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
            />

            <div className="d-flex flex-column " style={{ flex: 1 }}>
              <h2
                className="fw-semibold small m-0"
                id={`post-username-${post.id}`}
              >
                {post.author.username}
              </h2>
              <time
                dateTime={post.created_at}
                className="text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                {new Date(post.created_at).toLocaleDateString("it-IT", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}{" "}
              </time>
            </div>
            <div className="d-flex align-items-center px-5">
              {edit && (
                <button
                  type="button"
                  className="btn btn-link p-0 border-0 me-2"
                  onClick={() => setShowEditModal(true)}
                  aria-label={`Modifica il post ${post.id}`}
                  style={{
                    background: "transparent",
                    border: "none",
                  }}
                >
                  <Edit3 size={20} color="#007bff" />
                </button>
              )}
              {del && (
                <button
                  type="button"
                  className="btn btn-link p-0 border-0"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Sei sicuro di voler eliminare questo post?"
                      )
                    ) {
                      deletePost(post.id);
                    }
                  }}
                  aria-label={`Elimina il post ${post.id}`}
                  style={{
                    background: "transparent",
                    border: "none",
                  }}
                >
                  <Trash size={20} color="#dc3545" />
                </button>
              )}
            </div>
          </div>
        </header>

        {post.image ? (
          <figure className="m-0">
            <img
              src={post.image}
              alt={`Immagine del post di ${post.author.username}`}
              className="card-img"
              style={{ aspectRatio: "1/1", objectFit: "cover" }}
            />
          </figure>
        ) : (
          <div className="card-body">
            <h5>{post.content}</h5>
          </div>
        )}

        <div className="card-body">
          <div
            className="d-flex justify-content-start align-items-center mb-3"
            role="group"
            aria-label="Azioni del post"
          >
            <button
              type="button"
              className="btn btn-link p-0 border-0 me-3"
              onClick={() => toggleLike(post.id)}
              aria-label={
                isLiked
                  ? `Togli mi piace al post ${post.id}`
                  : `Metti mi piace al post ${post.id}`
              }
              aria-pressed={isLiked}
            >
              <Heart
                size={24}
                style={{
                  color: isLiked ? "#e91e63" : "#666",
                  fill: isLiked ? "#e91e63" : "none",
                  transition: "all 0.2s",
                }}
              />
            </button>

            <button
              type="button"
              className="btn btn-link p-0 border-0 me-3"
              onClick={() => setShowCommentsPopover(!showCommentsPopover)}
              aria-expanded={showCommentsPopover}
              aria-controls={`comments-popover-${post.id}`}
              aria-label={`Visualizza commenti per il post ${post.id}`}
            >
              <MessageCircle size={24} style={{ color: "#666" }} />
            </button>
          </div>

          <p className="fw-semibold small mb-2" aria-live="polite">
            {numberOfLikes()} mi piace
          </p>

          {!!post.image && (
            <div className="small mb-2">
              <span className="fw-semibold me-2">{post.author.username}</span>
              <span>{post.content}</span>
            </div>
          )}

          {comments.length > 0 && (
            <button
              type="button"
              className="btn btn-link p-0 border-0 text-muted small mt-2 d-block"
              onClick={() => setShowCommentsPopover(!showCommentsPopover)}
              aria-expanded={showCommentsPopover}
              aria-controls={`comments-popover-${post.id}`}
              aria-label={`Vedi tutti i ${comments.length} commenti per il post ${post.id}`}
            >
              Vedi tutti {comments.length} commenti
            </button>
          )}

          <button
            type="button"
            className="btn btn-link p-0 border-0 text-muted small mt-1 d-block"
            onClick={() => setShowAddCommentForm(!showAddCommentForm)}
            aria-expanded={showAddCommentForm}
            aria-controls={`add-comment-form-${post.id}`}
            aria-label={`Aggiungi un commento al post ${post.id}`}
          >
            Aggiungi un commento...
          </button>

          {showCommentsPopover && (
            <section
              id={`comments-popover-${post.id}`}
              className="comments-popover mt-3 p-3 border rounded"
              style={{
                backgroundColor: "#fff",
                maxHeight: "200px",
                overflowY: "auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              aria-labelledby={`comments-heading-${post.id}`}
              role="region"
            >
              <h3
                id={`comments-heading-${post.id}`}
                className="fw-bold mb-3 h6"
              >
                Commenti
              </h3>
              {comments.length === 0 ? (
                <p className="text-muted small">
                  Nessun commento ancora. Sii il primo a commentare!
                </p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {comments.map((comment) => (
                    <li key={comment.id} className="mb-2 small">
                      <span className="fw-semibold me-1">
                        {comment.author.username}
                      </span>
                      <span>{comment.content}</span>
                      <time
                        dateTime={comment.created_at}
                        className="text-muted ms-2"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {new Date(comment.created_at).toLocaleTimeString(
                          "it-IT",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100 mt-3"
                onClick={() => setShowCommentsPopover(false)}
                aria-label="Chiudi la sezione commenti"
              >
                Chiudi
              </button>
            </section>
          )}

          {showAddCommentForm && (
            <div
              id={`add-comment-form-${post.id}`}
              className="mt-3 p-3 border rounded"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <h4 className="fw-bold mb-3 h6">Scrivi un commento</h4>
              <form onSubmit={handleCommentSubmit}>
                <div className="form-group mb-3">
                  <label
                    htmlFor={`comment-textarea-${post.id}`}
                    className="visually-hidden"
                  >
                    Scrivi il tuo commento
                  </label>
                  <textarea
                    id={`comment-textarea-${post.id}`}
                    className="form-control"
                    rows={3}
                    placeholder="Scrivi il tuo commento..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    style={{
                      resize: "vertical",
                      fontSize: "14px",
                      backgroundColor: "#fff",
                      border: "1px solid #ced4da",
                    }}
                    aria-label="Campo di testo per il commento"
                    ref={commentInputRef}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-semibold py-2"
                  disabled={!newCommentText.trim() || isSubmittingComment}
                  style={{
                    backgroundColor: "#007bff",
                    borderColor: "#007bff",
                    borderRadius: "0.5rem",
                    opacity: newCommentText.trim() ? 1 : 0.6,
                  }}
                >
                  {isSubmittingComment ? <PulseLoader /> : "Pubblica"}
                </button>
                <button
                  type="button"
                  className="btn btn-link text-muted mt-2 w-100"
                  onClick={() => setShowAddCommentForm(false)}
                >
                  Annulla
                </button>
              </form>
            </div>
          )}
        </div>
      </article>

      {/* Edit Post Modal */}
      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
          role="dialog"
          aria-labelledby={`edit-modal-title-${post.id}`}
          aria-hidden="false"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id={`edit-modal-title-${post.id}`}>
                  Modifica Post
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Chiudi"
                ></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label
                      htmlFor={`edit-content-${post.id}`}
                      className="form-label"
                    >
                      Contenuto del post
                    </label>
                    <textarea
                      id={`edit-content-${post.id}`}
                      className="form-control"
                      rows={4}
                      placeholder="Scrivi qualcosa..."
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      required
                      style={{ resize: "vertical" }}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor={`edit-image-${post.id}`}
                      className="form-label"
                    >
                      Cambia immagine (opzionale)
                    </label>
                    <input
                      type="file"
                      id={`edit-image-${post.id}`}
                      className="form-control"
                      accept="image/*"
                      ref={editImageInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setEditImage(file || null);
                      }}
                    />
                    {post.image && (
                      <div className="mt-2">
                        <small className="text-muted">Immagine attuale:</small>
                        <img
                          src={post.image}
                          alt="Current post image"
                          className="d-block mt-1"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "0.25rem",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={isUpdatingPost}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!editContent.trim() || isUpdatingPost}
                  >
                    {isUpdatingPost ? (
                      <>
                        <PulseLoader size={8} color="white" /> Aggiornamento...
                      </>
                    ) : (
                      "Aggiorna Post"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
