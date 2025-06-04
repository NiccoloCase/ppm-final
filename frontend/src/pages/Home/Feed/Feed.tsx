import { useEffect, useState } from "react";
import { PostCard } from "../../../components/Post";
import { useStore } from "../../../store";
import { Spinner } from "react-bootstrap";
import { palette } from "../../../config";

interface FeedScreenProps {}

export const FeedScreen: React.FC<FeedScreenProps> = ({}) => {
  const posts = useStore((state) => state.feed);
  const fetchFeed = useStore((state) => state.fetchFeed);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);

    fetchFeed()
      .catch((error) => {
        console.error("Error fetching feed:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fetchFeed]);

  console.log("Feed data:", posts);

  return (
    <div className="min-vh-100 " style={{ paddingTop: "4rem" }}>
      {isLoading && posts.length == 0 ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="text-center">
            <Spinner color={palette.primary} animation="border" />
            <p className="text-center mt-3">Caricamento feed...</p>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-11 col-md-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
