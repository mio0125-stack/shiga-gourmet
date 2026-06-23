'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function FavoritesPage() {
  const router = useRouter()
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  async function fetchFavorites() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('favorites')
      .select('shop_id, shops(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setShops((data || []).map(f => f.shops).filter(Boolean))
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">♡ お気に入り</h1>
            {user && <p className="text-sm opacity-85">{user.email}</p>}
          </div>
          <div className="flex gap-2">
            <Link href="/" className="text-sm bg-white/20 px-3 py-1.5 rounded-full">🔍 探す</Link>
            {user && (
              <button onClick={handleLogout} className="text-sm bg-white/20 px-3 py-1.5 rounded-full">
                ログアウト
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 pb-16">
        {loading ? (
          <p className="text-center text-gray-400 py-12">読み込み中...</p>
        ) : !user ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">お気に入りを保存するにはログインが必要です</p>
            <Link href="/login" className="bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold">
              ログインする
            </Link>
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">♡</p>
            <p className="text-gray-500 mb-4">まだお気に入りがありません</p>
            <Link href="/" className="bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold">
              店舗を探す
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">保存した店舗（{shops.length}件）</p>
            {shops.map(shop => (
              <Link key={shop.id} href={`/shops/${shop.id}`}>
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 hover:shadow-md transition">
                  <h3 className="font-bold text-base mb-1">{shop.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">📍 {shop.area}</p>
                  <p className="text-sm text-gray-700">{shop.description}</p>
                  {shop.access_type && (
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded font-semibold ${
                      shop.access_type === '公共交通OK' ? 'bg-blue-100 text-blue-700' :
                      shop.access_type === '車推奨' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {shop.access_type}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
