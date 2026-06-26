'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ReviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [shop, setShop] = useState(null)
  const [user, setUser] = useState(null)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: shop } = await supabase.from('shops').select('id, name, area').eq('id', id).single()
      setShop(shop)
    }
    init()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) { setError('星を選んでください'); return }
    if (comment.trim().length < 5) { setError('コメントは5文字以上で入力してください'); return }
    setError(''); setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({ shop_id: id, user_id: user.id, rating, comment: comment.trim() })
    setSubmitting(false)
    if (error) setError('投稿に失敗しました。もう一度お試しください。')
    else router.push(`/shops/${id}`)
  }

  if (!shop) return <p className="text-center py-12 text-gray-400">読み込み中...</p>

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="bg-gradient-to-r from-rose-500 to-pink-400 text-white px-4 py-5 relative overflow-hidden">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/10 text-9xl select-none pointer-events-none leading-none">🐱</div>
        <button onClick={() => router.back()} className="text-sm opacity-80 mb-2 block relative">← 店舗詳細に戻る</button>
        <h1 className="text-xl font-bold relative">口コミを書く</h1>
        <p className="text-sm opacity-85 relative">{shop.name} · {shop.area}</p>
      </div>
      <div className="max-w-xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">評価</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} className="text-4xl transition-transform hover:scale-110 focus:outline-none">
                  <span className={star <= (hovered || rating) ? 'text-rose-400' : 'text-gray-300'}>★</span>
                </button>
              ))}
            </div>
            {rating > 0 && <p className="text-sm text-rose-400 mt-1">{['', 'とても悪い', '悪い', '普通', '良い', 'とても良い'][rating]}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">コメント</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="料理の味、雰囲気、アクセスなど自由に書いてください（5文字以上）" rows={5} required className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
            <p className="text-xs text-gray-400 mt-1 text-right">{comment.length} 文字</p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
            {submitting ? '投稿中...' : '口コミを投稿する'}
          </button>
        </form>
      </div>
    </div>
  )
}