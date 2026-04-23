import os from 'node:os'
import path from 'node:path'

export const DB_FILE_NAME = 'db.json'
export const DEFAULT_SHEET_NAME = 'main'
export const STORAGE_DIR_NAME = '.super-time'
export const TEST_DB_PATH = path.join(__dirname, '../test-db.json')
export const STORAGE_PATH = path.join(os.homedir(), STORAGE_DIR_NAME)
export const DB_PATH = path.join(STORAGE_PATH, DB_FILE_NAME)
export const DB_VERSION = 2
