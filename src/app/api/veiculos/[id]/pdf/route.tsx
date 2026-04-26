import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import React from 'react'
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontSize: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottom: '2 solid #0056A6' },
  logo: { width: 56, height: 36, objectFit: 'contain', marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0056A6' },
  headerSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#0056A6', marginBottom: 6, paddingBottom: 3, borderBottom: '1 solid #e5e7eb' },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 120, color: '#6b7280' },
  value: { flex: 1, fontWeight: 'medium' },
  card: { marginBottom: 8, padding: 8, backgroundColor: '#f9fafb', borderRadius: 4 },
  cardTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 3 },
  cardBody: { fontSize: 9, color: '#374151', marginBottom: 2 },
  cardMeta: { fontSize: 8, color: '#6b7280' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#9ca3af', textAlign: 'center' },
})

function formatD(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR')
}

function formatVal(v: number, tipo: string) {
  return tipo === 'hora' ? `${v}h` : `${v.toLocaleString('pt-BR')} km`
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const veiculo = await prisma.veiculo.findUnique({
    where: { id, ativo: true },
    include: { manutencoes: { orderBy: { data: 'desc' } }, proximaRevisao: true },
  })

  if (!veiculo) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  let logoSrc: string | undefined
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-nova-ambiental.jpg')
    const logoBuffer = fs.readFileSync(logoPath)
    logoSrc = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`
  } catch { }

  const isHora = veiculo.tipoMedicao === 'hora'

  const doc = React.createElement(Document, { title: `Relatório - Frota ${veiculo.numeroFrota}`, author: 'Nova Ambiental' },
    React.createElement(Page, { size: 'A4', style: styles.page },
      // Cabeçalho
      React.createElement(View, { style: styles.header },
        logoSrc && React.createElement(Image, { src: logoSrc, style: styles.logo }),
        React.createElement(View, {},
          React.createElement(Text, { style: styles.headerTitle }, 'Relatório de Manutenção'),
          React.createElement(Text, { style: styles.headerSub }, `Nova Ambiental — Frota ${veiculo.numeroFrota} · ${veiculo.placa}`)
        )
      ),
      // Dados do Veículo
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Dados do Veículo'),
        React.createElement(View, { style: styles.row }, React.createElement(Text, { style: styles.label }, 'Número da Frota:'), React.createElement(Text, { style: styles.value }, veiculo.numeroFrota)),
        React.createElement(View, { style: styles.row }, React.createElement(Text, { style: styles.label }, 'Placa:'), React.createElement(Text, { style: styles.value }, veiculo.placa)),
        React.createElement(View, { style: styles.row }, React.createElement(Text, { style: styles.label }, 'Modelo:'), React.createElement(Text, { style: styles.value }, veiculo.modelo)),
        React.createElement(View, { style: styles.row }, React.createElement(Text, { style: styles.label }, 'Marca:'), React.createElement(Text, { style: styles.value }, veiculo.marca)),
        React.createElement(View, { style: styles.row }, React.createElement(Text, { style: styles.label }, 'Ano:'), React.createElement(Text, { style: styles.value }, String(veiculo.ano))),
        React.createElement(View, { style: styles.row }, React.createElement(Text, { style: styles.label }, isHora ? 'Horímetro Atual:' : 'KM Atual:'), React.createElement(Text, { style: styles.value }, formatVal(veiculo.kmAtual, veiculo.tipoMedicao)))
      ),
      // Próxima Revisão
      veiculo.proximaRevisao && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Próxima Revisão'),
        React.createElement(View, { style: styles.row }, React.createElement(Text, { style: styles.label }, isHora ? 'Horas Previstas:' : 'KM Previsto:'), React.createElement(Text, { style: styles.value }, formatVal(veiculo.proximaRevisao.kmPrevisto, veiculo.tipoMedicao))),
        veiculo.proximaRevisao.dataPrevista && React.createElement(View, { style: styles.row }, React.createElement(Text, { style: styles.label }, 'Data Prevista:'), React.createElement(Text, { style: styles.value }, formatD(veiculo.proximaRevisao.dataPrevista))),
        veiculo.proximaRevisao.observacoes && React.createElement(View, { style: styles.row }, React.createElement(Text, { style: styles.label }, 'Observações:'), React.createElement(Text, { style: styles.value }, veiculo.proximaRevisao.observacoes))
      ),
      // Histórico de Manutenções
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, `Histórico de Manutenções (${veiculo.manutencoes.length})`),
        veiculo.manutencoes.length === 0 
          ? React.createElement(Text, { style: { color: '#9ca3af' } }, 'Nenhuma manutenção registrada.')
          : veiculo.manutencoes.slice(0, 25).map(m => React.createElement(View, { key: m.id, style: styles.card },
              React.createElement(Text, { style: styles.cardTitle }, `${formatD(m.data)} · ${formatVal(m.kmNaData, veiculo.tipoMedicao)}${m.custo ? `  —  R$ ${m.custo.toFixed(2)}` : ''}`),
              React.createElement(Text, { style: styles.cardBody }, m.servicos),
              React.createElement(Text, { style: styles.cardMeta }, `Mecânico: ${m.mecanico}`),
              m.observacoes && React.createElement(Text, { style: styles.cardMeta }, `Obs: ${m.observacoes}`)
            ))
      ),
      // Rodapé
      React.createElement(Text, { style: styles.footer }, `Gerado em ${new Date().toLocaleDateString('pt-BR')} · Nova Ambiental — Sistema de Frotas`)
    )
  )

  const buffer = await renderToBuffer(doc)

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="manutencao-frota${veiculo.numeroFrota}-${veiculo.placa}.pdf"`,
    },
  })
}