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
  }, []) 

  const trim = (list: Message[]) => list.length > MAX_MESSAGES ? list.slice(-MAX_MESSAGES) : list
  const run = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    try {
      const reply = await generate(prompt)
      setOutput(reply)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-3xl mx-auto p-4'>
      <h1>AI Prompt Maker</h1>

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