import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Bot,
  RotateCcw,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertCircle,
} from 'lucide-react';
import { AIChatMessage } from '../../types/ai';
import { aiService } from '../../services/aiService';
import { AIActionConfirmationCard } from './AIActionConfirmationCard';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const DEFAULT_PROMPTS = [
  "Show today's sales",
  "Which products are low in stock?",
  "Create a purchase order for ABC Traders",
  "Show overdue invoices",
  "Give me this month's expenses",
  "Compare sales with last month",
  "Show pending approvals",
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: "Hello! I am your AI ERP Copilot. You can ask me to inspect sales trends, check critical stock, audit overdue invoices, or draft purchase orders with automated ledger validations.",
      quickActions: [
        { label: "Show today's sales", prompt: "Show today's sales" },
        { label: 'Check low stock', prompt: 'Which products are low in stock?' },
        { label: 'Create PO for ABC Traders', prompt: 'Create a purchase order for ABC Traders' },
      ],
    },
  ]);
  const { user } = useAuth();
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    transcript,
    errorMessage: voiceError,
    startListening,
    stopListening,
    clearError: clearVoiceError,
  } = useSpeechRecognition((liveTranscript) => {
    setInputText(liveTranscript);
  });

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    if (isListening) {
      stopListening();
    }

    const query = (textToSend || inputText).trim();
    if (!query && attachedFiles.length === 0) return;

    const userMessage: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query || (attachedFiles.length > 0 ? `Uploaded document: ${attachedFiles[0].name}` : ''),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      const aiResponse = await aiService.sendMessage({
        message: query,
        conversation_id: 'conv-session-1',
        context: {
          activeRole: user?.role || 'Admin',
        },
      });
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `ERP Error: ${err.message || 'Failed to communicate with AI endpoint.'}`,
          responseType: 'error',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDoneSpeaking = () => {
    stopListening();
    const query = (inputText.trim() || transcript.trim() || "Show today's sales").trim();
    // Auto paste message into input box
    setInputText(query);
    // Submit message and return output immediately
    handleSend(query);
  };

  const handleVoiceToggle = async () => {
    if (isListening) {
      handleDoneSpeaking();
    } else {
      await startListening(inputText, (liveText) => {
        setInputText(liveText);
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'document',
      };
      setAttachedFiles([newFile]);
    }
  };

  const exportTableToExcel = (tableData: any) => {
    const headers = tableData.columns.map((c: any) => `"${c.label}"`).join(',');
    const rows = tableData.rows.map((row: any) =>
      tableData.columns.map((c: any) => `"${String(row[c.key] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `${tableData.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className={`relative flex flex-col w-full rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 ${
          isMaximized
            ? 'h-[96vh] max-w-[96vw]'
            : 'h-[90vh] sm:h-[82vh] max-w-3xl'
        }`}
      >
        {/* Assistant Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI ERP Assistant
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Connected to Enterprise Knowledge Graph &amp; DRF Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="hidden sm:inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title={isMaximized ? 'Restore size' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggested Prompts Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-xs no-scrollbar dark:border-slate-800 dark:bg-slate-800/40">
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3 w-3" /> Quick Ask:
          </span>
          {DEFAULT_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'border border-slate-200 bg-white text-slate-800 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                {/* User Attachment Tag */}
                {msg.attachments && (
                  <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-indigo-700/60 p-2 text-[11px] text-white">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-semibold">{msg.attachments[0].name}</span>
                    <span className="opacity-75">({msg.attachments[0].size})</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Table Inside Response */}
                {msg.tableData && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="flex items-center justify-between bg-slate-100/80 px-3 py-2 border-b border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {msg.tableData.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => exportTableToExcel(msg.tableData)}
                          className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200"
                        >
                          <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
                          <span>Export Excel</span>
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                          <tr>
                            {msg.tableData.columns.map((c) => (
                              <th
                                key={c.key}
                                className={`px-3 py-1.5 font-semibold ${
                                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                                }`}
                              >
                                {c.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {msg.tableData.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800">
                              {msg.tableData!.columns.map((col) => (
                                <td
                                  key={col.key}
                                  className={`px-3 py-1.5 text-slate-700 dark:text-slate-300 ${
                                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                  }`}
                                >
                                  {row[col.key]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {msg.tableData.totalSummary && (
                      <div className="bg-slate-100/60 p-2 text-[10px] font-medium text-slate-600 border-t border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        {msg.tableData.totalSummary}
                      </div>
                    )}
                  </div>
                )}

                {/* Chart Inside Response */}
                {msg.chartData && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                      {msg.chartData.title}
                    </p>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={msg.chartData.data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey={msg.chartData.xAxisKey} tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              borderColor: '#334155',
                              color: '#fff',
                              borderRadius: '8px',
                              fontSize: '11px',
                            }}
                          />
                          {msg.chartData.dataKeys.map((dk) => (
                            <Bar key={dk.key} dataKey={dk.key} fill={dk.color} radius={[4, 4, 0, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => exportTableToExcel({ title: msg.chartData!.title, columns: [{ key: 'month', label: 'Month' }, { key: 'sales', label: 'Sales' }, { key: 'purchases', label: 'Purchases' }], rows: msg.chartData!.data })}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download Chart Data</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Confirmation Card (PO draft, confirmation, states) */}
                {msg.actionPayload && (
                  <AIActionConfirmationCard action={msg.actionPayload} />
                )}

                {/* Quick actions follow-up pills */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {msg.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(qa.prompt)}
                        className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2 px-1 text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    type="button"
                    onClick={() => handleSend(messages[messages.length - 2]?.text || "Show today's sales")}
                    className="inline-flex items-center gap-0.5 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Retry query"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
                <Bot className="h-4 w-4 animate-bounce" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse delay-75" />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse delay-150" />
                <span className="ml-1 text-[11px]">Analyzing ERP datasets...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock */}
        <div className="border-t border-slate-200 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900">
          {/* Voice Recognition Error Alert */}
          {voiceError && (
            <div className="mb-2.5 flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-900/60 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{voiceError}</span>
              </div>
              <button
                type="button"
                onClick={clearVoiceError}
                className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Active Voice Recording Indicator */}
          {isListening && (
            <div className="mb-2.5 flex items-center justify-between rounded-lg bg-rose-50/90 px-3.5 py-2 text-xs text-rose-800 border border-rose-200 shadow-2xs dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span className="font-semibold">Listening to voice... (Speak clearly into your microphone)</span>
              </div>
              <button
                type="button"
                id="btn-done-speaking"
                onClick={handleDoneSpeaking}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all"
                title="Done speaking - auto paste message and return output"
              >
                <Send className="h-3 w-3" />
                <span>Done Speaking</span>
              </button>
            </div>
          )}

          {/* File Attachment Pill Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-100 p-2 text-xs dark:bg-slate-800">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {attachedFiles[0].name}
              </span>
              <span className="text-[10px] text-slate-400">({attachedFiles[0].size})</span>
              <button
                type="button"
                onClick={() => setAttachedFiles([])}
                className="ml-auto text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.csv,.xlsx,.xls,.png,.jpg"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Attach document or invoice (PDF, CSV, Excel, Image)"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                isListening
                  ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 animate-pulse'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice Input'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? 'Listening to voice command...' : 'Ask your ERP anything... ("Show today\'s sales", "Create PO")'}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={(!inputText.trim() && attachedFiles.length === 0) || isTyping}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:opacity-40"
              title="Send Prompt"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
