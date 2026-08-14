import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { myDetails, saveMyDetails } from "../services/mentor";
import Form from "../components/Form";
import Input from "../components/input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function MentorDetailsPage() {
  document.title = "FCT | Mentor Profile";
  const [mentorDetails, setMentorDetails] = useState({
    full_name: "",
    nic: "",
    email: "",
    home_address: "",
    phone: "",
    bank_branch: "",
    bank_account_number: "",
    id_front: null,
    id_back: null,
    status: "", // Approved, Rejected, Processing
  });

  const [previewFront, setPreviewFront] = useState(null);
  const [previewBack, setPreviewBack] = useState(null);
  const [fileNameFront, setFileNameFront] = useState(null);
  const [fileNameBack, setFileNameBack] = useState(null);

  const [submitted, setSubmitted] = useState(false); // 👈 track if details were submitted
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchMentorDetails();
  }, []);

  const fetchMentorDetails = async () => {
    try {
      const data = await myDetails();
      setMentorDetails({
        full_name: data.full_name || "",
        nic: data.nic || "",
        email: data.email || "",
        home_address: data.home_address || "",
        phone: data.phone || "",
        bank_branch: data.bank_branch || "",
        bank_account_number: data.bank_account_number || "",
        id_front: null,
        id_back: null,
        status: data.status || "",
      });

      // Set filenames if images exist in backend
      if (data.id_front_image) {
        setFileNameFront(data.id_front_image.split("/").pop());
        setPreviewFront(null);
      }
      if (data.id_back_image) {
        setFileNameBack(data.id_back_image.split("/").pop());
        setPreviewBack(null);
      }

      if (data.status) {
        setSubmitted(true); // if details exist from backend, treat as submitted
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setMentorDetails((prev) => ({ ...prev, [name]: file }));
      if (file) {
        const previewURL = URL.createObjectURL(file);
        if (name === "id_front_image") {
          setPreviewFront(previewURL);
          setFileNameFront(null); // clear filename until submitted
        }
        if (name === "id_back_image") {
          setPreviewBack(previewURL);
          setFileNameBack(null);
        }
      }
    } else {
      setMentorDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      for (let key in mentorDetails) {
        if (mentorDetails[key]) formData.append(key, mentorDetails[key]);
      }
      await saveMyDetails(formData);
      await Swal.fire({
        title: "Success",
        text: "Mentor details updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });

      // After first submission, status defaults to Processing
      setMentorDetails((prev) => ({
        ...prev,
        status: prev.status || "Processing",
      }));
      setSubmitted(true);

      // Refresh to get latest data & filenames
      fetchMentorDetails();
    } catch (err) {
      console.error(err);
      await Swal.fire({
        title: "Error",
        text: "Failed to update mentor details",
        icon: "error",
        confirmButtonText: "Try Again",
        customClass: {
          confirmButton: 'w-[200px] sm:w-[400px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <nav className="sticky top-0 w-full bg-gray-800 border-b border-gray-200 py-3 flex items-center justify-end px-6">
        <div className="flex flex-col text-right">
          <div className="font-semibold text-lg text-white">
            Future Code Technology - Mentor Profile
          </div>
          <span className="text-sm text-gray-400">
            Welcome back, {user?.username}
          </span>
        </div>
      </nav>

      <main className="flex-1 p-6 space-y-6">
        <Form
          title={`My Mentor Profile - ${user?.username}`}
          subtitle="Please fill the profile for the company use"
          onSubmit={handleSubmit}
          className="max-w-4xl"
        >
          <div className="space-y-6">
            <Input label="Full Name" name="full_name" placeholder="Enter Full Name" value={mentorDetails.full_name} onChange={handleChange} required />
            <Input label="NIC" name="nic" placeholder="Enter NIC Number" value={mentorDetails.nic} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" placeholder="example@gmail.com" value={mentorDetails.email} onChange={handleChange} required />
            <Input label="Home Address" name="home_address" placeholder="Enter Home Address" value={mentorDetails.home_address} onChange={handleChange} />
            <Input label="Phone" name="phone" placeholder="07X XXX XXXX" value={mentorDetails.phone} onChange={handleChange} required />
            <Input label="Bank Branch" name="bank_branch" placeholder="Enter Branch Name" value={mentorDetails.bank_branch} onChange={handleChange} />
            <Input label="Bank Account Number" name="bank_account_number" placeholder="Enter Bank Account Number" value={mentorDetails.bank_account_number} onChange={handleChange} />

            {/* Front Image */}
            <div>
              <label className="block font-medium mb-1">ID Front Image</label>
              <input
                type="file"
                name="id_front_image"
                onChange={handleChange}
                className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {/* Before submit → preview, After submit → filename */}
              {submitted && fileNameFront ? (
                <p className="mt-2 text-sm text-gray-600">Uploaded file: {fileNameFront}</p>
              ) : (
                previewFront && (
                  <img
                    src={previewFront}
                    alt="ID Front Preview"
                    className="w-64 h-64 object-contain mt-2 border"
                  />
                )
              )}
            </div>

            {/* Back Image */}
            <div>
              <label className="block font-medium mb-1">ID Back Image</label>
              <input
                type="file"
                name="id_back_image"
                onChange={handleChange}
                className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {submitted && fileNameBack ? (
                <p className="mt-2 text-sm text-gray-600">Uploaded file: {fileNameBack}</p>
              ) : (
                previewBack && (
                  <img
                    src={previewBack}
                    alt="ID Back Preview"
                    className="w-64 h-64 object-contain mt-2 border"
                  />
                )
              )}
            </div>

            {/* Status Display (only after first submit) */}
            {submitted && (
              <div>
                <label className="block font-medium mb-1">Current Status</label>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    mentorDetails.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : mentorDetails.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {mentorDetails.status || "Processing"}
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </Form>
      </main>
    </div>
  );
}
