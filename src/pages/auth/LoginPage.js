import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useHistory } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

import Button from "components/shared/Forms/Button";
import Input from "components/shared/Forms/Input";
import PasswordInput from "components/shared/Forms/PasswordInput";
import LoadingSpinner from "components/shared/UI/LoadingSpinner";

import { useAuth } from "context/use-auth";
import { GoogleLogin } from "react-google-login";
import client from "services/client";
import Admin from "../doctor/Admin";

const LoginPage = () => {
  const { handleSubmit, register, errors } = useForm();
  const {
    loginUser,
    error,
    clearErrors,
    isAuthenticated,
    loadUser,
    loading: cLoading,
  } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // setAuthToken(localStorage.token)
      history.replace("/");
    }

    if (error) {
      toast.error(error);
      clearErrors();
    }

    // eslint-disable-next-line
  }, [error, isAuthenticated]);

  const onSubmit = ({ email, password }) => {
    // console.log('cliekd')
    loginUser({
      emailID: email,
      password,
    });
    clearErrors();
  };

  const handleGoogleAuth = async (res) => {
    console.log("Ress", res.profileObj);
    try {
      setLoading(true);
      const password = res.profileObj.googleId + Date.now();
      const googleRes = await client.post("/auth/saveGoogle", {
        name: res.profileObj.name,
        emailID: res.profileObj.email,
        password: password,
        role: "doctor",
      });
      localStorage.setItem("token", googleRes.data.token);
      loadUser();
      setLoading(false);
    } catch (error) {
      console.log("Error", error);
      toast.error("Something Went Wrong! Please try after some time");
      setLoading(false);
    }
  };

  return (
    <div className="center">
      {(loading || cLoading) && <LoadingSpinner asOverlay />}
      <div className="form__wrapper">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-center">Welcome</h2>

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="john@gmail.com"
            myRef={register({
              required: "Please enter your email",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "invalid email address",
              },
            })}
            error={errors.email}
          />

          <div className="forgot__wrapper">
            <PasswordInput
              label="Password"
              name="password"
              placeholder="********"
              myRef={register({
                required: "Please enter your password",
                minLength: {
                  value: 8,
                  message: "Password must be atleast 8 characters long",
                },
              })}
              error={errors.password}
            />

            <Link className="forgot" to="/forgotPassword">
              Forgot Password?
            </Link>
          </div>

          <Button classNames="full" type="submit">
            Login
          </Button>
        </form>

        <hr />

        <GoogleLogin
          clientId="320113619885-gk7d3v66vs3bf4nksn6mf3tj2s6prgcs.apps.googleusercontent.com"
          buttonText="Login With Google"
          onSuccess={handleGoogleAuth}
          // onFailure={handleGoogleAuth}
          cookiePolicy={"single_host_origin"}
          render={(renderProps) => (
            <button onClick={renderProps.onClick} className="google_btn">
              <div className="flex-center">
                <FcGoogle style={{ fontSize: "2.5rem" }} />
                <span className="google__text">Login With Google</span>
              </div>
            </button>
          )}
        />
      </div>

      <div className="flex-sbt py-10">
        <span>Don't have an account?</span>

        <Link to="/register" className="btn">
          Register
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
