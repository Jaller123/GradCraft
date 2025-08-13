import { useState } from 'react'
import { generate } from './gemini'
import React from 'react'

const InputAI = () => {
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const run = async () => {
        setLoading(true); 
        setError(''); 
        setOutput('');
        
        try {
            const reply = await generate(prompt)
            setOutput(reply)
        } catch (e) {
            setError(String(e.message || e))
        } finally {
            setLoading(false)
        }
    }
    
  return (
    <div className = 'max-w-3xl mx-auto p-4'>
        <h1>AI Prompt Playground</h1>
        <textarea 
            value = {prompt}
            onChange = {(e) => setPrompt(e.target.value)}
            rows={6}
            className="w-full border p-3 rounded"
            placeholder="Write your prompt here..."
        />

        <button onClick={run} disabled={!prompt.trim() || loading}>
            {loading ? "Generating..." : "Generate"}
        </button>

        {error && <p style={{color: "red"}}>{error}</p>}
        {output && <pre className="whitespace-pre-wrap mt-4">{output}</pre>}
    </div>
  )
}

export default InputAI