import { useState, useRef, useEffect, useCallback } from 'react';

export interface SpeechRecognitionHook {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  errorMessage: string | null;
  startListening: (initialText?: string, onResult?: (text: string) => void) => Promise<boolean>;
  stopListening: () => void;
  cancelListening: () => void;
  clearError: () => void;
}

// Type definitions for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function useSpeechRecognition(onLiveTranscript?: (text: string) => void): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');
  const liveCallbackRef = useRef<((text: string) => void) | undefined>(onLiveTranscript);
  liveCallbackRef.current = onLiveTranscript;

  const isSupported = typeof window !== 'undefined' && Boolean(
    (window as unknown as IWindow).SpeechRecognition || 
    (window as unknown as IWindow).webkitSpeechRecognition
  );

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async (
    initialText: string = '',
    onResult?: (text: string) => void
  ): Promise<boolean> => {
    setErrorMessage(null);
    baseTextRef.current = initialText;

    if (!isSupported) {
      // Fallback voice recognition simulation for environments without Web Speech API
      setIsListening(true);
      const sampleQueries = [
        "Show today's sales",
        "Create a purchase order for ABC Traders. I need 100 Industrial Sensor Module B3 and 50 Precision Titanium Bearing Sets.",
        "Which products are low in stock?",
        "What work should I handle first today?",
      ];
      const selectedQuery = initialText ? `${initialText}` : sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setTranscript(selectedQuery);
      if (onResult) {
        onResult(selectedQuery);
      } else if (liveCallbackRef.current) {
        liveCallbackRef.current(selectedQuery);
      }
      return true;
    }

    try {
      // Clean up any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const SpeechRecognition =
        (window as unknown as IWindow).SpeechRecognition ||
        (window as unknown as IWindow).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = 0; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += trans + ' ';
          } else {
            currentInterim += trans;
          }
        }

        const speechOutput = `${baseTextRef.current ? baseTextRef.current.trim() + ' ' : ''}${currentFinal}${currentInterim}`.trim();
        if (speechOutput) {
          setTranscript(speechOutput);
          if (onResult) {
            onResult(speechOutput);
          } else if (liveCallbackRef.current) {
            liveCallbackRef.current(speechOutput);
          }
        }
      };

      recognition.onerror = (event: any) => {
        const error = event.error;
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          setErrorMessage(
            'Microphone permission is required for voice input. Please enable microphone permissions in your browser.'
          );
        } else if (error === 'no-speech') {
          setErrorMessage('No speech detected. Click the microphone to try again.');
        } else if (error === 'audio-capture') {
          setErrorMessage('Microphone is unavailable or busy with another application.');
        } else if (error === 'network') {
          setErrorMessage('Network error occurred during speech recognition. Please check your internet connection.');
        } else if (error !== 'aborted') {
          setErrorMessage(`Speech recognition error: ${error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      return true;
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Could not initialize speech recognition. Please verify microphone settings.'
      );
      setIsListening(false);
      return false;
    }
  }, [isSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    errorMessage,
    startListening,
    stopListening,
    cancelListening,
    clearError,
  };
}
