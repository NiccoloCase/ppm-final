import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, X } from "lucide-react";
import { Post } from "../../store/models/post";
import { useStore } from "../../store";
import { enqueueSnackbar } from "notistack";

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string; // TODO
}

export const PostCard: React.FC<{
  post: Post;
}> = ({ post }) => {
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const comments = [] as Comment[]; // TODO: Replace with actual comments data

  const execLike = useStore((state) => state.likePost);
  const execUnlike = useStore((state) => state.unlikePost);

  const [isLiked, setIsLiked] = useState(post.is_liked);

  useEffect(() => {
    setIsLiked(post.is_liked);
  }, [post.is_liked]);

  const toggleLike = (postId: number) => {
    console.log(`Toggling like for post ${postId}`);

    if (post.is_liked) {
      setIsLiked(false);
      execUnlike(postId)
        .then(() => {
          console.log(`Post ${postId} unliked successfully`);
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

  const numberOfLikes = () => {
    let base = Number(post.likes_count) || 0;
    if (post.is_liked && !isLiked) base -= 1;
    else if (!post.is_liked && isLiked) base += 1;
    return base > 0 ? base : 0;
  };

  return (
    <article
      className="card mb-4 border-0 shadow-sm"
      style={{ maxWidth: "500px" }}
    >
      <header className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {post.author.profile_picture && (
            <img
              src={post.author.profile_picture}
              alt={`Profilo di ${post.author.username}`}
              className="rounded-circle me-3"
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
            />
          )}
          <div className="d-flex flex-column">
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
              {post.created_at}
            </time>
          </div>
        </div>
      </header>
      {post.image && (
        <figure className="m-0">
          <img
            src={post.image}
            alt={`Immagine del post di ${post.author.username}`}
            className="card-img"
            style={{ aspectRatio: "1/1", objectFit: "cover" }}
          />
        </figure>
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

        <div className="small mb-2">
          <span className="fw-semibold me-2">{post.author.username}</span>
          <span>{post.content}</span>
        </div>
        {/* 
TODO
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
        )} */}
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
            <h3 id={`comments-heading-${post.id}`} className="fw-bold mb-3 h6">
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
