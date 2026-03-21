import { SHOP_ITEMS } from '../gameState'

export default function ShopScreen({ state, dispatch }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '0 16px 16px' }}>

      {/* Header */}
      <div style={{ padding: '16px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: '#d4a853', letterSpacing: '0.06em', margin: 0 }}>
          GYM SHOP
        </h2>
        <div style={{
          fontFamily: 'Bebas Neue', fontSize: 22, color: '#4caf80',
          letterSpacing: '0.04em', paddingBottom: 2,
        }}>
          ${Math.floor(state.money).toLocaleString()}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#555', marginBottom: 14 }}>
        Invest in gear to boost your performance
      </div>

      {SHOP_ITEMS.map(item => {
        const owned = !item.consumable && state.inventory.includes(item.id)
        const canAfford = state.money >= item.cost
        const consumableKey = item.consumable ? Object.keys(item.effect)[0] : null
        const remaining = consumableKey ? (state.consumables[consumableKey] || 0) : 0

        return (
          <div
            key={item.id}
            style={{
              background: '#0d0e14',
              borderRadius: 12,
              border: `1px solid ${owned ? '#2a4030' : '#1e2030'}`,
              padding: 14,
              marginBottom: 10,
              opacity: owned ? 0.7 : 1,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* Icon */}
              <div style={{
                fontSize: 28,
                width: 48, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#0f1117', borderRadius: 10,
                border: '1px solid #1e2030',
                flexShrink: 0,
              }}>
                {item.icon}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f0e6d0' }}>{item.name}</span>
                  {item.consumable && (
                    <span style={{ fontSize: 10, color: '#d4a853', background: '#d4a85320', padding: '1px 6px', borderRadius: 8 }}>
                      CONSUMABLE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4, marginBottom: 8 }}>
                  {item.description}
                </div>

                {/* Remaining sessions */}
                {item.consumable && remaining > 0 && (
                  <div style={{ fontSize: 11, color: '#d4a853', marginBottom: 8 }}>
                    ⚡ {remaining} sessions remaining
                  </div>
                )}

                {/* Buy button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {owned ? (
                    <span style={{ fontSize: 11, color: '#4caf80', fontWeight: 600 }}>
                      ✓ OWNED
                    </span>
                  ) : (
                    <button
                      onClick={() => dispatch({ type: 'BUY_ITEM', itemId: item.id })}
                      disabled={!canAfford}
                      style={{
                        padding: '7px 16px',
                        background: canAfford
                          ? 'linear-gradient(135deg, #c49440, #d4a853)'
                          : '#1e2030',
                        border: 'none',
                        borderRadius: 8,
                        color: canAfford ? '#08090d' : '#444',
                        fontSize: 12, fontWeight: 700,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        letterSpacing: '0.02em',
                        transition: 'all 0.15s',
                      }}
                    >
                      ${item.cost}
                    </button>
                  )}
                  {!owned && !canAfford && (
                    <span style={{ fontSize: 11, color: '#e05252' }}>
                      Need ${item.cost - Math.floor(state.money)} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
