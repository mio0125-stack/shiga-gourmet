'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const ShopsMap = dynamic(() => import('./components/ShopsMap'), { ssr: false })

const AREAS = ['すべて', '大津市', '草津市', '彦根市', '甲賀市', '長浜市', '守山市', '東近江市', '竜王町']

export default function Home() {
  const [shops, setShops] = useState([])
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('すべて')
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')

  useEffect(() => {
    fetchShops()
  }, [])

  async function fetchShops() {
    setLoading(true)
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setShops(data)
    setLoading(false)
  }

  const filtered = shops.filter(shop => {
    const matchArea = area === 'すべて' || shop.area === area
    const matchSearch =
      shop.name.includes(search) ||
      shop.area.includes(search) ||
      (shop.description || '').includes(search)
    return matchArea && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">🍽 しがランチ</h1>
            <p className="text-sm opacity-85">滋賀のカフェ・レストランを1か所で</p>
          </div>
          <Link href="/favorites" className="text-sm bg-white/20 px-3 py-1.5 rounded-full">
            ♡ お気に入り
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-4">
        <input
          type="text"
          placeholder="店名・エリアで検索（例: 大津、カフェ）"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <div className="flex gap-2 flex-wrap mt-3">
          {AREAS.map(a => (
            <button
              key={a}
              onClick={() => setArea(a)}
              className={`text-sm px-3 py-1 rounded-full border transition ${
                area === a
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-green-50 text-green-700 border-transparent'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* リスト/マップ切り替え */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mt-4">
          <button
            onClick={() => setView('list')}
            className={`flex-1 py-2 text-sm font-semibold transition ${
              view === 'list' ? 'bg-green-700 text-white' : 'bg-white text-gray-500'
            }`}
          >
            📋 一覧
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex-1 py-2 text-sm font-semibold transition ${
              view === 'map' ? 'bg-green-700 text-white' : 'bg-white text-gray-500'
            }`}
          >
            🗺 マップ
          </button>
        </div>
      </div>

      {view === 'map' ? (
        <div className="max-w-xl mx-auto px-4 pb-16">
          <div style={{ height: '60vh' }} className="rounded-xl overflow-hidden border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">読み込み中...</div>
            ) : (
              <ShopsMap shops={filtered} />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">ピンをタップすると店舗詳細へ</p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto px-4 pb-16">
          {loading ? (
            <p className="text-center text-gray-400 py-12">読み込み中...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12">該当する店舗が見つかりませんでした</p>
          ) : (
            filtered.map(shop => (
              <Link key={shop.id} href={`/shops/${shop.id}`}>
                <div className="bg-white border border-gray-200 rounded-xl mb-3 hover:shadow-md transition overflow-hidden">
                  {shop.image_url && (
                    <img
                      src={shop.image_url}
                      alt={shop.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-base mb-1">{shop.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">📍 {shop.area}</p>
                    <p className="text-sm text-gray-700">{shop.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {shop.access_type && (
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          shop.access_type === '公共交通OK' ? 'bg-blue-100 text-blue-700' :
                          shop.access_type === '車推奨' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {shop.access_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
