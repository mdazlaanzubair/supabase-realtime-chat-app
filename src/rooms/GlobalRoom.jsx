import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../client";
import moment from "moment";

const GlobalRoom = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dataToUpdate, setDataToUpdate] = useState(null);
  const [chats, setChats] = useState([]);

  const chatScrollRef = useRef(null);

  const logout = async () => {
    setIsLoading(true);

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      setError(error?.message);
      console.log("Error", error);
      setTimeout(() => setError(null), 5000);
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
        setTimeout(() => setError(null), 5000);
      }

      if (data) {
        setChats([...chats, data]);
        setMessage("");
        scrollChatToBottom();
      }

      setIsLoading(false);
    } else {
      ("Write something before submitting!");
      setTimeout(() => setError(null), 5000);
      setIsLoading(false);
    }
  };

  const getChats = async () => {
    setIsLoading(true);

    if (user?.email == "basitali23@gmail.com") {
      const { data, error } = await supabaseClient
        .from("Chats")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        setError(error?.message);
        console.log("Error", error);
        setTimeout(() => setError(null), 5000);
      }

      if (data) {
        setChats([...data]);
        setMessage("");
      }

      setIsLoading(false);
    } else {
      const { data, error } = await supabaseClient
        .from("Chats")
        .select("*")
        .eq("isDelete", false)
        .order("created_at", { ascending: true });

      if (error) {
        setError(error?.message);
        console.log("Error", error);
        setTimeout(() => setError(null), 5000);
      }

      if (data) {
        setChats([...data]);
        setMessage("");
      }

      setIsLoading(false);
    }
  };

  const updateChat = async (chatData) => {
    setIsLoading(true);

    if (chatData) {
      const { error, data } = await supabaseClient
        .from("Chats")
        .update({ message: chatData?.message })
        .eq("id", chatData?.id)
        .select("*")
        .single();

      if (error) {
        setError(error?.message);
        console.log("Error", error);
        setTimeout(() => setError(null), 5000);
      }

      if (data) {
        const updatedArray = chats?.map((chat) => {
          if (chat?.id == data?.id) {
            return data;
          } else {
            return chat;
          }
        });
        setChats([...updatedArray]);
        setDataToUpdate(null);
        scrollChatToBottom();
      }

      setIsLoading(false);
    }
  };

  const deleteChat = async (chatData) => {
    setIsLoading(true);

    if (chatData) {
      const { error, data } = await supabaseClient
        .from("Chats")
        .update({ isDelete: true })
        .eq("id", chatData?.id)
        .select("*")
        .single();

      if (error) {
        setError(error?.message);
        console.log("Error", error);
        setTimeout(() => setError(null), 5000);
      }

      if (data && data?.isDelete) {
        const updatedArray = chats?.filter((chat) => chat?.id != data?.id);
        setChats([...updatedArray]);
        setDataToUpdate(null);
        scrollChatToBottom();
      }

      setIsLoading(false);
    }
  };

  const scrollChatToBottom = () => {
    // Scroll to the bottom of the element
    if (chatScrollRef && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      chatScrollRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  // SUPABASE SOCKET FOR REALTIME UPDATES
  const insertChatSocket = supabaseClient
    .channel("custom-all-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "Chats" },
      (payload) => {
        setChats([...chats, payload?.new]);
      }
    )
    .subscribe();

  const updateChatSocket = supabaseClient
    .channel("custom-all-channel")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "Chats" },
      (payload) => {
        if (payload?.new?.isDelete) {
          const updatedArray = chats?.filter(
            (chat) => chat?.id != payload?.new?.id
          );
          setChats([...updatedArray]);
        } else {
          const updatedArray = chats?.map((chat) => {
            if (chat?.id == payload?.new?.id) {
              return payload?.new;
            } else {
              return chat;
            }
          });
          setChats([...updatedArray]);
        }
      }
    )
    .subscribe();

  useEffect(() => {
    console.log("Chat Insert Socket", insertChatSocket);
    console.log("Chat Update Socket", updateChatSocket);

    const fetchChats = async () => {
      if (user?.email == "basitali23@gmail.com") {
        const { data, error } = await supabaseClient
          .from("Chats")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          setError(error?.message);
          console.log("Error", error);
          setTimeout(() => setError(null), 5000);
        }

        if (data) setChats([...data]);
      } else {
        const { data, error } = await supabaseClient
          .from("Chats")
          .select("*")
          .eq("isDelete", false)
          .order("created_at", { ascending: true });

        if (error) {
          setError(error?.message);
          console.log("Error", error);
          setTimeout(() => setError(null), 5000);
        }

        if (data) setChats([...data]);
      }
    };

    setInterval(() => fetchChats(), 500);
  }, []);

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
      <div className="w-[90vw] lg:w-[30vw] flex flex-col items-center justify-center gap-3">
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
          <div
            ref={chatScrollRef}
            className="flex-grow h-[60vh] overscroll-x-none overflow-y-auto border w-full p-3 rounded-md bg-white"
          >
            {chats?.length > 0 ? (
              chats?.map((item, index) => {
                if (item?.user_id != user?.user_id) {
                  return (
                    <div className="w-fit max-w-2/3 my-3" key={index}>
                      <h1 className="text-sm font-bold">{item?.user_name}</h1>
                      <p className="relative p-2 text-sm text-slate-600 bg-[#f5f5f5] rounded-tl-none rounded-xl">
                        {item?.message}
                      </p>
                      <div className="text-[0.6rem] text-slate-400 ml-px flex items-center justify-between gap-3">
                        {moment(item?.created_at).fromNow()}
                        {user?.email == "basitali23@gmail.com" && (
                          <span className="text-blue-600">
                            {item?.isDelete ? "Deleted" : "Not Deleted"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      className="w-fit max-w-2/3 my-3 text-right ml-auto"
                      key={index}
                    >
                      <h1 className="text-sm font-bold">You</h1>
                      <div
                        className="relative p-2 text-sm text-[#f5f5f5] bg-blue-600 rounded-tr-none rounded-xl"
                        onDoubleClick={() => setDataToUpdate(item)}
                      >
                        {dataToUpdate && dataToUpdate?.id == item?.id ? (
                          <textarea
                            style={{
                              resize: "none",
                            }}
                            name="messages"
                            id="message-box"
                            className="w-[90%] bg-transparent focus:outline-none active:outline-none pt-1"
                            placeholder="Enter your message here..."
                            value={dataToUpdate?.message}
                            onChange={(e) =>
                              setDataToUpdate({
                                ...dataToUpdate,
                                message: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") updateChat(dataToUpdate);
                            }}
                            autoFocus
                          />
                        ) : (
                          item?.message
                        )}
                        {dataToUpdate && dataToUpdate?.id == item?.id && (
                          <div className="absolute top-1/2 -translate-y-1/2 -left-11 flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4 text-red-600 cursor-pointer"
                              onClick={() => deleteChat(item)}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4 text-slate-500 cursor-pointer"
                              onClick={() => setDataToUpdate(null)}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-[0.6rem] text-slate-400 ml-px flex items-center justify-between gap-3">
                        <span className="text-blue-600">
                          {user?.email == "basitali23@gmail.com" &&
                            (item?.isDelete ? "Deleted" : "Not Deleted")}
                        </span>
                        {moment(item?.created_at).fromNow()}ß
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
