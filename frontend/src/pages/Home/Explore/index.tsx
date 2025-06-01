import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface User {
  id: string;
  username: string;
  profilePic: string;
}

const allUsers: User[] = [
  {
    id: "1",
    username: "alice_wonder",
    profilePic: "https://via.placeholder.com/150/FF5733/FFFFFF?text=A",
  },
  {
    id: "2",
    username: "bob_builder",
    profilePic: "https://via.placeholder.com/150/33FF57/FFFFFF?text=B",
  },
  {
    id: "3",
    username: "charlie_chaplin",
    profilePic: "https://via.placeholder.com/150/3357FF/FFFFFF?text=C",
  },
  {
    id: "4",
    username: "diana_prince",
    profilePic: "https://via.placeholder.com/150/FF33A1/FFFFFF?text=D",
  },
  {
    id: "5",
    username: "eve_harrington",
    profilePic: "https://via.placeholder.com/150/33FFF2/FFFFFF?text=E",
  },
  {
    id: "6",
    username: "frank_ocean",
    profilePic: "https://via.placeholder.com/150/A133FF/FFFFFF?text=F",
  },
  {
    id: "7",
    username: "grace_hopper",
    profilePic: "https://via.placeholder.com/150/FFDB33/FFFFFF?text=G",
  },
  {
    id: "8",
    username: "harry_potter",
    profilePic: "https://via.placeholder.com/150/33A1FF/FFFFFF?text=H",
  },
];

const followers: User[] = [
  {
    id: "1",
    username: "alice_wonder",
    profilePic: "https://via.placeholder.com/150/FF5733/FFFFFF?text=A",
  },
  {
    id: "3",
    username: "charlie_chaplin",
    profilePic: "https://via.placeholder.com/150/3357FF/FFFFFF?text=C",
  },
  {
    id: "6",
    username: "frank_ocean",
    profilePic: "https://via.placeholder.com/150/A133FF/FFFFFF?text=F",
  },
];

const following: User[] = [
  {
    id: "2",
    username: "bob_builder",
    profilePic: "https://via.placeholder.com/150/33FF57/FFFFFF?text=B",
  },
  {
    id: "4",
    username: "diana_prince",
    profilePic: "https://via.placeholder.com/150/FF33A1/FFFFFF?text=D",
  },
  {
    id: "5",
    username: "eve_harrington",
    profilePic: "https://via.placeholder.com/150/33FFF2/FFFFFF?text=E",
  },
];

export const ExploreScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(allUsers);

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const renderUserList = (users: User[], title: string) => (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-3">{title}</h5>
        {users.length === 0 ? (
          <p className="text-muted text-center">Nessun utente trovato.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {users.map((user) => (
              <li key={user.id} className="d-flex align-items-center mb-3">
                <Link
                  to={`/profile/${user.username}`}
                  className="d-flex align-items-center text-decoration-none text-dark"
                >
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="rounded-circle me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                    }}
                  />
                  <span className="fw-semibold">{user.username}</span>
                </Link>
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

          {renderUserList(filteredUsers, "Tutti gli utenti")}

          {renderUserList(followers, "Follower")}

          {renderUserList(following, "Following")}
        </div>
      </div>
    </div>
  );
};
