import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../client";
import moment from "moment";

const GlobalRoom = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);

  const logout = async () => {
    setIsLoading(true);

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      setError(error?.message);
      console.log("Error", error);
      setTimeout(() => setSuccessMsg(null), 5000);
      setIsLoading(false);
    } else {
      navigate("/");

      localStorage.setItem("email", "");
      localStorage.setItem("name", "");
      localStorage.setItem("access_token", "");
      localStorage.setItem("refresh_token", "");
      localStorage.setItem("user_id", "");

      setUser(null);
      setIsLoading(false);
    }
  };

  const createChat = async () => {
    setIsLoading(true);
    if (message && message?.length > 0) {
      const { data, error } = await supabaseClient
        .from("Chats")
        .insert({
          message,
          user_id: user?.user_id,
          email: user?.email,
          user_name: user?.name,
        })
        .select("*")
        .single();

      if (error) {
        setError(error?.message);
        console.log("Error", error);
        setTimeout(() => setSuccessMsg(null), 5000);
      }

      if (data) {
        setChats([...chats, data]);
        setMessage("");
      }

      setIsLoading(false);
    } else {
      setError("Write something before submitting!");
      setTimeout(() => setSuccessMsg(null), 5000);
      setIsLoading(false);
    }
  };

  const getChats = async () => {
    setIsLoading(true);

    const { data, error } = await supabaseClient
      .from("Chats")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      setError(error?.message);
      console.log("Error", error);
      setTimeout(() => setSuccessMsg(null), 5000);
    }

    if (data) {
      setChats([...data]);
      setMessage("");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    const user_id = localStorage.getItem("user_id");

    if (
      email?.length <= 0 ||
      name?.length <= 0 ||
      access_token?.length <= 0 ||
      user_id?.length <= 0 ||
      refresh_token?.length <= 0
    ) {
      navigate("/");
      setUser(null);
    } else {
      setUser({
        user_id,
        name,
        email,
        access_token,
        refresh_token,
      });
      getChats();
    }
  }, []);

  if (user) {
    return (
      <div className="w-[60vw] lg:w-[30vw] flex flex-col items-center justify-center gap-3">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex-grow">
            <h1 className="text-sm font-bold truncate w-40" title={user?.name}>
              {user?.name}
            </h1>
            <p className="text-xs text-slate-400 ml-px">
              <a href={`mailto:${user?.email}`}>{user?.email}</a>
            </p>
          </div>
          <button
            onClick={logout}
            className="text-blue-600 text-sm justify-center flex items-center gap-2"
          >
            Logout
            {isLoading && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 animate-spin"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            )}
          </button>
        </div>
        <div className="flex w-full flex-col gap-3 items-center justify-center border border-slate-200 bg-slate-100 shadow-lg p-5 rounded-lg">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex-grow h-[60vh] overflow-y-auto border w-full p-3 rounded-md bg-white">
            {chats?.length > 0 ? (
              chats?.map((item, index) => {
                if (item?.user_id != user?.user_id) {
                  return (
                    <div className="w-fit max-w-2/3 my-3" key={index}>
                      <h1 className="text-sm font-bold">{item?.user_name}</h1>
                      <p className="p-2 text-sm text-slate-600 bg-[#f5f5f5] rounded-tl-none rounded-xl">
                        {item?.message}
                      </p>
                      <p className="text-[0.6rem] text-slate-400 ml-px">
                        {moment(item?.created_at).fromNow()}
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div
                      className="w-fit max-w-2/3 my-3 text-right ml-auto"
                      key={index}
                    >
                      <h1 className="text-sm font-bold">You</h1>
                      <p className="p-2 text-sm text-[#f5f5f5] bg-blue-600 rounded-tr-none rounded-xl">
                        {item?.message}
                      </p>
                      <p className="text-[0.6rem] text-slate-400 ml-px">
                        {moment(item?.created_at).fromNow()}
                      </p>
                    </div>
                  );
                }
              })
            ) : (
              <div className="w-full mx-auto my-auto text-center">
                <p className="p-2 text-sm bg-blue-600/20 text-blue-600 rounded">
                  No chats to display
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center border w-full p-2 rounded gap-1 bg-white">
            <textarea
              style={{
                resize: "none",
              }}
              name="messages"
              id="message-box"
              className="w-[90%] min-h-[2rem] max-h-[2rem] focus:outline-none active:outline-none rounded-sm pt-1"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="button"
              className="w-[10%] h-[2rem] bg-blue-600 rounded-sm text-white text-center"
              onClick={createChat}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 animate-spin mx-auto"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 mx-auto"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="bg-red-600/20 text-red-600 px-3 py-2 rounded w-full flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
};

export default GlobalRoom;
