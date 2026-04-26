import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-2 py-4 px-4">
      <Image
        src="/oficina-nova-ambiental.png"
        alt="Oficina Nova Ambiental"
        width={40}
        height={40}
        className="opacity-40 object-contain"
      />
    </footer>
  )
}
