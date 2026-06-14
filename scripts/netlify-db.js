const { execSync } = require('child_process')
const https = require('https')
const path = require('path')
const fs = require('fs')

// Tenta pegar o token do netlify-cli via keytar (Windows Credential Manager)
let token = null
try {
  // netlify-cli armazena o token no keychain do sistema
  const keytar = require(path.join(
    process.env.APPDATA || '',
    'npm', 'node_modules', 'netlify-cli', 'node_modules', 'keytar'
  ))
  token = keytar.getPassword('netlify', 'alansud959@gmail.com')
  console.log('token via keytar:', token ? 'FOUND' : 'NOT FOUND')
} catch (e) {
  console.log('keytar falhou:', e.message.slice(0, 100))
}

// Fallback: tenta via NETLIFY_AUTH_TOKEN env
if (!token) token = process.env.NETLIFY_AUTH_TOKEN

// Fallback: lê do config local do netlify
if (!token) {
  const paths = [
    path.join(process.env.APPDATA || '', 'netlify', 'config.json'),
    path.join(process.env.LOCALAPPDATA || '', 'netlify', 'config.json'),
    path.join(process.env.USERPROFILE || '', '.config', 'netlify', 'config.json'),
    path.join(process.env.USERPROFILE || '', '.netlify', 'config.json'),
  ]
  for (const p of paths) {
    if (fs.existsSync(p)) {
      console.log('Config encontrado em:', p)
      const cfg = JSON.parse(fs.readFileSync(p, 'utf8'))
      token = cfg.users?.[Object.keys(cfg.users || {})[0]]?.auth?.token
      break
    }
  }
}

console.log('Token encontrado:', token ? 'SIM ('+token.slice(0,8)+'...)' : 'NÃO')
