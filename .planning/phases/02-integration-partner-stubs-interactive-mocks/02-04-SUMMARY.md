---
phase: 02-integration-partner-stubs-interactive-mocks
plan: "04"
subsystem: ui
tags: [ui, simulators, razorpay, exotel, telephony, dtmf, speech-synthesis, checkout-modal]
requires:
  - phase: "02-02"
    subsystem: integrations
  - phase: "02-03"
    subsystem: api
provides:
  - "RazorpayCheckoutModal in @poco/ui/simulators with UPI QR/intent, Cards 3DS/OTP, Netbanking"
  - "ExotelTelephonySimulator with Web Audio DTMF tones, speech synthesis IVR, softphone banner, and active call workspace"
affects:
  - "@poco/ui"
tech-stack:
  added: []
  patterns:
    - "Web Audio API dual-tone sinusoidal oscillator generator for DTMF dialpad"
    - "Window SpeechSynthesis IVR prompt engine with interactive transcript"
    - "Responsive payment checkout modal with simulated 3D Secure bank OTP flow"
    - "Global nav-bar softphone floating widget with incoming call chime and ringing animation"
key-files:
  created:
    - packages/ui/src/simulators/index.ts
    - packages/ui/src/simulators/razorpay/razorpay-checkout-modal.tsx
    - packages/ui/src/simulators/razorpay/upi-payment-tab.tsx
    - packages/ui/src/simulators/razorpay/card-payment-tab.tsx
    - packages/ui/src/simulators/razorpay/netbanking-tab.tsx
    - packages/ui/src/simulators/razorpay/otp-verification-dialog.tsx
    - packages/ui/src/simulators/exotel/dtmf-tone-generator.ts
    - packages/ui/src/simulators/exotel/ivr-speech-synthesizer.ts
    - packages/ui/src/simulators/exotel/exotel-telephony-simulator.tsx
    - packages/ui/src/simulators/exotel/softphone-floating-widget.tsx
    - packages/ui/src/simulators/exotel/call-workspace.tsx
    - packages/ui/src/simulators/exotel/call-recording-player.tsx
  modified:
    - packages/ui/src/index.ts
key-decisions:
  - "D-09: Built multi-method Razorpay checkout modal supporting UPI QR/intent, Card payments with 3DS OTP modal, and Netbanking bank selector."
  - "D-10: Created ExotelTelephonySimulator with floating caller ID banner, senior auto-lookup, and call recording player."
  - "D-13: Preserved authentic consumer checkout UI without in-modal developer buttons."
  - "D-14: Implemented Web Audio API DtmfToneGenerator (dual sinusoidal oscillators) and browser SpeechSynthesis IVR engine."
  - "D-15: Built SoftphoneFloatingWidget for navigation bar incoming call alerts expanding to active CallWorkspace."
requirements-completed:
  - INTG-02
duration: "6 min"
completed: "2026-08-31T17:39:30Z"
coverage:
  - deliverable: "Razorpay Checkout Modal Simulator"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/ui build"
      status: "pass"
    human_judgment: false
  - deliverable: "Exotel Telephony Softphone Simulator"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/ui build"
      status: "pass"
    human_judgment: false
---

# Phase 02 Plan 04: Interactive Frontend Simulators Summary

Built high-fidelity interactive frontend simulators in `@poco/ui/simulators/*`: the multi-method `RazorpayCheckoutModal` (UPI QR/intent, Cards with 3DS/OTP verification, Netbanking) and the `ExotelTelephonySimulator` (Web Audio DTMF dual-frequency tones, synthesized IVR speech prompts, floating nav bar softphone widget, active call workspace, and call recording player).

## Accomplishments
- **`RazorpayCheckoutModal` (`@poco/ui/simulators/razorpay/*`)**:
  - `UpiPaymentTab`: Dynamic UPI QR code with 5-minute countdown, app intent buttons (Google Pay, PhonePe, Paytm, CRED), and custom VPA ID verification.
  - `CardPaymentTab`: Card number formatting with automatic card network detection (Visa, Mastercard, RuPay), expiry formatting, CVV masking, and cardholder name.
  - `OtpVerificationDialog`: Realistic Bank 3D Secure / NetSafe verification dialog with masked mobile number, 6-digit OTP input with auto-fill option ("123456"), and resend timer.
  - `NetbankingTab`: Grid of popular Indian banks (HDFC, ICICI, SBI, Axis, Kotak, PNB) and searchable selector for all other banks.
  - `RazorpayCheckoutModal`: Coordinates responsive centered modal / mobile slide-up sheet, order summary, amount formatting in integer paise, and success celebration / bank decline states without developer debug buttons.
- **`ExotelTelephonySimulator` (`@poco/ui/simulators/exotel/*`)**:
  - `DtmfToneGenerator`: Uses native browser Web Audio API dual oscillators matching standard Bell System frequencies for dialpad keys `0-9`, `*`, `#` and incoming ringtone chime.
  - `IvrSpeechSynthesizer`: Synthesizes dynamic IVR voice announcements ("Welcome to Poco Care...") via `window.speechSynthesis` with transcript sync.
  - `SoftphoneFloatingWidget`: Floating nav-bar alert with ringing pulse animation, caller phone number, senior profile preview, and Answer/Decline actions.
  - `CallWorkspace`: Live call timer, senior health card with chronic conditions, 12-key DTMF dialpad with audio feedback, live speech bubbles transcript log, disposition notes, and call transfer.
  - `CallRecordingPlayer`: Simulated audio player with dynamic SVG waveform visualizer, seek progress, and duration timer.

## Verification
- `pnpm --filter @poco/ui build` passed with exit code 0 and generated DTS type declarations.

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- [x] Razorpay checkout modal with UPI, Card, Netbanking, and 3DS OTP modal exported.
- [x] Exotel softphone simulator with Web Audio DTMF and speech synthesis exported.
- [x] SoftphoneFloatingWidget and CallRecordingPlayer built and verified.
- [x] Commit hash: 031344b
