import io = require('@actions/io')
import fs = require('fs')
import os = require('os')
import path = require('path')

const toolDir = path.join(__dirname, 'runner', 'tools')
const tempDir = path.join(__dirname, 'runner', 'temp')

process.env['RUNNER_TOOL_CACHE'] = toolDir
process.env['RUNNER_TEMP'] = tempDir
import * as installer from '../src/installer'

const IS_WINDOWS = process.platform === 'win32'

describe('installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir)
    await io.rmRF(tempDir)
  }, 100000)

  afterAll(async () => {
    try {
      await io.rmRF(toolDir)
      await io.rmRF(tempDir)
    } catch {
      console.log('Failed to remove test directories')
    }
  }, 100000)

  it('Acquires version of Sentinel if no matching version is installed', async () => {
    await installer.getSentinel('0.15.4')
    const sentinelDir = path.join(toolDir, 'sentinel', '0.15.4', os.arch())

    expect(fs.existsSync(`${sentinelDir}.complete`)).toBe(true)
    if (IS_WINDOWS) {
      expect(fs.existsSync(path.join(sentinelDir, 'sentinel.exe'))).toBe(true)
    } else {
      expect(fs.existsSync(path.join(sentinelDir, 'sentinel'))).toBe(true)
    }
  }, 100000)

  it('Throws if no location contains correct sentinel version', async () => {
    let thrown = false
    try {
      await installer.getSentinel('99.0.0')
    } catch {
      thrown = true
    }
    expect(thrown).toBe(true)
  })

  it('Uses version of sentinel installed in cache', async () => {
    const sentinelDir: string = path.join(
      toolDir,
      'sentinel',
      '98.0.0',
      os.arch()
    )
    await io.mkdirP(sentinelDir)
    fs.writeFileSync(`${sentinelDir}.complete`, 'hello')
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await installer.getSentinel('98.0.0')
    return
  })

  it('Doesnt use version of sentinel that was only partially installed in cache', async () => {
    const sentinelDir: string = path.join(
      toolDir,
      'sentinel',
      '97.0.0',
      os.arch()
    )
    await io.mkdirP(sentinelDir)
    let thrown = false
    try {
      // This will throw if it doesn't find it in the cache (because no such version exists)
      await installer.getSentinel('97.0.0')
    } catch {
      thrown = true
    }
    expect(thrown).toBe(true)
    return
  })

  it('Resolves semantic versions installed in cache', async () => {
    const sentinelDir: string = path.join(
      toolDir,
      'sentinel',
      '96.0.0',
      os.arch()
    )
    await io.mkdirP(sentinelDir)
    fs.writeFileSync(`${sentinelDir}.complete`, 'hello')
    // These will throw if it doesn't find it in the cache (because no such version exists)
    await installer.getSentinel('96.0.0')
    await installer.getSentinel('96')
    await installer.getSentinel('96.0')
  })
})
