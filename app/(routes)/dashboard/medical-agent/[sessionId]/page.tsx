"use client"

import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { doctorAgent } from '../../_components/DoctorAgentCard';
import { Circle, Loader, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';

export type SessionDetail = {
    id: number,
    notes: string,
    sessionId: string,
    report: JSON,
    selectedDoctor: doctorAgent,
    createdOn: string,
}

type Message = {
    id: string,
    role: string,
    text: string
}

/**
 * MedicalVoiceAgent Component
 * 
 * Provides an AI-powered medical voice assistant interface where users can
 * start a voice call with an AI doctor agent, interact in real-time, 
 * view live transcripts, and generate a consultation report.
 */
function MedicalVoiceAgent() {
    const { sessionId } = useParams(); // Get sessionId from route parameters
    const [sessionDetail, setSessionDetail] = useState<SessionDetail>(); // Current session details
    const [callStarted, setCallStarted] = useState(false); // Call connection status
    const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null); // Instance of Vapi for voice interaction
    const [currentRole, setCurrentRole] = useState<string | null>(null); // Current speaking role (user/assistant)
    const [liveTranscript, setLiveTranscript] = useState<string>(''); // Live transcription text
    const [messages, setMessages] = useState<Message[]>([]); // Finalized chat messages log
    const [loading, setLoading] = useState(false); // Loading state for UI feedback
    const router = useRouter();
    const vapiHandlersRef = useRef<{
        callStart: () => void;
        callEnd: () => void;
        message: (message: unknown) => void;
        speechStart: () => void;
        speechEnd: () => void;
        error: (err: unknown) => void;
    } | null>(null);

    const resetCallState = () => {
        setCallStarted(false);
        setVapiInstance(null);
        setCurrentRole(null);
        setLiveTranscript('');
        setLoading(false);
    };

    // Fetch session detail data from backend API
    const GetSessionDetails = useCallback(async () => {
        const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
        setSessionDetail(result.data);
    }, [sessionId]);

    // Load session details on component mount or when sessionId changes
    useEffect(() => {
        if (sessionId) void GetSessionDetails();
    }, [sessionId, GetSessionDetails]);

    /**
     * StartCall
     * Initializes and starts the voice call with the AI Medical Doctor Voice Agent
     * using the Vapi SDK and sets up event listeners for call and speech events.
     */
    const StartCall = () => {
        if (!sessionDetail) return;
        setLoading(true);

        // Initialize Vapi instance with your API key
        const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
        if (!apiKey) {
            setLoading(false);
            toast.error('Missing NEXT_PUBLIC_VAPI_API_KEY');
            return;
        }

        const vapi = new Vapi(apiKey);
        setVapiInstance(vapi);

        // Configuration for the AI voice agent
        const VapiAgentConfig = {
            name: 'AI Medical Doctor Voice Agent',
            firstMessage: "Hi there! I’m your AI Medical Assistant. I’m here to help you with any health questions or concerns you might have today. How are you feeling?",
            transcriber: {
                provider: 'assembly-ai' as const,
                language: 'en' as const
            },
            voice: {
                provider: 'playht' as const,
                voiceId: sessionDetail.selectedDoctor?.voiceId ?? 'will'
            },
            model: {
                provider: 'openai' as const,
                model: 'gpt-4' as const,
                messages: [
                    {
                        role: 'system' as const,
                        content: sessionDetail.selectedDoctor?.agentPrompt
                    }
                ]
            }
        };

        // Store handlers so we can unsubscribe (Vapi.off requires the same function reference)
        const handleCallStart = () => {
            setLoading(false);
            setCallStarted(true);
            console.log('Call started');
        };

        const handleCallEnd = () => {
            resetCallState();
            vapiHandlersRef.current = null;
            console.log('Call ended');
        };

        const handleMessage = (message: unknown) => {
            const msg = message as {
                type?: unknown;
                role?: unknown;
                transcriptType?: unknown;
                transcript?: unknown;
            };

            if (
                msg?.type === 'transcript' &&
                typeof msg.role === 'string' &&
                typeof msg.transcriptType === 'string' &&
                typeof msg.transcript === 'string'
            ) {
                const { role, transcriptType, transcript } = msg;
                if (transcriptType === 'partial') {
                    // Show live partial transcript while user/assistant is speaking
                    setLiveTranscript(transcript);
                    setCurrentRole(role);
                } else if (transcriptType === 'final') {
                    // Add finalized transcript to messages log
                    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, text: transcript }]);
                    setLiveTranscript('');
                    setCurrentRole(null);
                }
            }
        };

        const handleSpeechStart = () => {
            setCurrentRole('assistant');
        };

        const handleSpeechEnd = () => {
            setCurrentRole('user');
        };

        const handleError = (err: unknown) => {
            // Vapi/Daily errors often carry useful nested fields (provider + error message)
            const e = err as {
                errorMsg?: unknown;
                error?: { message?: unknown; errorMsg?: unknown; error?: { message?: unknown } | unknown } | unknown;
                message?: unknown;
            };
            const nested = (e?.error && typeof e.error === 'object')
                ? (e.error as { errorMsg?: unknown; message?: unknown; error?: { message?: unknown } | unknown })
                : undefined;
            const nestedInner = (nested?.error && typeof nested.error === 'object')
                ? (nested.error as { message?: unknown })
                : undefined;
            const msg =
                (typeof e?.errorMsg === 'string' && e.errorMsg) ||
                (typeof nested?.errorMsg === 'string' && nested.errorMsg) ||
                (typeof nested?.message === 'string' && nested.message) ||
                (typeof nestedInner?.message === 'string' && nestedInner.message) ||
                (typeof e?.message === 'string' && e.message) ||
                (typeof err === 'string' ? err : 'Call ended unexpectedly.');

            console.group('Vapi error');
            console.log('message:', msg);
            console.log('raw:', err);
            console.groupEnd();

            resetCallState();
            vapiHandlersRef.current = null;
            toast.error(msg);
        };

        vapiHandlersRef.current = {
            callStart: handleCallStart,
            callEnd: handleCallEnd,
            message: handleMessage,
            speechStart: handleSpeechStart,
            speechEnd: handleSpeechEnd,
            error: handleError,
        };

        // Event listeners for Vapi voice call lifecycle
        vapi.on('call-start', handleCallStart);
        vapi.on('call-end', handleCallEnd);
        vapi.on('message', handleMessage);
        vapi.on('speech-start', handleSpeechStart);
        vapi.on('speech-end', handleSpeechEnd);
        vapi.on('error', handleError);

        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
        if (assistantId) {
            // Preferred: use Vapi dashboard assistant config (providers/keys live in Vapi)
            vapi.start(assistantId);
        } else {
            // Inline config requires providers (OpenAI/PlayHT/AssemblyAI) to be configured for your Vapi project
            vapi.start(VapiAgentConfig);
        }
    };

    /**
     * endCall
     * Ends the ongoing voice call, cleans up listeners, generates
     * a consultation report, and redirects the user back to dashboard.
     */
    const endCall = async () => {
        // Generate consultation report based on chat messages
        await GenerateReport();

        if (!vapiInstance) return;

        // Stop the Vapi call and remove event listeners
        try {
            vapiInstance.stop();
        } catch (e) {
            // Vapi may throw if the meeting already ended (e.g. "ejection")
            console.warn('Vapi stop() failed:', e);
        }
        try {
            const handlers = vapiHandlersRef.current;
            if (handlers) {
                vapiInstance.off('call-start', handlers.callStart);
                vapiInstance.off('call-end', handlers.callEnd);
                vapiInstance.off('message', handlers.message);
                vapiInstance.off('speech-start', handlers.speechStart);
                vapiInstance.off('speech-end', handlers.speechEnd);
                vapiInstance.off('error', handlers.error);
            }
        } catch { }

        resetCallState();
        vapiHandlersRef.current = null;

        toast.success('Your report is generated!');

        // Redirect to dashboard after call ends and report is generated
        router.replace('/dashboard');
    };

    /**
     * GenerateReport
     * Sends the collected messages and session details to backend API to
     * create a medical consultation report.
     */
    const GenerateReport = async () => {
        setLoading(true);
        const result = await axios.post('/api/medical-report', {
            messages: messages,
            sessionDetail: sessionDetail,
            sessionId: sessionId
        });

        console.log(result.data);
        setLoading(false);

        return result.data;
    };

    return (
        <div className='p-5 border rounded-3xl bg-secondary'>
            {/* Status bar showing if call is connected */}
            <div className='flex justify-between items-center'>
                <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'>
                    <Circle className={`h-4 w-4 rounded-full ${callStarted ? 'bg-green-500' : 'bg-red-500'}`} />
                    {callStarted ? 'Connected...' : 'Not Connected'}
                </h2>
                <h2 className='font-bold text-xl text-gray-400'>00:00</h2> {/* TODO: Add timer */}
            </div>

            {/* Main content shows doctor details and conversation */}
            {sessionDetail && (
                <div className='flex items-center flex-col mt-10'>
                    <Image
                        src={sessionDetail.selectedDoctor?.image}
                        alt={sessionDetail.selectedDoctor?.specialist ?? ''}
                        width={120}
                        height={120}
                        className='h-[100px] w-[100px] object-cover rounded-full'
                    />
                    <h2 className='mt-2 text-lg'>{sessionDetail.selectedDoctor?.specialist}</h2>
                    <p className='text-sm text-gray-400'>AI Medical Voice Agent</p>

                    {/* Show last 4 finalized messages and live transcript */}
                    <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72'>
                        {messages.slice(-4).map((msg) => (
                            <h2 className='text-gray-400 p-2' key={msg.id}>
                                {msg.role}: {msg.text}
                            </h2>
                        ))}
                        {liveTranscript && (
                            <h2 className='text-lg'>
                                {currentRole} : {liveTranscript}
                            </h2>
                        )}
                    </div>

                    {/* Start or End Call buttons */}
                    {!callStarted ? (
                        <Button className='mt-20' onClick={StartCall} disabled={loading}>
                            {loading ? <Loader className='animate-spin' /> : <PhoneCall />} Start Call
                        </Button>
                    ) : (
                        <Button variant='destructive' onClick={endCall} disabled={loading}>
                            {loading ? <Loader className='animate-spin' /> : <PhoneOff />} Disconnect
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default MedicalVoiceAgent;
