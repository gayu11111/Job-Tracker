
from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect("jobtrack.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            applied_date TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return render_template("index.html")

# View all applications
@app.route("/api/applications", methods=["GET"])
def get_applications():
    conn = get_db()
    jobs = conn.execute(
        "SELECT * FROM applications ORDER BY id DESC"
    ).fetchall()
    conn.close()

    return jsonify([dict(job) for job in jobs])

# Add a new application
@app.route("/api/applications", methods=["POST"])
def add_application():
    data = request.get_json()

    conn = get_db()
    conn.execute("""
        INSERT INTO applications
        (company, role, applied_date, status)
        VALUES (?, ?, ?, ?)
    """, (
        data["company"],
        data["role"],
        data["applied_date"],
        data["status"]
    ))
    conn.commit()
    conn.close()

    return jsonify({"message": "Application added"}), 201

# Delete an application
@app.route("/api/applications/<int:job_id>", methods=["DELETE"])
def delete_application(job_id):
    conn = get_db()

    cursor = conn.execute(
        "DELETE FROM applications WHERE id = ?",
        (job_id,)
    )

    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Application not found"}), 404

    return jsonify({"message": "Application deleted"}), 200

# Update an application status
@app.route("/api/applications/<int:job_id>", methods=["PUT"])
def update_application(job_id):
    data = request.get_json()

    conn = get_db()
    cursor = conn.execute(
        "UPDATE applications SET status = ? WHERE id = ?",
        (data["status"], job_id)
    )

    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Application not found"}), 404

    return jsonify({"message": "Application status updated"}), 200

if __name__ == "__main__":
    init_db()
    app.run(debug=True)