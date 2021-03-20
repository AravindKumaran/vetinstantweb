import React, { createContext, useContext, useReducer } from "react";
import client from "services/client";
// import setAuthToken from 'utils/setAuthToken'

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const initialState = {
  token: localStorage.getItem("token") || null,
  loading: false,
  user: null,
  isAuthenticated: null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return {
        ...state,
        loading: true,
      };

    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload);
      return {
        ...state,
        ...action.payload,
        loading: false,
        isAuthenticated: true,
      };
    case "USER_LOADED":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
      };

    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
    case "AUTH_ERROR":
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };

    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };

    case "CLEAR_ERRORS":
      return {
        ...state,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadUser = async () => {
    try {
      dispatch({
        type: "LOADING",
      });
      const res = await client.patch(
        "/users/me",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      );

      if (res.data.user.role !== "doctor") {
        dispatch({
          type: "AUTH_ERROR",
          payload: "Something Went Wrong! Try Again Later",
        });
        return;
      }

      dispatch({
        type: "USER_LOADED",
        payload: res.data.user,
      });
    } catch (err) {
      dispatch({
        type: "AUTH_ERROR",
        payload:
          err.response?.data.msg || "Something Went Wrong! Try Again Later",
      });
    }
  };

  const loginUser = async (data) => {
    try {
      dispatch({
        type: "LOADING",
      });
      const res = await client.post("/auth/login", data);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: res.data.token,
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_FAIL",
        payload:
          err.response?.data.msg || "Something Went Wrong! Try Again Later",
      });
    }
  };

  const registerUser = async (data) => {
    try {
      dispatch({
        type: "LOADING",
      });
      const res = await client.post("/auth/signup", data);
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: res.data.token,
      });
    } catch (err) {
      dispatch({
        type: "REGISTER_FAIL",
        payload:
          err.response?.data.msg || "Something Went Wrong! Try Again Later",
      });
    }
  };

  const logoutUser = () => dispatch({ type: "LOGOUT" });

  const clearErrors = () => dispatch({ type: "CLEAR_ERRORS" });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        error: state.error,
        loading: state.loading,
        loginUser,
        registerUser,
        logoutUser,
        loadUser,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
