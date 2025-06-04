import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User } from "../../../store/models/user";
import { useStore } from "../../../store";
import { getProfilePicture } from "../../../utils";

export const ExploreScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const {
    user: currentUser,
    allUsers,
    followers,
    following,
    isLoadingUsers,
    isLoadingFollowers,
    isLoadingFollowing,
    isFollowingUser,
    followError,
    loadAllUsers,
    loadFollowers,
    loadFollowing,
    followUser,
    unfollowUser,
    clearFollowError,
  } = useStore();

  useEffect(() => {
    const loadData = async () => {
      await loadAllUsers();

      if (currentUser?.username) {
        await loadFollowers(currentUser.username);
        await loadFollowing(currentUser.username);
      }
    };

    loadData();
  }, [currentUser?.username, loadAllUsers, loadFollowers, loadFollowing]);

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, allUsers]);

  const handleFollowToggle = async (
    username: string,
    isCurrentlyFollowing: boolean
  ) => {
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(username);
      } else {
        await followUser(username);
      }

      if (currentUser?.username) {
        await loadFollowing(currentUser.username);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  const renderUserList = (
    users: User[],
    title: string,
    isLoading: boolean,
    showFollowButton: boolean = false
  ) => (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-3">{title}</h5>

        {followError && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            {followError}
            <button
              type="button"
              className="btn-close"
              onClick={clearFollowError}
              aria-label="Close"
            ></button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center p-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-muted text-center">Nessun utente trovato.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {users.map((user) => (
              <li
                key={user.id}
                className="d-flex align-items-center justify-content-between mb-3"
              >
                <Link
                  to={`/profile/${user.username}`}
                  className="d-flex align-items-center text-decoration-none text-dark flex-grow-1"
                >
                  <img
                    src={getProfilePicture(user)}
                    alt={user.username}
                    className="rounded-circle me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <span className="fw-semibold d-block">{user.username}</span>
                    {user.bio && (
                      <small className="text-muted">{user.bio}</small>
                    )}
                  </div>
                </Link>

                {showFollowButton &&
                  currentUser &&
                  user.username !== currentUser.username && (
                    <button
                      className={`btn btn-sm ${
                        user.is_following
                          ? "btn-outline-primary"
                          : "btn-primary"
                      }`}
                      onClick={() =>
                        handleFollowToggle(user.username, user.is_following)
                      }
                      disabled={isFollowingUser}
                    >
                      {isFollowingUser ? (
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : null}
                      {user.is_following ? "Unfollow" : "Follow"}
                    </button>
                  )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-vh-100" style={{ paddingTop: "2rem" }}>
      <div className="row justify-content-center">
        <div className="col-11">
          <section
            className="card border-0 mb-3"
            style={{ backgroundColor: "transparent", boxShadow: "none" }}
          >
            <div className="card-body p-3">
              <h1 className="h5 mb-0 fw-bold text-center">Esplora</h1>
            </div>
          </section>

          {/* Search Bar */}
          <section className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 bg-light"
                  placeholder="Cerca utenti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </section>

          {renderUserList(
            filteredUsers,
            "Tutti gli utenti",
            isLoadingUsers,
            true
          )}

          {currentUser && (
            <>
              {renderUserList(followers, "I tuoi follower", isLoadingFollowers)}
              {renderUserList(following, "Stai seguendo", isLoadingFollowing)}
            </>
          )}

          {!currentUser && (
            <section className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4 text-center">
                <h5 className="fw-bold mb-3">
                  Accedi per vedere i tuoi follower
                </h5>
                <p className="text-muted mb-3">
                  Effettua l'accesso per visualizzare i tuoi follower e gli
                  utenti che stai seguendo.
                </p>
                <Link to="/login" className="btn btn-primary">
                  Accedi
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
