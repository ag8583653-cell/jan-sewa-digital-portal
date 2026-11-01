
let selectedService = "";
let generatedOTP = "123456";
let verified = false;

const API_URL = "http://localhost:5075/api/applications";

const serviceForms = {
    "Aadhaar Services": `
        <label>Select Service</label>
        <select name="service" required>
            <option value="">Choose Service</option>
            <option>Address Update</option>
            <option>Name Update</option>
            <option>Date of Birth Update</option>
            <option>Document Update</option>
        </select>
        <label>Full Name</label>
        <input type="text" name="name" required>
        <label>Email</label>
        <input type="email" name="email">
    `,

    "PAN Card Services": `
        <label>Select Service</label>
        <select name="service" required>
            <option value="">Choose Service</option>
            <option>New PAN Card</option>
            <option>PAN Correction</option>
            <option>PAN Reprint</option>
        </select>
        <label>Full Name</label>
        <input type="text" name="name" required>
        <label>Date of Birth</label>
        <input type="date" name="dob" required>
        <label>Father's Name</label>
        <input type="text" name="fatherName" required>
        <label>Email</label>
        <input type="email" name="email">
    `,

    "Voter ID Services": `
        <label>Select Service</label>
        <select name="service" required>
            <option value="">Choose Service</option>
            <option>New Voter Registration</option>
            <option>Voter ID Correction</option>
            <option>Address Change</option>
        </select>
        <label>Full Name</label>
        <input type="text" name="name" required>
        <label>Date of Birth</label>
        <input type="date" name="dob" required>
        <label>Gender</label>
        <select name="gender" required>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
        </select>
        <label>State</label>
        <input type="text" name="state" required>
        <label>Address</label>
        <textarea name="address" required></textarea>
    `,

    "Government Schemes": `
        <label>Select Scheme</label>
        <select name="scheme" required>
            <option value="">Choose Scheme</option>
            <option>PM Awas Yojana</option>
            <option>Ayushman Bharat</option>
            <option>PM Kisan</option>
            <option>Other Scheme</option>
        </select>
        <label>Applicant Name</label>
        <input type="text" name="name" required>
        <label>Date of Birth</label>
        <input type="date" name="dob" required>
        <label>Annual Family Income</label>
        <input type="number" name="income" required>
        <label>Address</label>
        <textarea name="address" required></textarea>
    `,

    "Online Application": `
        <label>Application Category</label>
        <select name="category" required>
            <option value="">Choose Category</option>
            <option>Income Certificate</option>
            <option>Caste Certificate</option>
            <option>Residence Certificate</option>
            <option>Other Application</option>
        </select>
        <label>Applicant Name</label>
        <input type="text" name="name" required>
        <label>Subject</label>
        <input type="text" name="subject" required>
        <label>Application Details</label>
        <textarea name="details" required></textarea>
        <label>Email</label>
        <input type="email" name="email">
    `,

    "Application Status": `
        <label>Application Number</label>
        <input type="text" name="applicationNumber" required>
    `
};

function openForm(service) {
    selectedService = service;
    verified = false;

    document.getElementById("formTitle").innerText = service;

    document.getElementById("serviceFields").innerHTML =
        serviceForms[service];

    document.getElementById("applicationForm").style.display = "block";

    const isStatus = service === "Application Status";
    const mobileInput = document.getElementById("mobile");

mobileInput.required = !isStatus;

    document.getElementById("otpSection").style.display =
        isStatus ? "none" : "block";

    document.getElementById("submitBtn").style.display =
        isStatus ? "block" : "none";

    document.getElementById("mobile").value = "";
    document.getElementById("otp").value = "";
    document.getElementById("message").innerText = "";

    document.getElementById("applicationForm").scrollIntoView({
        behavior: "smooth"
    });
}

// Demo OTP only - real SMS verification nahi hai.
function sendOTP() {
    const mobile = document.getElementById("mobile").value;

    if (!/^[0-9]{10}$/.test(mobile)) {
        alert("Enter valid 10 digit mobile number");
        return;
    }

    generatedOTP = "123456";
    verified = false;

    document.getElementById("message").innerText =
        "Demo OTP: 123456 (not a real SMS)";

    document.getElementById("submitBtn").style.display = "none";
}

function verifyOTP() {
    const otp = document.getElementById("otp").value;

    if (otp === generatedOTP) {
        verified = true;

        document.getElementById("message").innerText =
            "Demo OTP Verified Successfully!";

        document.getElementById("submitBtn").style.display = "block";
    } else {
        alert("Wrong OTP! Demo OTP is 123456");
    }
}

document.addEventListener("DOMContentLoaded", function () {

    const serviceForm = document.getElementById("serviceForm");

    serviceForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(serviceForm);

        // Application Status Check
        if (selectedService === "Application Status") {
            const number = formData.get("applicationNumber");

            try {
                const response = await fetch(
                    `${API_URL}/${encodeURIComponent(number)}`
                );

                if (!response.ok) {
                    alert(response.status === 404
                        ? "Application not found!"
                        : "Unable to check application status.");
                    return;
                }

                const result = await response.json();

                alert(
                    "Application Found!\n" +
                    "Application Number: " + result.applicationNumber +
                    "\nService: " + result.serviceName +
                    "\nApplicant: " + result.applicantName +
                    "\nStatus: " + result.status
                );

            } catch (error) {
                alert("Backend connection failed. Please check the server.");
            }

            return;
        }

        // Application Submission
        if (!verified) {
            alert("Please verify demo OTP first.");
            return;
        }

        const applicantName = formData.get("name");

        if (!applicantName) {
            alert("Please enter your name.");
            return;
        }

        const mobile = document.getElementById("mobile").value;

        const applicationData = {
            serviceName: selectedService,
            applicantName: applicantName,
            mobile: mobile
        };

        const submitBtn = document.getElementById("submitBtn");
        submitBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(applicationData)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Application submission failed.");
                return;
            }

            alert(
                result.message +
                "\nApplication Number: " + result.applicationNumber +
                "\nStatus: " + result.status
            );

            serviceForm.reset();
            verified = false;

            document.getElementById("applicationForm").style.display = "none";

        } catch (error) {
            alert("Backend connection failed. Please check the server.");
        } finally {
            submitBtn.disabled = false;
        }
        // Slideshow
let currentSlide = 0;

f// Slideshow
let currentSlide = 0;

function showSlide(index) {
    const slides = document.querySelectorAll(".slideshow .slide");

    if (slides.length === 0) return;

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(slide => {
        slide.classList.remove("active");
    });

    slides[currentSlide].classList.add("active");
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
}

document.addEventListener("DOMContentLoaded", function () {
    showSlide(0);

    setInterval(function () {
        changeSlide(1);
    }, 4000);
});