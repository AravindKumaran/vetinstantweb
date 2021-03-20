import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Button from "components/shared/Forms/Button";
import { useAuth } from "context/use-auth";
import client from "services/client";
import MaterialTable from "material-table";
import toast from "react-hot-toast";

const Admin = () => {
  const { loadUser, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hospitals, setHopitals] = useState([]);
  const [doctorDetails, setDoctorDetails] = useState();

  useEffect(() => {
    const getDoctorDetails = async () => {
      try {
        setLoading(true);
        const res = await client.get(`/doctors/user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        });
        setDoctorDetails(res.data?.doctor);
        setLoading(false);
      } catch (err) {
        if (err.response?.data?.msg) {
          toast.error("Please add your details below");
        }

        setLoading(false);
      }
    };
    if (user) {
      getDoctorDetails();
    }
  }, [user?._id]);

  useEffect(() => {
    const getAllHospitals = async () => {
      setLoading(true);
      try {
        const res = await client.get("/hospitals", {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        });
        let allHospitals = res.data.hospitals;

        let newHospitals = allHospitals.reduce((acc, item) => {
          acc.push({
            label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            value: item._id,
          });
          return acc;
        }, []);
        setHopitals(newHospitals);
        setLoading(false);
      } catch (error) {
        toast.error("Something Went Wrong! Please try again later!");
        setLoading(false);
      }
    };
    getAllHospitals();
  }, []);

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

  const data = [
    {
      name: user.name,
      email: user.emailID,
      hospital: doctorDetails?.hospital?.name,
      detail: <div><Button variant="outlined">Accept</Button>{" "}<Button variant="outlined">Decline</Button></div>,
    },
  ];

  const columns = [
    {
      title: "Doctor Name",
      field: "name",
    },
    {
      title: "Email",
      field: "email",
    },
    {
      title: "Hospital",
      field: "hospital",
    },
    {
      title: "Detail",
      field: "detail",
    },
  ];

  return (
    <div className="app">
      <div className="containers">
        {data.map((row) => row.doctorDetails?.hospital?.name)}
        <MaterialTable title="Doctor Details" data={data} columns={columns} />
      </div>
    </div>
  );
};
export default Admin;
