"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, SignIn, SignOut, X } from "@phosphor-icons/react";
import { useMarkLiveAttendanceMutation } from "@/lib/api";
import type { ClassroomBatch, ClassroomStudent } from "./types";

function isMongoId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

function errorMessage(err: unknown) {
  if (err && typeof err === "object" && "data" in err) {
    const message = (err as { data?: { message?: string } }).data?.message;
    if (message) return message;
  }
  return "Could not save attendance. Try again.";
}

function blobToJpegFile(blob: Blob, name: string) {
  return blob instanceof File ? blob : new File([blob], name, { type: blob.type || "image/jpeg" });
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function AttendanceCaptureModal({
  student,
  batch,
  demo,
  onClose,
  onMarked,
}: {
  student: ClassroomStudent;
  batch: ClassroomBatch;
  demo?: boolean;
  onClose: () => void;
  onMarked?: (action: "login" | "logout") => void;
}) {
  const action: "login" | "logout" | null =
    student.loggedIn && student.loggedOut ? null : student.loggedIn ? "logout" : "login";
  const persist = !demo && isMongoId(student.id) && isMongoId(batch.id);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shot, setShot] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [doneAction, setDoneAction] = useState<"login" | "logout" | null>(null);

  const [markAttendance] = useMarkLiveAttendanceMutation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (action == null) return undefined;
    let cancelled = false;

    const start = async () => {
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stopStream(stream);
          return;
        }
        stopStream(streamRef.current);
        streamRef.current = stream;
        stream.getVideoTracks().forEach((track) => {
          track.addEventListener("ended", () => {
            if (!cancelled) void start();
          });
        });
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
      } catch {
        if (!cancelled) {
          setCameraError("Camera is blocked or unavailable. Allow camera access, or upload a photo.");
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopStream(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    // Open once for this card. Do not restart when the live page refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCaptured = (blob: Blob) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(blob);
    previewUrlRef.current = url;
    setShot(blob);
    setPreviewUrl(url);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) {
      setFormError("Wait for the camera to start, then try again.");
      return;
    }
    const max = 1280;
    let width = video.videoWidth;
    let height = video.videoHeight;
    if (Math.max(width, height) > max) {
      const scale = max / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setFormError("Could not capture the photo. Try again.");
          return;
        }
        setFormError(null);
        setCaptured(blob);
      },
      "image/jpeg",
      0.88,
    );
  };

  const retake = () => {
    setShot(null);
    setPreviewUrl(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFormError(null);
    const video = videoRef.current;
    if (video && streamRef.current) {
      video.srcObject = streamRef.current;
      void video.play().catch(() => undefined);
    }
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Choose a JPEG, PNG, or WebP photo.");
      return;
    }
    setFormError(null);
    setCaptured(file);
  };

  const submit = async () => {
    if (!action || !shot) return;
    setBusy(true);
    setFormError(null);
    try {
      if (persist) {
        await markAttendance({
          photo: blobToJpegFile(shot, `${action}-${Date.now()}.jpg`),
          studentId: student.id,
          batchId: batch.id,
          action,
        }).unwrap();
      }
      setDoneAction(action);
      onMarked?.(action);
      window.setTimeout(() => onCloseRef.current(), 1400);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const title = action === "logout" ? "Logout attendance" : action === "login" ? "Login attendance" : "Attendance complete";

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-capture-title"
        className="relative z-10 max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/12 bg-[#0a1020] p-5 shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-sky-400/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={student.photo} alt="" className="h-full w-full object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300/80">{title}</p>
            <h2 id="attendance-capture-title" className="truncate text-lg font-bold text-white">
              {student.name}
            </h2>
            <p className="truncate text-xs text-white/50">
              {student.course} · {batch.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/12 text-white/70 hover:text-white"
            aria-label="Close"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {demo ? (
          <p className="mb-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Demo preview only. Attendance photos are not saved.
          </p>
        ) : null}

        {action == null || doneAction ? (
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-6 text-center">
            <p className="font-semibold text-emerald-200">
              {doneAction === "logout"
                ? "Logout selfie saved."
                : doneAction === "login"
                  ? "Login selfie saved."
                  : "Login and logout are already marked for today."}
            </p>
            <p className="mt-1 text-xs text-white/50">Photos stay on the attendance calendar for 30 days.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-white/60">
              {action === "login"
                ? "Capture a selfie to mark login when you enter class."
                : "Capture a selfie to mark logout when you leave class."}
            </p>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`aspect-[4/3] w-full scale-x-[-1] object-cover ${previewUrl ? "hidden" : "block"}`}
              />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Captured attendance" className="aspect-[4/3] w-full object-cover" />
              ) : null}
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
                {action === "login" ? <SignIn size={12} /> : <SignOut size={12} />}
                {action}
              </span>
            </div>

            {cameraError ? <p className="text-sm text-amber-200">{cameraError}</p> : null}
            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}

            <div className="flex flex-col gap-2">
              {previewUrl ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void submit()}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-200 disabled:opacity-50"
                  >
                    {busy ? "Saving…" : `Save ${action} photo`}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={retake}
                    className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-white/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70"
                  >
                    Retake
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={capture}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/15 px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-sky-200"
                  >
                    <Camera size={16} weight="bold" />
                    Capture selfie
                  </button>
                  <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-white/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                    Upload a photo instead
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      capture="user"
                      className="sr-only"
                      onChange={(e) => {
                        onFile(e.target.files?.[0]);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
