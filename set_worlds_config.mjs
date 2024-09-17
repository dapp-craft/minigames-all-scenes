import * as process from 'process';
import * as fs from 'node:fs/promises'
import * as path from 'path';

const FILE_PATH = path.join(process.cwd(), 'scene.json')

async function setWorldsName() {
  try {
    const jsonData = JSON.parse(await fs.readFile(FILE_PATH, 'utf8'))
    jsonData.worldConfiguration = { name: process.argv[2] }
    await fs.writeFile(FILE_PATH, JSON.stringify(jsonData, null, 2))
    console.log(jsonData)
  } catch (error) {
    console.error(`${error}`)
    process.exit(1)
  }
}

if (process.argv.length < 3) {
  console.log('Usage: node set_worlds_config.mjs {name}')
  process.exit(1)
}

setWorldsName()
