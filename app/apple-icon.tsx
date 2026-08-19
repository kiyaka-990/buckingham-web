import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — Apple requires a raster, so the crest is rendered to PNG. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f4ec",
        }}
      >
        <svg viewBox="0 0 64 72" width="140" height="158">
          <path
            d="M32 3 L59 12.5 V37 C59 53 46.5 64.8 32 69 C17.5 64.8 5 53 5 37 V12.5 Z"
            fill="#1b4332"
          />
          <path
            d="M32 8.4 L54.4 16.3 V36.8 C54.4 50 44 60.2 32 64.1 C20 60.2 9.6 50 9.6 36.8 V16.3 Z"
            stroke="#cea052"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M23 30 C21.5 34 21 39.5 21.3 44.5 C21.5 47.5 22 49.3 23.2 50.6 C26.5 50.4 30.8 49.4 34.8 46.6 L38.4 44.6 L47.2 41.4 C48.6 40.9 49.8 40.4 49.8 39.4 C49.8 38.4 48.8 37.9 47.6 37.5 L40.2 34.6 C39.2 32.6 37.8 30.9 36 29.6 L35.4 28.4 L33.2 15.6 L29.4 26.2 C28.7 26.3 28 26.5 27.4 26.7 L19.6 17.2 Z"
            fill="#f7f4ec"
          />
        </svg>
      </div>
    ),
    size,
  );
}
