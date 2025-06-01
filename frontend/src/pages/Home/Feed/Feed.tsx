import { Post, PostCard } from "../../../components/Post";

interface FeedScreenProps {
  posts: Post[];
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ posts }) => {
  const handleLike = (id: string) => {
    // TODO
  };

  return (
    <div className="min-vh-100 " style={{ paddingTop: "4rem" }}>
      <div className="row justify-content-center">
        <div className="col-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} handleLike={handleLike} />
          ))}
        </div>
      </div>
    </div>
  );
};
