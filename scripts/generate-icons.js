const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function generateIcons() {
  const inputPath = path.join(process.cwd(), 'public', 'icon-source.jpg')
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(inputPath)) {
    console.error('Imagem fonte não encontrada:', inputPath)
    process.exit(1)
  }
  
  // Gerar ícone 192x192
  await sharp(inputPath)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 86, b: 166 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-192.png'))
  
  console.log('✓ icon-192.png gerado')
  
  // Gerar ícone 512x512
  await sharp(inputPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 86, b: 166 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512.png'))
  
  console.log('✓ icon-512.png gerado')
  console.log('Ícones atualizados com sucesso!')
}

generateIcons().catch(console.error)
