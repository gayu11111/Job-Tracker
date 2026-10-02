
const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");

// Load and display applications
async function loadApplications() {
    const response = await fetch("/api/applications");
    const applications = await response.json();

    jobList.innerHTML = "";

    applications.forEach(job => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${job.company}</td>
            <td>${job.role}</td>
            <td>${job.applied_date}</td>
            <td>
                <select id="status-${job.id}">
                    <option value="Applied" ${job.status === "Applied" ? "selected" : ""}>Applied</option>
                    <option value="Interview" ${job.status === "Interview" ? "selected" : ""}>Interview</option>
                    <option value="Selected" ${job.status === "Selected" ? "selected" : ""}>Selected</option>
                    <option value="Rejected" ${job.status === "Rejected" ? "selected" : ""}>Rejected</option>
                </select>
                <button onclick="updateApplication(${job.id})">Update</button>
            </td>
            <td>
                <button onclick="deleteApplication(${job.id})">Delete</button>
            </td>
        `;

        jobList.appendChild(row);
    });
}

// Add a new application
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const job = {
        company: document.getElementById("company").value,
        role: document.getElementById("role").value,
        applied_date: document.getElementById("applied_date").value,
        status: document.getElementById("status").value
    };

    const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(job)
    });

    if (response.ok) {
        form.reset();
        loadApplications();
    } else {
        alert("Failed to add application");
    }
});

// Update application status
async function updateApplication(id) {
    const status = document.getElementById(`status-${id}`).value;

    const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: status })
    });

    if (response.ok) {
        alert("Application status updated!");
        loadApplications();
    } else {
        alert("Failed to update status");
    }
}

// Delete an application
async function deleteApplication(id) {
    if (!confirm("Are you sure you want to delete this application?")) {
        return;
    }

    const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        loadApplications();
    } else {
        alert("Failed to delete application");
    }
}

// Load applications when the page opens
loadApplications();
