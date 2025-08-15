import React from 'react';
import { useState } from 'react';
import { generate } from './gemini';

const InputAI: React.FC = () => {

  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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