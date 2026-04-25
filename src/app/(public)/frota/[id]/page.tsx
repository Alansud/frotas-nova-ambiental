import { redirect } from 'next/navigation'

export default async function FrotaVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/veiculo/${id}`)
}
