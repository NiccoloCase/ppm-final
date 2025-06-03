import { useEffect, useState } from "react";
import { useStore } from "../../../store";
import { Post } from "../../../store/models/post";
import { User } from "../../../store/models/user";
import { api } from "../../../api";
import { PostCard } from "../../../components/Post";
import { PulseLoader } from "react-spinners";
import { enqueueSnackbar } from "notistack";

export const ProfileScreen: React.FC = () => {
  const currentUser = useStore((state) => state.user) as User;

  const logout = useStore((state) => state.logout);

  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    api.getUserPosts(currentUser.username as any).then((data) => {
      if (data.data) setPosts(data.data);
      console.log({ posts: data.data });
    });
  }, [currentUser]);

  const onPostDelete = (id: number) => {
    setPosts((s) => (s == null ? null : s.filter((x) => x.id !== id)));
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="min-vh-100 " style={{ paddingTop: "4rem" }}>
      <div className="row justify-content-center">
        <div className="col-11 col-lg-10">
          <div className="row mb-5">
            <div className="col-12 col-md-4 text-center mb-4 mb-md-0">
              <img
                src={
                  currentUser.profile_picture ||
                  "https://avatar.iran.liara.run/public/boy"
                }
                alt={currentUser.username}
                className="rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </div>

            <div className="col-12 col-md-8">
              <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start mb-4">
                <h2 className="fw-light me-md-4 mb-3 mb-md-0">
                  {currentUser.username}
                </h2>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary btn-sm px-4">
                    Edit Profile
                  </button>{" "}
                  <button
                    className="btn btn-secondary btn-sm px-4"
                    onClick={logout}
                  >
                    Logout
                  </button>{" "}
                </div>
              </div>

              <div className="d-flex justify-content-center justify-content-md-start gap-4 mb-4">
                <div className="text-center">
                  <span className="fw-semibold">
                    {currentUser.followers_count.toLocaleString()}
                  </span>
                  <span className="text-muted ms-1">followers</span>
                </div>
                <div className="text-center">
                  <span className="fw-semibold">
                    {currentUser.following_count}
                  </span>
                  <span className="text-muted ms-1">following</span>
                </div>
              </div>

              <div>
                <div className="small" style={{ whiteSpace: "pre-line" }}>
                  {currentUser.bio}
                </div>
              </div>
            </div>
          </div>

          <div className="border-top pt-4">
            {posts == null ? (
              <div className=" text-center">
                <PulseLoader />
              </div>
            ) : (
              posts.map((post, index) => (
                <PostCard
                  post={post}
                  key={index}
                  del={true}
                  onDelete={onPostDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
