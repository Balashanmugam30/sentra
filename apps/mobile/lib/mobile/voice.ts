export const DEFAULT_VOICE_INSTRUCTIONS = [
  "Proceed to Exit B",
  "Avoid smoke ahead",
  "Turn left in 10 meters",
  "Assistance is on the way",
];

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function speakInstruction(text: string, rate: number) {
  if (!isSpeechSupported()) {
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 0.92;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function pauseSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}
