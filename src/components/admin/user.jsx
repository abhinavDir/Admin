import React, { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("userSignup"));
    if (savedUser) setUsers([savedUser]); // just single user demo
  }, []);

  return (
    <div>
      <h1>👤 Users</h1>
      {users.length === 0 ? <p>No users found</p> : (
        <ul>
          {users.map((user, i) => (
            <li key={i}>{user.name} - {user.mobile}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users;
