let selectedService = "";
let generatedOTP = "123456";
let verified = false;


const API_URL = "http://127.0.0.1:5075/api/applications";

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


// Open Citizen Service Form
function openForm(service) {

    if (!serviceForms[service]) {
        alert("Service form not found!");
        return;
    }

    selectedService = service;
    verified = false;

    document.getElementById("formTitle").innerText = service;
    document.getElementById("serviceFields").innerHTML = serviceForms[service];
    document.getElementById("applicationForm").style.display = "block";

    const isStatus = service === "Application Status";

    document.getElementById("mobile").required = !isStatus;
    document.getElementById("otpSection").style.display = isStatus ? "none" : "block";
    document.getElementById("submitBtn").style.display = isStatus ? "block" : "none";

    document.getElementById("mobile").value = "";
    document.getElementById("otp").value = "";
    document.getElementById("message").innerText = "";

    document.getElementById("applicationForm").scrollIntoView({
        behavior: "smooth"
    });
}


// Demo OTP
function sendOTP() {

    const mobile = document.getElementById("mobile").value;

    if (!/^[0-9]{10}$/.test(mobile)) {
        alert("Enter valid 10 digit mobile number");
        return;
    }

    generatedOTP = "123456";
    verified = false;

    document.getElementById("message").innerText =
        "Demo OTP: 123456 (Not a real SMS)";

    document.getElementById("submitBtn").style.display = "none";
}


// Verify OTP
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
    // APPLICATION SUBMIT AND STATUS CHECK

document.getElementById("serviceForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    // Application Status Check
    if (selectedService === "Application Status") {

        const number = document.querySelector(
            '[name="applicationNumber"]'
        ).value.trim();

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(number)}`
            );

            if (!response.ok) {
                alert("Application not found!");
                return;
            }

            const data = await response.json();

            alert(
                "Application Number: " + data.applicationNumber +
                "\nStatus: " + data.status
            );

        } catch (error) {
            alert("Backend connection error!");
        }

        return;
    }

    // OTP Verification
    if (!verified) {
        alert("Please verify OTP first!");
        return;
    }

    const formData = new FormData(this);

    const applicantName = formData.get("name");

    const applicationData = {
        ApplicantName: applicantName,
        Mobile: document.getElementById("mobile").value,
        ServiceName: selectedService
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(applicationData)
        });

        const data = await response.json();

        if (!response.ok) {
            alert("Error: " + JSON.stringify(data));
            return;
        }

        document.getElementById("message").innerHTML =
            "Application Submitted Successfully!<br>" +
            "Application ID: <strong>" +
            data.applicationNumber +
            "</strong><br>Status: " + data.status;

        document.getElementById("submitBtn").style.display = "none";

        alert("Your Application ID is: " + data.applicationNumber);
        // Close form after successful submission
document.getElementById("applicationForm").style.display = "none";

// Reset form
this.reset();

// Reset OTP verification
verified = false;

    } catch (error) {

        alert("Backend connection failed! Please check your API.");

        console.error(error);
    }
});

// PRACTICAL TRAINING CENTER

let currentTraining = "";
let currentStep = 0;


const trainingData = {
    digilocker: {
        title: "DigiLocker Practical Training",
        steps: [
            "Step 1: DigiLocker ki official website digilocker.gov.in kholo.",
            "Step 2: Sign In ya Create Account par click karo.",
            "Step 3: Apna mobile number enter karo.",
            "Step 4: OTP verify karo.",
            "Step 5: Aadhaar details se account setup karo.",
            "Step 6: Issued Documents section mein documents dekho."
        ]
    },

    aadhaar: {
        title: "Aadhaar Practical Training",
        steps: [
            "Step 1: UIDAI ki official website uidai.gov.in kholo.",
            "Step 2: My Aadhaar section par jao.",
            "Step 3: Download Aadhaar option select karo.",
            "Step 4: Aadhaar number ya VID enter karo.",
            "Step 5: Captcha aur OTP verification complete karo.",
            "Step 6: Aadhaar PDF download karo."
        ]
    },

    pan: {
        title: "PAN Card Practical Training",
        steps: [
            "Step 1: Income Tax ya authorised PAN service ki official website kholo.",
            "Step 2: New PAN application option select karo.",
            "Step 3: Applicant ki details bharo.",
            "Step 4: Required documents upload karo.",
            "Step 5: Details verify karke application submit karo.",
            "Step 6: Acknowledgement number save karo."
        ]
    }
};

function showTraining(type) {
    currentTraining = type;
    currentStep = 0;

    const training = trainingData[type];

    if (!training) return;

    document.getElementById("trainingContent").style.display = "block";
    document.getElementById("trainingTitle").innerText = training.title;

    document.getElementById("trainingSteps").innerHTML = `
        <h3 id="stepNumber"></h3>
        <p id="stepInstruction"></p>

        <button onclick="previousTrainingStep()">Previous</button>
        <button onclick="nextTrainingStep()">Next</button>
        <button onclick="completeTraining()">Complete Training</button>
    `;

    displayTrainingStep();

    document.getElementById("trainingContent")
        .scrollIntoView({ behavior: "smooth" });
}

function displayTrainingStep() {
    const steps = trainingData[currentTraining].steps;

    document.getElementById("stepNumber").innerText =
        "Step " + (currentStep + 1) + " of " + steps.length;

    document.getElementById("stepInstruction").innerText =
        steps[currentStep];
}

function previousTrainingStep() {
    if (currentStep > 0) {
        currentStep--;
        displayTrainingStep();
    }
}

function nextTrainingStep() {
    const steps = trainingData[currentTraining].steps;

    if (currentStep < steps.length - 1) {
        currentStep++;
        displayTrainingStep();
    }
}

function completeTraining() {
    alert("Congratulations! You have completed the training.");
    document.getElementById("trainingContent").style.display = "none";
}

window.showTraining = showTraining;
window.displayTrainingStep = displayTrainingStep;
window.previousTrainingStep = previousTrainingStep;
window.nextTrainingStep = nextTrainingStep;
window.completeTraining = completeTraining;

}
