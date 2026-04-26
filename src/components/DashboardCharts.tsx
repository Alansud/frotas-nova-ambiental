'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

export interface GastoMensal {
  mes: string
  total: number
  count: number
}

export interface TipoServico {
  nome: string
  value: number
}

interface Props {
  gastosMensais: GastoMensal[]
  tiposServico: TipoServico[]
}

const PIE_COLORS = ['#0056A6', '#00A651', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardCharts({ gastosMensais, tiposServico }: Props) {
  const temGastos = gastosMensais.some(g => g.total > 0 || g.count > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico de Barras — Gastos Mensais */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Gastos Mensais
        </h2>
        <p className="text-xs text-gray-400 mb-4">Últimos 6 meses (R$)</p>
        {temGastos ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gastosMensais} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => v === 0 ? '0' : `R$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />
              <Tooltip
                formatter={(v) => [`R$ ${Number(v).toFixed(2)}`, 'Total gasto']}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="total" fill="#0056A6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-gray-300">
            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm">Sem gastos registrados</p>
          </div>
        )}
      </div>

      {/* Gráfico de Pizza — Tipos de Serviço */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Tipos de Serviço
        </h2>
        <p className="text-xs text-gray-400 mb-4">Distribuição de manutenções</p>
        {tiposServico.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={tiposServico}
                cx="50%"
                cy="45%"
                outerRadius={72}
                dataKey="value"
                labelLine={false}
              >
                {tiposServico.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [Number(v), 'Manutenções']} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => value}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-gray-300">
            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
            <p className="text-sm">Sem manutenções registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}
