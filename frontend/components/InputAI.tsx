import React from 'react';
import { useState, useEffect } from 'react';
import { generate } from './gemini';

type Role = "users" | "assistant";
type Message = { id: string; role: Role; content: string; ts: number; }

const STORAGE_KEY = "ai_chat_messages_v1"
const MAX_MESSAGES = 100
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

const InputAI: React.FC = () => {
  

  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setMessages(JSON.parse(raw))
      }
     } catch {}
  }, []);

  useEffect(() => {
    try {  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)) 
     } catch {}
  }, [messages]) 

  const trim = (list: Message[]) => list.length > MAX_MESSAGES ? list.slice(-MAX_MESSAGES) : list
  
  const run = async () => {

    const text = prompt.trim()
    if (!text || loading) return

    setLoading(true)
    setError('')
    setOutput('')

     const userMsg: Message = { id: uid(), role: "users", content: text, ts: Date.now() };
     setMessages(prev => trim([...prev, userMsg]))
     setPrompt('')


    try {
      const reply = await generate(prompt)
      setOutput(reply)

      const aiMsg: Message = { id: uid(), role: "assistant", content: reply || "[empty]", ts: Date.now() }
      setMessages(prev => trim([...prev, aiMsg]))
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      const aiError: Message = { id: uid(), role: "assistant", content: `⚠️ ${message}`, ts: Date.now() }
      setMessages(prev => trim([...prev, aiError]))
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setMessages([]); setError(""); setOutput(""); setPrompt('');
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  return (
    <div className='max-w-3xl mx-auto p-4'>
      <header className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">GenAI: AI Prompt Playground</h1>
        <button onClick={clearAll} className='text-sm underline'>Clear</button>
      </header>

      {/*Chat History*/}
      <div className="border rounded p-3 h-[50vh] overflow-auto bg-white mb-3">
        {messages.length === 0 && <div className='text-gray-500'>No messages yet. Start chatting!</div>}
        {messages.map(msg => (
          <div key={msg.id} className={`flex my-1 ${msg.role === "users" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 shadow-sm ${msg.role === "users" ? "bg-blue-100" : "bg-gray-100"}`}>
              <div className='text-sm whitespace-pre-wrap'>{msg.content}</div>
              <div className='text-[10px] text-gray-500 mt-1'>
                 {msg.role === "users" ? "You" : "GenAI"} • {new Date(msg.ts).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

      </div>
      <textarea
       value={prompt}
       onChange={(e) => setPrompt(e.target.value)} 
       onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && prompt.trim() && !loading) {
          run()
        }
       }}
       rows={6}
       className='w-full border p-3 rounded'
       placeholder='Type your prompt here...'
       />

      <button
        className='mt-2 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50'
        onClick={run}
        disabled={!prompt.trim() || loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

       {error && <p style={{ color: "red" }}> {error}</p>}
       {output && <pre className="whitespace-pre-wrap mt-4">{output}</pre>}
    </div>
  )
}

export default InputAI