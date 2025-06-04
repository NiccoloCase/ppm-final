import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../../store";
import { Post } from "../../store/models/post";
import { User } from "../../store/models/user";
import { api } from "../../api";
import { PostCard } from "../../components/Post";
import { PulseLoader } from "react-spinners";
import { enqueueSnackbar } from "notistack";
import * as Yup from "yup";

// Validation schema
const profileValidationSchema = Yup.object().shape({
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
});

export const ProfileScreen: React.FC = () => {
  const { username: routeUsername } = useParams<{ username?: string }>();
  const currentUser = useStore((state) => state.user) as User;
  const logout = useStore((state) => state.logout);
  const editProfile = useStore((state) => state.editProfile);
  const followUser = useStore((state) => state.followUser);
  const unfollowUser = useStore((state) => state.unfollowUser);
  const isFollowingUser = useStore((state) => state.isFollowingUser);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editProfilePicture, setEditProfilePicture] = useState<File | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    bio?: string;
  }>({});

  const isOwnProfile =
    !routeUsername || routeUsername === currentUser?.username;
  const targetUsername = routeUsername || currentUser?.username;

  useEffect(() => {
    const loadProfileUser = async () => {
      if (!targetUsername) return;

      if (isOwnProfile && currentUser) {
        setProfileUser(currentUser);
      } else if (routeUsername) {
        setIsLoadingProfile(true);
        try {
          const response = await api.getUserProfile(routeUsername);
          if (response.success && response.data) {
            setProfileUser(response.data);
          } else {
            enqueueSnackbar("Failed to load user profile", {
              variant: "error",
            });
          }
        } catch (error) {
          enqueueSnackbar("Failed to load user profile", { variant: "error" });
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfileUser();
  }, [routeUsername, currentUser, isOwnProfile, targetUsername]);

  useEffect(() => {
    if (!targetUsername) return;

    api.getUserPosts(targetUsername as any).then((data) => {
      if (data.data) setPosts(data.data);
      console.log({ posts: data.data });
    });
  }, [targetUsername]);

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setEditUsername(currentUser.username || "");
      setEditBio(currentUser.bio || "");
    }
  }, [currentUser, isOwnProfile]);

  const onPostDelete = (id: number) => {
    setPosts((s) => (s == null ? null : s.filter((x) => x.id !== id)));
  };

  const onUpdate = (id: number, updatedPost: Post) => {
    setPosts((currentPosts) => {
      if (currentPosts == null) return null;

      return currentPosts.map((post) =>
        post.id === id ? { ...post, ...updatedPost } : post
      );
    });
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditProfilePicture(null);
    setPreviewUrl(null);
    setValidationErrors({});

    if (currentUser) {
      setEditUsername(currentUser.username || "");
      setEditBio(currentUser.bio || "");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditProfilePicture(file);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Validate form data
  const validateForm = async () => {
    try {
      await profileValidationSchema.validate(
        {
          username: editUsername,
          bio: editBio,
        },
        { abortEarly: false }
      );
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleEditProfile = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      enqueueSnackbar("Per favore correggi gli errori nel modulo", {
        variant: "error",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const result = await editProfile(
        editUsername !== currentUser?.username ? editUsername : undefined,
        editBio !== currentUser?.bio ? editBio : undefined,
        editProfilePicture || undefined
      );

      if (result.success) {
        enqueueSnackbar("Profile updated successfully!", {
          variant: "success",
        });
        setShowEditModal(false);
        setEditProfilePicture(null);
        setPreviewUrl(null);
        setValidationErrors({});
        // Update the profile user if it's the current user
        if (isOwnProfile && currentUser) {
          setProfileUser(currentUser);
        }
      } else {
        enqueueSnackbar(result.error || "Failed to update profile", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Failed to update profile", { variant: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileUser || isOwnProfile) return;

    try {
      const result = profileUser.is_following
        ? await unfollowUser(profileUser.username)
        : await followUser(profileUser.username);

      if (result.success) {
        // Update the profile user's follow status and followers count
        setProfileUser((prev) =>
          prev
            ? {
                ...prev,
                is_following: !prev.is_following,
                followers_count: prev.is_following
                  ? prev.followers_count - 1
                  : prev.followers_count + 1,
              }
            : null
        );

        enqueueSnackbar(
          profileUser.is_following ? "Unfollowed user" : "Following user",
          { variant: "success" }
        );
      } else {
        enqueueSnackbar(result.error || "Failed to update follow status", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Failed to update follow status", { variant: "error" });
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditUsername(value);

    if (validationErrors.username) {
      setValidationErrors((prev) => ({ ...prev, username: undefined }));
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEditBio(value);

    if (validationErrors.bio) {
      setValidationErrors((prev) => ({ ...prev, bio: undefined }));
    }
  };

  if (!currentUser) return <div>Loading...</div>;
  if (isLoadingProfile)
    return (
      <div className="text-center mt-5">
        <PulseLoader />
      </div>
    );
  if (!profileUser) return <div>User not found</div>;

  return (
    <div className="min-vh-100" style={{ paddingTop: "4rem" }}>
      <div className="row justify-content-center">
        <div className="col-11 col-lg-10">
          <div className="row mb-5">
            <div className="col-12 col-md-4 text-center mb-4 mb-md-0">
              <img
                src={
                  profileUser.profile_picture ||
                  "https://avatar.iran.liara.run/public/boy"
                }
                alt={profileUser.username}
                className="rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </div>
            <div className="col-12 col-md-8">
              <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start mb-4">
                <h2 className="fw-light me-md-4 mb-3 mb-md-0">
                  {profileUser.username}
                </h2>
                <div className="d-flex gap-2">
                  {isOwnProfile ? (
                    <>
                      <button
                        className="btn btn-primary btn-sm px-4"
                        onClick={() => setShowEditModal(true)}
                      >
                        Edit Profile
                      </button>
                      <button
                        className="btn btn-secondary btn-sm px-4"
                        onClick={logout}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      className={`btn btn-sm px-4 ${
                        profileUser.is_following
                          ? "btn-outline-primary"
                          : "btn-primary"
                      }`}
                      onClick={handleFollowToggle}
                      disabled={isFollowingUser}
                    >
                      {isFollowingUser ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          {profileUser.is_following
                            ? "Unfollowing..."
                            : "Following..."}
                        </>
                      ) : profileUser.is_following ? (
                        "Unfollow"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-center justify-content-md-start gap-4 mb-4">
                <div className="text-center">
                  <span className="fw-semibold">
                    {profileUser.followers_count.toLocaleString()}
                  </span>
                  <span className="text-muted ms-1">followers</span>
                </div>
                <div className="text-center">
                  <span className="fw-semibold">
                    {profileUser.following_count}
                  </span>
                  <span className="text-muted ms-1">following</span>
                </div>
              </div>
              <div>
                <div className="small" style={{ whiteSpace: "pre-line" }}>
                  {profileUser.bio}
                </div>
              </div>
            </div>
          </div>
          <div className="border-top pt-4">
            {posts == null ? (
              <div className="text-center">
                <PulseLoader />
              </div>
            ) : (
              posts.map((post, index) => (
                <PostCard
                  edit={isOwnProfile} // Only allow editing on own profile
                  post={post}
                  key={index}
                  del={isOwnProfile} // Only allow deleting on own profile
                  onDelete={onPostDelete}
                  onUpdate={onUpdate}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal - Only show for own profile */}
      {showEditModal && isOwnProfile && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3 text-center">
                  <img
                    src={
                      previewUrl ||
                      currentUser.profile_picture ||
                      "https://avatar.iran.liara.run/public/boy"
                    }
                    alt="Profile preview"
                    className="rounded-circle mb-3"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="form-control"
                      id="profilePicture"
                    />
                    <label htmlFor="profilePicture" className="form-label">
                      Profile Picture
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      validationErrors.username ? "is-invalid" : ""
                    }`}
                    id="username"
                    value={editUsername}
                    onChange={handleUsernameChange}
                  />
                  {validationErrors.username && (
                    <div className="invalid-feedback">
                      {validationErrors.username}
                    </div>
                  )}
                  <div className="form-text">
                    {editUsername.length}/30 caratteri
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">
                    Bio
                  </label>
                  <textarea
                    className={`form-control ${
                      validationErrors.bio ? "is-invalid" : ""
                    }`}
                    id="bio"
                    rows={4}
                    value={editBio}
                    onChange={handleBioChange}
                  />
                  {validationErrors.bio && (
                    <div className="invalid-feedback">
                      {validationErrors.bio}
                    </div>
                  )}
                  <div className="form-text">
                    {editBio.length}/150 caratteri
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEditProfile}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
