const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function generateIcons() {
  const inputPath = path.join(process.cwd(), 'public', 'icon-source.jpg')
  
  if (!fs.existsSync(inputPath)) {
    console.error('Imagem fonte não encontrada:', inputPath)
    process.exit(1)
  }
  
  // Gerar ícones com nomes diferentes para forçar atualização
  await sharp(inputPath)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 86, b: 166 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'app-icon-192.png'))
  
  console.log('✓ app-icon-192.png gerado')
  
  await sharp(inputPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 86, b: 166 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'app-icon-512.png'))
  
  console.log('✓ app-icon-512.png gerado')
  console.log('Ícones atualizados com sucesso!')
}

generateIcons().catch(console.error)
