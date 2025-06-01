interface User {
  // TODO: change location
  username: string;
  fullName: string;
  avatar: string;
  posts: number;
  followers: number;
  following: number;
  bio: string;
  isVerified: boolean;
}

const currentUser: User = {
  username: "john_doe",
  fullName: "John Doe",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  posts: 42,
  followers: 1234,
  following: 567,
  bio: "📸 Photography enthusiast\n🌍 Travel lover\n☕ Coffee addict",
  isVerified: false,
};

const userPosts = [
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
];

export const ProfileScreen: React.FC = () => (
  <div className="min-vh-100 " style={{ paddingTop: "4rem" }}>
    <div className="row justify-content-center">
      <div className="col-11 col-lg-10">
        {/* Profile Header */}
        <div className="row mb-5">
          <div className="col-12 col-md-4 text-center mb-4 mb-md-0">
            <img
              src={currentUser.avatar}
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
                {/** TODO */}
                <button className="btn btn-secondary btn-sm px-4">
                  Logout
                </button>{" "}
              </div>
            </div>

            <div className="d-flex justify-content-center justify-content-md-start gap-4 mb-4">
              <div className="text-center">
                <span className="fw-semibold">{currentUser.posts}</span>
                <span className="text-muted ms-1">posts</span>
              </div>
              <div className="text-center">
                <span className="fw-semibold">
                  {currentUser.followers.toLocaleString()}
                </span>
                <span className="text-muted ms-1">followers</span>
              </div>
              <div className="text-center">
                <span className="fw-semibold">{currentUser.following}</span>
                <span className="text-muted ms-1">following</span>
              </div>
            </div>

            <div>
              <div className="fw-semibold mb-1">{currentUser.fullName}</div>
              <div className="small" style={{ whiteSpace: "pre-line" }}>
                {currentUser.bio}
              </div>
            </div>
          </div>
        </div>

        <div className="border-top pt-4">
          <div className="row g-1 g-md-3">
            {userPosts.map((image, index) => (
              <div key={index} className="col-4">
                <div
                  className="position-relative overflow-hidden"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={image}
                    alt={`Post ${index + 1}`}
                    className="img-fluid"
                    style={{
                      aspectRatio: "1/1",
                      objectFit: "cover",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
