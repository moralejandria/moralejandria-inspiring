
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { HistorySidebar } from './components/HistorySidebar';
import { sendMessageToGemini } from './services/geminiService';
import { Message, HistoryItem, LoadingState } from './types';

// Suggested questions based on the book's themes
const INITIAL_SUGGESTIONS = [
  "Me siento desmotivado y sin rumbo...",
  "Tengo miedo al fracaso...",
  "Siento envidia del éxito de otros...",
  "Estoy pasando por un duelo difícil...",
  "Me cuesta perdonar a quien me hirió...",
  "Siento que no valgo lo suficiente..."
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('moralejandria_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing history", e);
      }
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('moralejandria_history', JSON.stringify(history));
  }, [history]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setLoadingState(LoadingState.LOADING);

    try {
      // Context window of last 6 messages
      const conversationContext = messages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const responseText = await sendMessageToGemini(text, conversationContext);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save to history (limit 10)
      setHistory(prev => {
        const newHistory = [{
          id: Date.now().toString(),
          query: text,
          response: responseText,
          timestamp: Date.now()
        }, ...prev];
        return newHistory.slice(0, 10);
      });

      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setLoadingState(LoadingState.IDLE);
  };

  const handleDeleteHistory = () => {
    setHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#F9F7F1] relative overflow-hidden text-slate-800">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-blue-900/30 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <HistorySidebar 
        history={history}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onDeleteHistory={handleDeleteHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto h-full bg-[#F9F7F1] md:shadow-2xl md:my-4 md:rounded-xl overflow-hidden border-x border-blue-100 relative">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 p-4 flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors text-blue-800"
              title="Ver Historial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-blue-900 font-serif tracking-wide">MORALEJANDRÍA</h1>
              <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest">Sabiduría Viva</p>
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-full transition-all shadow-sm hover:shadow-md"
            title="Empezar nueva conversación"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Nueva Consulta</span>
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-[#F9F7F1]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 animate-[fadeIn_0.8s_ease-out_forwards]">
              
              {/* Classical Bust Image Representation */}
              <div className="relative w-72 h-72 mb-2 mx-auto flex items-center justify-center">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-100/20 to-transparent rounded-full blur-2xl scale-90"></div>
                
                {/* Main Image - Using specific URL provided by user */}
                <img 
                  src="https://fal.media/files/koala/M_a_72-8O-4P68mK4s1-U.png" 
                  alt="Busto Clásico Moralejandría" 
                  className="w-full h-full object-contain relative z-10 drop-shadow-xl filter contrast-110"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
              
              <div className="px-4 relative z-20">
                <h2 className="text-3xl font-bold text-blue-900 font-serif mb-4">Bienvenido a MORALEJANDRIA.</h2>
                <p className="text-slate-600 leading-relaxed serif-font italic text-lg">
                  "En un mundo de preguntas, hay historias que guardan respuestas."
                </p>
                <p className="text-sm text-blue-400 mt-2 uppercase tracking-wide font-medium">
                  ¿Qué dilema inquieta tu alma hoy?
                </p>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 px-2 relative z-20">
                {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-left p-4 text-sm text-slate-700 bg-white border border-blue-100 rounded-lg hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {loadingState === LoadingState.LOADING && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white border border-blue-100 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
                    <div className="flex space-x-2 items-center">
                      <span className="text-xs text-blue-300 font-serif italic mr-2">Consultando sabiduría...</span>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {loadingState === LoadingState.ERROR && (
                <div className="flex justify-center my-4">
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-100">
                    Hubo un problema al consultar el libro. Por favor, intenta de nuevo.
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-blue-100 p-4">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe aquí tu pregunta..."
              className="w-full py-4 pl-6 pr-14 bg-[#F9F7F1] border border-blue-100 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-inner font-light"
              disabled={loadingState === LoadingState.LOADING}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || loadingState === LoadingState.LOADING}
              className="absolute right-2 p-2.5 bg-blue-900 text-white rounded-full hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-blue-900 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-3">
            <span className="text-[10px] text-slate-400 font-serif italic">Basado en "Moralejandría" de José Manuel Gracia Gracia</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
