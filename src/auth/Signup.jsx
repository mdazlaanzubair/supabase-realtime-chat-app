import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabaseClient } from "../client";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPwd, setIsShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);

    if (
      formData?.name?.length <= 0 ||
      formData?.email?.length <= 0 ||
      formData?.password?.length <= 0
    ) {
      setError("All fields are required!");
      setTimeout(() => setSuccessMsg(null), 5000);
      return;
    } else {
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email: formData?.email,
          password: formData?.password,
          options: {
            data: {
              name: formData?.name,
            },
          },
        });

        if (error) {
          setError(error?.message);
          console.log("Error", error);
          setTimeout(() => setSuccessMsg(null), 10000);
        } else {
          setSuccessMsg("Check email for verification link!");
          setTimeout(() => setSuccessMsg(null), 5000);
        }

        setIsLoading(false);
      } catch (error) {
        setError("Something went wrong while registration. Try again later!");
        setTimeout(() => setSuccessMsg(null), 5000);
        console.error("Error submitting form:", error.message);
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    setError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    const user_id = localStorage.getItem("user_id");

    if (
      email?.length > 0 ||
      name?.length > 0 ||
      access_token?.length > 0 ||
      user_id?.length > 0 ||
      refresh_token?.length > 0
    ) {
      navigate("/global-room");
    }
  }, []);
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex w-[90vw] lg:w-[30vw] flex-col gap-5 items-center justify-center bg-slate-100 shadow-lg p-5 rounded-lg">
        <h1 className="text-xl font-bold">Register</h1>
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
        {successMsg && (
          <p className="bg-green-600/20 text-green-600 px-3 py-2 rounded w-full flex items-center gap-2">
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
            {successMsg}
          </p>
        )}
        <div className="w-full flex flex-col">
          <label htmlFor="name" className="text-lg mb-3">
            Fullname
          </label>
          <input
            type="text"
            className="h-8 rounded-md px-2"
            name="name"
            id="name"
            value={formData.name}
            placeholder="e.g. John Doe"
            onChange={handleChange}
          />
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="email" className="text-lg mb-3">
            Email
          </label>
          <input
            type="email"
            className="h-8 rounded-md px-2"
            id="email"
            name="email"
            value={formData.email}
            placeholder="e.g. john.d@example.com"
            onChange={handleChange}
          />
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="pwd" className="text-lg mb-3">
            Password
          </label>

          <div className="relative w-full">
            <input
              type={isShowPwd ? "text" : "password"}
              className="w-full h-8 rounded-md px-2"
              name="password"
              id="pwd"
              value={formData?.password}
              placeholder="Secret keyword"
              onChange={handleChange}
            />
            {isShowPwd ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="absolute top-1/2 -translate-y-1/2 right-2 w-4 h-4 cursor-pointer"
                onClick={() => setIsShowPwd(false)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="absolute top-1/2 -translate-y-1/2 right-2 w-4 h-4 cursor-pointer"
                onClick={() => setIsShowPwd(true)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-3 bg-blue-600 rounded-md h-8 text-white justify-center flex items-center gap-2"
          disabled={isLoading}
        >
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
          Register
        </button>
        <Link to="/" className="text-blue-600">
          Already have an account
        </Link>
      </div>
    </form>
  );
};

export default SignupForm;
