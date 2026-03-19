import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../redux/thunks/authThunk";
import { useNavigation } from "@react-navigation/native";

export default function AuthHooks() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    password: "",
    email: "",
  });

const navigation = useNavigation();

  const [formError, setFormError] = useState({});
  const { loading, user, error, isLoggedIn } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();

  const handleLoginInput = (field, value) => {
    setCredentials({ ...credentials, [field]: value });
  };

  const handleRegisterInput = (field, value) => {
    setRegisterForm({ ...registerForm, [field]: value });
  };

  const loginRules = {
    email: {
      required: true,
      regex: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/,
      message: "Invalid email format",
    },
    password: {
      required: true,
      minLength: 6,
    },
  };

  const registerRules = {
    name: {
      required: true,
      regex: /^[a-zA-Z ]+$/,
      message: "Name should only contain letters",
    },
    email: {
      required: true,
      regex: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/,
      message: "Invalid email format",
    },
    password: {
      required: true,
      minLength: 6,
    },
  };

  const validate = (data, rules) => {
    const errors = {};

    Object.keys(rules).forEach((field) => {
      const value = data[field];
      const fieldRules = rules[field];

      if (fieldRules.required && !value) {
        errors[field] = `${field} is required`;
        return;
      }

      if (fieldRules.regex && value && !fieldRules.regex.test(value)) {
        errors[field] = fieldRules.message || `Invalid ${field}`;
      }

      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] =
          `${field} must be at least ${fieldRules.minLength} characters`;
      }
    });

    return errors;
  };

  const loginSubmit = async () => {
    const errors = validate(credentials, loginRules);

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
    setFormError({});

    try {
      await dispatch(login(credentials)).unwrap();
    } catch (submissionError) {
      setFormError((current) => ({
        ...current,
        general:
          submissionError?.error || submissionError?.message || "Login failed",
      }));
    }
  };

  const registerSubmit = async () => {
    const errors = validate(registerForm, registerRules);

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
    setFormError({});

    try {
      await dispatch(register(registerForm)).unwrap();
    } catch (submissionError) {
      setFormError((current) => ({
        ...current,
        general:
          submissionError?.error ||
          submissionError?.message ||
          "Registration failed",
      }));
    }
  };

  return {
    credentials,
    registerForm,
    isLoggedIn,
    loading,
    error,
    user,
    formError,
    handleLoginInput,
    handleRegisterInput,
    loginSubmit,
    registerSubmit,
    navigation
  };
}
