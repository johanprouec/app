"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";

export default function ChatDetail() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: 1, text: "Buenas tardes, vi su publicación del lote Angus Premium. ¿Sigue disponible?", time: "10:20", sender: 'me' },
    { id: 2, text: "Sí, aún están disponibles las 18 unidades. ¿Le interesa verlos en video?", time: "10:25 ✓✓", sender: 'other' },
    { id: 3, text: "Claro, me gustaría. También quería saber si el precio tiene alguna flexibilidad si pago de contado.", time: "10:28", sender: 'me' },
    { id: 4, text: "Para pago de contado podemos hablar de un 5% de descuento. Le envío el video ahora.", time: "10:30 ✓✓", sender: 'other' },
    { id: 5, text: "¿Le interesa el lote de 18 Angus que tengo disponible? Son excelentes ejemplares.", time: "10:32", sender: 'me' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!inputVal.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ✓`;
    setMessages([...messages, { id: Date.now(), text: inputVal, time, sender: 'me' }]);
    setInputVal('');
    
    // Simulate thinking delay then scroll (React state handles it sequentially)
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now()+1, text: "Gracias, le respondo en un momento.", time, sender: 'other' }]);
    }, 1200);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-cream h-full flex flex-col w-full relative" style={{height: '100dvh'}}>
      <TopNav 
        showBack
        backTo="/chat"
        title={
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-bold text-sm">JR</div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-forest text-sm">José Rincón</p>
              <p className="text-xs text-green-600 font-medium">● En línea</p>
            </div>
          </div>
        }
        rightAction={
          <>
            <button className="w-9 h-9 rounded-full hover:bg-cream-dark flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent">
              <span className="material-symbols-outlined text-stone text-[20px]">call</span>
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-cream-dark flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent">
              <span className="material-symbols-outlined text-stone text-[20px]">more_vert</span>
            </button>
          </>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-area">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'other' ? 'justify-end' : 'justify-start'} animate-up`}>
            <div className={`${m.sender === 'other' ? 'bubble-out' : 'bubble-in'} px-4 py-2.5 max-w-[80%]`}>
              <p className="text-sm">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.sender === 'other' ? 'text-green-300/60 text-right' : 'text-stone'}`}>{m.time}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex-shrink-0 px-4 py-3 bg-cream border-t border-stone/10 flex items-end gap-3 z-10 pb-safe">
        <button className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center flex-shrink-0 cursor-pointer border-none">
          <span className="material-symbols-outlined text-stone text-[20px]">attach_file</span>
        </button>
        <div className="field flex-1 flex items-center px-4 py-2 min-h-[44px]">
          <textarea 
            placeholder="Escribe un mensaje..." 
            rows={1}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="flex-1 bg-transparent text-sm text-forest resize-none leading-relaxed w-full"
            style={{maxHeight: '100px'}}
          ></textarea>
        </div>
        <button onClick={sendMessage} className="w-10 h-10 rounded-full bg-forest flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform cursor-pointer border-none">
          <span className="material-symbols-outlined fill-icon text-white text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
}
