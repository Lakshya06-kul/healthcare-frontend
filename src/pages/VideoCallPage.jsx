import { useMemo } from "react";
import AgoraCallMVP from "../components/AgoraCallMVP";

export default function VideoCallPage() {
  const appointmentId = "appointment-demo-101";
  const uid = "user-demo-1";

  const appId = useMemo(() => import.meta.env.VITE_AGORA_APP_ID || "", []);
  const token = useMemo(() => import.meta.env.VITE_AGORA_TOKEN || null, []);

  return (
    <section className="h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎥</div>
            <div>
              <h1 className="text-xl font-bold">Video Consultation</h1>
              <p className="text-blue-100 text-sm">Dr. Hamza Khan • Cardiology</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-500 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Connected</span>
            </div>
            <div className="text-sm bg-gray-800 px-4 py-2 rounded-lg">
              <span>⏱️ </span>
              <span className="font-mono">00:15:32</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full bg-black rounded-2xl shadow-2xl flex items-center justify-center relative">
          <AgoraCallMVP appId={appId} token={token} appointmentId={appointmentId} uid={uid} />
          
          {/* Overlay Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
            <button className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0-6l4 4m0 0l4-4m-4 4V4m0 12H5" />
              </svg>
            </button>
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow-lg transition-all hover:scale-105">
              End Call
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-gray-800 text-white p-4 border-t border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">👨‍⚕️</div>
            <div>
              <p className="font-semibold">Dr. Hamza Khan</p>
              <p className="text-sm text-gray-400">Cardiologist • 10 years experience</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-600 rounded-full">💬 Chat Available</span>
            <span className="px-3 py-1 bg-green-600 rounded-full">✓ Recording</span>
          </div>
        </div>
      </div>
    </section>
  );
}
