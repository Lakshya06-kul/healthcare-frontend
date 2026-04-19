import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

function RemoteVideo({ user }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (user?.videoTrack && containerRef.current) {
      user.videoTrack.play(containerRef.current);
    }
  }, [user]);

  return (
    <div
      ref={containerRef}
      style={{
        width: 320,
        height: 240,
        background: "#111",
        borderRadius: 8,
        overflow: "hidden"
      }}
    />
  );
}

export default function AgoraCallMVP({ appId, token, appointmentId, uid }) {
  const localVideoRef = useRef(null);

  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState({
    audioTrack: null,
    videoTrack: null
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        setRemoteUsers((prev) => {
          const exists = prev.some((u) => u.uid === user.uid);
          if (exists) {
            return prev.map((u) => (u.uid === user.uid ? user : u));
          }
          return [...prev, user];
        });
      }

      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === "video") {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      }
    };

    const handleUserLeft = (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
      leaveCall();
    };
  }, []);

  const joinCall = async () => {
    try {
      if (!appId || !appointmentId) {
        alert("Missing appId or appointmentId");
        return;
      }

      await client.join(appId, appointmentId, token || null, uid || null);

      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      setLocalTracks({ audioTrack, videoTrack });

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      await client.publish([audioTrack, videoTrack]);

      setJoined(true);
      setIsMuted(false);
      setIsCameraOff(false);
    } catch (error) {
      console.error("joinCall failed:", error);
      alert("Could not join call");
    }
  };

  const leaveCall = async () => {
    try {
      const { audioTrack, videoTrack } = localTracks;

      audioTrack?.stop();
      audioTrack?.close();

      videoTrack?.stop();
      videoTrack?.close();

      await client.leave();

      setLocalTracks({ audioTrack: null, videoTrack: null });
      setRemoteUsers([]);
      setJoined(false);
      setIsMuted(false);
      setIsCameraOff(false);
    } catch (error) {
      console.error("leaveCall failed:", error);
    }
  };

  const toggleMute = async () => {
    if (!localTracks.audioTrack) return;

    const nextMuted = !isMuted;
    await localTracks.audioTrack.setEnabled(!nextMuted);
    setIsMuted(nextMuted);
  };

  const toggleCamera = async () => {
    if (!localTracks.videoTrack) return;

    const nextCameraOff = !isCameraOff;
    await localTracks.videoTrack.setEnabled(!nextCameraOff);
    setIsCameraOff(nextCameraOff);
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>Video Call (Channel: {appointmentId || "N/A"})</h2>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h3>Local</h3>
          <div
            ref={localVideoRef}
            style={{
              width: 320,
              height: 240,
              background: "#222",
              borderRadius: 8,
              overflow: "hidden"
            }}
          />
        </div>

        <div>
          <h3>Remote Users</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {remoteUsers.length === 0 && <p>No remote video yet</p>}
            {remoteUsers.map((user) => (
              <RemoteVideo key={user.uid} user={user} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!joined ? (
          <button onClick={joinCall}>Join Call</button>
        ) : (
          <>
            <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
            <button onClick={toggleCamera}>{isCameraOff ? "Camera On" : "Camera Off"}</button>
            <button onClick={leaveCall}>Leave</button>
          </>
        )}
      </div>
    </div>
  );
}
