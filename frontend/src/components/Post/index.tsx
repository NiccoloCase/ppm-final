import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, X } from "lucide-react";

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  username: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean;
}

export const PostCard: React.FC<{
  post: Post;
  handleLike: (id: string) => void;
}> = ({ post, handleLike }) => {
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showCommentsPopover) {
          setShowCommentsPopover(false);
        }
        if (showAddCommentForm) {
          setShowAddCommentForm(false);
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showCommentsPopover, showAddCommentForm]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      console.log(`Adding comment for post ${post.id}: "${newCommentText}"`);
      setNewCommentText("");
      setShowAddCommentForm(false);
    }
  };

  return (
    <article
      className="card mb-4 border-0 shadow-sm"
      style={{ maxWidth: "500px" }}
    >
      <header className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img
            src={post.avatar}
            alt={`Profilo di ${post.username}`}
            className="rounded-circle me-3"
            style={{ width: "32px", height: "32px", objectFit: "cover" }}
          />
          <div className="d-flex flex-column">
            <h2
              className="fw-semibold small m-0"
              id={`post-username-${post.id}`}
            >
              {post.username}
            </h2>
            <time
              dateTime={post.timestamp}
              className="text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              {post.timestamp}
            </time>
          </div>
        </div>
      </header>

      <figure className="m-0">
        <img
          src={post.image}
          alt={`Immagine del post di ${post.username}`}
          className="card-img"
          style={{ aspectRatio: "1/1", objectFit: "cover" }}
        />
      </figure>

      <div className="card-body">
        <div
          className="d-flex justify-content-start align-items-center mb-3"
          role="group"
          aria-label="Azioni del post"
        >
          <button
            type="button"
            className="btn btn-link p-0 border-0 me-3"
            onClick={() => handleLike(post.id)}
            aria-label={
              post.isLiked
                ? `Togli mi piace al post di ${post.username}`
                : `Metti mi piace al post di ${post.username}`
            }
            aria-pressed={post.isLiked}
          >
            <Heart
              size={24}
              style={{
                color: post.isLiked ? "#e91e63" : "#666",
                fill: post.isLiked ? "#e91e63" : "none",
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
            aria-label={`Visualizza commenti per il post di ${post.username}`}
          >
            <MessageCircle size={24} style={{ color: "#666" }} />
          </button>
        </div>

        <p className="fw-semibold small mb-2" aria-live="polite">
          {post.likes.toLocaleString()} mi piace
        </p>

        <div className="small mb-2">
          <span className="fw-semibold me-2">{post.username}</span>
          <span>{post.caption}</span>
        </div>

        {post.comments.length > 0 && (
          <button
            type="button"
            className="btn btn-link p-0 border-0 text-muted small mt-2 d-block"
            onClick={() => setShowCommentsPopover(!showCommentsPopover)}
            aria-expanded={showCommentsPopover}
            aria-controls={`comments-popover-${post.id}`}
            aria-label={`Vedi tutti i ${post.comments.length} commenti per il post di ${post.username}`}
          >
            Vedi tutti {post.comments.length} commenti
          </button>
        )}
        <button
          type="button"
          className="btn btn-link p-0 border-0 text-muted small mt-1 d-block"
          onClick={() => setShowAddCommentForm(!showAddCommentForm)}
          aria-expanded={showAddCommentForm}
          aria-controls={`add-comment-form-${post.id}`}
          aria-label={`Aggiungi un commento al post di ${post.username}`}
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
            <h3 id={`comments-heading-${post.id}`} className="fw-bold mb-3 h6">
              Commenti
            </h3>
            {post.comments.length === 0 ? (
              <p className="text-muted small">
                Nessun commento ancora. Sii il primo a commentare!
              </p>
            ) : (
              <ul className="list-unstyled mb-0">
                {post.comments.map((comment) => (
                  <li key={comment.id} className="mb-2 small">
                    <span className="fw-semibold me-1">{comment.username}</span>
                    <span>{comment.text}</span>
                    <time
                      dateTime={comment.timestamp}
                      className="text-muted ms-2"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {comment.timestamp}
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
                disabled={!newCommentText.trim()}
                style={{
                  backgroundColor: "#007bff",
                  borderColor: "#007bff",
                  borderRadius: "0.5rem",
                  opacity: newCommentText.trim() ? 1 : 0.6,
                }}
              >
                Pubblica
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
  );
};
