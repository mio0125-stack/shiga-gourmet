'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('メールアドレスまたはパスワードが正しくありません')
      else router.push('/favorites')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError('登録に失敗しました: ' + error.message)
      else setMessage('確認メールを送信しました。メールを確認してください。')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="bg-gradient-to-r from-rose-500 to-pink-400 text-white px-4 py-5 relative overflow-hidden">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/10 text-9xl select-none pointer-events-none leading-none">🐱</div>
        <button onClick={() => router.back()} className="text-sm opacity-80 mb-2 block relative">← 戻る</button>
        <h1 className="text-xl font-bold relative">ログイン</h1>
        <p className="text-sm opacity-85 relative">お気に入り保存・口コミ投稿に必要です</p>
      </div>
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex rounded-xl overflow-hidden border border-rose-100 mb-6 shadow-sm">
          <button onClick={() => setTab('login')} className={`flex-1 py-2.5 text-sm font-semibold transition ${tab === 'login' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'}`}>ログイン</button>
          <button onClick={() => setTab('signup')} className={`flex-1 py-2.5 text-sm font-semibold transition ${tab === 'signup' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'}`}>新規登録</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">メールアドレス</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" required className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">パスワード（8文字以上）</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8文字以上" required minLength={8} className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-rose-500 text-sm">{message}</p>}
          <button type="submit" disabled={loading} className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
            {loading ? '処理中...' : tab === 'login' ? 'ログインする' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}