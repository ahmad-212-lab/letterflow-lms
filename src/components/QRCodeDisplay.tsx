"use client";

import { QRCodeSVG } from "qrcode.react";

export default function QRCodeDisplay({ value }: { value: string }) {
  return (
    <div style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', display: 'inline-block', border: '1px solid var(--border-color)' }}>
      <QRCodeSVG value={value} size={80} level={"H"} />
    </div>
  );
}
