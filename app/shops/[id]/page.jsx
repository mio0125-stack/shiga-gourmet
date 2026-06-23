'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ShopDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [shop, setShop] = useState(null)
  const [menus, setMenus] = useState([])
  const [reviews, setReviews] = useState([])
  const [isFav, setIsFav] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [id])

  async function fetchAll() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    const [{ data: shop }, { data: menus }, { data: reviews }] = await Promise.all([
      supabase.from('shops').select('*').eq('id', id).single(),
      supabase.from('menus').select('*').eq('shop_id', id),
      supabase.from('reviews').select('*').eq('shop_id', id).order('created_at', { ascending: false }),
    ])
    setShop(shop)
    setMenus(menus || [])
    setReviews(reviews || [])

    if (user) {
      const { data: fav } = await supabase.from('favorites').select('id').eq('shop_id', id).eq('user_id', user.id).single()
      setIsFav(!!fav)
    }
    setLoading(false)
  }

  async function toggleFavorite() {
    if (!user) { router.push('/login'); return }
    if (isFav) {
      await supabase.from('favorites').delete().eq('shop_id', id).eq('user_id', user.id)
      setIsFav(false)
    } else {
      await supabase.from('favorites').insert({ shop_id: id, user_id: user.id })
      setIsFav(true)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return <p className="text-center py-12 text-gray-400">読み込み中...</p>
  if (!shop) return <p className="text-center py-12 text-gray-400">店舗が見つかりませんでした</p>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-green-700 to-green-500 text-white px-4 py-6 max-w-xl mx-auto">
        <button onClick={() => router.back()} className="text-sm opacity-80 mb-3 block">← 一覧に戻る</button>
        <h2 className="text-2xl font-bold mb-1">{shop.name}</h2>
        <p className="text-sm opacity-90">📍 {shop.area} · {shop.description}</p>
        {avgRating && <p className="text-sm mt-1">⭐ {avgRating}（{reviews.length}件）</p>}
      </div>

      <div className="max-w-xl mx-auto">
        {/* メニュー */}
        <div className="px-4 py-5 border-b border-gray-200 bg-white">
          <h3 className="font-bold text-base mb-3">🍽 メニュー</h3>
          {menus.length === 0 ? (
            <p className="text-sm text-gray-400">メニュー情報なし</p>
          ) : (
            menus.map(m => (
              <div key={m.id} className="flex justify-between py-2 border-b border-dashed border-gray-200 last:border-0 text-sm">
                <span>{m.name}</span>
                <span className="font-semibold text-green-700">¥{m.price.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>

        {/* アクセス */}
        <div className="px-4 py-5 border-b border-gray-200 bg-white">
          <h3 className="font-bold text-base mb-3">🚃 アクセス</h3>
          <div className="mb-3">
            {shop.access_type && (
              <span className={`text-xs px-2 py-1 rounded font-semibold ${
                shop.access_type === '公共交通OK' ? 'bg-blue-100 text-blue-700' :
                shop.access_type === '車推奨' ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {shop.access_type}
              </span>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
            {shop.nearest_station && (
              <div className="flex gap-3">
                <span className="text-gray-500 w-16 shrink-0">電車</span>
                <span>{shop.nearest_station} 徒歩{shop.walk_minutes}分</span>
              </div>
            )}
            {shop.bus_stop && (
              <div className="flex gap-3">
                <span className="text-gray-500 w-16 shrink-0">バス</span>
                <span>{shop.bus_stop}</span>
              </div>
            )}
            {shop.parking && (
              <div className="flex gap-3">
                <span className="text-gray-500 w-16 shrink-0">駐車場</span>
                <span>{shop.parking}</span>
              </div>
            )}
            {shop.address && (
              <div className="flex gap-3">
                <span className="text-gray-500 w-16 shrink-0">住所</span>
                <span>{shop.address}</span>
              </div>
            )}
            {shop.map_url && (
              <a href={shop.map_url} target="_blank" rel="noopener noreferrer"
                className="block mt-2 text-green-700 font-semibold">
                📍 Googleマップで開く →
              </a>
            )}
          </div>
        </div>

        {/* 口コミ */}
        <div className="px-4 py-5 bg-white">
          <h3 className="font-bold text-base mb-3">💬 口コミ（{reviews.length}件）</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 mb-3">まだ口コミはありません</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="bg-gray-50 rounded-xl p-3 mb-3 text-sm">
                <div className="text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p className="mt-1">{r.comment}</p>
              </div>
            ))
          )}
          <Link href={`/shops/${id}/review`}
            className="block text-center border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">
            ログインして口コミを書く
          </Link>
        </div>
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 max-w-xl mx-auto">
        <button
          onClick={() => document.querySelector('#access-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600"
        >
          🚃 アクセス
        </button>
        <button
          onClick={toggleFavorite}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
            isFav ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-green-700 text-white'
          }`}
        >
          {isFav ? '♡ 保存済み' : '♡ お気に入りに保存'}
        </button>
      </div>
    </div>
  )
}
