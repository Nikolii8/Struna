# app.py
from flask import Flask, jsonify, request, send_from_directory
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
app = Flask(__name__, static_folder="static")

def ensure_counter_row():
    # Проверява дали има ред с id=1, и ако няма - вкарва начален ред
    resp = supabase.table("counter").select("id").eq("id", 1).execute()
    rows = resp.data or []
    if not rows:
        supabase.table("counter").insert({"id": 1, "clicks": 0}).execute()

# Увери се, че редът съществува при стартиране
ensure_counter_row()

@app.route("/count", methods=["GET"])
def get_count():
    try:
        resp = supabase.table("counter").select("clicks").eq("id", 1).execute()
        rows = resp.data or []
        clicks = rows[0]["clicks"] if rows else 0
        return jsonify({"clicks": clicks})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/click", methods=["POST"])
def add_click():
    try:
        # Четем текущия clicks, увеличаваме и записваме обратно
        resp = supabase.table("counter").select("clicks").eq("id", 1).execute()
        rows = resp.data or []
        clicks = rows[0]["clicks"] if rows else 0
        new = clicks + 1
        supabase.table("counter").update({"clicks": new}).eq("id", 1).execute()
        return jsonify({"clicks": new})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/waitlist", methods=["POST"])
def add_email():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400
        supabase.table("waitlist").insert({"email": email}).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Serve static and html files (както преди)
@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def serve_frontend(path):
    return send_from_directory(os.getcwd(), path)

if __name__ == "__main__":
    app.run(debug=True)
