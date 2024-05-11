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
          setTimeout(() => setSuccessMsg(null), 5000);
        } else {
          console.log("Data", data);
          console.log("Error", error);
          setSuccessMsg("Check email for verification link!");
          setTimeout(() => setSuccessMsg(null), 5000);
          navigate("/global-room");
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
      <div className="flex w-[60vw] lg:w-[30vw] flex-col gap-5 items-center justify-center bg-slate-100 shadow-lg p-5 rounded-lg">
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
          <input
            type="password"
            className="h-8 rounded-md px-2"
            id="pwd"
            value={formData.password}
            name="password"
            placeholder="Secret keyword"
            onChange={handleChange}
          />
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
