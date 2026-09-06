import { useEffect, useRef, useState } from "react";
import { apiUrl, authFetch } from "./api";

export function useGrievanceAudio({ grievanceId, token, enabled }) {
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const dispose = () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

    const loadAudio = async () => {
      dispose();
      setIsPlaying(false);
      setHasAudio(false);

      if (!enabled || !grievanceId || !token) return;

      setLoading(true);
      try {
        const res = await authFetch(apiUrl(`/api/grievances/get_audio/${grievanceId}`), token);
        if (!res.ok || cancelled) return;

        const buffer = await res.arrayBuffer();
        if (cancelled || !buffer.byteLength) return;

        const blob = new Blob([buffer], { type: "audio/webm" });
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        const audio = new Audio(objectUrl);
        audio.addEventListener("ended", () => setIsPlaying(false));
        audioRef.current = audio;
        setHasAudio(true);
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setHasAudio(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAudio();

    return () => {
      cancelled = true;
      dispose();
      setIsPlaying(false);
    };
  }, [grievanceId, token, enabled]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
      setIsPlaying(false);
    }
  };

  return { isPlaying, hasAudio, loading, togglePlay };
}
