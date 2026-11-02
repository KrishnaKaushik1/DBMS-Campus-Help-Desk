"use client";

import { useState, useEffect, FormEvent } from "react";

export default function Home() {
  const [requests, setRequests] = useState<any[]>([]);
  const [source, setSource] = useState<string>("");
  const [views, setViews] = useState<number>(0);
  
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    const res = await fetch("/api/requests");
    const data = await res.json();
    if (data.requests) {
      setRequests(data.requests);
      setSource(data.source);
    }
  };

  const fetchViews = async () => {
    const res = await fetch("/api/views");
    const data = await res.json();
    if (data.views) {
      setViews(data.views);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchViews();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !message) {
      setError("Name and message are required.");
      return;
    }

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_name: name, message }),
    });

    const data = await res.json();
    
    if (data.success) {
      setName("");
      setMessage("");
      fetchRequests(); 
    } else {
      setError(data.error || "Failed to post request.");
    }
  };

  const handleResolve = async (id: number) => {
    const res = await fetch(`/api/requests?id=${id}`, {
      method: "DELETE",
    });
    
    const data = await res.json();
    
    if (data.success) {
      fetchRequests(); 
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-2">Campus Help Desk Board</h1>
      <p className="text-gray-600 mb-6 font-semibold">Board views: {views}</p>

      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-100 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-black">Post a Request</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        
        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 border rounded text-black"
        />
        <textarea
          placeholder="Help Request Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 mb-3 border rounded text-black h-24"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Post Request
        </button>
      </form>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Latest Requests</h2>
          <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded text-sm font-mono">
            Source: {source}
          </span>
        </div>

        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="p-4 border rounded shadow-sm bg-white text-black flex justify-between items-start">
              <div>
                <p className="font-bold text-lg mb-1">{req.student_name}</p>
                <p className="text-gray-700 mb-2">{req.message}</p>
                <p className="text-xs text-gray-400">
                  {new Date(req.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => handleResolve(req.id)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Resolve
              </button>
            </div>
          ))}
          {requests.length === 0 && <p className="text-gray-500">No requests yet.</p>}
        </div>
      </div>
    </main>
  );
}