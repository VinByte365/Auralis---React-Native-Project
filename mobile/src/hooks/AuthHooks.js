import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../redux/thunks/authThunk";

export default function AuthHooks() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    password: "",
    email: "",
    age: 0,
  });
  const { loading, user, error, isLoggedIn } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    console.log(loading, user, error, isLoggedIn);
  }, [error, loading, user, isLoggedIn]);

  const handleLoginInput = (field, value) => {
    setCredentials({ ...credentials, [field]: value });
  };

  const handleRegisterInput = (field, value) => {
    setRegisterForm({ ...registerForm, [field]: value });
  };

  const loginSubmit = async () => {
    console.log("reached");
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/;
    if (!credentials.email) setError("Email field is required");
    if (!emailRegex.test(credentials.email)) setError("Invalid email");
    if (!credentials.password) setError("Password field is required!");
    console.log(credentials);
    login(credentials);

    return;
  };

  return {
    credentials,
    registerForm,
    isLoggedIn,
    loading,
    error,
    user,
    handleLoginInput,
    handleRegisterInput,
    loginSubmit,
  };
}
