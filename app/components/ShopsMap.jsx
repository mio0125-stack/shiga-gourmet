'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function ShopsMap({ shops }) {
  const shopsWithCoords = shops.filter(s => s.lat && s.lng)

  return (
    <MapContainer
      center={[35.1, 136.0]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {shopsWithCoords.map(shop => (
        <Marker key={shop.id} position={[shop.lat, shop.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold mb-1">{shop.name}</p>
              <p className="text-gray-500 text-xs mb-2">📍 {shop.area}</p>
              <Link
                href={`/shops/${shop.id}`}
                className="text-green-700 font-semibold text-xs"
              >
                詳細を見る →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
