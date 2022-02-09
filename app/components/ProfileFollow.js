import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfileFollow(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPosts() {
      try {
        const response = await Axios.get(
          `/profile/${username}/${props.action}`,
          {
            cancelToken: ourRequest.token,
          }
        );
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("There was a problem or the request was cancelled.");
      }
    }
    fetchPosts();
    return () => {
      ourRequest.cancel();
    };
  }, [username, props.action]);

  if (isLoading) return <LoadingDotsIcon />;
  if (posts.length === 0 && props.action === "following") {
    return <p>This user is not following anyone yet ;)</p>;
  }
  if (posts.length === 0 && props.action === "followers") {
    return <p>This user doesn't have any followers right now ;)</p>;
  }
  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${follower.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={follower.avatar} />{" "}
            {follower.username}
          </Link>
        );
      })}
    </div>
  );
}

export default ProfileFollow;
